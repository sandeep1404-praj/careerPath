import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { sendOtpEmail, sendPasswordResetEmail } from '../utils/emailService.js';
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

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    await sendPasswordResetEmail(email, resetToken);

    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in.' });
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

// Update current user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, track } = req.body;
    // The authenticateToken middleware normally sets req.user._id
    const userId = req.user && (req.user._id || req.user.id || req.user);
    if (!userId) return res.status(400).json({ message: 'Invalid user token' });

    const existingUser = await User.findById(userId);
    if (!existingUser) return res.status(404).json({ message: 'User not found' });

    // If email is changing, ensure uniqueness
    if (email && email !== existingUser.email) {
      const conflict = await User.findOne({ email });
      if (conflict) return res.status(400).json({ message: 'Email already in use' });
      existingUser.email = email;
    }

    if (name) existingUser.name = name;
    if (track !== undefined) existingUser.track = track;

    await existingUser.save();

    const userObj = existingUser.toObject();
    delete userObj.password;

    res.json({ message: 'Profile updated', user: userObj });
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
