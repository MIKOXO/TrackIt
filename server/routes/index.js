import express from 'express';
import { getStatus } from '../controllers/statusController.js';
import authRouter from './auth.js';
import transactionRouter from './transactions.js';
import analyticsRouter from './analytics.js';
import adminRouter from './admin.js';
import assistantRouter from './assistant.js';

const router = express.Router();

router.get('/status', getStatus);
router.use('/auth', authRouter);
router.use('/transactions', transactionRouter);
router.use('/analytics', analyticsRouter);
router.use('/admin', adminRouter);
router.use('/assistant', assistantRouter);

export default router;
