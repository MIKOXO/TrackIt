import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  updateCurrentUser,
  changePassword,
  passwordResetUnavailable,
  deleteCurrentUser,
  logout,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import csrfProtection from '../middleware/csrfProtection.js';
import {
  loginLimiter,
  registerLimiter,
  passwordLimiter,
  passwordResetIpLimiter,
  passwordResetEmailLimiter,
} from '../middleware/rateLimiter.js';
import validate from '../middleware/validate.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
} from '../validation/authSchemas.js';

const router = express.Router();

router.post('/register', registerLimiter, validate(registerSchema), register);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.get('/me', protect, csrfProtection, getCurrentUser);
router.put('/me', protect, csrfProtection, validate(updateProfileSchema), updateCurrentUser);
router.delete(
  '/me',
  protect,
  csrfProtection,
  passwordLimiter,
  validate(deleteAccountSchema),
  deleteCurrentUser
);
router.put(
  '/password',
  protect,
  csrfProtection,
  passwordLimiter,
  validate(changePasswordSchema),
  changePassword
);
router.post(
  '/forgot-password/question',
  passwordResetIpLimiter,
  passwordResetEmailLimiter,
  passwordResetUnavailable
);
router.post(
  '/forgot-password',
  passwordResetIpLimiter,
  passwordResetEmailLimiter,
  passwordResetUnavailable
);
router.post(
  '/reset-password',
  passwordResetIpLimiter,
  passwordResetEmailLimiter,
  passwordResetUnavailable
);
router.post('/logout', protect, csrfProtection, logout);

export default router;
