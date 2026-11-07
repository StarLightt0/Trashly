import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trashly_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me')
};

export const wasteAPI = {
  getCategories: () => api.get('/waste/categories'),
  getWasteItems: (params) => api.get('/waste', { params }),
  getWasteDetail: (identifier) => api.get(`/waste/${identifier}`),
  getStats: () => api.get('/waste/stats')
};

export const quizAPI = {
  getQuizzes: () => api.get('/quizzes'),
  getQuizDetail: (identifier) => api.get(`/quizzes/${identifier}`),
  submitQuiz: (identifier, answers) => api.post(`/quizzes/${identifier}/submit`, { answers }),
  getLeaderboard: () => api.get('/quizzes/leaderboard')
};

export const userAPI = {
  getDashboard: () => api.get('/user/dashboard'),
  updateProfile: (profileData) => api.put('/user/profile', profileData),
  getCalculatorStatus: () => api.get('/user/calculator-status'),
  claimCalculatorReward: (data) => api.post('/user/calculator-reward', data || {})
};

export default api;
