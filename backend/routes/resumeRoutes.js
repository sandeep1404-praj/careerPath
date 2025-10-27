import express from 'express';
import {
  createResume,
  getAllResumes,
  getUserResumes,
  getResumeById,
  updateResume,
  deleteResume,
} from '../controllers/resumeController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/resumes
 * @desc    Create a new resume
 * @access  Private
 */
router.post('/', createResume);

/**
 * @route   GET /api/resumes
 * @desc    Get all resumes (with pagination and search)
 * @access  Private
 */
router.get('/', getAllResumes);

/**
 * @route   GET /api/resumes/user/:userId
 * @desc    Get all resumes for a specific user
 * @access  Private (user can only access their own resumes)
 */
router.get('/user/:userId', getUserResumes);

/**
 * @route   GET /api/resumes/:id
 * @desc    Get a single resume by ID
 * @access  Private (user can only access their own resume)
 */
router.get('/:id', getResumeById);

/**
 * @route   PUT /api/resumes/:id
 * @desc    Update a resume
 * @access  Private (user can only update their own resume)
 */
router.put('/:id', updateResume);

/**
 * @route   DELETE /api/resumes/:id
 * @desc    Delete a resume
 * @access  Private (user can only delete their own resume)
 */
router.delete('/:id', deleteResume);

export default router;
