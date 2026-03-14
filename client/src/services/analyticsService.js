import apiClient from './apiClient.js';

const withAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getAnalytics = ({ token, months = 6, days = 14 } = {}) => {
  if (!token) {
    return Promise.reject(new Error('Authentication token is required to fetch analytics.'));
  }

  return apiClient.get('/api/analytics', {
    ...withAuthHeader(token),
    params: { months, days },
  });
};

