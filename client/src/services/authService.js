import apiClient from './apiClient.js';

export const register = (payload) => apiClient.post('/api/auth/register', payload);
export const login = (payload) => apiClient.post('/api/auth/login', payload);
