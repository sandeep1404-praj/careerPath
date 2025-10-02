import StaticRoadmap from "../models/StaticRoadmap.js";
import UserRoadmap from "../models/UserRoadmap.js";

// Get all static roadmaps
export const getStaticRoadmaps = async (req, res) => {
  try {
    console.log('📊 Attempting to fetch static roadmaps...');
    
    // Check if database is connected
    const mongoose = await import('mongoose');
    if (mongoose.default.connection.readyState !== 1) {
      console.error('❌ Database not connected. ReadyState:', mongoose.default.connection.readyState);
      return res.status(500).json({ 
        message: 'Database connection error',
        readyState: mongoose.default.connection.readyState
      });
    }

    const roadmaps = await StaticRoadmap.find().sort({ track: 1 });
    console.log(`✅ Found ${roadmaps.length} static roadmaps`);
    
    if (roadmaps.length === 0) {
      console.log('⚠️ No roadmaps found in database. Seeding might have failed.');
    }
    
    res.json(roadmaps);
  } catch (error) {
    console.error('❌ Error fetching static roadmaps:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Failed to fetch roadmaps', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get a specific static roadmap by ID or track
export const getStaticRoadmap = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find by ID first, then by track name
    let roadmap = await StaticRoadmap.findOne({ id });
    if (!roadmap) {
      roadmap = await StaticRoadmap.findOne({ track: { $regex: new RegExp(id, 'i') } });
    }
    
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }
    
    res.json(roadmap);
  } catch (error) {
    console.error('Error fetching static roadmap:', error);
    res.status(500).json({ 
      message: 'Failed to fetch roadmap', 
      error: error.message 
    });
  }
};

// Get user's personal roadmap
export const getUserRoadmap = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let userRoadmap = await UserRoadmap.findOne({ userId });
    
    // Create empty roadmap if it doesn't exist
    if (!userRoadmap) {
      userRoadmap = new UserRoadmap({
        userId,
        tasks: [],
        preferences: {},
        stats: { totalTasks: 0, completedTasks: 0, inProgressTasks: 0 }
      });
      await userRoadmap.save();
    }
    
    res.json(userRoadmap);
  } catch (error) {
    console.error('Error fetching user roadmap:', error);
    res.status(500).json({ 
      message: 'Failed to fetch user roadmap', 
      error: error.message 
    });
  }
};

// Add task to user's roadmap
export const addTaskToUserRoadmap = async (req, res) => {
  try {
    console.log('🚀 Adding task to user roadmap...');
    console.log('User object:', req.user);
    console.log('User ID type:', typeof req.user?.id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const userId = req.user.id || req.user._id; // Handle both id and _id
    
    if (!userId) {
      console.error('❌ No user ID found in request');
      return res.status(401).json({ message: 'User authentication failed' });
    }
    
    const { 
      taskId, 
      name, 
      description, 
      staticTaskId, 
      roadmapTrack, 
      estimatedTime, 
      difficulty, 
      category, 
      resources = [],
      isCustom = false 
    } = req.body;

    if (!taskId || !name) {
      console.error('❌ Missing required fields:', { taskId, name });
      return res.status(400).json({ message: 'Task ID and name are required' });
    }

    console.log('📋 Looking for existing user roadmap for userId:', userId);
    let userRoadmap = await UserRoadmap.findOne({ userId });
    
    if (!userRoadmap) {
      console.log('📝 Creating new user roadmap...');
      userRoadmap = new UserRoadmap({ 
        userId, 
        tasks: [],
        stats: { totalTasks: 0, completedTasks: 0, inProgressTasks: 0 }
      });
    } else {
      console.log(`📋 Found existing roadmap with ${userRoadmap.tasks.length} tasks`);
    }

    // Check if task already exists in user's roadmap
    const existingTask = userRoadmap.tasks.find(task => task.taskId === taskId);
    if (existingTask) {
      console.log('⚠️ Task already exists:', taskId);
      return res.status(400).json({ message: 'Task already added to your roadmap' });
    }

    // Calculate next order position
    const maxOrder = userRoadmap.tasks.length > 0 
      ? Math.max(...userRoadmap.tasks.map(task => task.order || 0))
      : 0;

    console.log('📊 Max order:', maxOrder);

    // Create new task with proper validation
    const newTask = {
      taskId: String(taskId),
      name: String(name),
      description: description ? String(description) : '',
      staticTaskId: staticTaskId ? String(staticTaskId) : undefined,
      roadmapTrack: roadmapTrack ? String(roadmapTrack) : 'General',
      estimatedTime: estimatedTime ? String(estimatedTime) : undefined,
      difficulty: difficulty,
      category: category ? String(category) : undefined,
      resources: Array.isArray(resources) ? resources : [],
      isCustom: Boolean(isCustom),
      order: maxOrder + 1,
      status: 'not-started'
    };

    console.log('✨ New task created:', JSON.stringify(newTask, null, 2));

    userRoadmap.tasks.push(newTask);
    console.log('💾 Saving user roadmap...');
    
    const savedRoadmap = await userRoadmap.save();
    console.log('✅ Task added successfully');
    
    res.status(201).json({ 
      message: 'Task added successfully', 
      task: newTask,
      roadmap: savedRoadmap 
    });
  } catch (error) {
    console.error('❌ Error adding task to user roadmap:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to add task', 
      error: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update user's roadmap (task status, order, notes, etc.)
export const updateUserRoadmap = async (req, res) => {
  try {
    const userId = req.user.id;
    const { action, taskId, updates, newOrder } = req.body;

    if (!action || !taskId) {
      return res.status(400).json({ message: 'Action and task ID are required' });
    }

    const userRoadmap = await UserRoadmap.findOne({ userId });
    if (!userRoadmap) {
      return res.status(404).json({ message: 'User roadmap not found' });
    }

    const taskIndex = userRoadmap.tasks.findIndex(task => task.taskId === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found in roadmap' });
    }

    switch (action) {
      case 'update-status':
        if (!updates?.status) {
          return res.status(400).json({ message: 'Status is required for update-status action' });
        }
        userRoadmap.tasks[taskIndex].status = updates.status;
        userRoadmap.tasks[taskIndex].updatedAt = new Date();
        
        if (updates.status === 'completed') {
          userRoadmap.tasks[taskIndex].completedAt = new Date();
        }
        break;

      case 'update-notes':
        userRoadmap.tasks[taskIndex].notes = updates.notes || '';
        userRoadmap.tasks[taskIndex].updatedAt = new Date();
        break;

      case 'reorder':
        if (typeof newOrder !== 'number') {
          return res.status(400).json({ message: 'New order position is required for reorder action' });
        }
        
        // Update the order of the task
        const task = userRoadmap.tasks[taskIndex];
        task.order = newOrder;
        task.updatedAt = new Date();

        // Sort tasks by order to maintain consistency
        userRoadmap.tasks.sort((a, b) => a.order - b.order);
        break;

      case 'remove':
        userRoadmap.tasks.splice(taskIndex, 1);
        break;

      case 'update-details':
        // Allow updating custom task details
        if (userRoadmap.tasks[taskIndex].isCustom) {
          Object.assign(userRoadmap.tasks[taskIndex], updates);
          userRoadmap.tasks[taskIndex].updatedAt = new Date();
        } else {
          return res.status(400).json({ message: 'Cannot update details of static tasks' });
        }
        break;

      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    await userRoadmap.save();

    res.json({ 
      message: 'Roadmap updated successfully', 
      roadmap: userRoadmap 
    });
  } catch (error) {
    console.error('Error updating user roadmap:', error);
    res.status(500).json({ 
      message: 'Failed to update roadmap', 
      error: error.message 
    });
  }
};

// Update user roadmap preferences
export const updateUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    let payload = req.body;

    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch (parseError) {
        console.warn('Received string payload that is not valid JSON:', parseError.message);
        return res.status(400).json({ message: 'Invalid JSON payload' });
      }
    }

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return res.status(400).json({ message: 'Request body must be an object' });
    }

    const preferenceSource = payload.preferences && typeof payload.preferences === 'object'
      ? payload.preferences
      : payload;

    if (!preferenceSource || typeof preferenceSource !== 'object' || Array.isArray(preferenceSource)) {
      return res.status(400).json({ message: 'Preferences must be provided as an object' });
    }

    const preferences = preferenceSource;

    const allowedFields = new Set(['defaultTrack', 'showCompleted', 'sortBy']);
    const allowedSortValues = ['order', 'addedAt', 'difficulty', 'track'];

    const sanitizedPreferences = {};
    for (const [key, value] of Object.entries(preferences)) {
      if (!allowedFields.has(key)) continue;

      if (key === 'sortBy' && value && !allowedSortValues.includes(value)) {
        return res.status(400).json({ message: 'Invalid sort option' });
      }

      sanitizedPreferences[key] = value;
    }

    if (Object.keys(sanitizedPreferences).length === 0) {
      return res.status(400).json({ message: 'No valid preferences provided' });
    }

    let userRoadmap = await UserRoadmap.findOne({ userId });
    
    if (!userRoadmap) {
      userRoadmap = new UserRoadmap({
        userId,
        tasks: [],
        preferences: {
          defaultTrack: '',
          showCompleted: true,
          sortBy: 'order'
        }
      });
    }

    const existingPreferences = userRoadmap.preferences && typeof userRoadmap.preferences === 'object'
      ? (typeof userRoadmap.preferences.toObject === 'function'
        ? userRoadmap.preferences.toObject()
        : userRoadmap.preferences)
      : {};

    userRoadmap.preferences = {
      ...existingPreferences,
      ...sanitizedPreferences
    };

    userRoadmap.markModified('preferences');
    await userRoadmap.save();

    res.json({ 
      message: 'Preferences updated successfully', 
      preferences: userRoadmap.preferences 
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ 
      message: 'Failed to update preferences', 
      error: error.message 
    });
  }
};