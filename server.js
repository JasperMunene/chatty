import { Server } from "socket.io";
import http from "http";
import app from "./app.js"; 
import socketHandler from "./src/sockets/socketHandler.js";

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

// Attach socket handler
socketHandler(io);

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});
