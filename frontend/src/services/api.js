import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000' });

// Add token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('sentinelflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const authAPI = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  me: () => api.get('/api/auth/me')
};

// Dashboard
export const dashboardAPI = {
  getSummary: () => api.get('/api/dashboard/summary')
};

// Users
export const usersAPI = {
  getAll: () => api.get('/api/users'),
  getById: (id) => api.get(`/api/users/${id}`),
  create: (data) => api.post('/api/users', data),
  update: (id, data) => api.put(`/api/users/${id}`, data),
  delete: (id) => api.delete(`/api/users/${id}`)
};

// Devices
export const devicesAPI = {
  getAll: () => api.get('/api/devices'),
  create: (data) => api.post('/api/devices', data),
  update: (id, data) => api.put(`/api/devices/${id}`, data),
  delete: (id) => api.delete(`/api/devices/${id}`)
};

// Activities
export const activitiesAPI = {
  getAll: (params) => api.get('/api/activities', { params }),
  getById: (id) => api.get(`/api/activities/${id}`),
  create: (data) => api.post('/api/activities', data)
};

// Sessions
export const sessionsAPI = {
  getAll: () => api.get('/api/sessions'),
  create: (data) => api.post('/api/sessions', data)
};

// Risk
export const riskAPI = {
  getAll: () => api.get('/api/risk-assessments'),
  create: (data) => api.post('/api/risk-assessments', data)
};

// Threats
export const threatsAPI = {
  getAll: (params) => api.get('/api/threats', { params }),
  getById: (id) => api.get(`/api/threats/${id}`),
  update: (id, data) => api.put(`/api/threats/${id}`, data)
};

// Alerts
export const alertsAPI = {
  getAll: (params) => api.get('/api/alerts', { params }),
  getById: (id) => api.get(`/api/alerts/${id}`),
  create: (data) => api.post('/api/alerts', data),
  update: (id, data) => api.put(`/api/alerts/${id}`, data)
};

// Investigations
export const investigationsAPI = {
  getAll: () => api.get('/api/investigations'),
  getById: (id) => api.get(`/api/investigations/${id}`),
  create: (data) => api.post('/api/investigations', data),
  update: (id, data) => api.put(`/api/investigations/${id}`, data),
  addFinding: (id, data) => api.post(`/api/investigations/${id}/findings`, data),
  getFindings: (id) => api.get(`/api/investigations/${id}/findings`)
};

// Reports
export const reportsAPI = {
  getAll: () => api.get('/api/reports'),
  getById: (id) => api.get(`/api/reports/${id}`),
  generate: (data) => api.post('/api/reports', data)
};

// Audit
export const auditAPI = {
  getAll: (params) => api.get('/api/audit-logs', { params })
};

// Behavior
export const behaviorAPI = {
  getAll: () => api.get('/api/behavior-analysis'),
  analyze: (data) => api.post('/api/behavior-analysis', data)
};

// Policies
export const policiesAPI = {
  getAll: () => api.get('/api/policies'),
  create: (data) => api.post('/api/policies', data),
  update: (id, data) => api.put(`/api/policies/${id}`, data)
};

export default api;
