import express from 'express';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';  // CORS middleware to allow cross-origin requests
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';
import messageRoutes from './src/routes/messageRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';

dotenv.config();

const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Cookie parser middleware
app.use(cookieParser());

// CORS configuration
const corsOptions = {
    origin: process.env.CLIENT_URL || "http://localhost:3000", // Allow requests from your Next.js frontend
    credentials: true, // Allow cookies to be sent and received with requests
};
app.use(cors(corsOptions));

// Configure session middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 24, // 1 day
            sameSite: 'lax',
        },
        name: 'chatty', 
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
