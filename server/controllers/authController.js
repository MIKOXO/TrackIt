import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

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
        role: user.role,
      },
    });
  } catch (error) {
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
      return next({ status: 401, message: 'Invalid credentials.' });
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
      role: req.user.role,
    },
  });
};
