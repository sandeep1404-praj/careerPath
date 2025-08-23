import express from "express";
import Roadmap from "../models/Roadmap.js";

const router = express.Router();

// Get all roadmaps
router.get("/", async (req, res) => {
  try {
    const roadmaps = await Roadmap.find();
    res.json(roadmaps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single roadmap by ID
router.get("/:id", async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);
    if (!roadmap) return res.status(404).json({ msg: "Roadmap not found" });
    res.json(roadmap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add roadmap (for admin only later)
router.post("/", async (req, res) => {
  try {
    const { title, description, steps } = req.body;
    const newRoadmap = new Roadmap({ title, description, steps });
    await newRoadmap.save();
    res.json(newRoadmap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
