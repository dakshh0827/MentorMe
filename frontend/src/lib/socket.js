import { io } from "socket.io-client";

// Create socket connection with auth token
export const socket = io(import.meta.env.REACT_APP_API_URL || "http://localhost:5001", {
  autoConnect: true,
  withCredentials: true,
  extraHeaders: {
    "Authorization": localStorage.getItem("token") || ""
  }
});

// Reconnect with updated token when user logs in
export const updateSocketAuth = (token) => {
  socket.io.opts.extraHeaders = {
    "Authorization": token
  };
  
  // Force reconnect to apply new auth header
  if (socket.connected) {
    socket.disconnect().connect();
  }
};
