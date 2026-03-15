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
