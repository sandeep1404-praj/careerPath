const API_BASE_URL = 'http://localhost:5000/api';

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = options.token || localStorage.getItem('token');

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const fetchOptions = { ...options, headers };
    if (fetchOptions.method && fetchOptions.method.toUpperCase() === 'GET') {
      delete fetchOptions.body;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);
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

// Resume API functions
export const resumeAPI = {
  /**
   * Create a new resume
   * @param {Object} resumeData - Resume data object
   * @returns {Promise<Object>} Created resume
   */
  createResume: async (resumeData) => {
    return apiRequest('/resumes', {
      method: 'POST',
      body: JSON.stringify(resumeData),
    });
  },

  /**
   * Get all resumes for a specific user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of resumes
   */
  getUserResumes: async (userId) => {
    return apiRequest(`/resumes/user/${userId}`, {
      method: 'GET',
    });
  },

  /**
   * Get a single resume by ID
   * @param {string} resumeId - Resume ID
   * @returns {Promise<Object>} Resume object
   */
  getResumeById: async (resumeId) => {
    return apiRequest(`/resumes/${resumeId}`, {
      method: 'GET',
    });
  },

  /**
   * Update a resume
   * @param {string} resumeId - Resume ID
   * @param {Object} resumeData - Updated resume data
   * @returns {Promise<Object>} Updated resume
   */
  updateResume: async (resumeId, resumeData) => {
    return apiRequest(`/resumes/${resumeId}`, {
      method: 'PUT',
      body: JSON.stringify(resumeData),
    });
  },

  /**
   * Delete a resume
   * @param {string} resumeId - Resume ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteResume: async (resumeId) => {
    return apiRequest(`/resumes/${resumeId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get all resumes (with pagination and search)
   * @param {Object} params - Query parameters (page, limit, search)
   * @returns {Promise<Object>} Paginated resumes
   */
  getAllResumes: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/resumes?${queryString}` : '/resumes';
    return apiRequest(endpoint, {
      method: 'GET',
    });
  },
};

// Initial resume template for creating new resumes
export const getInitialResumeData = () => ({
  title: 'Untitled Resume',
  thumbnail: '',
  template: {
    theme: 'modern',
    colorPalette: ['#3B82F6', '#1E40AF', '#60A5FA'],
  },
  profileInfo: {
    photo: '',
    profilePreviewUrl: '',
    fullName: '',
    designation: '',
    summary: '',
  },
  contactInfo: {
    email: '',
    phoneNo: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
  },
  workExperience: [],
  education: [],
  skills: [],
  projects: [],
  certificates: [],
  languages: [],
  interests: [],
});
