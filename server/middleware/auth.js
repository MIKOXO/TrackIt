import jwt from 'jsonwebtoken';
import User from '../models/User.js';

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
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next({ status: 401, message: 'Authorization header missing.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return next({ status: 401, message: 'User not found for given token.' });
    }

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency ?? 'ETB',
      role: user.role,
    };
    next();
  } catch (error) {
    next({ status: 401, message: 'Invalid or expired authentication token.' });
  }
};
