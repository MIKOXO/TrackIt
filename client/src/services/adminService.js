import apiClient from './apiClient.js';

export const getDashboardStats = () => {
  return apiClient.get('/api/admin/dashboard');
};

export const getUserStats = () => {
  return apiClient.get('/api/admin/users/stats');
};

export const getAllUsers = () => {
  return apiClient.get('/api/admin/users');
};

export const updateUserStatus = ({ userId, status } = {}) => {
  if (!userId) {
    return Promise.reject(new Error('User ID is required to update status.'));
  }
  if (!['active', 'suspended'].includes(status)) {
    return Promise.reject(new Error('Invalid status value.'));
  }

  return apiClient.patch(`/api/admin/users/${userId}/status`, { status });
};

export const deleteUserAccount = ({ userId } = {}) => {
  if (!userId) {
    return Promise.reject(new Error('User ID is required to delete an account.'));
  }

  return apiClient.delete(`/api/admin/users/${userId}`);
};
