import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { getDashboardStats, getUserStats, getAllUsers, updateUserStatus, deleteUser } from '../controllers/adminController.js';

const router = express.Router();

// Protect all admin routes
router.use(protect);
router.use(adminOnly);

// Dashboard stats
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users/stats', getUserStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

export default router;
