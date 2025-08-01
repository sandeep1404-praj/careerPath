# CareerCompass Frontend

## Authentication Features

This frontend includes a complete authentication system with email verification:

### Features
- ✅ User registration with email verification
- ✅ User login with email verification requirement
- ✅ Password strength validation
- ✅ Protected routes
- ✅ JWT token management
- ✅ Email verification flow
- ✅ Responsive design
- ✅ Graceful error handling
- ✅ Connection status indicators

### Pages
- **Home** (`/`) - Landing page with navigation
- **Login** (`/login`) - User login form
- **Signup** (`/signup`) - User registration form
- **Verify Email** (`/verify-email`) - Email verification page
- **Dashboard** (`/dashboard`) - Protected user dashboard

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Make sure the backend is running:**
   - Backend should be running on `http://localhost:5000`
   - Check the backend README for setup instructions

### Using the Authentication System

1. **Signup:**
   - Visit `/signup` to create a new account
   - Fill in the form with valid information
   - Password must meet strength requirements
   - Account will be created and verified automatically (if email not configured)

2. **Login:**
   - Visit `/login` to sign in
   - Use the credentials from signup
   - Email verification is required for login

3. **Dashboard:**
   - After login, visit `/dashboard`
   - This page is protected and requires authentication
   - Shows user information and account status

4. **Email Verification:**
   - Click the verification link in your email
   - Or visit `/verify-email?token=YOUR_TOKEN`

### Environment Variables

The frontend connects to the backend at `http://localhost:5000` by default. If you need to change this, update the `API_BASE_URL` in `src/services/api.js`.

### File Structure

```
src/
├── components/
│   ├── Navbar.jsx          # Navigation with auth state
│   ├── ProtectedRoute.jsx  # Route protection component
│   └── ui/                 # UI components
├── contexts/
│   └── AuthContext.jsx     # Authentication context
├── pages/
│   ├── Login.jsx           # Login page
│   ├── Signup.jsx          # Signup page
│   ├── VerifyEmail.jsx     # Email verification page
│   └── Dashboard.jsx       # Protected dashboard
├── services/
│   └── api.js              # API service functions
└── App.jsx                 # Main app with routing
```

### API Endpoints Used

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify-email/:token` - Email verification
- `POST /api/auth/resend-verification` - Resend verification email
- `GET /api/auth/profile` - Get user profile
- `GET /api/health` - Health check

### Security Features

- JWT token storage in localStorage
- Protected routes with automatic redirect
- Password strength validation
- Email verification requirement
- Secure API communication
- Form validation and error handling
- Graceful connection error handling

### Error Handling

The frontend gracefully handles various error scenarios:
- Backend server not running
- Network connectivity issues
- Authentication failures
- Invalid form data
- Email verification issues

### Production Ready

This frontend is production-ready with:
- Comprehensive error handling
- User-friendly error messages
- Loading states and feedback
- Responsive design
- Security best practices
- Clean and maintainable code
