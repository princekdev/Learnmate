import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('learnmate_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('learnmate_token');
      localStorage.removeItem('learnmate_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// ─── User ──────────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
};

// ─── Roadmap ───────────────────────────────────────────────────────────────
export const roadmapAPI = {
  generate: (data) => api.post('/roadmap/generate', data),
  get: () => api.get('/roadmap'),
  getById: (id) => api.get(`/roadmap/${id}`),
  updateProgress: (id, data) => api.put(`/roadmap/${id}/progress`, data),
  adapt: (data) => api.post('/roadmap/adapt', data),
};

// ─── AI ────────────────────────────────────────────────────────────────────
export const aiAPI = {
  chat: (data) => api.post('/ai/chat', data),
  getChatHistory: (chatId) => api.get(`/ai/chat/${chatId}`),
  getAllChats: () => api.get('/ai/chats'),
  deleteChat: (chatId) => api.delete(`/ai/chat/${chatId}`),
  recommend: (data) => api.post('/ai/recommend', data),
  analyze: () => api.get('/ai/analyze'),
};

// ─── Progress ──────────────────────────────────────────────────────────────
export const progressAPI = {
  get: () => api.get('/progress'),
  update: (data) => api.put('/progress', data),
};

// ─── Assessment ────────────────────────────────────────────────────────────
export const assessmentAPI = {
  generate: (data) => api.post('/assessment/generate', data),
  submit: (data) => api.post('/assessment/submit', data),
  history: () => api.get('/assessment/history'),
};

// ─── Recommendations ───────────────────────────────────────────────────────
export const recommendationAPI = {
  get: () => api.get('/recommendations'),
  generate: (data) => api.post('/recommendations/generate', data),
  toggleSave: (id) => api.put(`/recommendations/${id}/save`),
};
