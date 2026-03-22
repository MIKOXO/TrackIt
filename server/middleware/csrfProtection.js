import {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
} from '../constants/authCookies.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const csrfProtection = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.header(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next({ status: 403, message: 'Invalid CSRF token.' });
  }

  next();
};

export default csrfProtection;
