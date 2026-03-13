import express from 'express';
import { protect } from '../middleware/auth.js';
import { createTransaction, getTransactions } from '../controllers/transactionController.js';

const router = express.Router();

router.use(protect);

router.post('/', createTransaction);
router.get('/', getTransactions);

export default router;
