import express from 'express';
import { sendOtpEmail } from '../utils/emailService.js';

const router = express.Router();

// Test email sending
router.post('/test-email', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    console.log('Testing email send to:', email);
    const result = await sendOtpEmail(email, otp);
    
    if (result) {
      res.json({ success: true, message: 'Email sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send email' });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message,
      details: {
        code: error.code,
        command: error.command
      }
    });
  }
});

export default router;
