require('dotenv').config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fileUpload = require('express-fileupload');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.set("port", process.env.PORT || 4000);
const cors = require("cors");

app.use(cors({
    origin: "*"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 },
    abortOnLimit: true,
    createParentPath: true
}));

app.get("/", (req, res) => {
    res.json({ 
        message: "Proshare API",
        version: "2.0.0",
        endpoints: {
            users: "/api/users",
            projects: "/api/projects",
            messages: "/api/messages",
            upload: "/api/upload"
        }
    });
});

// Controllers
const userController = require("./controllers/userController");
app.use("/api/users", userController);

const projectController = require("./controllers/projectController");
app.use("/api/projects", projectController);

const messageController = require("./controllers/messageController");
app.use("/api/messages", messageController);

const uploadController = require("./controllers/uploadController");
app.use("/api/upload", uploadController);

// Socket.io for real-time messaging
const connectedUsers = new Map(); 

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // User joins with their googleId
    socket.on("join", (googleId) => {
        connectedUsers.set(googleId, socket.id);
        socket.googleId = googleId;
        console.log(`User ${googleId} connected with socket ${socket.id}`);
    });

    // Send message event
    socket.on("sendMessage", (data) => {
        const { receiverId, message, conversationId } = data;
        const receiverSocketId = connectedUsers.get(receiverId);
        
        if (receiverSocketId) {
            // Send to specific user
            io.to(receiverSocketId).emit("receiveMessage", {
                message,
                conversationId
            });
        }
    });

    // Typing indicator
    socket.on("typing", (data) => {
        const { receiverId, isTyping, senderName } = data;
        const receiverSocketId = connectedUsers.get(receiverId);
        
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("userTyping", {
                isTyping,
                senderName
            });
        }
    });

    // Mark messages as read
    socket.on("messagesRead", (data) => {
        const { senderId, conversationId } = data;
        const senderSocketId = connectedUsers.get(senderId);
        
        if (senderSocketId) {
            io.to(senderSocketId).emit("messagesReadConfirmation", {
                conversationId
            });
        }
    });

    socket.on("disconnect", () => {
        if (socket.googleId) {
            connectedUsers.delete(socket.googleId);
            console.log(`User ${socket.googleId} disconnected`);
        }
    });
});

if (require.main === module) {
    server.listen(app.get("port"), () => {
        console.log(`✅ Server running on port ${app.get("port")}`);
        console.log(`🔌 WebSocket server active`);
    });
}

module.exports = { app, server, io };