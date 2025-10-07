import express from 'express';
import Roadmap from '../models/Roadmap.js';
import User from '../models/User.js';
import { sendTaskMotivationEmail } from '../utils/emailService.js';

const router = express.Router();

// Fetch user tasks
router.get('/', async (req, res) => {
  const { userId } = req.query;
  try {
    const tasks = await Roadmap.find({ userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Trigger email manually
router.post('/:taskId/send-email', async (req, res) => {
  try {
    const task = await Roadmap.findById(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const user = await User.findById(task.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await sendTaskMotivationEmail({ to: user.email, task });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
