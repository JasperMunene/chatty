import express from 'express';
import prisma from '../../db/prisma.js';

const router = express.Router();

// Send a message within a chat.
router.post('/', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).send({ message: 'Unauthorized: Please log in first' });
    }

    const { chatId, content } = req.body;
    const senderId = req.user.id; // Authenticated user's ID

    // Validate input
    if (!chatId || !content) {
        return res.status(400).send({ message: 'Chat ID and content are required' });
    }

    try {
        // Verify the chat exists
        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
        });

        if (!chat) {
            return res.status(404).send({ message: 'Chat not found' });
        }

        // Check if the sender is a participant of the chat
        const isParticipant = await prisma.chatUser.findUnique({
            where: {
                userId_chatId: {
                    userId: senderId,
                    chatId,
                },
            },
        });

        if (!isParticipant) {
            return res.status(403).send({ message: 'You are not a participant of this chat' });
        }

        // Create the message
        const message = await prisma.message.create({
            data: {
                content,
                senderId,
                chatId,
            },
            include: {
                sender: { select: { id: true, name: true, profilePicture: true } },
            },
        });

        res.status(201).send({
            message: 'Message sent successfully',
            data: {
                id: message.id,
                content: message.content,
                sender: message.sender,
                chatId: message.chatId,
                createdAt: message.createdAt,
            },
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

export default router