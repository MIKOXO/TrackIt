const AUTH_COOKIE_NAME = 'trackitToken';
const CSRF_COOKIE_NAME = 'trackitCsrf';
const CSRF_HEADER_NAME = 'x-csrf-token';
const AUTH_COOKIE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 1 day
const isProduction = process.env.NODE_ENV === 'production';

const createCookieOptions = ({ httpOnly }) => ({
  httpOnly,
  secure: isProduction,
  sameSite: 'none',
  maxAge: AUTH_COOKIE_MAX_AGE_MS,
});

export const AUTH_COOKIE_OPTIONS = createCookieOptions({ httpOnly: true });
export const CSRF_COOKIE_OPTIONS = createCookieOptions({ httpOnly: false });
export const AUTH_COOKIE_CLEAR_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'none',
};
export const CSRF_COOKIE_CLEAR_OPTIONS = {
  httpOnly: false,
  secure: isProduction,
  sameSite: 'none',
};

export {
  AUTH_COOKIE_NAME,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  AUTH_COOKIE_MAX_AGE_MS,
};
