import express from 'express';
import { sendOtpEmail } from '../utils/emailService.js';

const router = express.Router();

// Test email sending with detailed diagnostics
router.post('/test-email', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    console.log('\n🧪 EMAIL TEST START');
    console.log(`📧 To: ${email}`);
    console.log(`🔐 OTP: ${otp}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const result = await sendOtpEmail(email, otp);
    
    console.log('🧪 EMAIL TEST END\n');

    if (result) {
      res.json({ 
        success: true, 
        message: 'Email sent successfully',
        details: 'Check backend logs for detailed diagnostic output'
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send email - check backend logs for error details' 
      });
    }
  } catch (error) {
    console.error('🧪 TEST ERROR:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      errorCode: error.code,
      details: 'Check backend logs for full error details'
    });
  }
});

// Check email configuration
router.get('/check-email-config', (req, res) => {
  console.log('\n🔍 EMAIL CONFIGURATION CHECK');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? `✅ ${process.env.EMAIL_USER}` : '❌ NOT SET');
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ SET (length: ' + process.env.EMAIL_PASSWORD.length + ')' : '❌ NOT SET');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'production (default)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  res.json({
    email_user: process.env.EMAIL_USER ? 'SET' : 'MISSING',
    email_password: process.env.EMAIL_PASSWORD ? 'SET' : 'MISSING',
    password_length: process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0,
    node_env: process.env.NODE_ENV || 'production'
  });
});

export default router;
