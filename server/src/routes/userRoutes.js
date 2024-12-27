import express from 'express';
import prisma from '../../db/prisma.js';
import cloudinary from '../config/cloudinaryConfig.js';
import upload from '../config/multerConfig.js';

const router = express.Router();

// Search for users by username or email
router.get('/', async (req, res) => {
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

// Retrieve a specific user's profile information.
router.get('/:id', async (req, res) => {
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

// Upload or update the profile picture for a specific user.
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

                // Update the user's profile picture in the database
                const updatedUser = await prisma.user.update({
                    where: { id },
                    data: { profilePicture: imageUrl },
                    select: { id: true, name: true, profilePicture: true },
                });

                // Respond with the updated user details
                res.status(200).json({
                    message: 'Profile picture updated successfully',
                    user: updatedUser,
                });
            }
        ).end(req.file.buffer); // Pass the file buffer to the uploader
    } catch (error) {
        console.error('Error updating profile picture:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


export default router;
