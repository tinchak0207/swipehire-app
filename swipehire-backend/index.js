
// custom-backend-example/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import CORS
const User = require('./User'); // Our user model

const app = express();
const PORT = process.env.PORT || 5000; // Use PORT from .env or default to 5000
const FRONTEND_URL = process.env.FRONTEND_URL; // Get frontend URL from .env

// Log FRONTEND_URL at the point of use for CORS configuration
console.log(`[CORS Config] FRONTEND_URL from .env at CORS setup: ${FRONTEND_URL}`);

// Middleware to parse JSON
app.use(express.json());

// Global preflight OPTIONS handler
// This should come BEFORE any other general CORS middleware or routes
app.options('*', (req, res) => {
  console.log(`[CORS Preflight] Handling OPTIONS request for ${req.path} from origin: ${req.headers.origin}`);
  
  // Validate origin for preflight
  if (req.headers.origin === FRONTEND_URL) {
    res.header('Access-Control-Allow-Origin', FRONTEND_URL);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Ensure this matches client request headers
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(204); // HTTP 204 No Content for successful preflight
  } else {
    // If origin does not match, Express will typically send a 403 or let it fall through.
    // For clarity, we can log it.
    console.warn(`[CORS Preflight] Origin mismatch. Expected: ${FRONTEND_URL}, Received: ${req.headers.origin}. Sending 403.`);
    res.sendStatus(403); // Forbidden
  }
});

// General CORS Middleware for actual requests (GET, POST, PUT etc.)
// This will apply after the OPTIONS request has been handled by app.options('*', ...)
const corsOptions = {
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // OPTIONS is handled by app.options now
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));


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
        console.log(`[DB Action] User created: ${newUser._id} for firebaseUid: ${firebaseUid}`);
        res.status(201).json({ message: 'User created!', user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get a user by ID (for tailored experience)
app.get('/api/users/:identifier', async (req, res) => {
    try {
        const identifier = req.params.identifier;
        let user;
        console.log(`[DB Action] Attempting to find user with identifier: ${identifier}`);

        if (mongoose.Types.ObjectId.isValid(identifier)) {
            user = await User.findById(identifier);
            if (user) console.log(`[DB Action] Found user by ObjectId: ${user._id}`);
        }
        
        if (!user) {
            user = await User.findOne({ firebaseUid: identifier });
            if (user) console.log(`[DB Action] Found user by firebaseUid: ${user.firebaseUid}, ObjectId: ${user._id}`);
        }

        if (!user) {
            console.log(`[DB Action] User not found with identifier: ${identifier}`);
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update user features/preferences
app.put('/api/users/:identifier', async (req, res) => {
    try {
        const identifier = req.params.identifier;
        const update = req.body;
        let updatedUser;
        console.log(`[DB Action] Attempting to update user with identifier: ${identifier}. Update data:`, JSON.stringify(update).substring(0, 200) + "...");


        if (mongoose.Types.ObjectId.isValid(identifier)) {
            updatedUser = await User.findByIdAndUpdate(identifier, update, { new: true, runValidators: true });
             if (updatedUser) console.log(`[DB Action] Updated user by ObjectId: ${updatedUser._id}`);
        }
        
        if (!updatedUser) {
            updatedUser = await User.findOneAndUpdate({ firebaseUid: identifier }, update, { new: true, runValidators: true });
            if (updatedUser) console.log(`[DB Action] Updated user by firebaseUid: ${updatedUser.firebaseUid}, ObjectId: ${updatedUser._id}`);
        }

        if (!updatedUser) {
            console.log(`[DB Action] User not found for update with identifier: ${identifier}`);
            return res.status(404).json({ message: 'User not found' });
        }
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
    // This log uses the FRONTEND_URL variable that was defined at the top.
    console.log(`Frontend URL allowed by CORS: ${FRONTEND_URL}`); 
});
