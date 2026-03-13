import express from 'express';
import { getStatus } from '../controllers/statusController.js';
import authRouter from './auth.js';
import transactionRouter from './transactions.js';

const router = express.Router();

router.get('/status', getStatus);
router.use('/auth', authRouter);
router.use('/transactions', transactionRouter);

export default router;
