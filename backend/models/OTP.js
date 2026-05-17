import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  otp: {
    type: String,
    required: true
  },
  expiry: {
    type: Date,
    required: true
  },
  purpose: {
    type: String,
    enum: ['signup', 'login', 'reset'], // <-- 'signup' included
    required: true 
  },
  signupName: {
    type: String,
    trim: true,
    default: null
  },
  signupPasswordHash: {
    type: String,
    default: null
  }
});

// Index for faster queries
otpSchema.index({ email: 1, purpose: 1 });

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;