
// swipehire-backend/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Still useful for non-preflight
const User = require('./User');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL;

console.log(`[CORS Config] Effective FRONTEND_URL for CORS: ${FRONTEND_URL}`);

// ABSOLUTELY FIRST: Global OPTIONS preflight handler
app.options('*', (req, res) => {
  console.log(`[Global OPTIONS Handler] <<< Received OPTIONS request for: ${req.originalUrl} from origin: ${req.headers.origin}`);

  if (req.headers.origin === FRONTEND_URL) {
    const headersToSet = {
      'Access-Control-Allow-Origin': FRONTEND_URL, // Reflect the specific allowed origin
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400' // Cache preflight for 1 day
    };
    // Log exactly what headers are being set
    console.log('[Global OPTIONS Handler] >>> Setting response headers:', JSON.stringify(headersToSet));
    res.header(headersToSet);
    res.sendStatus(204); // No Content
    console.log(`[Global OPTIONS Handler] --- Responded 204 for allowed origin: ${req.headers.origin}`);
  } else {
    console.warn(`[Global OPTIONS Handler] XXX Disallowed origin for OPTIONS: ${req.headers.origin}. Allowed: ${FRONTEND_URL}. Sending 204 without specific CORS headers for this origin.`);
    // For disallowed origins, sending 204 makes the browser responsible for the origin check.
    // If we sent 403, some browsers might not report the underlying CORS issue clearly.
    res.sendStatus(204);
  }
});

// Then other middleware
app.use(express.json());

// CORS configuration for actual requests (non-preflight)
const corsOptions = {
  origin: function (origin, callback) {
    // Note: Using req.path here will be undefined as req is not in this scope.
    // The logging for actual request path/method should be inside a middleware or route.
    // For now, this log will just show the origin being checked by this specific cors instance.
    console.log(`[Actual Request CORS] Origin check. Request from: ${origin}`);
    if (!origin || origin === FRONTEND_URL) {
      // console.log(`[Actual Request CORS] Allowed origin: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`[Actual Request CORS] Disallowed origin: ${origin}. Allowed: ${FRONTEND_URL}`);
      callback(new Error('Not allowed by CORS for actual request'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // OPTIONS is handled globally
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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
    process.exit(1);
});

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

app.listen(PORT, () => {
    console.log(`Custom Backend Server running on http://localhost:${PORT}`);
    console.log(`Make sure your Next.js app is configured to send requests to this address.`);
    console.log(`Frontend URL allowed by CORS (from env for server log): ${process.env.FRONTEND_URL}`);
});
    