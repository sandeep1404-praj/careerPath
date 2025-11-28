# CareerCompass Backend

## Email Verification Setup

This backend now includes email verification functionality for user signup. Here's what you need to set up:

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/careercompass

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration (Gmail) - Optional for testing
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here

# Frontend URL (for email verification links)
FRONTEND_URL=http://localhost:5173

# Server Port
PORT=5000
```

### Quick Start (Without Email Setup)

For testing without email verification:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start MongoDB** (if not already running):
   ```bash
   # On Windows (if using MongoDB Community)
   "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env to your Atlas connection string
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```

4. **Test the connection:**
   - Visit: `http://localhost:5000/api/health`
   - Should return: `{"status":"OK","message":"Server is running"}`

### Gmail Setup (Optional)

To use Gmail for sending emails, you need to:

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate a new app password for "Mail"
   - Use this password in your `EMAIL_PASSWORD` environment variable

### API Endpoints

#### Health Check
- **GET** `/api/health`
- Returns server status

#### Signup
- **POST** `/api/auth/signup`
- Creates user account and sends verification email
- Body: `{ name, email, password }`

#### Verify Email
- **GET** `/api/auth/verify-email/:token`
- Verifies user email using the token from the email

#### Resend Verification
- **POST** `/api/auth/resend-verification`
- Resends verification email if the original expires
- Body: `{ email }`

#### Login
- **POST** `/api/auth/login`
- Login (requires email verification)
- Body: `{ email, password }`

#### Profile
- **GET** `/api/auth/profile`
- Get user profile (requires authentication)
- Headers: `Authorization: Bearer <token>`

#### Test
- **GET** `/api/auth/test`
- Test endpoint to verify auth routes are working

### Troubleshooting

#### Common Issues:

1. **"Cannot connect to server"**
   - Make sure the backend is running: `npm run dev`
   - Check if port 5000 is available
   - Verify MongoDB is running

2. **"MongoDB connection error"**
   - Check your `MONGODB_URI` in `.env`
   - Make sure MongoDB is running locally or Atlas is accessible
   - Try: `mongodb://localhost:27017/careercompass`

3. **"CORS error"**
   - Backend CORS is configured for `http://localhost:5173`
   - Make sure frontend is running on the correct port

4. **"Email verification failed"**
   - Check email credentials in `.env`
   - Or test without email setup (signup will still work)

#### Testing Without Email:

If you don't want to set up email verification for testing:

1. Comment out the email sending in `routes/auth.js`:
   ```javascript
   // Comment out this line in signup route:
   // const emailSent = await sendVerificationEmail(email, verificationToken);
   ```

2. Or manually verify users in MongoDB:
   ```javascript
   // In MongoDB shell or Compass:
   db.users.updateOne(
     { email: "test@example.com" },
     { $set: { isVerified: true } }
   )
   ```

### Installation

```bash
npm install
```

### Running the Server

```bash
npm run dev
```

### Features

- ✅ Email verification on signup
- ✅ Token expiration (24 hours)
- ✅ Resend verification email
- ✅ Secure token generation
- ✅ Email verification required for login
- ✅ Password reset email functionality (ready for future use)
- ✅ Health check endpoint
- ✅ Better error handling
- ✅ CORS configuration 