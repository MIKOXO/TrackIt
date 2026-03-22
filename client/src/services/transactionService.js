import apiClient from './apiClient.js';

export const createTransaction = (payload) => {
  return apiClient.post('/api/transactions', payload);
};

export const getTransactions = () => {
  return apiClient.get('/api/transactions');
};
