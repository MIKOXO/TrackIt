import apiClient from './apiClient.js';

export const register = (payload) => apiClient.post('/api/auth/register', payload);
export const login = (payload) => apiClient.post('/api/auth/login', payload);

const withAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const updateProfile = (payload, token) => {
  if (!token) {
    return Promise.reject(new Error('Authentication token is required to update profile.'));
  }
  return apiClient.put('/api/auth/me', payload, withAuthHeader(token));
};

export const changePassword = (payload, token) => {
  if (!token) {
    return Promise.reject(new Error('Authentication token is required to change password.'));
  }
  return apiClient.put('/api/auth/password', payload, withAuthHeader(token));
};

export const setSecurityQuestion = (payload, token) => {
  if (!token) {
    return Promise.reject(new Error('Authentication token is required.'));
  }
  return apiClient.post('/api/auth/security-question', payload, withAuthHeader(token));
};

export const fetchSecurityQuestionForEmail = (email) => {
  if (!email?.trim()) {
    return Promise.reject(new Error('Email is required.'));
  }
  return apiClient.post('/api/auth/forgot-password/question', { email: email.trim() });
};

export const verifySecurityQuestionAnswer = (payload) => {
  return apiClient.post('/api/auth/forgot-password', payload);
};

export const resetPasswordWithToken = (payload) => {
  return apiClient.post('/api/auth/reset-password', payload);
};
