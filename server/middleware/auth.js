import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AUTH_COOKIE_NAME } from '../constants/authCookies.js';

const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }
  return jwt.verify(token, secret);
};

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];
    const headerToken =
      authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const token = headerToken || cookieToken;
    if (!token) {
      return next({ status: 401, message: 'Authorization credentials are required.' });
    }
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return next({ status: 401, message: 'User not found for given token.' });
    }
    if (user.status === 'suspended') {
      return next({ status: 403, message: 'User account is suspended.' });
    }

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency ?? 'ETB',
      role: user.role,
      securityQuestionSet: Boolean(user.securityQuestionSet),
    };
    next();
  } catch (error) {
    next({ status: 401, message: 'Invalid or expired authentication token.' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return next({ status: 403, message: 'Admin access required.' });
  }
  next();
};
