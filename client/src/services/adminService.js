import apiClient from './apiClient.js';

const withAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getDashboardStats = ({ token } = {}) => {
  if (!token) {
    return Promise.reject(new Error('Authentication token is required to fetch dashboard stats.'));
  }

  return apiClient.get('/api/admin/dashboard', withAuthHeader(token));
};

export const getUserStats = ({ token } = {}) => {
  if (!token) {
    return Promise.reject(new Error('Authentication token is required to fetch user stats.'));
  }

  return apiClient.get('/api/admin/users/stats', withAuthHeader(token));
};

export const getAllUsers = ({ token } = {}) => {
  if (!token) {
    return Promise.reject(new Error('Authentication token is required to fetch users.'));
  }

  return apiClient.get('/api/admin/users', withAuthHeader(token));
};

export const updateUserStatus = ({ token, userId, status } = {}) => {
  if (!token) {
    return Promise.reject(new Error('Authentication token is required to update a user.'));
  }
  if (!userId) {
    return Promise.reject(new Error('User ID is required to update status.'));
  }
  if (!['active', 'suspended'].includes(status)) {
    return Promise.reject(new Error('Invalid status value.'));
  }

  return apiClient.patch(
    `/api/admin/users/${userId}/status`,
    { status },
    withAuthHeader(token)
  );
};

export const deleteUserAccount = ({ token, userId } = {}) => {
  if (!token) {
    return Promise.reject(new Error('Authentication token is required to delete a user.'));
  }
  if (!userId) {
    return Promise.reject(new Error('User ID is required to delete an account.'));
  }

  return apiClient.delete(`/api/admin/users/${userId}`, withAuthHeader(token));
};
