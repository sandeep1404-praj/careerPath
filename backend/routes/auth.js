import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { sendOtpEmail } from '../utils/emailService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Generate numeric OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Signup with OTP verification
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword,
      isVerified: false
    });

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

    // Save OTP
    await OTP.create({
      email,
      otp,
      expiry: otpExpiry,
      purpose: 'signup'
    });

    // Send OTP email
    let emailSent = true;
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      emailSent = await sendOtpEmail(email, otp);
    } else {
      console.log('Email not configured. OTP for testing:', otp);
    }

    if (!emailSent && process.env.EMAIL_USER) {
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.status(201).json({ 
      message: 'Signup successful. OTP sent to your email for verification.',
      email,
      // For testing without email configuration
      ...(process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER && { otp })
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify OTP for signup
router.post('/verify-signup-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const otpRecord = await OTP.findOne({ email, otp, purpose: 'signup' });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    if (otpRecord.expiry < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'OTP has expired. Please sign up again.' });
    }

    // Mark user as verified
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isVerified = true;
    await user.save();

    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login (no OTP)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email with the OTP sent to you.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists and password is correct
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

    // Delete any existing OTP for this user
    await OTP.deleteMany({ email, purpose: 'login' });

    // Save new OTP
    const otpRecord = new OTP({
      email,
      otp,
      expiry: otpExpiry,
      purpose: 'login'
    });
    await otpRecord.save();

    // Send OTP email
    let emailSent = true;
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      emailSent = await sendOtpEmail(email, otp);
    } else {
      console.log('Email not configured. New OTP for testing:', otp);
    }

    if (!emailSent && process.env.EMAIL_USER) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.json({
      message: 'New OTP sent to your email',
      otpId: otpRecord._id,
      // For testing without email configuration
      ...(process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER && { otp })
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Auth routes are working!',
    emailVerification: 'enabled',
    otpSystem: 'enabled'
  });
});

export default router;
