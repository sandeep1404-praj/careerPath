import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  chatWithMentor,
  generateRoadmapPreview,
  acceptGeneratedRoadmap
} from '../controllers/aiController.js';

const router = express.Router();

router.post('/chat', authenticateToken, chatWithMentor);
router.post('/generate-roadmap', authenticateToken, generateRoadmapPreview);
router.post('/accept-roadmap', authenticateToken, acceptGeneratedRoadmap);

export default router;
