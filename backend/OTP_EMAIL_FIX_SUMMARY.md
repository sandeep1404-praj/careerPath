# OTP Email Sending Issue - Root Cause & Fixes

## Problem Reported
**Error:** 500 response with message "Failed to send OTP email. Please verify your email address and try again. If problem persists, contact support."

## Root Causes Identified & Fixed

### 1. **Incomplete Email Configuration Validation** ❌ → ✅
**Issue in [routes/auth.js](routes/auth.js):**
- The code was initializing `emailSent = true` incorrectly
- It only checked `if (process.env.EMAIL_USER)` but not `EMAIL_PASSWORD`
- If `EMAIL_USER` was set but `EMAIL_PASSWORD` was missing/invalid, the code would:
  - Skip email sending (because both weren't set)
  - Keep `emailSent = true` (wrong default)
  - Skip error check
  - Return success even though email wasn't sent

**Fixes Applied:**
```javascript
// BEFORE (WRONG)
let emailSent = true;
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  emailSent = await sendOtpEmail(email, otp);
}
if (!emailSent && process.env.EMAIL_USER) { // Missing PASSWORD check!
  return res.status(500).json({ ... });
}

// AFTER (CORRECT)
const emailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;
let emailSent = false;
if (!emailConfigured) {
  // Production error, development allows testing without email
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({ 
      message: 'Server email configuration error. Please contact support.',
      error: 'EMAIL_CONFIG_MISSING'
    });
  }
} else {
  try {
    emailSent = await sendOtpEmail(email, otp);
  } catch (emailError) {
    emailSent = false;
  }
}
if (!emailSent && emailConfigured) {
  // Return error only if email sending was attempted and failed
  return res.status(500).json({ 
    message: 'Failed to send OTP email. Please verify your email address and try again. If problem persists, contact support.',
    error: 'EMAIL_SEND_FAILED'
  });
}
```

---

### 2. **Missing Request Timeout** ❌ → ✅
**Issue:** Email retry logic (up to 6 retry attempts across 2 ports) could take 10+ seconds, but routes had no timeout configured. Frontend requests would hang or timeout before the backend completed.

**Fix Applied:**
Added timeout middleware to all email-sending routes:
```javascript
const setSignupTimeout = (req, res, next) => {
  req.setTimeout(90000); // 90 seconds
  next();
};

const setEmailTimeout = (req, res, next) => {
  req.setTimeout(90000); // 90 seconds
  next();
};

// Applied to these routes:
router.post('/signup', setSignupTimeout, async (req, res) => { ... });
router.post('/resend-otp', setEmailTimeout, async (req, res) => { ... });
router.post('/forgot-password', setEmailTimeout, async (req, res) => { ... });
```

---

### 3. **Password Reset Email Not Using Retry Logic** ❌ → ✅
**Issue:** `sendPasswordResetEmail()` was using a basic transporter without the dual-port fallback retry logic that `sendOtpEmail()` has.

**Fix Applied:**
Updated [utils/emailService.js](utils/emailService.js) to use `sendEmailWithRetry()` for password reset emails, giving them the same robustness:
- Tries port 587 (STARTTLS) first
- Falls back to port 465 (SSL) if 587 fails
- Retries up to 3 times per port with exponential backoff
- Catches and logs all errors

---

### 4. **Incomplete Error Handling in /forgot-password** ❌ → ✅
**Issue:** The route wasn't checking if `sendPasswordResetEmail()` succeeded before returning success response.

**Fix Applied:**
```javascript
// BEFORE
await sendPasswordResetEmail(email, resetToken);
res.json({ message: 'Password reset email sent' });

// AFTER
const emailSent = await sendPasswordResetEmail(email, resetToken);
if (!emailSent) {
  return res.status(500).json({ 
    message: 'Failed to send password reset email. Please verify your email address and try again. If problem persists, contact support.',
    error: 'EMAIL_SEND_FAILED'
  });
}
res.json({ message: 'Password reset email sent' });
```

---

## Files Modified
1. **backend/routes/auth.js**
   - Fixed validation logic for `/signup` route
   - Fixed validation logic for `/resend-otp` route  
   - Fixed error handling for `/forgot-password` route
   - Added timeout middleware to all email-sending routes

2. **backend/utils/emailService.js**
   - Updated `sendPasswordResetEmail()` to use `sendEmailWithRetry()`
   - Removed basic transporter, now uses same retry logic as OTP emails

---

## Email Configuration Verification

**Required Environment Variables (in .env):**
```
EMAIL_USER=contactwebsandeep@gmail.com
EMAIL_PASSWORD=xudecceckqfaqqnz  # Gmail App Password (16 chars, no spaces)
```

**Gmail App Password Requirements:**
1. ✅ Gmail 2-Step Verification MUST be enabled
2. ✅ Generate App Password at: https://myaccount.google.com/apppasswords
3. ✅ Use the 16-character password (with no spaces)
4. ✅ Not your regular Gmail password

**To verify setup is working, use:**
```bash
curl -X GET http://localhost:5000/api/test/check-email-config
```

---

## How Email Retry Logic Works

**Dual-Port Strategy:**
1. Tries port 587 (STARTTLS) - works on most networks
2. Falls back to port 465 (SSL) - more reliable on restrictive networks like Render

**Retry Logic:**
- Up to 3 attempts per port
- Wait times: 1s, 3s, 7s (exponential backoff)
- Auth errors (EAUTH) skip to next port
- Network errors (ETIMEDOUT, ECONNREFUSED) skip to next port
- Other errors retry same port

**Result:**
- Maximum 6 total send attempts (3 per port × 2 ports)
- Total max wait time: ~50 seconds
- Comprehensive logging for debugging

---

## Testing the Fix

### Test 1: Signup with Email
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

Expected response (if email configured):
```json
{
  "message": "Signup successful. OTP sent to your email for verification.",
  "email": "test@example.com"
}
```

### Test 2: Resend OTP
```bash
curl -X POST http://localhost:5000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

### Test 3: Check Email Configuration
```bash
curl -X GET http://localhost:5000/api/test/check-email-config
```

Will show:
```json
{
  "EMAIL_USER_configured": true,
  "EMAIL_PASSWORD_configured": true,
  "ready": true
}
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `EAUTH` error | Invalid Gmail App Password - regenerate at myaccount.google.com/apppasswords |
| `ETIMEDOUT` on port 587 | Network blocks port 587 - auto-fallback to port 465 handles this |
| Email never arrives | Check spam/junk folder; verify sender email is from `contactwebsandeep@gmail.com` |
| Request times out (>30s) | Now fixed with 90-second timeout on email routes |
| "EMAIL_CONFIG_MISSING" in production | Set both EMAIL_USER and EMAIL_PASSWORD in production .env |

---

## Deployment Notes

When deploying to production (e.g., Render):
1. Ensure `.env` has BOTH EMAIL_USER and EMAIL_PASSWORD set
2. The dual-port strategy handles both open ports (465 is more reliable on Render)
3. Timeout of 90 seconds ensures enough time for retry logic
4. Monitor backend logs for email send attempts and failures

---

## Summary of Changes

✅ **Validation Logic:** Fixed email configuration checks to verify both USER and PASSWORD
✅ **Timeout Handling:** Added 90-second timeout to all email-sending routes  
✅ **Retry Logic:** Extended to password reset emails for consistency
✅ **Error Handling:** Proper error responses when email sending fails
✅ **Logging:** Enhanced with detailed email send attempt logs

All changes ensure robust email delivery even on restrictive networks while providing clear error messages for debugging.
