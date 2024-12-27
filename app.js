import express from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';
import messageRoutes from './src/routes/messageRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Configure session
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === "production", // Secure cookies in production
            maxAge: 1000 * 60 * 60 * 24, // 1 day
        },
    })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/users', userRoutes);
app.use('/v1/chats', chatRoutes);
app.use('/v1/messages', messageRoutes);
app.use('/v1/notifications', notificationRoutes);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

export default app;
