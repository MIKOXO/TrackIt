import apiClient from './apiClient.js';

export const getAnalytics = ({ months = 6, days = 14 } = {}) => {
  return apiClient.get('/api/analytics', {
    params: { months, days },
  });
};
