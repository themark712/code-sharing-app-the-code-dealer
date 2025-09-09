import express from "express";
import { adminMiddleware, protect } from "../middleware/authMiddleware.js";
import {
  bulkAddTags,
  createTag, 
  getTags, 
  getTagById, 
  deleteTag
} from "../controllers/tags/tagsController.js";

const router = express.Router();

// create a new tag
router.post("/create-tag", protect, createTag);

// get all tags
router.get("/get-tags", protect, getTags)

// get tag by id
router.get("/tag/:id", protect, getTagById)

// add bulk tags
router.post("/bulk-tags", protect, adminMiddleware, bulkAddTags);

// delete a tag
router.delete("/tag/:id", protect, deleteTag);

export default router;