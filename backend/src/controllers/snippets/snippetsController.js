import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Snippet from '../../models/snippets/SnippetModel.js';

export const getPublicSnippets = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const userId = req.query.userId;
    const tagId = req.query.tagId;
    const search = req.query.search;

    // calculate number of documents to skip
    const skip = (page - 1) * limit;

    // build the query object
    const query = { isPublic: true };

    // filter by userId if provided
    if (userId) {
      query.user = userId;
    }

    // filter by tagId if provided
    if (tagId) {
      query.tags = tagId;
    }

    // filter title and description by search term
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },   // "i" for case-insensitive
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // get snippets, displaying tag names rather than ids
    const snippets = await Snippet.find(query)
      .populate("tags", "name")
      .populate("user", "_id name  photo")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // get total snippets count
    const totalSnippets = await Snippet.countDocuments(query);

    // send a paginated response
    return res.status(200).json({
      totalSnippets,
      totalPages: Math.ceil(totalSnippets / limit),
      currentPage: page,
      snippets
    });

  } catch (error) {
    console.log("Error in snippetsController.js/getPublicSnippets()", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export const getPublicSnippet = asyncHandler(async (req, res) => {
  try {
    const snippetId = req.params.id;

    const snippet = await Snippet.findOne({ _id: snippetId, isPublic: true })
      .populate("tags", "name")
      .populate("user", "_id name photo");

    return res.status(200).json(snippet);
  } catch (error) {
    console.log("Error in snippetsController.js/getUserSnippet()", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export const getUserSnippet = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const snippetId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized! Please log in." });
    }

    const snippet = await Snippet.findOne({ _id: snippetId, user: userId })
      .populate("tags", "name")
      .populate("user", "_id name photo");

    return res.status(200).json(snippet);
  } catch (error) {
    console.log("Error in snippetsController.js/getUserSnippet()", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export const getUserSnippets = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const tagId = req.query.tagId;
    const search = req.query.search;

    // validate user
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized! Please log in." });
    }

    // limit the number of snippets to 10
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // calculate number of documents to skip
    const skip = (page - 1) * limit;

    // build the query object
    const query = { user: userId };

    // filter by tagId
    if (tagId) {
      query.tags = { $in: [tagId] };
    }

    // filter title and description by search term
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },   // "i" for case-insensitive
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const snippets = await Snippet.find(query)
      .populate("tags", "name")
      .populate("user", "_id name photo")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    // get total snippets count
    const totalSnippets = await Snippet.countDocuments({ user: userId });    // wrong count
    //const totalSnippets = await Snippet.countDocuments(query);           // correct count

    // send a paginated response
    return res.status(200).json({
      totalSnippets,
      totalPages: Math.ceil(totalSnippets / limit),
      currentPage: page,
      snippets
    });
  } catch (error) {
    console.log("Error in snippetsController.js/getUserSnippets()", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export const createSnippet = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { title, description, code, language, tags, isPublic } = req.body;

    // validate user
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized! Please log in." });
    }

    // validate title
    if (!title || title.length < 3) {
      return res.status(400).json({ message: "Title is required and should be at least 3 characters long." });
    }

    // validate description
    if (!description || description.length < 5) {
      return res.status(400).json({ message: "Description is required and should be at least 5 characters long." });
    }

    // validate code
    if (!code || code.length < 10) {
      return res.status(400).json({ message: "Code is required and should be at least 10 characters long." });
    }

    // check if the tags are valid
    if (
      !tags ||
      tags.length === 0 ||
      !tags.every((tag) => mongoose.Types.ObjectId.isValid(tag))
    ) {
      return res.status(400).json({ message: "Please provide valid tags" });
    }

    const snippet = new Snippet({
      title,
      description,
      code,
      language,
      tags,
      isPublic,
      user: userId,
    });

    await snippet.save();

    return res.status(201).json(snippet);
  } catch (error) {
    console.log("Error in snippetsController.js/createSnippet()", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export const updateSnippet = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const snippetId = req.params.id;
    const { title, description, code, language, tags, isPublic } = req.body;

    // validate user
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized! Please log in." });
    }

    const snippet = await Snippet.findOne({ _id: snippetId, user: userId });

    if (!snippet) {
      return res.status(401).json({ message: "Snippet not found." });
    }

    // update fields to new value or current value if no updated value is provided
    snippet.title = title || snippet.title;
    snippet.description = description || snippet.description;
    snippet.code = code || snippet.code;
    snippet.language = language || snippet.language;
    snippet.tags = tags || snippet.tags;
    snippet.isPublic = isPublic || snippet.isPublic;

    await snippet.save();
    return res.status(200).json(snippet);
  } catch (error) {
    console.log("Error in snippetsController.js/updateSnippet()", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export const deleteSnippet = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const snippetId = req.params.id;

    // validate user
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized! Please log in." });
    }

    const snippet = await Snippet.findOne({ _id: snippetId, user: userId });

    if (!snippet) {
      return res.status(401).json({ message: "Snippet not found." });
    }

    await Snippet.deleteOne({ _id: snippetId });

    return res.status(200).json({ message: "Snippet deleted successfully" });
  } catch (error) {
    console.log("Error in snippetsController.js/deleteSnippet()", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export const likeSnippet = asyncHandler(async (req, res) => {
  try {
    const snippetId = req.params.id;
    const userId = req.user._id;

    let snippet = await Snippet.findById(snippetId);

    if (!snippet) {
      return res.status(401).json({ message: "Snippet not found." });
    }

    // check if user has already liked
    if (snippet.likedBy.includes(userId)) {
      // unlike snippet if user has already liked it
      snippet.likes -= 1;
      snippet.likedBy = snippet.likedBy.filter((id) => {
        return id.toString() !== userId.toString();
      });
      await snippet.save();
      return res.status(200).json({
        message: "Snippet unliked successfully",
        likes: snippet.likes
      });
    } else {
      // add like if user has not already liked
      snippet.likes += 1;
      snippet.likedBy.push(userId);
      await snippet.save();
      return res.status(200).json({
        message: "Snippet liked successfully",
        likes: snippet.likes
      });
    }
  } catch (error) {
    console.log("Error in snippetsController.js/likeSnippet()", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export const getLikedSnippets = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const tagId = req.query.tagId;
    const search = req.query.search;

    // validate user
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized! Please log in." });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // build the query object
    const query = { likedBy: userId };    // check if the user has liked the snippet

    // filter by tag id if provided - selects documents whose tag array contains at least one element
    if (tagId) {
      query.tags = { $in: [tagId] };
    }

    // search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // fetch the paginated liked snippets
    const snippets = await Snippet.find(query)
      .populate("tags", "name")
      .populate("user", "_id name photo")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // get total snippets
    const totalSnippets = await Snippet.countDocuments(query);

    return res.status(200).json({
      totalSnippets,
      totalPages: Math.ceil(totalSnippets / limit),
      currentPage: page,
      snippets
    });
  } catch (error) {
    console.log("Error in snippetsController.js/getLikedSnippets()", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export const getLeaderBoard = asyncHandler(async (req, res) => {
  try {
    const leaderboard = await Snippet.aggregate([
      {
        $group: {
          _id: "$user",   // group by user
          totalLikes: { $sum: "$likes" },     // sum of likes
          snippetCount: { $sum: 1 }      // count of snippets
        }
      },
      {
        $lookup: {
          from: "users",    // join with users collection
          localField: "_id",
          foreignField: "_id",   // join on _id field
          as: "userInfo"    // name of the array field that will hold user information
        }
      },
      {
        $unwind: "$userInfo",    // flattens the userInfo array
      },
      {
        $project: {
          _id: 0,
          name: "$userInfo.name",
          photo: "$userInfo.photo",
          totalLikes: 1,
          _id: "$userInfo._id",
          snippetCount: 1,
          score: {
            $add: [
              { $toInt: "$totalLikes" },
              { $multiply: ["$snippetCount", 10] }
            ]
          }
        }
      },
      {
        $sort: { totalLikes: -1 }    // sort by total likes
      },
      { $limit: 100 }   // get top 100 users
    ]);

    return res.status(200).json(leaderboard);
  } catch (error) {
    console.log("Error in snippetsController.js/getLeaderBoard()", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export const getPopularSnippets = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const tagId = req.query.tagId;
    const search = req.query.search;
    const skip = (page - 1) * limit;

    // build the query object
    const query = { isPublic: true };

    // filter by tagId if provided
    if (tagId) {
      query.tags = { $in: [tagId] };
    }

    // filter title and description by search term
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },   // "i" for case-insensitive
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // fetch popular snippets, displaying tag names rather than ids
    const popularSnippets = await Snippet.find(query)
      .populate("tags", "name")
      .populate("user", "_id name  photo")
      .sort({ likes: -1 })
      .skip(skip)
      .limit(limit * 10);  // get 10 * the limit to get a good sample

    // shuffle the snippets
    const shuffledSnippets = popularSnippets.sort(() => 0.5 - Math.random());

    // get snippets for the current page
    const snippets = shuffledSnippets.slice((page - 1) * limit, page * limit);

    // get total snippets count
    const totalSnippets = await Snippet.countDocuments(query);

    // send a paginated response
    return res.status(200).json({
      totalSnippets,
      totalPages: Math.ceil(totalSnippets / limit),
      currentPage: page,
      snippets
    });



  } catch (error) {
    console.log("Error in snippetsController.js/getPopularSnippets()", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});