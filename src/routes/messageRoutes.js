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

router.get('/:id', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).send({ message: 'Unauthorized: Please log in first' });
    }

    const { id: chatId } = req.params; // Chat ID
    const { search, limit, offset } = req.query; // Query parameters for search, pagination
    const userId = req.user.id; // Authenticated user's ID

    try {
        // Verify the chat exists
        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
        });

        if (!chat) {
            return res.status(404).send({ message: 'Chat not found' });
        }

        // Check if the authenticated user is a participant of the chat
        const isParticipant = await prisma.chatUser.findUnique({
            where: {
                userId_chatId: {
                    userId,
                    chatId,
                },
            },
        });

        if (!isParticipant) {
            return res.status(403).send({ message: 'You are not a participant of this chat' });
        }

        // Build query filters
        const filters = {
            chatId,
        };

        if (search) {
            filters.content = { contains: search, mode: 'insensitive' }; // Search by content
        }

        // Retrieve messages with optional search and pagination
        const messages = await prisma.message.findMany({
            where: filters,
            orderBy: { createdAt: 'desc' }, // Newest messages first
            take: parseInt(limit) || 50, // Limit number of messages, default 50
            skip: parseInt(offset) || 0, // Offset for pagination, default 0
            include: {
                sender: { select: { id: true, name: true, profilePicture: true } },
            },
        });

        res.status(200).send({
            message: 'Messages retrieved successfully',
            data: messages,
        });
    } catch (error) {
        console.error('Error retrieving message history:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

router.put('/:id', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).send({ message: 'Unauthorized: Please log in first' });
    }

    const { id: messageId } = req.params; // Message ID
    const { content } = req.body; 
    const userId = req.user.id; // Authenticated user's ID

    try {
        // Check if the message exists and belongs to the user
        const message = await prisma.message.findUnique({
            where: { id: messageId },
        });

        if (!message) {
            return res.status(404).send({ message: 'Message not found' });
        }

        if (message.senderId !== userId) {
            return res.status(403).send({ message: 'You can only edit your own messages' });
        }

        // Ensure the content is not empty
        if (!content || content.trim() === '') {
            return res.status(400).send({ message: 'Message content cannot be empty' });
        }

        // Update the message content
        const updatedMessage = await prisma.message.update({
            where: { id: messageId },
            data: { content },
            select: { id: true, content: true, chatId: true, senderId: true, createdAt: true },
        });

        res.status(200).send({
            message: 'Message updated successfully',
            data: updatedMessage,
        });
    } catch (error) {
        console.error('Error editing message:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});



export default router