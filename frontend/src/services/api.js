const API_BASE_URL = 'https://careerpath-54sr.onrender.com/api';

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
  try {
    // allow passing a token explicitly or fallback to localStorage token
    const token = options.token || localStorage.getItem('token');

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Do not send a body with GET requests
    const fetchOptions = { ...options, headers };
    if (fetchOptions.method && fetchOptions.method.toUpperCase() === 'GET') {
      delete fetchOptions.body;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);

    // Try to parse JSON response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      // Extract error message from standardized error response
      const errorMessage = data.message || data.error || `HTTP error! status: ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.errors = data.errors; // Validation errors if any
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const connectionError = new Error('Unable to connect to server. Please check if the backend is running.');
      connectionError.status = 503;
      throw connectionError;
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

  // Get user profile (uses token from localStorage or options.token)
  getProfile: async () => {
    return apiRequest('/auth/profile', {
      method: 'GET',
    });
  },

  // Get user profile by userId query param (used by settings page)
  getProfileByUserId: async (userId) => {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return apiRequest(`/auth/profile${query}`, {
      method: 'GET',
    });
  },

  // Update user profile (expects full user object)
  updateProfile: async (user) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  },

  // Update notification preference for a user
  updateNotification: async (userId, enabled) => {
    return apiRequest('/user/notification', {
      method: 'PATCH',
      body: JSON.stringify({ userId, enabled }),
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
  getStaticRoadmaps: async (page = 1, limit = 10) => {
    return apiRequest(`/roadmaps/static?page=${page}&limit=${limit}`, {
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