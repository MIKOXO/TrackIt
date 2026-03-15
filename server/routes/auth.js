import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  updateCurrentUser,
  changePassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getCurrentUser);
router.put('/me', protect, updateCurrentUser);
router.put('/password', protect, changePassword);

export default router;
