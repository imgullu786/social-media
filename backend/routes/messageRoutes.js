import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import { sendMessage, getMessages, getConversations } from '../controllers/messageController.js';

const router = express.Router();

router.post('/', protectRoute, sendMessage);
router.get('/get/:recipientUserId', protectRoute, getMessages);
router.get('/conversations', protectRoute, getConversations);


export default router;