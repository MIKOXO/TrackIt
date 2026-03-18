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
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getCurrentUser);
router.put('/me', protect, updateCurrentUser);
router.put('/password', protect, changePassword);
router.post('/security-question', protect, setSecurityQuestion);
router.post('/forgot-password/question', fetchSecurityQuestionByEmail);
router.post('/forgot-password', verifySecurityAnswerForReset);
router.post('/reset-password', resetPasswordWithToken);

export default router;
