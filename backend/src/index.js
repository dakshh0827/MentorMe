import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer, request } from "http";

import path from "path";

import { connectDB } from "./lib/db.js";
import { initializeSocket } from "./lib/socket.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import requestRoutes from "./routes/requests.route.js";
import messageRoutes from "./routes/message.route.js";
import sessionRoutes from "./routes/sessions.route.js";
import fileUpload from "express-fileupload";


dotenv.config();

const app = express();
const PORT = process.env.PORT;
const __dirname = path.resolve();

const server = createServer(app);
const io = initializeSocket(server);

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp/",
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5174"], // Allow both origins
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);
app.use('/api/messages', messageRoutes);
app.use("/api/sessions", sessionRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
  connectDB();
});

export { io };
