import express from 'express';
import prisma from '../../db/prisma.js';
import upload from '../config/multerConfig.js';
import cloudinary from '../config/cloudinaryConfig.js';

const router = express.Router();

// Create new chat
router.post('/', async (req, res) => {
    const { name, userIds } = req.body;

    // Validate the input
    if(!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).send({ message: 'userIds must be a non-empty array' });
    }

    try {
        // Check if the authenticated user is provided (e.g., via middleware or req.user)
        if (!req.isAuthenticated()) {
            return res.status(401).send({ message: 'Unauthorized: Please log in first' });
        }

        const authUserId = req.user.id

         // Ensure the authenticated user is included in the chat
         if (!userIds.includes(authUserId)) {
            userIds.push(authUserId);
        }

         // Create the chat
         const chat = await prisma.chat.create({
            data: {
                name,
                users: {
                    create: userIds.map(userId => ({
                        user: { connect: { id: userId } },
                    })),
                },
            },
            include: {
                users: {
                    select: {
                        user: { select: { id: true, name: true, email: true } },
                    },
                },
            },
        });

        res.status(201).send({
            message: 'Chat created successfully',
            chat: {
                id: chat.id,
                name: chat.name,
                users: chat.users.map(chatUser => chatUser.user),
                createdAt: chat.createdAt,
            },
        });
    } catch (error) {
        console.error('Error creating chat:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
})

// Retrieve a list of chats the user is a member of.
router.get('/', async (req, res) => {
    try {
        // Check if the user is authenticated
        if (!req.isAuthenticated()) {
            return res.status(401).send({ message: 'Unauthorized: Please log in first' });
        }

        const authUserId = req.user.id;

        // Retrieve chats that the user is part of
        const chats = await prisma.chat.findMany({
            where: {
                users: {
                    some: {
                        userId: authUserId,
                    },
                },
            },
            include: {
                users: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                messages: {
                    take: 1, // Fetch the most recent message
                    orderBy: {
                        createdAt: 'desc',
                    },
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        sender: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        // Format the response
        const formattedChats = chats.map(chat => {
            // Extract the other user's name for one-on-one chats
            const otherUser =
                chat.users.length === 2
                    ? chat.users.find(chatUser => chatUser.user.id !== authUserId)?.user
                    : null;

            return {
                id: chat.id,
                name: chat.name || (otherUser ? otherUser.name : null), 
                users: chat.users.map(chatUser => chatUser.user),
                lastMessage: chat.messages[0] || null,
                createdAt: chat.createdAt,
            };
        });

        res.status(200).send({
            message: 'Chats retrieved successfully',
            chats: formattedChats,
        });
    } catch (error) {
        console.error('Error retrieving chats:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

// Get details about a specific chat.
router.get('/:id', async (req, res) => {
    try {
        // Check if the user is authenticated
        if (!req.isAuthenticated()) {
            return res.status(401).send({ message: 'Unauthorized: Please log in first' });
        }

        const { id } = req.params; 
        const authUserId = req.user.id; // Authenticated user's ID

        // Retrieve the chat details
        const chat = await prisma.chat.findUnique({
            where: {
                id: id,
            },
            include: {
                users: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        sender: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        // Check if the chat exists and if the user is part of it
        if (!chat) {
            return res.status(404).send({ message: 'Chat not found' });
        }

        const isUserPartOfChat = chat.users.some(chatUser => chatUser.user.id === authUserId);

        if (!isUserPartOfChat) {
            return res.status(403).send({ message: 'Forbidden: You are not a participant in this chat' });
        }

        // Format the response
        const chatDetails = {
            id: chat.id,
            name: chat.name || null,
            participants: chat.users.map(chatUser => chatUser.user),
            messages: chat.messages,
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt,
        };

        res.status(200).send({
            message: 'Chat details retrieved successfully',
            chat: chatDetails,
        });
    } catch (error) {
        console.error('Error retrieving chat details:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

// Upload or update a profile picture for a group chat.
router.post('/:id/profile-picture', upload.single('image'), async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).send({ message: 'Unauthorized: Please log in first' });
    }

    const { id } = req.params;

    try {
        // Check if a file was uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Upload image to Cloudinary
        cloudinary.uploader.upload_stream(
            { resource_type: 'image' },
            async (error, uploadResult) => {
                if (error) {
                    console.error('Error uploading image to Cloudinary:', error);
                    return res.status(500).json({ message: 'Error uploading image to Cloudinary' });
                }

                // Get the secure URL from Cloudinary
                const imageUrl = uploadResult.secure_url;

                // Update the chat's profile picture in the database
                const updatedChat= await prisma.chat.update({
                    where: { id },
                    data: { profilePicture: imageUrl },
                    select: { id: true, name: true, profilePicture: true },
                });

                // Respond with the updated user details
                res.status(200).json({
                    message: 'Profile picture updated successfully',
                    user: updatedChat,
                });
            }
        ).end(req.file.buffer); // Pass the file buffer to the uploader
    } catch (error) {
        console.error('Error updating profile picture:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router