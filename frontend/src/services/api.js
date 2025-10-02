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

  // Login (email & password, no OTP)
  login: async (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
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

  // Forgot password (request reset link)
  forgotPassword: async (email) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Reset password
  resetPassword: async ({ token, password }) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },
};

// Roadmap API functions
export const roadmapAPI = {
  // Get all static roadmaps
  getStaticRoadmaps: async () => {
    return apiRequest('/roadmaps/static', {
      method: 'GET',
    });
  },

  // Get specific static roadmap
  getStaticRoadmap: async (id) => {
    return apiRequest(`/roadmaps/static/${id}`, {
      method: 'GET',
    });
  },

  // Get user's personal roadmap
  getUserRoadmap: async (token) => {
    return apiRequest('/roadmaps/user', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Add task to user's roadmap
  addTaskToUserRoadmap: async (token, taskData) => {
    // Debug log to verify payload type
    console.log('Sending to backend /roadmaps/user/add:', taskData, typeof taskData);
    return apiRequest('/roadmaps/user/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(taskData),
    });
  },

  // Update user's roadmap
  updateUserRoadmap: async (token, updateData) => {
    return apiRequest('/roadmaps/user/update', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });
  },

  // Update user preferences
  updateUserPreferences: async (token, preferences) => {
    return apiRequest('/roadmaps/user/preferences', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ preferences }),
    });
  },

  // Add entire roadmap to user's collection
  addRoadmapToUser: async (token, roadmapData) => {
    console.log('Sending to backend /roadmaps/user/add-roadmap:', roadmapData, typeof roadmapData);
    return apiRequest('/roadmaps/user/add-roadmap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(roadmapData),
    });
  },

  // Delete entire roadmap from user's collection
  deleteRoadmapFromUser: async (token, roadmapId) => {
    console.log('Deleting roadmap from backend:', roadmapId);
    return apiRequest(`/roadmaps/user/delete-roadmap/${roadmapId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Legacy roadmap functions (for backward compatibility)
  getAllRoadmaps: async () => {
    return apiRequest('/roadmaps', {
      method: 'GET',
    });
  },

  getRoadmap: async (id) => {
    return apiRequest(`/roadmaps/${id}`, {
      method: 'GET',
    });
  },
};