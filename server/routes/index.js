import express from 'express';
import { getStatus } from '../controllers/statusController.js';
import authRouter from './auth.js';

const router = express.Router();

router.get('/status', getStatus);
router.use('/auth', authRouter);

export default router;
