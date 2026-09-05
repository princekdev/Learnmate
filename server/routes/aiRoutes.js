import express from 'express';
import {
  chatWithAI,
  getChatHistory,
  getAllChats,
  deleteChat,
  getRecommendations,
  analyzeProgress,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';
import rateLimit from 'express-rate-limit';

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { message: 'Too many AI requests. Please wait a moment.' },
});

const router = express.Router();

router.post('/chat', protect, aiLimiter, chatWithAI);
router.get('/chat/:chatId', protect, getChatHistory);
router.get('/chats', protect, getAllChats);
router.delete('/chat/:chatId', protect, deleteChat);
router.post('/recommend', protect, aiLimiter, getRecommendations);
router.get('/analyze', protect, analyzeProgress);

export default router;
