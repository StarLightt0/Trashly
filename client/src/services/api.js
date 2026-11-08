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
  changePassword: (passwordData) => api.put('/user/change-password', passwordData),
  getCalculatorStatus: () => api.get('/user/calculator-status'),
  claimCalculatorReward: (data) => api.post('/user/calculator-reward', data || {})
};

export const dropPointAPI = {
  getDropPoints: (params) => api.get('/drop-points', { params }),
  getDropPointDetail: (id) => api.get(`/drop-points/${id}`)
};

export const scanAPI = {
  detectWaste: (data) => api.post('/scan/detect', data),
  getSamples: () => api.get('/scan/samples'),
  getHistory: () => api.get('/scan/history')
};

export const chatAPI = {
  send: (message, history = []) => api.post('/chat', { message, history })
};

export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getSystemStatus: () => api.get('/admin/system/status'),
  getWasteItems: (params) => api.get('/admin/waste', { params }),
  createWasteItem: (data) => api.post('/admin/waste', data),
  updateWasteItem: (id, data) => api.put(`/admin/waste/${id}`, data),
  deleteWasteItem: (id) => api.delete(`/admin/waste/${id}`),
  getDropPoints: () => api.get('/admin/drop-points'),
  createDropPoint: (data) => api.post('/admin/drop-points', data),
  updateDropPoint: (id, data) => api.put(`/admin/drop-points/${id}`, data),
  deleteDropPoint: (id) => api.delete(`/admin/drop-points/${id}`),
  getQuizzes: () => api.get('/admin/quizzes'),
  createQuiz: (data) => api.post('/admin/quizzes', data),
  deleteQuiz: (id) => api.delete(`/admin/quizzes/${id}`),
  getScans: () => api.get('/admin/scans'),
  deleteScan: (id) => api.delete(`/admin/scans/${id}`),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  adjustUserPoints: (id, amount, reason) => api.post(`/admin/users/${id}/adjust-points`, { amount, reason }),
  getCalculatorSettings: () => api.get('/admin/calculator-settings'),
  updateCalculatorSettings: (data) => api.put('/admin/calculator-settings', data)
};

export default api;
