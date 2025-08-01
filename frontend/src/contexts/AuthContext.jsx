import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [otpId, setOtpId] = useState(null);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await authAPI.getProfile(token);
          setUser(response.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          // Only logout if it's an authentication error, not a connection error
          if (error.message.includes('401') || error.message.includes('403')) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  // Send OTP for login
  const sendOtp = async (email, password) => {
    try {
      const response = await authAPI.sendOtp({ email, password });
      setOtpId(response.otpId);
      return { success: true, message: response.message, otp: response.otp };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Verify OTP and login
  const verifyOtp = async (email, otp) => {
    try {
      const response = await authAPI.verifyOtp({ email, otp, otpId });
      setUser(response.user);
      setToken(response.token);
      setOtpId(null);
      localStorage.setItem('token', response.token);
      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Resend OTP
  const resendOtp = async (email, password) => {
    try {
      const response = await authAPI.resendOtp({ email, password });
      setOtpId(response.otpId);
      return { success: true, message: response.message, otp: response.otp };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Signup
  const signup = async (name, email, password) => {
    try {
      const response = await authAPI.signup({ name, email, password });
      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Login (email & password, no OTP)
  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('token', response.token);
      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    setOtpId(null);
    localStorage.removeItem('token');
  };

  // Verify email (for signup verification)
  const verifyEmail = async (token) => {
    try {
      const response = await authAPI.verifyEmail(token);
      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Verify signup OTP
  const verifySignupOtp = async (email, otp) => {
    try {
      const response = await authAPI.verifySignupOtp({ email, otp });
      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    token,
    loading,
    otpId,
    sendOtp,
    verifyOtp,
    resendOtp,
    signup,
    login,
    logout,
    verifyEmail,
    verifySignupOtp,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};