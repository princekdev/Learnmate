import express from 'express';
import {
  generateRoadmap,
  getRoadmap,
  getRoadmapById,
  updateRoadmapProgress,
  adaptRoadmap,
} from '../controllers/roadmapController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, generateRoadmap);
router.get('/', protect, getRoadmap);
router.get('/:id', protect, getRoadmapById);
router.put('/:id/progress', protect, updateRoadmapProgress);
router.post('/adapt', protect, adaptRoadmap);

export default router;
