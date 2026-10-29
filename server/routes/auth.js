import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  updateCurrentUser,
  changePassword,
  verifyEmail,
  resendOtp,
  forgotPassword,
  resetPassword,
  deleteCurrentUser,
  logout,
  googleLogin,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import csrfProtection from '../middleware/csrfProtection.js';
import {
  loginLimiter,
  registerLimiter,
  passwordLimiter,
  passwordResetIpLimiter,
  passwordResetEmailLimiter,
  otpSendEmailLimiter,
  otpSendIpLimiter,
  forgotPasswordIpLimiter,
  forgotPasswordEmailLimiter,
} from '../middleware/rateLimiter.js';
import validate from '../middleware/validate.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
  verifyEmailSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleAuthSchema,
} from '../validation/authSchemas.js';

const router = express.Router();

router.post('/register', registerLimiter, validate(registerSchema), register);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/google', loginLimiter, validate(googleAuthSchema), googleLogin);
router.post('/verify-email', validate(verifyEmailSchema), verifyEmail);
router.post(
  '/resend-otp',
  otpSendIpLimiter,
  otpSendEmailLimiter,
  validate(resendOtpSchema),
  resendOtp
);
router.post(
  '/forgot-password',
  forgotPasswordIpLimiter,
  forgotPasswordEmailLimiter,
  validate(forgotPasswordSchema),
  forgotPassword
);
router.post(
  '/reset-password',
  passwordResetIpLimiter,
  passwordResetEmailLimiter,
  validate(resetPasswordSchema),
  resetPassword
);
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
router.post('/logout', protect, csrfProtection, logout);

export default router;
