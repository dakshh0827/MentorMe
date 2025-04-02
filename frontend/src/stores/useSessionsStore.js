import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import io from 'socket.io-client';

const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5001';
let socket;

const useSessionsStore = create((set, get) => ({
    pendingSessions: [],
    upcomingSessions: [],
    pastSessions: [],
    resolvedSessions: [], // Added resolvedSessions array
    isLoading: false,
    error: null,

    // Initialize socket connection
    initSocketConnection: () => {
        if (!socket) {
            socket = io(API_URL);
            
            socket.on('connect', () => {
                console.log('Socket connected for session updates');
            });
            
            socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                set({ error: 'Failed to connect to real-time service' });
            });
        }
        return socket;
    },

    // Listen for real-time session updates
    listenForSessionUpdates: (userId) => {
        const store = get();
        const socket = store.initSocketConnection();
        
        // Join user-specific room for session updates
        socket.emit('join-session-room', userId);
        
        // Listen for various session events
        socket.on('session-request-received', (session) => {
            set(state => ({
                pendingSessions: [session, ...state.pendingSessions]
            }));
        });
        
        socket.on('session-status-updated', (updatedSession) => {
            set(state => {
                // Remove from pending if it's there
                const newPendingSessions = state.pendingSessions.filter(
                    session => session._id !== updatedSession._id
                );
                
                // Add to upcoming if accepted or to resolved if rejected
                let newUpcomingSessions = [...state.upcomingSessions];
                let newResolvedSessions = [...state.resolvedSessions];
                
                if (updatedSession.status === 'accepted') {
                    newUpcomingSessions = [updatedSession, ...newUpcomingSessions];
                } else if (updatedSession.status === 'rejected') {
                    newResolvedSessions = [updatedSession, ...newResolvedSessions];
                }
                
                return {
                    pendingSessions: newPendingSessions,
                    upcomingSessions: newUpcomingSessions,
                    resolvedSessions: newResolvedSessions
                };
            });
        });
        
        socket.on('session-completed', (completedSession) => {
            set(state => {
                // Remove from upcoming
                const newUpcomingSessions = state.upcomingSessions.filter(
                    session => session._id !== completedSession._id
                );
                
                // Add to past sessions
                const newPastSessions = [completedSession, ...state.pastSessions];
                
                return {
                    upcomingSessions: newUpcomingSessions,
                    pastSessions: newPastSessions
                };
            });
        });
        
        socket.on('session-cancelled', (cancelledSession) => {
            set(state => {
                // Remove from appropriate list based on status
                const newPendingSessions = state.pendingSessions.filter(
                    session => session._id !== cancelledSession._id
                );
                const newUpcomingSessions = state.upcomingSessions.filter(
                    session => session._id !== cancelledSession._id
                );
                
                return {
                    pendingSessions: newPendingSessions,
                    upcomingSessions: newUpcomingSessions
                };
            });
        });
    },

    // Clean up socket listeners
    cleanupSocketListeners: () => {
        if (socket) {
            socket.off('session-request-received');
            socket.off('session-status-updated');
            socket.off('session-completed');
            socket.off('session-cancelled');
        }
    },

    // Fetch all sessions for a user
    fetchSessions: async (userId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get(`/sessions/user/${userId}`);
            const { pendingSessions, upcomingSessions, pastSessions } = response.data;
            
            set({
                pendingSessions: pendingSessions || [],
                upcomingSessions: upcomingSessions || [],
                pastSessions: pastSessions || [],
                isLoading: false
            });
        } catch (error) {
            console.error('Error fetching sessions:', error);
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to fetch sessions'
            });
        }
    },
    
    // Fetch resolved sessions for a user
    fetchResolvedSessions: async (userId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get(`/sessions/resolved/${userId}`);
            set({
                resolvedSessions: response.data || [],
                isLoading: false
            });
        } catch (error) {
            console.error('Error fetching resolved sessions:', error);
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to fetch resolved sessions'
            });
        }
    },

    // Create a new session request
    createSessionRequest: async (sessionData) => {
        set({ isLoading: true, error: null });
        try {
            console.log("sessions data: ", sessionData);
    
            const response = await axiosInstance.post('/sessions/create', {
                mentor: sessionData.mentor, 
                student: sessionData.student, 
                title: sessionData.title,
                description: sessionData.description,
                scheduledAt: sessionData.scheduledAt, // Fixed field name
            });
    
            set(state => ({
                upcomingSessions: [response.data, ...state.upcomingSessions],
                isLoading: false
            }));
    
            return response.data;
        } catch (error) {
            console.error('Error creating session request:', error);
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to create session request'
            });
            throw error;
        }
    },
    
    // Update session status (accept/decline)
    updateSessionStatus: async (sessionId, status) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.patch(`/sessions/${sessionId}/status`, { status });
            
            // Local state will be updated via socket events
            set({ isLoading: false });
            return response.data;
        } catch (error) {
            console.error('Error updating session status:', error);
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to update session status'
            });
            throw error;
        }
    },

    // Cancel a session
    cancelSession: async (sessionId) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.delete(`/sessions/${sessionId}`);
            
            // Local state will be updated via socket events
            set({ isLoading: false });
        } catch (error) {
            console.error('Error cancelling session:', error);
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to cancel session'
            });
            throw error;
        }
    },

    // Complete a session
    completeSession: async (sessionId, feedbackData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.patch(`/sessions/${sessionId}/complete`, feedbackData);
            
            // Local state will be updated via socket events
            set({ isLoading: false });
            return response.data;
        } catch (error) {
            console.error('Error completing session:', error);
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to complete session'
            });
            throw error;
        }
    },

    // Reset error state
    clearError: () => set({ error: null })
}));

export default useSessionsStore;