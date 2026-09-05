import express from 'express';
import {
  getRecommendations,
  generateRecommendations,
  toggleSaveRecommendation,
} from '../controllers/recommendationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getRecommendations);
router.post('/generate', protect, generateRecommendations);
router.put('/:id/save', protect, toggleSaveRecommendation);

export default router;
