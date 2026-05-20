import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { sendOtpEmail, sendPasswordResetEmail } from '../utils/emailService.js';
import { authenticateToken } from '../middleware/auth.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Generate numeric OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Add timeout middleware for auth routes (email operations can be slow)
// 90 seconds for signup/password reset, 30 seconds for login
const setSignupTimeout = (req, res, next) => {
  req.setTimeout(90000); // 90 seconds for signup (includes email retry logic)
  next();
};

const setEmailTimeout = (req, res, next) => {
  req.setTimeout(90000);
  next();
};

// Step 1: Signup - User enters name, email, password and receives OTP
router.post('/signup', setSignupTimeout, async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate OTP (6-digit code valid for 3 minutes)
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 3 * 60 * 1000);

    // Delete any previous OTP for this email
    await OTP.deleteMany({ email, purpose: 'signup' });

    // Hash password and store in OTP record (avoid storing plain password)
    const signupPasswordHash = await bcrypt.hash(password, 10);

    // Store OTP with user details (temporary storage)
    await OTP.create({
      email,
      otp,
      expiry: otpExpiry,
      purpose: 'signup',
      signupName: name,
      signupPasswordHash
    });

    // Send OTP email
    const emailSent = await sendOtpEmail(email, otp);

    if (!emailSent) {
      // Clean up OTP if email fails
      await OTP.deleteMany({ email, purpose: 'signup' });
      return res.status(500).json({ 
        message: 'Failed to send OTP. Please check your email address and try again.',
        error: 'EMAIL_SEND_FAILED'
      });
    }

    res.status(201).json({ 
      message: 'Signup initiated. OTP sent to your email. Please verify within 3 minutes.',
      email,
      // For development/testing only (return OTP for testing without email)
      ...(process.env.NODE_ENV === 'development' && { otp })
    });

  } catch (error) {
    console.error('❌ Signup error:', error.message);
    res.status(500).json({ message: 'Signup failed. Please try again.' });
  }
});

// Step 2: Verify OTP - User verifies OTP to complete signup and create account
router.post('/verify-signup-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ email, otp, purpose: 'signup' });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // Check if OTP is expired
    if (otpRecord.expiry < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'OTP has expired. Please sign up again.' });
    }

    // Check if signup data exists
    if (!otpRecord.signupName || !otpRecord.signupPasswordHash) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'Signup session expired. Please sign up again.' });
    }

    // Double-check user doesn't already exist
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user account
    const newUser = await User.create({
      name: otpRecord.signupName,
      email,
      password: otpRecord.signupPasswordHash,
      isVerified: true
    });

    // Delete OTP record (no longer needed)
    await OTP.deleteOne({ _id: otpRecord._id });

    console.log('✅ User registered successfully:', email);

    res.status(201).json({ 
      message: 'Email verified successfully! Account created. You can now log in.',
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error('❌ OTP verification error:', error.message);
    res.status(500).json({ message: 'Verification failed. Please try again.' });
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

    if (!user.password) {
      return res.status(400).json({ message: 'Password login is not available for this account' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email with the OTP sent to you.' });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'Server configuration error: missing JWT secret' });
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
router.post('/resend-otp', setEmailTimeout, async (req, res) => {
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
    const emailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;
    
    let emailSent = false;
    if (!emailConfigured) {
      console.warn('⚠️ Email configuration incomplete - EMAIL_USER or EMAIL_PASSWORD missing');
      if (process.env.NODE_ENV === 'production') {
        await OTP.deleteOne({ _id: otpRecord._id });
        return res.status(500).json({ 
          message: 'Server email configuration error. Please contact support.',
          error: 'EMAIL_CONFIG_MISSING'
        });
      }
    } else {
      try {
        emailSent = await sendOtpEmail(email, otp);
      } catch (emailError) {
        console.error('Exception during OTP send:', emailError.message);
        emailSent = false;
      }
    }

    if (!emailSent && emailConfigured) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(500).json({ 
        message: 'Failed to send OTP email. Please verify your email address and try again. If problem persists, contact support.',
        error: 'EMAIL_SEND_FAILED'
      });
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
router.post('/forgot-password', setEmailTimeout, async (req, res) => {
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

    const emailSent = await sendPasswordResetEmail(email, resetToken);
    
    if (!emailSent) {
      console.error('Password reset email failed for:', email);
      return res.status(500).json({ 
        message: 'Failed to send password reset email. Please verify your email address and try again. If problem persists, contact support.',
        error: 'EMAIL_SEND_FAILED'
      });
    }

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
