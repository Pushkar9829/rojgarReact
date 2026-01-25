import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'https://api.tatsatinfotech.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  sendOTP: (mobileNumber, purpose = 'LOGIN') => {
    return api.post('/auth/send-otp', { mobileNumber, purpose });
  },
  verifyOTP: (mobileNumber, otp, profile = null) => {
    return api.post('/auth/verify-otp', { mobileNumber, otp, profile });
  },
  logout: () => {
    return api.post('/auth/logout');
  },
};

// Jobs API
export const jobsAPI = {
  getAll: (params = {}) => {
    return api.get('/jobs', { params });
  },
  getById: (id) => {
    return api.get(`/jobs/${id}`);
  },
  create: (data) => {
    return api.post('/admin/jobs', data);
  },
  update: (id, data) => {
    return api.put(`/admin/jobs/${id}`, data);
  },
  delete: (id) => {
    return api.delete(`/admin/jobs/${id}`);
  },
};

// Schemes API
export const schemesAPI = {
  getAll: (params = {}) => {
    return api.get('/schemes', { params });
  },
  getById: (id) => {
    return api.get(`/schemes/${id}`);
  },
  create: (data) => {
    return api.post('/admin/schemes', data);
  },
  update: (id, data) => {
    return api.put(`/admin/schemes/${id}`, data);
  },
  delete: (id) => {
    return api.delete(`/admin/schemes/${id}`);
  },
};

// Users API
export const usersAPI = {
  getAll: (params = {}) => {
    return api.get('/admin/users', { params });
  },
};

// Admin Stats API
export const adminAPI = {
  getStats: () => {
    return api.get('/admin/stats');
  },
};

export default api;