import apiClient from './apiClient.js';

export const register = (payload) => apiClient.post('/api/auth/register', payload);
export const login = (payload) => apiClient.post('/api/auth/login', payload);

export const updateProfile = (payload) => apiClient.put('/api/auth/me', payload);
export const changePassword = (payload) => apiClient.put('/api/auth/password', payload);
export const deleteAccount = (payload) => {
  if (!payload?.password) {
    return Promise.reject(new Error('Password is required to delete account.'));
  }
  return apiClient.delete('/api/auth/me', { data: { password: payload.password } });
};

export const setSecurityQuestion = (payload) => {
  return apiClient.post('/api/auth/security-question', payload);
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

export const logout = () => {
  return apiClient.post('/api/auth/logout');
};
