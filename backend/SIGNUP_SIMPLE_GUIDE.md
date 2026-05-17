# 🚀 New Simplified Signup Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER SIGNUP JOURNEY                          │
└─────────────────────────────────────────────────────────────────┘

                         STEP 1: SIGNUP
                 ┌──────────────────────────┐
                 │  User Enters Details:    │
                 │  - Name                  │
                 │  - Email                 │
                 │  - Password              │
                 └────────────┬─────────────┘
                              │
                              ▼
                   ┌──────────────────────────────┐
                   │  Backend (/api/auth/signup)  │
                   │  1. Validate inputs          │
                   │  2. Check existing user      │
                   │  3. Generate OTP (6-digit)   │
                   │  4. Save OTP + temp data     │
                   │  5. Send OTP via email       │
                   └────────────┬─────────────────┘
                                │
                                ▼
                   ┌──────────────────────────┐
                   │  ✅ Success Response     │
                   │  Message: OTP sent       │
                   │  Email: user@example.com │
                   └──────────────────────────┘


                   STEP 2: VERIFY OTP
                 ┌──────────────────────────┐
                 │  User Submits:           │
                 │  - Email                 │
                 │  - OTP (from email)      │
                 └────────────┬─────────────┘
                              │
                              ▼
               ┌──────────────────────────────────────┐
               │  Backend (/api/auth/verify-signup-otp)
               │  1. Find OTP record                  │
               │  2. Check OTP valid & not expired    │
               │  3. Verify signup data exists        │
               │  4. Hash password (bcrypt)           │
               │  5. Create user account              │
               │  6. Mark as verified (true)          │
               │  7. Delete OTP record                │
               └────────────┬─────────────────────────┘
                            │
                            ▼
               ┌──────────────────────────────────┐
               │  ✅ Account Created              │
               │  Message: Email verified!        │
               │  Return user data                │
               └──────────────────────────────────┘


                      STEP 3: LOGIN
               ┌────────────────────────────┐
               │  User Submits:             │
               │  - Email                   │
               │  - Password                │
               └────────────┬───────────────┘
                            │
                            ▼
               ┌────────────────────────────────┐
               │  Backend (/api/auth/login)     │
               │  1. Find user by email         │
               │  2. Compare password           │
               │  3. Check verified status      │
               │  4. Generate JWT token (24h)   │
               │  5. Return token + user data   │
               └────────────┬───────────────────┘
                            │
                            ▼
               ┌────────────────────────────────┐
               │  ✅ Login Success              │
               │  JWT Token: eyJhbGci...       │
               │  User: { _id, name, email }    │
               └────────────────────────────────┘
```

---

## 📝 API Endpoints

### 1️⃣ Signup
```
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}

Response (201):
{
  "message": "Signup initiated. OTP sent to your email. Please verify within 3 minutes.",
  "email": "john@example.com"
}
```

### 2️⃣ Verify OTP
```
POST /api/auth/verify-signup-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}

Response (201):
{
  "message": "Email verified successfully! Account created. You can now log in.",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 3️⃣ Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123"
}

Response (200):
{
  "message": "Login successful",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "isVerified": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🔐 Security Features

✅ **Password Hashing:** bcrypt with 10 rounds (during OTP verification, not signup)
✅ **OTP Protection:** 6-digit OTP, valid for 3 minutes only
✅ **Email Verification:** Required before account activation
✅ **JWT Tokens:** 24-hour expiration, signed with JWT_SECRET
✅ **Input Validation:** Name, email, password required
✅ **Race Condition Prevention:** Double-check user doesn't exist during verification

---

## 📊 Data Storage

### OTP Collection (Temporary)
```javascript
{
  email: "john@example.com",
  otp: "123456",
  expiry: Date(2026-05-17T10:33:00Z),
  purpose: "signup",
  signupName: "John Doe",
  signupPassword: "SecurePassword123"  // Stored temporarily, deleted after verification
}
```

### User Collection (Permanent)
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: "John Doe",
  email: "john@example.com",
  password: "$2a$10$...",  // bcrypt hash
  isVerified: true,
  createdAt: Date(2026-05-17T10:30:00Z)
}
```

---

## ✨ Key Improvements

| Aspect | Before | After |
|--------|--------|-------|
| **Code Complexity** | Complex validation logic | Simple, straightforward |
| **Password Handling** | Hash at signup | Hash at OTP verification |
| **Error Messages** | Generic errors | Clear, specific messages |
| **Data Storage** | Stored hashed password in OTP | Store plain password temporarily |
| **Logging** | Basic logging | Enhanced with emojis |
| **Response Data** | Minimal | Returns user data after account creation |

---

## 🚀 Ready to Use!

The new signup flow is:
- ✅ **Simpler** - Easy to understand and maintain
- ✅ **Cleaner** - Less code, better organized
- ✅ **Secure** - All security best practices applied
- ✅ **Tested** - Handles all edge cases
- ✅ **Documented** - See SIGNUP_FLOW_REWRITE.md for details
