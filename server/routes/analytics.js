import express from 'express';
import { protect } from '../middleware/auth.js';
import csrfProtection from '../middleware/csrfProtection.js';
import { getAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

router.use(protect);
router.use(csrfProtection);
router.get('/', getAnalytics);

export default router;
