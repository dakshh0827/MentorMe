import { Server } from "socket.io";

const activeUsers = new Map(); // Store active users

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5174",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Join user to their personal room
    socket.on("join", (userId) => {
      if (userId) {
        activeUsers.set(userId, socket.id);
        socket.join(userId);
        console.log(`User ${userId} joined room`);
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      for (let [userId, socketId] of activeUsers.entries()) {
        if (socketId === socket.id) {
          activeUsers.delete(userId);
          break;
        }
      }
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

export { activeUsers };
