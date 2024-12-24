import express from 'express';
import prisma from '../../db/prisma.js';

const router = express.Router();

// Search for users by username or email
router.get('/users', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).send({ message: 'Unauthorized: Please log in first' });
    }

    // Get search query from the query parameters
    const { search } = req.query;

    // If no search term is provided, return an error message
    if (!search) {
        return res.status(400).send({ message: 'Please provide a search term' });
    }

    try {
        // Search for users by username or email
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: 'insensitive', 
                        },
                    },
                    {
                        email: {
                            contains: search,
                            mode: 'insensitive', 
                        },
                    },
                ],
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });

        if (users.length === 0) {
            return res.status(404).send({ message: 'No users found matching the search criteria' });
        }

        // Return the found users
        res.status(200).send({ users });
    } catch (error) {
        console.error('Error during user search:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

router.get('/users/:id', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).send({ message: 'Unauthorized: Please log in first' });
    }

    const { id } = req.params;

    try {
        // Fetch the user by their ID
        const user = await prisma.user.findUnique({
            where: { id: id }, 
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        res.status(200).send({ user });
    } catch (error) {
        console.error('Error retrieving user profile:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});


export default router;
