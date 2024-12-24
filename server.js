import { Server } from "socket.io";
import http from "http";
import app from "./app.js"; 

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});

export { io }; // Export `io` if you need to use it in other files
