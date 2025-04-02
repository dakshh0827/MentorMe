import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore.js";
import useChatStore from "../stores/useChatStore.js";
import { socket } from "../lib/socket.js";
import { formatDistanceToNow } from "date-fns";

const ConnectPage = () => {
  const { authUser } = useAuthStore();
  const { menteeID } = useParams();
  const navigate = useNavigate();
  const messageEndRef = useRef(null);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [recipientTyping, setRecipientTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  
  const {
    messages,
    recipient,
    loading,
    sendMessage,
    fetchMessages,
    fetchRecipient,
    markAsRead,
  } = useChatStore();

  // Fetch recipient data and messages
  useEffect(() => {
    if (!authUser?._id) {
      navigate("/login");
      return;
    }

    if (menteeID) {
      fetchRecipient(menteeID);
      fetchMessages(authUser._id, menteeID);
    }
  }, [authUser, menteeID, fetchRecipient, fetchMessages, navigate]);

  // Socket connection setup
  useEffect(() => {
    if (!authUser?._id || !menteeID) return;

    // Join a room based on the two user IDs (sorted to ensure consistency)
    const roomId = [authUser._id, menteeID].sort().join('-');
    socket.emit('join_chat', { roomId, userId: authUser._id });

    // Listen for incoming messages
    socket.on('receive_message', (newMessage) => {
      if (newMessage.sender !== authUser._id) {
        markAsRead(newMessage._id);
      }
      useChatStore.getState().addMessage(newMessage);
      scrollToBottom();
    });

    // Listen for typing indicators
    socket.on('typing_indicator', ({ userId, isTyping }) => {
      if (userId === menteeID) {
        setRecipientTyping(isTyping);
      }
    });

    // Cleanup on unmount
    return () => {
      socket.off('receive_message');
      socket.off('typing_indicator');
      socket.emit('leave_chat', { roomId, userId: authUser._id });
    };
  }, [authUser, menteeID, markAsRead]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const roomId = [authUser._id, menteeID].sort().join('-');
    
    await sendMessage({
      sender: authUser._id,
      recipient: menteeID,
      content: message,
      roomId
    });
    
    setMessage("");
    clearTimeout(typingTimeout);
    socket.emit('typing_indicator', { roomId, userId: authUser._id, isTyping: false });
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    // Handle typing indicator
    if (!isTyping) {
      setIsTyping(true);
      const roomId = [authUser._id, menteeID].sort().join('-');
      socket.emit('typing_indicator', { roomId, userId: authUser._id, isTyping: true });
    }
    
    // Clear previous timeout
    if (typingTimeout) clearTimeout(typingTimeout);
    
    // Set new timeout
    const timeout = setTimeout(() => {
      setIsTyping(false);
      const roomId = [authUser._id, menteeID].sort().join('-');
      socket.emit('typing_indicator', { roomId, userId: authUser._id, isTyping: false });
    }, 2000);
    
    setTypingTimeout(timeout);
  };

  // Format timestamp to relative time (e.g., "5 minutes ago")
  const formatMessageTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return "just now";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-700 flex justify-between items-center px-6 py-3 bg-gray-800">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="mr-4 text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center">
            <div className="h-10 w-10 bg-gray-600 rounded-full mr-3 flex items-center justify-center">
              {recipient?.profilePicture ? (
                <img src={recipient.profilePicture} alt={recipient.name} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-white">{recipient?.name?.charAt(0) || "?"}</span>
              )}
            </div>
            <div>
              <p className="font-semibold text-white">{recipient?.name || "Loading..."}</p>
              <p className="text-xs text-gray-400">
                {recipient?.role === "mentor" ? "Mentor" : "Mentee"}
                {recipient?.field && ` • ${recipient.field}`}
                {recipientTyping && <span className="text-purple-400 ml-2">typing...</span>}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="bg-gray-800 rounded-full p-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="mt-4">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={msg._id || index} 
              className={`flex ${msg.sender === authUser?._id ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-3/4 rounded-2xl px-4 py-2 ${
                  msg.sender === authUser?._id 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-800 text-gray-200'
                }`}
              >
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${
                  msg.sender === authUser?._id ? 'text-purple-200' : 'text-gray-400'
                }`}>
                  {formatMessageTime(msg.createdAt)}
                  {msg.sender === authUser?._id && (
                    <span className="ml-2">
                      {msg.read ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                      )}
                    </span>
                  )}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messageEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-700 p-4 bg-gray-800">
        <div className="flex items-center">
          <input
            type="text"
            className="flex-1 bg-gray-700 text-gray-200 border border-gray-600 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Type your message..."
            value={message}
            onChange={handleTyping}
          />
          <button
            type="submit"
            className={`ml-2 rounded-full p-2 ${
              message.trim() ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-700 cursor-not-allowed'
            } text-white transition-colors`}
            disabled={!message.trim()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConnectPage;