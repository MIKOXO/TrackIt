import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  updateCurrentUser,
  changePassword,
  setSecurityQuestion,
  fetchSecurityQuestionByEmail,
  verifySecurityAnswerForReset,
  resetPasswordWithToken,
  deleteCurrentUser,
  logout,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import csrfProtection from '../middleware/csrfProtection.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, csrfProtection, getCurrentUser);
router.put('/me', protect, csrfProtection, updateCurrentUser);
router.delete('/me', protect, csrfProtection, deleteCurrentUser);
router.put('/password', protect, csrfProtection, changePassword);
router.post('/security-question', protect, csrfProtection, setSecurityQuestion);
router.post('/forgot-password/question', fetchSecurityQuestionByEmail);
router.post('/forgot-password', verifySecurityAnswerForReset);
router.post('/reset-password', resetPasswordWithToken);
router.post('/logout', protect, csrfProtection, logout);

export default router;
