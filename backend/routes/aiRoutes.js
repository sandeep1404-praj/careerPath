import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  chatWithMentor,
  generateRoadmapPreview,
  acceptGeneratedRoadmap,
  getSessionContext,
  getUserProfileMemory,
  deleteChatSession,
  deleteAllChatSessions
} from '../controllers/aiController.js';

const router = express.Router();

router.post('/chat', authenticateToken, chatWithMentor);
router.post('/generate-roadmap', authenticateToken, generateRoadmapPreview);
router.post('/accept-roadmap', authenticateToken, acceptGeneratedRoadmap);
router.get('/session-context', authenticateToken, getSessionContext);
router.get('/user-profile-memory', authenticateToken, getUserProfileMemory);
router.delete('/session/:sessionId', authenticateToken, deleteChatSession);
router.delete('/sessions', authenticateToken, deleteAllChatSessions);

export default router;
