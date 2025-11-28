# Roadmap Controller Update Guide

## Remaining Functions to Update

This guide shows how to update the remaining roadmapController.js functions to use the error middleware.

### Pattern to Follow:

**Before:**
```javascript
export const someFunction = async (req, res) => {
  try {
    // validation
    if (!data) {
      return res.status(400).json({ message: 'Error message' });
    }
    
    // logic
    const result = await Model.find();
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};
```

**After:**
```javascript
export const someFunction = asyncHandler(async (req, res, next) => {
  // validation
  if (!data) {
    throw new AppError('Error message', 400);
  }
  
  // logic
  const result = await Model.find();
  
  res.json({ success: true, data: result });
});
```

## Functions to Update:

### 1. addTaskToUserRoadmap
**Current:** Lines 79-115
**Updates needed:**
- Wrap in `asyncHandler`
- Replace `return res.status(401).json({ message: '...' })` with `throw new AppError('...', 401)`
- Replace `return res.status(400).json({ message: '...' })` with `throw new AppError('...', 400)`
- Remove try-catch
- Keep validation error handling but use AppError

### 2. updateUserRoadmap
**Updates needed:**
- Wrap in `asyncHandler`
- Replace all `return res.status(...).json()` with `throw new AppError()`
- Remove try-catch

### 3. updateUserPreferences
**Updates needed:**
- Wrap in `asyncHandler`  
- Replace all status code responses with AppError
- Remove try-catch

### 4. addRoadmapToUser
**Updates needed:**
- Wrap in `asyncHandler`
- Replace all error responses with AppError
- Remove try-catch

### 5. deleteRoadmapFromUser
**Updates needed:**
- Wrap in `asyncHandler`
- Replace all error responses with AppError
- Remove try-catch

## Quick Reference Commands:

### Step 1: Import check
Make sure top of file has:
```javascript
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
```

### Step 2: For each function:
1. Change `async (req, res) => {` to `asyncHandler(async (req, res, next) => {`
2. Remove `try {` at start and entire `} catch(error) { ... }` block
3. Find all `return res.status(4xx).json({ message: '...' })`
4. Replace with `throw new AppError('...', 4xx);`
5. For validation errors, can still use:
```javascript
if (error.name === 'ValidationError') {
  const validationErrors = Object.values(error.errors).map(err => err.message);
  throw new AppError('Validation failed', 400, validationErrors);
}
```

## Testing After Updates:

1. Start backend: `npm start`
2. Test each endpoint:
   - Valid requests should work normally
   - Invalid requests should return consistent error format:
   ```json
   {
     "success": false,
     "status": "fail",
     "message": "Error message",
     "errors": ["validation error 1", "validation error 2"]
   }
   ```

3. Check frontend catches errors properly
4. Verify toast notifications show correct messages

## Example: addTaskToUserRoadmap Updated

```javascript
export const addTaskToUserRoadmap = asyncHandler(async (req, res, next) => {
  const userId = req.user.id || req.user._id;
  
  if (!userId) {
    throw new AppError('User authentication failed', 401);
  }
  
  const { 
    taskId, name, description, staticTaskId, roadmapTrack, 
    estimatedTime, difficulty, category, resources = [], isCustom = false 
  } = req.body;

  if (!taskId || !name) {
    throw new AppError('Task ID and name are required', 400);
  }
  
  let userRoadmap = await UserRoadmap.findOne({ userId });
  
  if (!userRoadmap) {
    userRoadmap = new UserRoadmap({ 
      userId, 
      tasks: [],
      stats: { totalTasks: 0, completedTasks: 0, inProgressTasks: 0 }
    });
  }

  const existingTask = userRoadmap.tasks.find(task => task.taskId === taskId);
  if (existingTask) {
    throw new AppError('Task already added to your roadmap', 400);
  }

  const maxOrder = userRoadmap.tasks.length > 0 
    ? Math.max(...userRoadmap.tasks.map(task => task.order || 0))
    : 0;
    
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
  
  userRoadmap.tasks.push(newTask);
  const savedRoadmap = await userRoadmap.save();
  
  // Send motivational email (don't throw on email errors)
  try {
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(userId);
    if (user && user.notificationEnabled) {
      const { sendTaskMotivationEmail } = await import('../utils/emailService.js');
      await sendTaskMotivationEmail({
        to: user.email,
        task: {
          title: newTask.name,
          description: newTask.description,
          estimatedTime: newTask.estimatedTime || '',
        }
      });
    }
  } catch (mailErr) {
    console.error('Email notification failed:', mailErr);
  }

  res.status(201).json({ 
    message: 'Task added successfully', 
    task: newTask,
    roadmap: savedRoadmap 
  });
});
```

## Auth Routes Update Pattern

For routes in `backend/routes/auth.js`, update each route handler similarly:

```javascript
// Before
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    // ... rest of code
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// After
router.post('/signup', asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User already exists', 400);
  }
  // ... rest of code
}));
```

## Summary

By following this pattern consistently:
1. **Less code** - No try-catch blocks
2. **Consistency** - All errors formatted the same
3. **Maintainability** - Easy to add/modify error handling
4. **DX** - Simple `throw new AppError()` instead of return status
5. **UX** - Frontend gets consistent, parseable error responses
