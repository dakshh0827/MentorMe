import mongoose from 'mongoose';
import Session from '../models/sessions.model.js';
import { io } from '../index.js';

/**
 * Get all sessions for a user, categorized by status
 */
export const getUserSessions = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const sessions = await Session.find({
      $or: [{ student: userId }, { mentor: userId }],
    })
      .populate('student', 'name email')
      .populate('mentor', 'name email')
      .sort({ scheduledAt: -1 });

    const now = new Date();
    const pendingSessions = sessions.filter(session => session.status === 'pending');
    const upcomingSessions = sessions.filter(
      session => session.status === 'accepted' && new Date(session.scheduledAt) > now
    );
    const pastSessions = sessions.filter(
      session => session.status === 'completed' || (session.status === 'accepted' && new Date(session.scheduledAt) < now)
    );

    res.status(200).json({ pendingSessions, upcomingSessions, pastSessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Failed to fetch sessions', error: error.message });
  }
};

/**
 * Get resolved sessions for a user (both accepted and rejected)
 */
export const getResolvedSessions = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const resolvedSessions = await Session.find({
      $or: [{ student: userId }, { mentor: userId }],
      status: { $in: ['accepted', 'rejected'] }
    })
      .populate('student', 'name email')
      .populate('mentor', 'name email')
      .sort({ updatedAt: -1 });

    res.status(200).json(resolvedSessions);
  } catch (error) {
    console.error('Error fetching resolved sessions:', error);
    res.status(500).json({ message: 'Failed to fetch resolved sessions', error: error.message });
  }
};

/**
 * Create a new session request
 */
export const createSession = async (req, res) => {
    try {
        const { scheduledAt, mentor, student, title, description } = req.body;

        if (!scheduledAt || !mentor || !student || !title) {
            return res.status(400).json({ message: 'All fields (scheduledAt, mentor, student, title) are required' });
        }

        if (!mongoose.Types.ObjectId.isValid(mentor) || !mongoose.Types.ObjectId.isValid(student)) {
            return res.status(400).json({ message: 'Invalid mentor or student ID' });
        }

        const newSession = new Session({ 
            scheduledAt, 
            mentor, 
            student, 
            title, 
            description,
            status: 'pending' 
        });

        await newSession.save();

        io.to(`user-${mentor}`).emit('session-request-received', newSession);

        res.status(201).json(newSession);
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ message: 'Failed to create session', error: error.message });
    }
};

/**
 * Update session status (accept/decline)
 */
export const updateSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status } = req.body;

    if (!['accepted', 'declined', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "accepted", "declined", or "rejected".' });
    }

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: 'Invalid session ID' });
    }

    const updatedSession = await Session.findByIdAndUpdate(sessionId, { status }, { new: true })
      .populate('student', 'name email')
      .populate('mentor', 'name email');

    if (!updatedSession) {
      return res.status(404).json({ message: 'Session not found' });
    }

    io.to(`user-${updatedSession.student._id}`).emit('session-status-updated', updatedSession);
    io.to(`user-${updatedSession.mentor._id}`).emit('session-status-updated', updatedSession);

    res.status(200).json(updatedSession);
  } catch (error) {
    console.error('Error updating session status:', error);
    res.status(500).json({ message: 'Failed to update session status', error: error.message });
  }
};

/**
 * Complete a session with feedback
 */
export const completeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const feedbackData = req.body;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: 'Invalid session ID' });
    }

    const completedSession = await Session.findByIdAndUpdate(
      sessionId,
      { status: 'completed', feedback: feedbackData, completedAt: new Date() },
      { new: true }
    )
      .populate('student', 'name email')
      .populate('mentor', 'name email');

    if (!completedSession) {
      return res.status(404).json({ message: 'Session not found' });
    }

    io.to(`user-${completedSession.student._id}`).emit('session-completed', completedSession);
    io.to(`user-${completedSession.mentor._id}`).emit('session-completed', completedSession);

    res.status(200).json(completedSession);
  } catch (error) {
    console.error('Error completing session:', error);
    res.status(500).json({ message: 'Failed to complete session', error: error.message });
  }
};

/**
 * Cancel a session
 */
export const cancelSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: 'Invalid session ID' });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    await Session.findByIdAndDelete(sessionId);

    io.to(`user-${session.student}`).emit('session-cancelled', session);
    io.to(`user-${session.mentor}`).emit('session-cancelled', session);

    res.status(200).json({ message: 'Session cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling session:', error);
    res.status(500).json({ message: 'Failed to cancel session', error: error.message });
  }
};