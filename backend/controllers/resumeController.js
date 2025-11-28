import Resume from '../models/resume.js';
import mongoose from 'mongoose';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * @desc    Create a new resume
 * @route   POST /api/resumes
 * @access  Private (requires authentication)
 */
export const createResume = asyncHandler(async (req, res, next) => {
  const userId = req.user._id || req.user.id;

  // Accept payload from client but sanitize and merge with defaults
  const payload = req.body || {};
  const { title } = payload;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    throw new AppError('Title is required', 400);
  }

  // Defaults
  const defaults = {
    thumbnail: '',
    template: { theme: '', colorPalette: [] },
    profileInfo: {
      photo: '',
      profilePreviewUrl: '',
      fullName: '',
      designation: '',
      summary: '',
    },
    contactInfo: {
      email: '',
      phoneNo: '',
      location: '',
      linkedin: '',
      github: '',
      website: '',
    },
    workExperience: [],
    education: [],
    skills: [],
    projects: [],
    certificates: [],
    languages: [],
    interests: [],
  };

  // Build sanitized data by picking only allowed fields
  const allowed = ['thumbnail','template','profileInfo','contactInfo','workExperience','education','skills','projects','certificates','languages','interests'];
  const sanitized = {};
  for (const key of allowed) {
    if (payload[key] !== undefined) sanitized[key] = payload[key];
  }

  const resume = await Resume.create({
    userId,
    title: title.trim(),
    ...defaults,
    ...sanitized,
  });

  res.status(201).json({
    success: true,
    message: 'Resume created successfully',
    data: resume,
  });
});

/**
 * @desc    Get all resumes (admin or general listing)
 * @route   GET /api/resumes
 * @access  Private (requires authentication)
 */
export const getAllResumes = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const skip = (page - 1) * limit;

  // Build search query
  const searchQuery = search
    ? {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { 'profileInfo.fullName': { $regex: search, $options: 'i' } },
          { 'profileInfo.designation': { $regex: search, $options: 'i' } },
        ],
      }
    : {};

  const resumes = await Resume.find(searchQuery)
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Resume.countDocuments(searchQuery);

  res.status(200).json({
    success: true,
    data: resumes,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Get resumes for a specific user
 * @route   GET /api/resumes/user/:userId
 * @access  Private (requires authentication)
 */
export const getUserResumes = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const authenticatedUserId = req.user._id || req.user.id;

  // Users can only access their own resumes unless they're admin
  if (userId !== authenticatedUserId.toString()) {
    throw new AppError('Unauthorized to access these resumes', 403);
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError('Invalid user ID', 400);
  }

  const resumes = await Resume.find({ userId })
    .sort({ updatedAt: -1 })
    .select('-__v');

  res.status(200).json({
    success: true,
    count: resumes.length,
    data: resumes,
  });
});

/**
 * @desc    Get a single resume by ID
 * @route   GET /api/resumes/:id
 * @access  Private (requires authentication)
 */
export const getResumeById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id || req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid resume ID', 400);
  }

  const resume = await Resume.findById(id).populate('userId', 'name email');

  if (!resume) {
    throw new AppError('Resume not found', 404);
  }

  // Check if user owns this resume
  if (resume.userId._id.toString() !== userId.toString()) {
    throw new AppError('Unauthorized to access this resume', 403);
  }

  res.status(200).json({
    success: true,
    data: resume,
  });
});

/**
 * @desc    Update a resume
 * @route   PUT /api/resumes/:id
 * @access  Private (requires authentication)
 */
export const updateResume = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id || req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid resume ID', 400);
  }

  const resume = await Resume.findById(id);

  if (!resume) {
    throw new AppError('Resume not found', 404);
  }

  // Check if user owns this resume
  if (resume.userId.toString() !== userId.toString()) {
    throw new AppError('Unauthorized to update this resume', 403);
  }

  // Prevent userId from being updated
  delete req.body.userId;

  const updatedResume = await Resume.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Resume updated successfully',
    data: updatedResume,
  });
});

/**
 * @desc    Delete a resume
 * @route   DELETE /api/resumes/:id
 * @access  Private (requires authentication)
 */
export const deleteResume = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id || req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid resume ID', 400);
  }

  const resume = await Resume.findById(id);

  if (!resume) {
    throw new AppError('Resume not found', 404);
  }

  // Check if user owns this resume
  if (resume.userId.toString() !== userId.toString()) {
    throw new AppError('Unauthorized to delete this resume', 403);
  }

  await Resume.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Resume deleted successfully',
    data: { id },
  });
});
