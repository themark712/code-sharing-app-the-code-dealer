import express from "express";
import { bulkAddTags } from "../controllers/tags/tagsController.js";
import { adminMiddleware, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/bulk-tags", protect, adminMiddleware, bulkAddTags);

export default router;