import express from 'express';
import { generateAssessment, submitAssessment, getAssessmentHistory } from '../controllers/assessmentController.js';
import { protect } from '../middleware/authMiddleware.js';
import rateLimit from 'express-rate-limit';

const assessLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { message: 'Too many assessment requests. Please wait.' },
});

const router = express.Router();

router.post('/generate', protect, assessLimiter, generateAssessment);
router.post('/submit', protect, submitAssessment);
router.get('/history', protect, getAssessmentHistory);

export default router;
