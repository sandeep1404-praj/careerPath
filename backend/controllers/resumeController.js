import Resume from '../models/resume.js';
import mongoose from 'mongoose';

/**
 * @desc    Create a new resume
 * @route   POST /api/resumes
 * @access  Private (requires authentication)
 */
export const createResume = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    // Accept payload from client but sanitize and merge with defaults
    const payload = req.body || {};
    const { title } = payload;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
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
  } catch (error) {
    console.error('Error creating resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create resume',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all resumes (admin or general listing)
 * @route   GET /api/resumes
 * @access  Private (requires authentication)
 */
export const getAllResumes = async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resumes',
      error: error.message,
    });
  }
};

/**
 * @desc    Get resumes for a specific user
 * @route   GET /api/resumes/user/:userId
 * @access  Private (requires authentication)
 */
export const getUserResumes = async (req, res) => {
  try {
    const { userId } = req.params;
    const authenticatedUserId = req.user._id || req.user.id;

    // Users can only access their own resumes unless they're admin
    // Add admin check here if you have role-based access
    if (userId !== authenticatedUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to access these resumes',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    const resumes = await Resume.find({ userId })
      .sort({ updatedAt: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      count: resumes.length,
      data: resumes,
    });
  } catch (error) {
    console.error('Error fetching user resumes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user resumes',
      error: error.message,
    });
  }
};

/**
 * @desc    Get a single resume by ID
 * @route   GET /api/resumes/:id
 * @access  Private (requires authentication)
 */
export const getResumeById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resume ID',
      });
    }

    const resume = await Resume.findById(id).populate('userId', 'name email');

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    // Check if user owns this resume
    if (resume.userId._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to access this resume',
      });
    }

    res.status(200).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resume',
      error: error.message,
    });
  }
};

/**
 * @desc    Update a resume
 * @route   PUT /api/resumes/:id
 * @access  Private (requires authentication)
 */
export const updateResume = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resume ID',
      });
    }

    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    // Check if user owns this resume
    if (resume.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this resume',
      });
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
  } catch (error) {
    console.error('Error updating resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update resume',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a resume
 * @route   DELETE /api/resumes/:id
 * @access  Private (requires authentication)
 */
export const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resume ID',
      });
    }

    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    // Check if user owns this resume
    if (resume.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this resume',
      });
    }

    await Resume.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully',
      data: { id },
    });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resume',
      error: error.message,
    });
  }
};
