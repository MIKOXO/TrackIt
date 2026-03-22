import express from 'express';
import { protect } from '../middleware/auth.js';
import csrfProtection from '../middleware/csrfProtection.js';
import {
  askAssistant,
  createConversation,
  getConversations,
  getConversation,
  deleteConversation,
} from '../controllers/assistantController.js';

const router = express.Router();

router.use(protect);
router.use(csrfProtection);

router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.get('/conversations/:conversationId', getConversation);
router.delete('/conversations/:conversationId', deleteConversation);
router.post('/', askAssistant);

export default router;
