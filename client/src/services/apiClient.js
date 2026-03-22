import axios from 'axios';

const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_COOKIE_NAME = 'trackitCsrf';
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
  if (!isBrowser) {
    return;
  }
  if (token) {
    window.localStorage.setItem(CSRF_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(CSRF_STORAGE_KEY);
  }
};

const getCsrfTokenFromCookie = () => {
  if (!isBrowser) return null;
  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${CSRF_COOKIE_NAME}=`));
  if (!cookie) return null;
  return decodeURIComponent(cookie.split('=')[1] || '');
};

const resolveCsrfToken = () => {
  if (csrfToken) {
    return csrfToken;
  }

  const tokenFromCookie = getCsrfTokenFromCookie();
  if (tokenFromCookie) {
    persistToken(tokenFromCookie);
  }

  return tokenFromCookie;
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
  if (!SAFE_METHODS.has(method)) {
    const token = resolveCsrfToken();
    if (token) {
      config.headers = {
        ...config.headers,
        [CSRF_HEADER_NAME]: token,
      };
    }
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
