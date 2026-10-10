import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(
      "sentinelflow_token"
    );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   AUTHENTICATION
========================= */

export const authAPI = {
  login: (data) =>
    api.post("/api/auth/login", data),

  register: (data) =>
    api.post("/api/auth/register", data),

  me: () =>
    api.get("/api/auth/me"),
};

/* =========================
   DASHBOARD
========================= */

export const dashboardAPI = {
  getSummary: () =>
    api.get("/api/dashboard/summary"),
};

/* =========================
   USERS
========================= */

export const usersAPI = {
  getAll: () =>
    api.get("/api/users"),

  getById: (id) =>
    api.get(`/api/users/${id}`),

  create: (data) =>
    api.post("/api/users", data),

  update: (id, data) =>
    api.put(`/api/users/${id}`, data),

  delete: (id) =>
    api.delete(`/api/users/${id}`),
};

/* =========================
   DEVICES
========================= */

export const devicesAPI = {
  getAll: () =>
    api.get("/api/devices"),

  getById: (id) =>
    api.get(`/api/devices/${id}`),

  create: (data) =>
    api.post("/api/devices", data),

  update: (id, data) =>
    api.put(`/api/devices/${id}`, data),

  delete: (id) =>
    api.delete(`/api/devices/${id}`),
};

/* =========================
   ACTIVITIES
========================= */

export const activitiesAPI = {
  getAll: () =>
    api.get("/api/activities"),

  getById: (id) =>
    api.get(`/api/activities/${id}`),

  create: (data) =>
    api.post("/api/activities", data),
};

/* =========================
   SESSIONS
========================= */

export const sessionsAPI = {
  getAll: () =>
    api.get("/api/sessions"),

  getById: (id) =>
    api.get(`/api/sessions/${id}`),
};

/* =========================
   BEHAVIOR ANALYSIS
========================= */

export const behaviorAPI = {
  getAll: () =>
    api.get("/api/behavior-analysis"),

  getById: (id) =>
    api.get(`/api/behavior-analysis/${id}`),

  analyze: (data) =>
    api.post("/api/behavior-analysis", data),
};

/* =========================
   RISK ASSESSMENTS
========================= */

export const riskAPI = {
  getAll: () =>
    api.get("/api/risk-assessments"),

  getById: (id) =>
    api.get(`/api/risk-assessments/${id}`),

  calculate: (data) =>
    api.post("/api/risk-assessments", data),
};

/* =========================
   THREATS
========================= */

export const threatsAPI = {
  getAll: () =>
    api.get("/api/threats"),

  getById: (id) =>
    api.get(`/api/threats/${id}`),

  create: (data) =>
    api.post("/api/threats", data),

  update: (id, data) =>
    api.put(`/api/threats/${id}`, data),
};

/* =========================
   ALERTS
========================= */

export const alertsAPI = {
  getAll: () =>
    api.get("/api/alerts"),

  getById: (id) =>
    api.get(`/api/alerts/${id}`),

  create: (data) =>
    api.post("/api/alerts", data),

  update: (id, data) =>
    api.put(`/api/alerts/${id}`, data),
};

/* =========================
   INVESTIGATIONS
========================= */

export const investigationsAPI = {
  getAll: () =>
    api.get("/api/investigations"),

  getById: (id) =>
    api.get(`/api/investigations/${id}`),

  create: (data) =>
    api.post("/api/investigations", data),

  update: (id, data) =>
    api.put(`/api/investigations/${id}`, data),
};

/* =========================
   SECURITY REPORTS
========================= */

export const reportsAPI = {
  getAll: () =>
    api.get("/api/reports"),

  generate: (data) =>
    api.post(
      "/api/reports/generate",
      data
    ),

  getGenerated: () =>
    api.get("/api/reports/generated"),
};

/* =========================
   AUDIT LOGS
========================= */

export const auditAPI = {
  getAll: () =>
    api.get("/api/audit-logs"),
};

/* =========================
   POLICIES
========================= */

export const policiesAPI = {
  getAll: () =>
    api.get("/api/policies"),

  getById: (id) =>
    api.get(`/api/policies/${id}`),

  create: (data) =>
    api.post("/api/policies", data),

  update: (id, data) =>
    api.put(`/api/policies/${id}`, data),
};

export default api;