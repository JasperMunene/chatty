import express from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv"
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js'
import chatRoutes from './src/routes/chatRoutes.js'
import messageRoutes from './src/routes/messageRoutes.js'

const app = express();
dotenv.config();

// Middleware
app.use(express.json());

// Configure express-session
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            maxAge: 1000 * 60 * 60 * 24,
        },

    })
);

// Initialize Passport and session handling
app.use(passport.initialize());
app.use(passport.session());

// Use the routes with the appropriate prefix
app.use('/v1/auth', authRoutes);
app.use('/v1/users', userRoutes);
app.use('/v1/chats', chatRoutes);
app.use('/v1/messages', messageRoutes);

// Routes
app.get("/", (req, res) => {
    res.send("Hello World!");
});

export default app;
