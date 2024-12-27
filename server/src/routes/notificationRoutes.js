import express from 'express';
import prisma from '../../db/prisma.js';

const router = express.Router();

// Fetch notifications for events like new messages or chat invitations.
router.get('/', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).send({ message: 'Unauthorized: Please log in first' });
    }

    const userId = req.user.id; // Authenticated user's ID

    try {
        // Fetch unread notifications for the user (or all notifications)
        const notifications = await prisma.notification.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: 'desc', // Sort notifications by creation date
            },
        });

        // Respond with the notifications
        res.status(200).json({
            message: 'Notifications fetched successfully',
            notifications,
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});


// Mark a notification as read.
router.put('/:id/read', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).send({ message: 'Unauthorized: Please log in first' });
    }

    const { id } = req.params; // Notification ID
    const authUserId = req.user.id; // Authenticated user ID

    try {
        // Verify that the notification exists and belongs to the authenticated user
        const notification = await prisma.notification.findUnique({
            where: { id },
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (notification.userId !== authUserId) {
            return res.status(403).json({ message: 'You are not authorized to update this notification' });
        }

        // Mark the notification as read
        const updatedNotification = await prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });

        res.status(200).json({
            message: 'Notification marked as read',
            notification: updatedNotification,
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


export default router