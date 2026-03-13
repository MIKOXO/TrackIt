import apiClient from './apiClient.js';

const withAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const createTransaction = (payload, token) => {
  if (!token) {
    return Promise.reject(new Error('Authentication token is required to create a transaction.'));
  }
  return apiClient.post('/api/transactions', payload, withAuthHeader(token));
};

export const getTransactions = (token) => {
  if (!token) {
    return Promise.reject(new Error('Authentication token is required to fetch transactions.'));
  }
  return apiClient.get('/api/transactions', withAuthHeader(token));
};
