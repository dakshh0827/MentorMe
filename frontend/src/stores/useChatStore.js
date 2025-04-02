import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { socket } from "../lib/socket.js";

const useChatStore = create((set, get) => ({
  messages: [],
  recipient: null,
  loading: false,
  error: null,
  
  // Fetch recipient user data
  fetchRecipient: async (userId) => {
    try {
      set({ loading: true });
      const response = await axiosInstance.get(`/messages/findUser/${userId}`);
      set({ recipient: response.data, loading: false });
    } catch (error) {
      console.error("Error fetching recipient:", error);
      set({ error: error.message, loading: false });
    }
  },
  
  // Fetch messages between two users
  fetchMessages: async (userId, recipientId) => {
    try {
      set({ loading: true });
      const response = await axiosInstance.get(`/messages/${userId}/${recipientId}`);
      set({ messages: response.data, loading: false });
    } catch (error) {
      console.error("Error fetching messages:", error);
      set({ error: error.message, loading: false });
    }
  },
  
  // Send a new message
  sendMessage: async (messageData) => {
    try {
      const response = await axiosInstance.post('/messages', messageData);
      const newMessage = response.data;
      
      // Add to local state
      set(state => ({ 
        messages: [...state.messages, newMessage] 
      }));
      
      // Emit through socket
      socket.emit('send_message', { 
        ...newMessage, 
        roomId: messageData.roomId 
      });
      
      return newMessage;
    } catch (error) {
      console.error("Error sending message:", error);
      set({ error: error.message });
      return null;
    }
  },
  
  // Add a new message to the state (for socket received messages)
  addMessage: (message) => {
    set(state => {
      // Check if the message already exists to avoid duplicates
      const messageExists = state.messages.some(msg => 
        msg._id === message._id || 
        (msg.tempId && msg.tempId === message.tempId)
      );
      
      if (!messageExists) {
        return { messages: [...state.messages, message] };
      }
      return state;
    });
  },
  
  // Mark a message as read
  markAsRead: async (messageId) => {
    try {
      await axiosInstance.patch(`/messages/${messageId}/read`);
      
      // Update local state
      set(state => ({
        messages: state.messages.map(msg => 
          msg._id === messageId ? { ...msg, read: true } : msg
        )
      }));
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  },
  
  // Get unread message count for a specific conversation
  getUnreadCount: async (userId, recipientId) => {
    try {
      const response = await axiosInstance.get(`/messages/unread/${userId}/${recipientId}`);
      return response.data.count;
    } catch (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }
  },
  
  // Clear messages when leaving the chat
  clearMessages: () => {
    set({ messages: [] });
  }
}));

export default useChatStore;