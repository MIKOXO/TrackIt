import axios from 'axios';

const CSRF_HEADER_NAME = 'x-csrf-token';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const CSRF_STORAGE_KEY = 'trackitCsrfToken';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const isBrowser = typeof window !== 'undefined';
const getStorage = () => (isBrowser ? window.localStorage : null);

let csrfToken = getStorage()?.getItem(CSRF_STORAGE_KEY) || null;

const persistToken = (token) => {
  csrfToken = token;
  if (isBrowser) {
    if (token) {
      window.localStorage.setItem(CSRF_STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(CSRF_STORAGE_KEY);
    }
  }
};

const updateTokenFromHeaders = (headers) => {
  if (!headers) {
    return;
  }
  const headerToken =
    headers[CSRF_HEADER_NAME] ?? headers[CSRF_HEADER_NAME.toLowerCase()] ?? null;
  if (headerToken) {
    persistToken(headerToken);
  }
};

apiClient.interceptors.request.use((config) => {
  const method = (config.method || 'get').toUpperCase();
  if (!SAFE_METHODS.has(method) && csrfToken) {
    config.headers = {
      ...config.headers,
      [CSRF_HEADER_NAME]: csrfToken,
    };
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    updateTokenFromHeaders(response.headers);
    return response;
  },
  (error) => {
    updateTokenFromHeaders(error?.response?.headers);
    return Promise.reject(error);
  },
);

export const clearCsrfToken = () => persistToken(null);

export default apiClient;
