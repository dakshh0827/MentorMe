import express from 'express';
import { getUserById, getMessages, createMessage, markAsRead, getUnreadCount, getConversations } from '../controllers/message.controller.js';
import { protectRoute } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protectRoute);

// Get messages between two users
router.get('/findUser/:userId', getUserById);
router.get('/:userId/:recipientId', getMessages);

// Create a new message
router.post('/', createMessage);

// Mark a message as read
router.patch('/:messageId/read', markAsRead);

// Get unread messages count
router.get('/unread/:userId/:recipientId', getUnreadCount);

// Get all conversations for a user
router.get('/conversations/:userId', getConversations);

export default router;
