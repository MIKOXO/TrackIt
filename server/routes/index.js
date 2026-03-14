import express from 'express';
import { getStatus } from '../controllers/statusController.js';
import authRouter from './auth.js';
import transactionRouter from './transactions.js';
import analyticsRouter from './analytics.js';

const router = express.Router();

router.get('/status', getStatus);
router.use('/auth', authRouter);
router.use('/transactions', transactionRouter);
router.use('/analytics', analyticsRouter);

export default router;
