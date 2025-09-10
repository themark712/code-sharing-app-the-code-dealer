import express from 'express';
import { createSnippet, deleteSnippet, getPublicSnippet, getPublicSnippets, getUserSnippet, getUserSnippets,updateSnippet } from '../controllers/snippets/snippetsController.js';
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router();

// create snippet
router.post('/create-snippet', protect, createSnippet);

// get public snippets
router.get('/snippets/public', getPublicSnippets);

// get single public snippet
router.get('/snippet/public/:id', getPublicSnippet);

// get user snippets
router.get('/snippets',protect, getUserSnippets);

// get single snippet
router.get('/snippet/:id',protect, getUserSnippet);

// update snippet
router.patch("/snippet/:id", protect, updateSnippet);

// delete snippet
router.delete("/snippet/:id", protect, deleteSnippet);

export default router;