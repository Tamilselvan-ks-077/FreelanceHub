import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  timeout: 15000, // 15-second strict timeout on API calls
  headers: { 'Content-Type': 'application/json' },
});

// Attach CSRF token from cookie on mutating requests
api.interceptors.request.use((config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    const csrfMatch = document.cookie.match(/csrftoken=([^;]+)/);
    if (csrfMatch) {
      config.headers['X-CSRFToken'] = csrfMatch[1];
    }
  }
  return config;
});

// Response interceptor to handle network errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network failure, offline, or request timeout
      const customErr = new Error(
        error.code === 'ECONNABORTED'
          ? 'Request timed out. Please check your network connection and retry.'
          : 'Unable to reach the server. Please check your internet connection.'
      );
      customErr.isNetworkError = true;
      return Promise.reject(customErr);
    }
    // Extract standardized backend error message
    const backendMessage = error.response.data?.error || error.response.data?.detail;
    if (backendMessage) {
      error.friendlyMessage = backendMessage;
    }
    return Promise.reject(error);
  }
);

// Helper for file upload validation (5MB max)
export function validateFileSize(file, maxMb = 5) {
  if (!file) return true;
  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`File "${file.name}" exceeds the ${maxMb}MB limit.`);
  }
  return true;
}

// ---------- AUTH ----------
export const authAPI = {
  login: (data) => api.post('/auth/login/', data),
  logout: () => api.post('/auth/logout/'),
  signup: (data) => api.post('/auth/signup/', data),
  me: () => api.get('/auth/me/'),
};

// ---------- PROFILE ----------
export const profileAPI = {
  get: () => api.get('/profile/'),
  update: (data) => {
    if (data instanceof FormData) {
      const avatar = data.get('avatar');
      if (avatar instanceof File) validateFileSize(avatar, 5);
      return api.put('/profile/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.put('/profile/', data);
  },
};

// ---------- FREELANCERS ----------
export const freelancerAPI = {
  list: (params) => api.get('/freelancers/', { params }),
  detail: (id) => api.get(`/freelancers/${id}/`),
  toggleFavourite: (id) => api.post(`/freelancers/${id}/favourite/`),
};

// ---------- DASHBOARD ----------
export const dashboardAPI = {
  get: () => api.get('/dashboard/'),
};

// ---------- BOOKINGS ----------
export const bookingAPI = {
  create: (freelancerId, data) => api.post(`/bookings/create/${freelancerId}/`, data),
  detail: (id) => api.get(`/bookings/${id}/`),
  update: (id, data) => api.put(`/bookings/${id}/`, data),
  action: (id, action) => api.post(`/bookings/${id}/action/`, { action }),
  cancel: (id) => api.post(`/bookings/${id}/cancel/`),
};

// ---------- INVOICES (With Idempotency Key) ----------
export const invoiceAPI = {
  pay: (id, data = {}) => {
    const idempotencyKey = data.idempotency_key || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pay-${Date.now()}`);
    return api.post(`/invoices/${id}/pay/`, data, {
      headers: { 'Idempotency-Key': idempotencyKey },
    });
  },
};

// ---------- MESSAGES ----------
export const messageAPI = {
  inbox: () => api.get('/messages/'),
  chat: (username) => api.get(`/messages/${username}/`),
  send: (username, data) => {
    if (data instanceof FormData) {
      const attachment = data.get('attachment');
      if (attachment instanceof File) validateFileSize(attachment, 5);
      return api.post(`/messages/${username}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.post(`/messages/${username}/`, data);
  },
};

// ---------- NOTIFICATIONS ----------
export const notificationAPI = {
  list: () => api.get('/notifications/'),
  markRead: () => api.post('/notifications/read/'),
};

// ---------- ADMIN ----------
export const adminAPI = {
  stats: () => api.get('/admin/stats/'),
};

// ---------- HEALTH & MONITORING ----------
export const healthAPI = {
  check: () => api.get('/health/'),
};

export default api;
