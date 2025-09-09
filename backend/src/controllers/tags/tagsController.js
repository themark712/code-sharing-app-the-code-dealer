import asyncHandler from 'express-async-handler';
import Tags from '../../models/tags/TagsModel.js';

export const getTags = asyncHandler(async (req, res) => {
  try {
    const tags = await Tags.find({});
    return res.status(200).json(tags);
  } catch (error) {
    console.log("Error in tagsController.js/getTags()", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export const createTag = asyncHandler(async (req, res) => {
  try {
    // get user id
    const userId = req.user._id;
    // get name of tag from request body
    const { name } = req.body;

    // check for valid user id
    if (!userId) {
      return res.status(400).json({ message: "Not authorized. Please log in." });
    }

    // check if name is null or empty
    if (!name || name === "") {
      return res.status(400).json({ message: "Tag name is required." });
    }

    const tag = await Tags.create({
      name,
      user: userId
    });

    await tag.save();
    return res.status(201).json(tag);
  } catch (error) {
    console.log("Error in tagsController.js/createTag()", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Bulk tags add -- only admins can do this
export const bulkAddTags = asyncHandler(async (req, res) => {
  try {
    // get user id
    const userId = req.user._id;
    // get array of tags from request body
    const { tags } = req.body;      // expecting an array of tag names

    // check for valid user id
    if (!userId) {
      return res.status(400).json({ message: "Not authorized. Please log in." });
    }

    // check if tags (from body) is an array with items
    if (!tags || tags.length === 0 || !Array.isArray(tags)) {
      return res.status(400).json({ message: "No tags provided." });
    }

    // create an array of tag objects
    const tagsDoc = tags.map((tag) => ({
      name: tag,
      user: userId
    }));

    // Insert all tags in bulk
    const createdTags = await Tags.insertMany(tagsDoc);

    return res.status(201).json({ message: "Tags added", createdTags });
  } catch (error) {
    console.log("Error in tagsController.js/bulkAddTags()", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export const getTagById = asyncHandler(async (req, res) => {
  try {
    //console.log(req.params.id);
    if (req.params.id.length !== 24) {
      return res.status(404).json({ message: "Invalid tag id" });
    }
    const tag = await Tags.findById(req.params.id)
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }
    return res.status(201).json(tag);
  } catch (error) {
    console.log("Error in tagsController.js/getTagById()", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export const deleteTag = asyncHandler(async (req, res) => {
  try {
    if (req.params.id.length !== 24) {
      return res.status(404).json({ message: "Invalid tag id" });
    }
    const tag = await Tags.findById(req.params.id)

    // check if tag exists
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }
      return res.status(200).json({ message: "Tag deleted" });
  } catch (error) {
    console.log("Error in tagsController.js/deleteTag()", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});