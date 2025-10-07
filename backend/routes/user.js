import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Toggle notification ON/OFF
router.patch('/notification', async (req, res) => {
  const { userId, enabled } = req.body;
  try {
    const user = await User.findByIdAndUpdate(userId, { notificationEnabled: enabled }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ notificationEnabled: user.notificationEnabled });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
