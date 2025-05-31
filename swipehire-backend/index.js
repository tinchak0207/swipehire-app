
// custom-backend-example/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import CORS
const User = require('./User'); // Our user model

const app = express();
const PORT = process.env.PORT || 5000; // Use PORT from .env or default to 5000
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:9002'; // Get frontend URL from .env

// Middleware to parse JSON
app.use(express.json());

// CORS Middleware - Allow requests from your frontend
app.use(cors({ origin: FRONTEND_URL }));

// Connect to MongoDB
const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://tinchak0207:cfchan%407117@swipehire.fwxspbu.mongodb.net/?retryWrites=true&w=majority&appName=swipehire';
mongoose.connect(MONGO_URI)
.then(() => console.log(`Connected to MongoDB at ${MONGO_URI}`))
.catch((err) => {
    console.error('MongoDB connection error. Make sure MongoDB is running and the URI is correct.');
    console.error(err);
    process.exit(1); // Exit if DB connection fails
});

// --- Routes ---

// Welcome Route
app.get('/', (req, res) => {
    res.send('Welcome to SwipeHire Backend API!');
});

// Create a new user (Signup)
app.post('/api/users', async (req, res) => {
    try {
        const { name, email, preferences, firebaseUid } = req.body;

        if (!name || !email || !firebaseUid) {
 return res.status(400).json({ message: 'Name, email, and firebaseUid are required' });
        }
        const existingUser = await User.findOne({ $or: [{ email }, { firebaseUid }] });
        if (existingUser) {
 return res.status(409).json({ message: 'User already exists with this email or Firebase UID' });
        }

        // Create a new User document
        const newUser = new User({ name, email, preferences, firebaseUid });
        await newUser.save();

        res.status(201).json({ message: 'User created!', user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get a user by ID (for tailored experience)
app.get('/api/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        let user;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            // If not a valid ObjectId, try to find by firebaseUid
            user = await User.findOne({ firebaseUid: userId });
        } else {
            user = await User.findById(userId);
        }
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update user features/preferences
app.put('/api/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const update = req.body; // e.g., { "preferences": { "theme": "dark" } } or { "name": "New Name"}
        let updatedUser;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            // If not a valid ObjectId, try to find and update by firebaseUid
            updatedUser = await User.findOneAndUpdate({ firebaseUid: userId }, update, { new: true, runValidators: true });
        } else {
            updatedUser = await User.findByIdAndUpdate(userId, update, { new: true, runValidators: true });
        }

        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User updated!', user: updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// --- End Routes ---

// Start the server
app.listen(PORT, () => {
    console.log(`Custom Backend Server running on http://localhost:${PORT}`);
    console.log(`Make sure your Next.js app is configured to send requests to this address.`);
});
