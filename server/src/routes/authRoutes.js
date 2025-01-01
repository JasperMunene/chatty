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

    if (!name || !email || !password) {
        return res.status(400).send({ message: 'All fields are required' });
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            return res.status(400).send({ message: 'Email is already registered.' });
        }

        const existingUserByName = await prisma.user.findFirst({ where: { name } });

        if (existingUserByName) {
            return res.status(400).send({ message: 'Username is already taken.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

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
router.post(
    '/login',
    (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            if (err) return next(err);
            if (!user) return res.status(401).json({ message: info.message || 'Unauthorized' });

            req.login(user, (loginErr) => {
                if (loginErr) return next(loginErr);
                res.status(200).json({
                    message: 'Logged in successfully',
                    user: { id: user.id, name: user.name, email: user.email },
                });
            });
        })(req, res, next);
    }
);


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
router.get('/me', (req, res) => {
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
