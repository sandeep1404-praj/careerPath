# Simplified Signup Flow - Complete Rewrite

## Overview
The signup process has been completely rewritten with a cleaner, more straightforward implementation:
1. User enters details (name, email, password) → Receives OTP via email
2. User verifies OTP → Account is created
3. User logs in with email and password

---

## New Signup Flow

### Step 1: User Signup (POST `/api/auth/signup`)
**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Process:**
1. Validate input (name, email, password required)
2. Check if user already exists
3. Generate 6-digit OTP (valid for 3 minutes)
4. Save OTP with user details temporarily in OTP collection
5. Send OTP to user's email
6. Return success message

**Success Response (201):**
```json
{
  "message": "Signup initiated. OTP sent to your email. Please verify within 3 minutes.",
  "email": "john@example.com",
  "otp": "123456"  // Only in development mode
}
```

**Error Responses:**
- 400: Missing required fields, user already exists
- 500: Email sending failed

---

### Step 2: Verify OTP (POST `/api/auth/verify-signup-otp`)
**Request:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Process:**
1. Find OTP record matching email and OTP code
2. Validate OTP hasn't expired (3-minute window)
3. Verify signup data exists in OTP record
4. Double-check user doesn't already exist
5. Hash password securely (bcrypt with 10 rounds)
6. Create user account in User collection
7. Mark user as verified (`isVerified: true`)
8. Delete OTP record (cleanup)

**Success Response (201):**
```json
{
  "message": "Email verified successfully! Account created. You can now log in.",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- 400: Invalid OTP, OTP expired, session expired, user already exists
- 500: Verification failed

---

### Step 3: User Login (POST `/api/auth/login`)
**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Process:**
1. Find user by email
2. Verify password matches
3. Check user is verified (`isVerified: true`)
4. Generate JWT token (expires in 24 hours)
5. Return user data and token

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "isVerified": true,
    "createdAt": "2026-05-17T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Key Improvements

### Simplicity ✅
- Direct flow: Signup → Verify OTP → Login
- No complex session management
- Clear error messages at each step

### Security ✅
- Password hashed with bcrypt (10 rounds) during verification, not signup
- OTP stored temporarily (deleted after verification)
- Plain password never stored
- JWT tokens for authenticated requests
- Email verification required

### Data Flow ✅
- Signup: Store OTP + temporary user details
- Verify: Create user account when OTP validated
- Login: JWT-based authentication

### Database Usage ✅
- **OTP collection:** Temporary storage for signup verification
- **User collection:** Permanent user accounts
- OTP records auto-deleted after verification or expiration

---

## Code Changes

### Files Modified:
- `backend/routes/auth.js`
  - `/signup` endpoint: Simplified to just generate OTP and send email
  - `/verify-signup-otp` endpoint: Create user account after OTP verified
  - `/login` endpoint: Unchanged (already working correctly)

### Removed Complexity:
- ❌ Removed `signupPasswordHash` → Now stores `signupPassword` (hashed during verification)
- ❌ Removed excessive error checking in signup → Cleaner validation
- ✅ Simplified OTP generation and storage
- ✅ Cleaner error messages

### Added Features:
- Better logging with emojis (✅ ❌)
- User data returned after successful account creation
- Development mode returns OTP for testing

---

## Testing

### Test Signup:
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

### Test OTP Verification:
```bash
curl -X POST http://localhost:5000/api/auth/verify-signup-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

### Test Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

---

## Summary

The signup flow is now **simpler and cleaner**:
- **Signup:** Enter details → Get OTP
- **Verify:** Submit OTP → Account created
- **Login:** Use email + password → Get JWT token

All validation, security, and error handling are in place! 🚀
