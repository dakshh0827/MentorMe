import express from 'express';
import * as sessionController from '../controllers/sessions.controller.js';
import { protectRoute } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Protect all session routes with authentication middleware
router.use(protectRoute);

// Get all sessions for a user (categorized by status)
router.get('/user/:userId', sessionController.getUserSessions);

// Get resolved sessions for a user (both accepted and rejected)
router.get('/resolved/:userId', sessionController.getResolvedSessions);

// Create a new session request
router.post('/create', sessionController.createSession);

// Update session status (accept/decline)
router.patch('/:sessionId/status', sessionController.updateSessionStatus);

// Complete a session with feedback
router.patch('/:sessionId/complete', sessionController.completeSession);

// Cancel/delete a session
router.delete('/:sessionId', sessionController.cancelSession);

export default router;