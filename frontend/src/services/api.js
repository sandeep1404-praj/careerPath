const API_BASE_URL = 'http://localhost:5000/api';

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check if the backend is running.');
    }
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  // Signup
  signup: async (userData) => {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Send OTP for login
  sendOtp: async (credentials) => {
    return apiRequest('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Verify OTP and login
  verifyOtp: async (otpData) => {
    return apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(otpData),
    });
  },

  // Resend OTP
  resendOtp: async (credentials) => {
    return apiRequest('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Verify email (for signup verification)
  verifyEmail: async (token) => {
    return apiRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  // Get user profile
  getProfile: async (token) => {
    return apiRequest('/auth/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Health check
  health: async () => {
    return apiRequest('/health', {
      method: 'GET',
    });
  },

  // Add this function for signup OTP verification
  verifySignupOtp: async ({ email, otp }) => {
    return apiRequest('/auth/verify-signup-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },
};