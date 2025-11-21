import axios from 'axios';

// Create axios instance with base configuration
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Include cookies for httpOnly refresh token
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management utilities
const TOKEN_KEY = 'access_token';

const getAccessToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

const setAccessToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  // Note: httpOnly refresh token will be cleared by server
};

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor to add Bearer token
api.interceptors.request.use(
  (config) => {
    // Don't add auth header to login/register/refresh endpoints
    const publicEndpoints = ['/auth/login', '/auth/register', '/auth/refresh'];
    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      config.url?.includes(endpoint),
    );

    if (!isPublicEndpoint) {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`,
      );
    }

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  },
);

// Response interceptor for token refresh logic
api.interceptors.response.use(
  (response) => {
    // Log successful response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `✅ API Response: ${response.config.method?.toUpperCase()} ${
          response.config.url
        } - ${response.status}`,
      );
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `❌ API Error: ${originalRequest?.method?.toUpperCase()} ${
          originalRequest?.url
        } - ${error.response?.status}`,
      );
    }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't attempt refresh for auth endpoints (login, register, refresh)
      const authEndpoints = ['/auth/login', '/auth/register', '/auth/refresh'];
      const isAuthEndpoint = authEndpoints.some((endpoint) =>
        originalRequest?.url?.includes(endpoint),
      );

      if (isAuthEndpoint) {
        // Let auth endpoints fail naturally without triggering refresh
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token using httpOnly refresh cookie
        const refreshResponse = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          {
            withCredentials: true, // Send httpOnly refresh cookie
            timeout: 5000,
          },
        );

        // Backend responds as { success, message, data: { accessToken, newRefreshToken } }
        const refreshedData =
          refreshResponse.data?.data ?? refreshResponse.data;
        const { accessToken } = refreshedData || {};

        if (accessToken) {
          // Update stored access token
          setAccessToken(accessToken);

          // Update default authorization header
          api.defaults.headers.Authorization = `Bearer ${accessToken}`;

          // Process queued requests with new token
          processQueue(null, accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          console.log('✅ Token refreshed successfully');
          return api(originalRequest);
        } else {
          throw new Error('No access token received from refresh');
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);

        // Clear tokens and redirect to login
        clearTokens();
        processQueue(refreshError, null);

        // Dispatch logout event for AuthContext to handle
        window.dispatchEvent(
          new CustomEvent('auth:logout', {
            detail: { reason: 'token_refresh_failed' },
          }),
        );

        // Redirect to login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other error cases
    if (error.response?.status >= 500) {
      console.error('🚨 Server Error:', error.response.data);
      // Could dispatch global error event here
      window.dispatchEvent(
        new CustomEvent('api:server-error', {
          detail: { error: error.response.data },
        }),
      );
    }

    // Network errors
    if (error.code === 'ECONNABORTED') {
      console.error('⏰ Request timeout');
      error.message =
        'Request timeout. Please check your connection and try again.';
    } else if (!error.response) {
      console.error('🔌 Network Error:', error.message);
      error.message =
        'Network error. Please check your connection and try again.';
    }

    return Promise.reject(error);
  },
);

// API service methods
export const apiService = {
  // Authentication methods
  auth: {
    login: async (credentials) => {
      try {
        const response = await api.post('/auth/login', credentials);
        // Unwrap server shape { success, message, data: { user, accessToken } }
        return { success: true, data: response.data?.data ?? response.data };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Login failed',
        };
      }
    },

    register: async (userData) => {
      try {
        const response = await api.post('/auth/register', userData);
        // Unwrap server shape { success, message, data: { user, accessToken } }
        return { success: true, data: response.data?.data ?? response.data };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Registration failed',
        };
      }
    },
    logout: () => api.post('/auth/logout'),
    refresh: () => api.post('/auth/refresh'),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) =>
      api.post('/auth/reset-password', { token, password }),
  },

  // User methods
  user: {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
    deleteAccount: () => api.delete('/users/profile'),
    changePassword: (data) => api.put('/users/change-password', data),
  },

  // Goals methods
  goals: {
    getAll: () => api.get('/goals'),
    create: (goal) => api.post('/goals', goal),
    update: (id, goal) => api.put(`/goals/${id}`, goal),
    delete: (id) => api.delete(`/goals/${id}`),
    getById: (id) => api.get(`/goals/${id}`),
  },

  // Challenges methods
  challenges: {
    getAll: (params) => api.get('/challenges', { params }),
    getById: (id) => api.get(`/challenges/${id}`),
    create: (challenge) => api.post('/challenges', challenge),
    update: (id, challenge) => api.put(`/challenges/${id}`, challenge),
    delete: (id) => api.delete(`/challenges/${id}`),
    submit: (id, submission) =>
      api.post(`/challenges/${id}/submit`, submission),
    getSubmissions: (id) => api.get(`/challenges/${id}/submissions`),
    complete: (id) => api.post(`/challenges/${id}/complete`),
  },

  // Progress methods
  progress: {
    getOverview: () => api.get('/progress/overview'),
    getSkills: () => api.get('/progress/skills'),
    getActivity: (params) => api.get('/progress/activity', { params }),
    getStats: () => api.get('/progress/stats'),
  },

  // Leaderboard methods
  leaderboard: {
    getGlobal: (params) => api.get('/leaderboard/global', { params }),
    getUserRank: () => api.get('/leaderboard/user-rank'),
  },

  // Peer Review methods
  peerReview: {
    getReviewQueue: (params) => api.get('/peer-review/queue', { params }),
    getMySubmissions: () => api.get('/peer-review/my-submissions'),
    submitReview: (submissionId, review) =>
      api.post(`/peer-review/submissions/${submissionId}/review`, review),
    getReviewDetails: (submissionId) =>
      api.get(`/peer-review/submissions/${submissionId}`),
  },

  // Notifications methods
  notifications: {
    getAll: () => api.get('/notifications'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
  },
};

// Export utilities for external use
export { getAccessToken, setAccessToken, clearTokens };

// Export configured axios instance
export default api;
