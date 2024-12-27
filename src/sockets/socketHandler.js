const socketHandler = (io) => {
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        // User joins a chat
        socket.on("joinChat", (chatId) => {
            if (chatId) {
                socket.join(chatId);
                console.log(`User ${socket.id} joined chat ${chatId}`);
            } else {
                console.error("joinChat event received without chatId");
            }
        });

        // Send message to a chat
        socket.on("sendMessage", ({ chatId, message }) => {
            if (chatId && message) {
                io.to(chatId).emit("newMessage", message);
                console.log(`Message sent in chat ${chatId}: ${message}`);
            } else {
                console.error("sendMessage event received with missing data");
            }
        });

        // Send notification to a specific user
        socket.on("sendNotification", ({ userId, notification }) => {
            if (userId && notification) {
                io.to(userId).emit("newNotification", notification);
                console.log(`Notification sent to user ${userId}: ${notification}`);
            } else {
                console.error("sendNotification event received with missing data");
            }
        });

        // Handle disconnection
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};

export default socketHandler;
