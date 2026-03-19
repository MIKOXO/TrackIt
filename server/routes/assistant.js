import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  askAssistant,
  createConversation,
  getConversations,
  getConversation,
} from '../controllers/assistantController.js';

const router = express.Router();

router.use(protect);

router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.get('/conversations/:conversationId', getConversation);
router.post('/', askAssistant);

export default router;
