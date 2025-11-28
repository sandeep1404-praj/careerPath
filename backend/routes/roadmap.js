import express from "express";
import Roadmap from "../models/Roadmap.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  getStaticRoadmaps,
  getStaticRoadmap,
  getUserRoadmap,
  addTaskToUserRoadmap,
  addRoadmapToUser,
  deleteRoadmapFromUser,
  updateUserRoadmap,
  updateUserPreferences
} from "../controllers/roadmapController.js";

const router = express.Router();

// Debug endpoint to check database status
router.get("/debug", async (req, res) => {
  try {
    const mongoose = await import('mongoose');
    const StaticRoadmap = (await import('../models/StaticRoadmap.js')).default;
    
    const dbStatus = {
      connected: mongoose.default.connection.readyState === 1,
      readyState: mongoose.default.connection.readyState,
      host: mongoose.default.connection.host,
      name: mongoose.default.connection.name
    };

    const roadmapCount = await StaticRoadmap.countDocuments();
    
    res.json({
      database: dbStatus,
      roadmapCount,
      message: roadmapCount === 0 ? 'No roadmaps found in database' : 'Database looks good'
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// Simple JSON body test endpoint (no auth required)
// // router.post("/test-json", (req, res) => {
// //   console.log('🧪 JSON Test endpoint hit');
// //   console.log('req.body:', req.body);
// //   console.log('req.body type:', typeof req.body);
// //   console.log('Content-Type:', req.headers['content-type']);
  
//   res.json({
//     message: 'JSON test successful',
//     receivedBody: req.body,
//     bodyType: typeof req.body,
//     contentType: req.headers['content-type']
//   });
// });

// IMPORTANT: All specific routes MUST come before any parameterized routes!

// Get all static roadmaps
router.get("/static", getStaticRoadmaps);

// Get specific static roadmap
router.get("/static/:id", getStaticRoadmap);

// Get user's personal roadmap (protected)
router.get("/user", authenticateToken, getUserRoadmap);

// Add task to user's roadmap (protected)
router.post("/user/add", authenticateToken, addTaskToUserRoadmap);

// Add entire roadmap to user's collection (protected)
router.post("/user/add-roadmap", authenticateToken, addRoadmapToUser);

// Delete entire roadmap from user's collection (protected)
router.delete("/user/delete-roadmap/:roadmapId", authenticateToken, deleteRoadmapFromUser);

// Test endpoint to debug request body
router.post("/user/debug-body", authenticateToken, (req, res) => {
  // console.log('🔍 Debug body endpoint hit');
  // console.log('req.body:', req.body);
  // console.log('req.body type:', typeof req.body);
  // console.log('req.headers:', req.headers);
  // console.log('Content-Type:', req.headers['content-type']);
  
  res.json({ 
    message: 'Debug successful',
    body: req.body,
    bodyType: typeof req.body,
    contentType: req.headers['content-type'],
    user: {
      id: req.user.id || req.user._id,
      email: req.user.email
    }
  });
});

// Test endpoint to verify authentication
router.post("/user/test", authenticateToken, (req, res) => {
  res.json({ 
    message: 'Authentication test successful',
    user: {
      id: req.user.id || req.user._id,
      email: req.user.email,
      name: req.user.name
    }
  });
});

// Update user's roadmap (protected)
router.patch("/user/update", authenticateToken, updateUserRoadmap);

// Update user preferences (protected)
router.patch("/user/preferences", authenticateToken, updateUserPreferences);

// Legacy routes for backward compatibility (THESE MUST BE LAST)
// Get all legacy roadmaps
router.get("/legacy", async (req, res) => {
  try {
    const roadmaps = await Roadmap.find();
    res.json(roadmaps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add roadmap (for admin only later)
router.post("/legacy", async (req, res) => {
  try {
    const { title, description, steps } = req.body;
    const newRoadmap = new Roadmap({ title, description, steps });
    await newRoadmap.save();
    res.json(newRoadmap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DANGER ZONE: Parameterized routes MUST be last!
// Get single legacy roadmap by ID (this catches everything else)
router.get("/:id", async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);
    if (!roadmap) return res.status(404).json({ msg: "Roadmap not found" });
    res.json(roadmap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
