import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach CSRF token from cookie on every mutating request
api.interceptors.request.use((config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    const csrfMatch = document.cookie.match(/csrftoken=([^;]+)/);
    if (csrfMatch) {
      config.headers['X-CSRFToken'] = csrfMatch[1];
    }
  }
  return config;
});

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

// ---------- INVOICES ----------
export const invoiceAPI = {
  pay: (id, data) => api.post(`/invoices/${id}/pay/`, data || {}),
};

// ---------- MESSAGES ----------
export const messageAPI = {
  inbox: () => api.get('/messages/'),
  chat: (username) => api.get(`/messages/${username}/`),
  send: (username, data) => {
    if (data instanceof FormData) {
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

export default api;
