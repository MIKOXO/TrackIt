import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import ChatHistory from '../models/ChatHistory.js';
import Otp from '../models/Otp.js';
import { consumeOtp, issueOtp, normalizeEmail } from '../services/otpService.js';
import {
  AUTH_COOKIE_NAME,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  AUTH_COOKIE_OPTIONS,
  CSRF_COOKIE_OPTIONS,
  AUTH_COOKIE_CLEAR_OPTIONS,
  CSRF_COOKIE_CLEAR_OPTIONS,
} from '../constants/authCookies.js';

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@trackit.app';

const SUPPORTED_CURRENCIES = new Set([
  'USD',
  'EUR',
  'GBP',
  'ETB',
  'KES',
  'NGN',
  'ZAR',
  'INR',
  'CAD',
  'AUD',
  'JPY',
]);

const PASSWORD_REQUIREMENTS = [
  {
    id: 'length',
    label: 'At least 10 characters',
    test: (value) => value && value.length >= 10,
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter',
    test: (value) => /[A-Z]/.test(value),
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter',
    test: (value) => /[a-z]/.test(value),
  },
  {
    id: 'number',
    label: 'One number',
    test: (value) => /[0-9]/.test(value),
  },
  {
    id: 'special',
    label: 'One symbol (e.g. !@#$%)',
    test: (value) => /[!@#$%^&*(),.?":{}|<>]/.test(value),
  },
]

const createCsrfToken = () => crypto.randomBytes(32).toString('hex');

const attachAuthCookies = (res, token) => {
  const csrfToken = createCsrfToken();
  res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);
  res.cookie(CSRF_COOKIE_NAME, csrfToken, CSRF_COOKIE_OPTIONS);
  res.setHeader(CSRF_HEADER_NAME, csrfToken);
  return csrfToken;
};

const clearAuthCookies = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, AUTH_COOKIE_CLEAR_OPTIONS);
  res.clearCookie(CSRF_COOKIE_NAME, CSRF_COOKIE_CLEAR_OPTIONS);
};

const getPasswordValidation = (value) => {
  const unmet = PASSWORD_REQUIREMENTS.filter((requirement) => !requirement.test(value))
  return {
    isValid: unmet.length === 0,
    unmet,
  }
}

const getTokenSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET must be defined');
  }
  return secret;
};

const generateToken = (payload) => {
  return jwt.sign(payload, getTokenSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

const DUMMY_BCRYPT_HASH = await bcrypt.hash('this-is-not-a-real-password-value', 12);

const signAuthToken = (user) =>
  generateToken({
    userId: user._id,
    role: user.role,
    tokenVersion: user.tokenVersion ?? 0,
  });

const buildUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  currency: user.currency ?? 'ETB',
  role: user.role,
  emailVerified: Boolean(user.emailVerified),
});

const GENERIC_PASSWORD_RESET_MESSAGE =
  'If an account exists for that email, a password reset code has been sent.';

const EMAIL_NOT_VERIFIED_MESSAGE =
  'Verify your email address to continue. Check your inbox for your verification code.';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next({ status: 409, message: 'User already exists.' });
    }

    const { isValid, unmet } = getPasswordValidation(password);
    if (!isValid) {
      const message = `Password must include ${unmet.map((requirement) => requirement.label).join(', ')}`;
      return next({ status: 400, message });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      emailVerified: false,
    });

    try {
      await issueOtp({ email: user.email, purpose: 'verify_email' });
    } catch (error) {
      if (!['OTP_COOLDOWN', 'OTP_RATE_LIMITED'].includes(error?.code)) {
        await Otp.deleteMany({ email: user.email }).catch(() => {});
        await user.deleteOne().catch(() => {});
        return next(error);
      }
    }

    res.status(201).json({
      user: buildUserPayload(user),
      message: 'Account created. Check your email for a verification code.',
    });
  } catch (error) {
    if (error?.code === 11000) {
      return next({ status: 409, message: 'Email is already in use.' });
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +tokenVersion');
    if (!user) {
      await bcrypt.compare(password, DUMMY_BCRYPT_HASH);
      return next({ status: 401, message: 'Invalid email or password.' });
    }

    if (user.status === 'suspended') {
      return next({
        status: 403,
        message: `Your account has been suspended. Contact ${SUPPORT_EMAIL} for more info.`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next({ status: 401, message: 'Invalid email or password.' });
    }

    if (!user.emailVerified) {
      try {
        await issueOtp({ email: user.email, purpose: 'verify_email' });
      } catch (error) {
        if (!['OTP_COOLDOWN', 'OTP_RATE_LIMITED'].includes(error?.code)) {
          return next(error);
        }
      }
      return next({
        status: 403,
        code: 'EMAIL_NOT_VERIFIED',
        message: EMAIL_NOT_VERIFIED_MESSAGE,
      });
    }

    const token = signAuthToken(user);
    const csrfToken = attachAuthCookies(res, token);
    res.json({
      user: buildUserPayload(user),
      csrfToken,
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      currency: req.user.currency ?? 'ETB',
      role: req.user.role,
      emailVerified: Boolean(req.user.emailVerified),
    },
  });
};

export const updateCurrentUser = async (req, res, next) => {
  try {
    if (!req.user) {
      return next({ status: 401, message: 'Not authenticated.' });
    }

    const updates = {};

    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim();
      if (!name) {
        return next({ status: 400, message: 'Name is required.' });
      }
      updates.name = name;
    }

    if (req.body.email !== undefined) {
      const email = String(req.body.email).trim().toLowerCase();
      if (!email) {
        return next({ status: 400, message: 'Email is required.' });
      }
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        return next({ status: 400, message: 'Valid email is required.' });
      }
      updates.email = email;
    }

    if (req.body.currency !== undefined) {
      const currency = String(req.body.currency).trim().toUpperCase();
      if (!currency) {
        return next({ status: 400, message: 'Currency is required.' });
      }
      if (!/^[A-Z]{3}$/.test(currency)) {
        return next({ status: 400, message: 'Currency must be a 3-letter code.' });
      }
      if (!SUPPORTED_CURRENCIES.has(currency)) {
        return next({ status: 400, message: 'Unsupported currency.' });
      }
      updates.currency = currency;
    }

    if (Object.keys(updates).length === 0) {
      return next({ status: 400, message: 'No profile fields provided.' });
    }

    if (updates.email) {
      const existingUser = await User.findOne({
        email: updates.email,
        _id: { $ne: req.user.id },
      });
      if (existingUser) {
        return next({ status: 409, message: 'Email is already in use.' });
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true });
    if (!user) {
      return next({ status: 404, message: 'User not found.' });
    }

    res.json({
      user: buildUserPayload(user),
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    if (!req.user) {
      return next({ status: 401, message: 'Not authenticated.' });
    }

    const currentPassword = String(req.body.currentPassword ?? '');
    const newPassword = String(req.body.newPassword ?? '');
    const confirmPassword =
      req.body.confirmPassword !== undefined ? String(req.body.confirmPassword) : undefined;

    if (!currentPassword || !newPassword) {
      return next({
        status: 400,
        message: 'Current password and new password are required.',
      });
    }

    const { isValid, unmet } = getPasswordValidation(newPassword);
    if (!isValid) {
      const message = `Password must include ${unmet.map((requirement) => requirement.label).join(', ')}`;
      return next({ status: 400, message });
    }

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return next({ status: 400, message: 'Passwords must match.' });
    }

    const user = await User.findById(req.user.id).select('+password +tokenVersion');
    if (!user) {
      return next({ status: 404, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return next({ status: 401, message: 'Current password is incorrect.' });
    }

    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) {
      return next({ status: 400, message: 'New password must differ from the current password.' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();

    const token = signAuthToken(user);
    const csrfToken = attachAuthCookies(res, token);

    res.json({ message: 'Password updated successfully.', csrfToken });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const code = String(req.body.code ?? '');

    await consumeOtp({ email, purpose: 'verify_email', code });

    const user = await User.findOne({ email }).select('+tokenVersion');
    if (!user) {
      return next({
        status: 400,
        code: 'OTP_INVALID',
        message: 'That verification code is invalid. Request a new code and try again.',
      });
    }

    if (user.status === 'suspended') {
      return next({
        status: 403,
        message: `Your account has been suspended. Contact ${SUPPORT_EMAIL} for more info.`,
      });
    }

    if (!user.emailVerified) {
      user.emailVerified = true;
      await user.save();
    }

    const token = signAuthToken(user);
    const csrfToken = attachAuthCookies(res, token);

    res.json({
      user: buildUserPayload(user),
      csrfToken,
      message: 'Email verified successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { purpose } = req.body;
    const user = await User.findOne({ email });

    if (!user || (purpose === 'verify_email' && user.emailVerified)) {
      return res.json({
        message: 'If that email needs a verification code, one has been sent.',
      });
    }

    try {
      await issueOtp({ email, purpose });
    } catch (error) {
      if (error?.code === 'EMAIL_SEND_FAILED') {
        return res.json({
          message: 'If that email needs a verification code, one has been sent.',
        });
      }
      throw error;
    }

    res.json({ message: 'A new verification code has been sent.' });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const user = await User.findOne({ email });

    if (user) {
      try {
        await issueOtp({ email, purpose: 'reset_password' });
      } catch (error) {
        console.error('Unable to send password reset code', {
          code: error?.code,
          status: error?.status,
        });
      }
    }

    res.json({ message: GENERIC_PASSWORD_RESET_MESSAGE });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const code = String(req.body.code ?? '');
    const newPassword = String(req.body.newPassword ?? '');

    const { isValid, unmet } = getPasswordValidation(newPassword);
    if (!isValid) {
      const message = `Password must include ${unmet.map((requirement) => requirement.label).join(', ')}`;
      return next({ status: 400, message });
    }

    await consumeOtp({ email, purpose: 'reset_password', code });

    const user = await User.findOne({ email }).select('+tokenVersion');
    if (!user) {
      return next({
        status: 400,
        code: 'OTP_INVALID',
        message: 'That reset code is invalid. Request a new code and try again.',
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();
    clearAuthCookies(res);

    res.json({ message: 'Password reset successfully. Sign in with your new password.' });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  clearAuthCookies(res);
  res.json({ message: 'Signed out successfully.' });
};

export const deleteCurrentUser = async (req, res, next) => {
  try {
    if (!req.user) {
      return next({ status: 401, message: 'Not authenticated.' });
    }

    const password = String(req.body.password ?? '');
    if (!password) {
      return next({ status: 400, message: 'Password is required.' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return next({ status: 404, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return next({ status: 403, message: 'Cannot delete an administrator account.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next({ status: 401, message: 'Password is incorrect.' });
    }

    await Transaction.deleteMany({ user: user._id });
    await ChatHistory.deleteMany({ user: user._id });
    await Otp.deleteMany({ email: user.email });
    await user.deleteOne();
    clearAuthCookies(res);

    res.json({ message: 'Account deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
