import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Message from '../models/message.model.js';

const onlineUsers = new Map();

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [process.env.CLIENT_URL || "http://localhost:5174", "https://mentorme-qs6s.onrender.com"],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.headers.authorization;
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return next(new Error('Authentication error: Invalid token'));
        }

        socket.user = decoded;
        next();
      });
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    if (socket.user && socket.user._id) {
      onlineUsers.set(socket.user._id, socket.id);

      io.emit('user_status', { 
        userId: socket.user._id, 
        status: 'online' 
      });
    }

    socket.on('join_chat', ({ roomId }) => {
      socket.join(roomId);
      console.log(`User ${socket.user?._id} joined room: ${roomId}`);
    });

    socket.on('leave_chat', ({ roomId }) => {
      socket.leave(roomId);
      console.log(`User ${socket.user?._id} left room: ${roomId}`);
    });

    socket.on('send_message', async (messageData) => {
      try {
        if (messageData.roomId) {
          io.to(messageData.roomId).emit('receive_message', messageData);
        }

        if (!messageData._id) {
          const newMessage = new Message({
            sender: messageData.sender,
            recipient: messageData.recipient,
            content: messageData.content
          });
          await newMessage.save();
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    socket.on('typing_indicator', ({ roomId, userId, isTyping }) => {
      socket.to(roomId).emit('typing_indicator', { userId, isTyping });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);

      if (socket.user && socket.user._id) {
        onlineUsers.delete(socket.user._id);
        io.emit('user_status', { 
          userId: socket.user._id, 
          status: 'offline' 
        });
      }
    });
  });

  return io;
};

export { onlineUsers };
