import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

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

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return next({ status: 400, message: 'Name, email, and password are required.' });
    }

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
    });
    const token = generateToken({ userId: user._id, role: user.role });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency ?? 'ETB',
        role: user.role,
      },
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
    if (!email || !password) {
      return next({ status: 400, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next({
        status: 404,
        message: 'This account was deleted. Please contact mikeadmin@gmail.com for assistance.',
      });
    }

    if (user.status === 'suspended') {
      return next({
        status: 403,
        message: 'Your account has been suspended. Contact mikeadmin@gmail.com for more info.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next({ status: 401, message: 'Invalid credentials.' });
    }

    const token = generateToken({ userId: user._id, role: user.role });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency ?? 'ETB',
        role: user.role,
      },
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
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency ?? 'ETB',
        role: user.role,
      },
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

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return next({ status: 404, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return next({ status: 401, message: 'Current password is incorrect.' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
};
