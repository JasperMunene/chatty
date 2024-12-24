import express from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import prisma from '../../db/prisma.js';

const router = express.Router();

passport.use(
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
        },
        async (email, password, done) => {
            try {
                const user = await prisma.user.findUnique({ where: { email } });

                if (!user) {
                    return done(null, false, { message: 'User not found' });
                }

                // Compare the hashed password with the one provided
                const isMatch = await bcrypt.compare(password, user.password);

                if (!isMatch) {
                    return done(null, false, { message: 'Invalid password' });
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

// Serialize and deserialize user for session support
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Signup route
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
        return res.status(400).send({ message: 'All fields are required' });
    }

    try {
        // Check if the email is already registered
        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            return res.status(400).send({ message: 'Email is already registered. Please log in or use a different email.' });
        }

         // Check if the username is already taken
         const existingUserByName = await prisma.user.findUnique({ where: { name } });

         if (existingUserByName) {
            return res.status(400).send({ message: 'Username is already taken. Please choose a different username.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        res.status(201).send({
            message: 'User registered successfully',
            user: { id: newUser.id, name: newUser.name, email: newUser.email },
        });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});


// Login route
router.post('/login', passport.authenticate('local', { failureMessage: 'Invalid credentials' }), (req, res) => {
    res.status(200).send({ message: 'Logged in successfully', user: { id: req.user.id, name: req.user.name, email: req.user.email } });
});

// Logout route
router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).send({ message: 'Internal Server Error' });
        }
        res.status(200).send({ message: 'Logged out successfully' });
    });
});

// Get current user's profile route
router.get('/profile', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).send({ message: 'Unauthorized: Please log in first' });
    }

    res.status(200).send({
        message: 'Profile retrieved successfully',
        user: {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
        },
    });
});


// Export the router
export default router;
