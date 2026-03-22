import express from 'express';
import { protect } from '../middleware/auth.js';
import csrfProtection from '../middleware/csrfProtection.js';
import { createTransaction, getTransactions } from '../controllers/transactionController.js';

const router = express.Router();

router.use(protect);
router.use(csrfProtection);

router.post('/', createTransaction);
router.get('/', getTransactions);

export default router;
