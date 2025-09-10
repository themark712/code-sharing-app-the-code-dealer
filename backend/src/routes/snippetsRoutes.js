import express from 'express';
import { protect } from '../middleware/authMiddleware.js'
import {
  createSnippet,
  deleteSnippet,
  getPublicSnippet,
  getPublicSnippets,
  getUserSnippet,
  getUserSnippets, 
  updateSnippet, 
  likeSnippet,
  getLikedSnippets
} from '../controllers/snippets/snippetsController.js';

const router = express.Router();

// create snippet
router.post('/create-snippet', protect, createSnippet);

// get public snippets
router.get('/snippets/public', getPublicSnippets);

// get single public snippet
router.get('/snippet/public/:id', getPublicSnippet);

// get user snippets
router.get('/snippets', protect, getUserSnippets);

// get single snippet
router.get('/snippet/:id', protect, getUserSnippet);

// update snippet
router.patch("/snippet/:id", protect, updateSnippet);

// delete snippet
router.delete("/snippet/:id", protect, deleteSnippet);

// like a snippet
router.patch("/snippet/like/:id", protect, likeSnippet);

// get liked snippets
router.get("/snippets/liked", protect, getLikedSnippets);

export default router;