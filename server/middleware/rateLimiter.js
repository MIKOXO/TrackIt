import { createRequire } from 'node:module';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

const require = createRequire(import.meta.url);

const getLimiterStore = (keyPrefix) => {
  const storeSetting = (process.env.RATE_LIMIT_STORE || 'memory').trim();
  if (storeSetting === 'memory') {
    return undefined;
  }
  const storeModule = require(storeSetting);
  const StoreClass = storeModule?.default ?? storeModule?.Store ?? storeModule;
  if (typeof StoreClass !== 'function') {
    throw new Error(`RATE_LIMIT_STORE "${storeSetting}" must export a store class.`);
  }
  return new StoreClass({ keyPrefix });
};

const MINUTE_MS = 60 * 1000;

const readPositiveNumber = (name, fallback) => {
  const parsed = Number(process.env[name] ?? '');
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const RATE_LIMIT_ENABLED = process.env.RATE_LIMIT_ENABLED !== 'false';

const rateLimitConfig = {
  global: {
    keyPrefix: 'global',
    windowMs: readPositiveNumber('RATE_LIMIT_GLOBAL_WINDOW_MS', 15 * MINUTE_MS),
    limit: readPositiveNumber('RATE_LIMIT_GLOBAL_MAX', 600),
    message: 'Too many requests. Please try again later.',
  },
  login: {
    keyPrefix: 'login',
    windowMs: readPositiveNumber('RATE_LIMIT_LOGIN_WINDOW_MS', 15 * MINUTE_MS),
    limit: readPositiveNumber('RATE_LIMIT_LOGIN_MAX', 10),
    message: 'Too many sign-in attempts. Please try again later.',
  },
  register: {
    keyPrefix: 'register',
    windowMs: readPositiveNumber('RATE_LIMIT_REGISTER_WINDOW_MS', 60 * MINUTE_MS),
    limit: readPositiveNumber('RATE_LIMIT_REGISTER_MAX', 30),
    message: 'Too many registration attempts from this network. Please try again later.',
  },
  password: {
    keyPrefix: 'password',
    windowMs: readPositiveNumber('RATE_LIMIT_PASSWORD_WINDOW_MS', 15 * MINUTE_MS),
    limit: readPositiveNumber('RATE_LIMIT_PASSWORD_MAX', 10),
    message: 'Too many password attempts. Please try again later.',
  },
  passwordResetIp: {
    keyPrefix: 'password-reset',
    windowMs: readPositiveNumber('RATE_LIMIT_PASSWORD_RESET_WINDOW_MS', 15 * MINUTE_MS),
    limit: readPositiveNumber('RATE_LIMIT_PASSWORD_RESET_MAX', 10),
    message: 'Too many password reset attempts from this network. Please try again later.',
  },
  passwordResetEmail: {
    keyPrefix: 'password-reset-email',
    windowMs: readPositiveNumber('RATE_LIMIT_PASSWORD_RESET_EMAIL_WINDOW_MS', 60 * MINUTE_MS),
    limit: readPositiveNumber('RATE_LIMIT_PASSWORD_RESET_EMAIL_MAX', 5),
    message: 'Too many password reset attempts for this account. Please try again later.',
  },
};

const requestEmail = (req) =>
  typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';

const createRateLimiter = ({
  keyPrefix,
  windowMs,
  limit,
  keyGenerator,
  skip,
  skipSuccessfulRequests,
  message,
}) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message },
    keyGenerator,
    skip,
    skipSuccessfulRequests,
    store: getLimiterStore(keyPrefix),
  });

const noopLimiter = (req, res, next) => next();

export const globalLimiter = RATE_LIMIT_ENABLED
  ? createRateLimiter({ ...rateLimitConfig.global })
  : noopLimiter;

export const loginLimiter = RATE_LIMIT_ENABLED
  ? createRateLimiter({
      ...rateLimitConfig.login,
      keyGenerator: (req) => `${ipKeyGenerator(req.ip)}:${requestEmail(req) || 'anonymous'}`,
      skipSuccessfulRequests: true,
    })
  : noopLimiter;

export const registerLimiter = RATE_LIMIT_ENABLED
  ? createRateLimiter({ ...rateLimitConfig.register })
  : noopLimiter;

export const passwordLimiter = RATE_LIMIT_ENABLED
  ? createRateLimiter({
      ...rateLimitConfig.password,
      keyGenerator: (req) => String(req.user?.id ?? ipKeyGenerator(req.ip)),
    })
  : noopLimiter;

export const passwordResetIpLimiter = RATE_LIMIT_ENABLED
  ? createRateLimiter({ ...rateLimitConfig.passwordResetIp })
  : noopLimiter;

export const passwordResetEmailLimiter = RATE_LIMIT_ENABLED
  ? createRateLimiter({
      ...rateLimitConfig.passwordResetEmail,
      keyGenerator: (req) => requestEmail(req),
      skip: (req) => !requestEmail(req),
    })
  : noopLimiter;
