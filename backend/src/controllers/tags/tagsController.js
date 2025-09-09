import asyncHandler from 'express-async-handler';

export const bulkAddTags = asyncHandler(async (req, res) => {
  try {
    console.log('bulkAddTags');
  } catch (error) {
    console.log('Error in bulkAddTags:',error);
    return res.status(500).json({message: "Internal Server Error"});
  }
});