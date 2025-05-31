
// swipehire-backend/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Still useful for non-preflight
const User = require('./User');
// Node.js built-in fetch for Node 18+
// If using an older Node version, you might need a package like 'node-fetch'
// const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL;

console.log(`[CORS Config] Effective FRONTEND_URL for CORS: ${FRONTEND_URL}`);

// Global OPTIONS preflight handler - Must be one of the first middleware
app.options('*', (req, res, next) => {
  console.log(`[Global OPTIONS Handler] <<< Received OPTIONS request for: ${req.originalUrl} from origin: ${req.headers.origin}`);
  const headersToSet = {
    'Access-Control-Allow-Origin': req.headers.origin || FRONTEND_URL, // Reflect origin or use configured
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400' // Cache preflight for 1 day
  };
  // Log exactly what headers are being set
  console.log('[Global OPTIONS Handler] >>> Setting response headers:', JSON.stringify(headersToSet));
  res.header(headersToSet);
  res.sendStatus(204); // No Content for successful preflight
  console.log(`[Global OPTIONS Handler] --- Responded 204 for origin: ${req.headers.origin} to request: ${req.originalUrl}`);
});


// Then other middleware
app.use(express.json());

// CORS configuration for actual requests (non-preflight)
const corsOptions = {
  origin: function (origin, callback) {
    const requestPath = this.path; // 'this' context here refers to the request itself
    console.log(`[CORS Origin Check - Actual Request] Request origin: ${origin}, Path: ${requestPath}, Allowed origin (FRONTEND_URL env var): ${FRONTEND_URL}`);
    if (!origin || origin === FRONTEND_URL) {
      callback(null, true);
    } else {
      console.warn(`[CORS Origin Check - Actual Request] Disallowed origin: ${origin} for path ${requestPath}. Allowed: ${FRONTEND_URL}`);
      callback(new Error('Not allowed by CORS'));
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

// ORIGINAL Update user features/preferences
app.put('/api/users/:identifier', async (req, res) => {
    try {
        const identifier = req.params.identifier;
        const update = req.body;
        let updatedUser;
        console.log(`[DB Action - Original PUT] Attempting to update user with identifier: ${identifier}. Update data:`, JSON.stringify(update).substring(0, 200) + "...");

        if (mongoose.Types.ObjectId.isValid(identifier)) {
            updatedUser = await User.findByIdAndUpdate(identifier, update, { new: true, runValidators: true });
             if (updatedUser) console.log(`[DB Action - Original PUT] Updated user by ObjectId: ${updatedUser._id}`);
        }
        
        if (!updatedUser) {
            updatedUser = await User.findOneAndUpdate({ firebaseUid: identifier }, update, { new: true, runValidators: true });
            if (updatedUser) console.log(`[DB Action - Original PUT] Updated user by firebaseUid: ${updatedUser.firebaseUid}, ObjectId: ${updatedUser._id}`);
        }

        if (!updatedUser) {
            console.log(`[DB Action - Original PUT] User not found for update with identifier: ${identifier}`);
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User updated!', user: updatedUser });
    } catch (error) {
        console.error('Error updating user (Original PUT):', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// NEW Proxy endpoint for updating user role
app.put('/api/proxy/users/:identifier/role', async (req, res) => {
  const { identifier } = req.params;
  const requestBody = req.body; // This will contain { selectedRole, name, email } from frontend

  console.log(`[Proxy PUT /role] Received request for identifier: ${identifier} with body:`, JSON.stringify(requestBody));

  try {
    const internalUrl = `http://localhost:${PORT}/api/users/${identifier}`;
    console.log(`[Proxy PUT /role] Making internal PUT request to: ${internalUrl}`);

    const internalResponse = await fetch(internalUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Add any other headers your original endpoint might expect,
        // though for internal calls this is often simpler.
        // 'Authorization': req.headers.authorization || undefined // Example if you needed to forward auth
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await internalResponse.json();

    if (!internalResponse.ok) {
      console.error(`[Proxy PUT /role] Internal request failed with status ${internalResponse.status}:`, responseData);
      // Forward the status and message from the internal call
      return res.status(internalResponse.status).json(responseData);
    }

    console.log(`[Proxy PUT /role] Internal request successful. Forwarding response to client.`);
    res.status(internalResponse.status).json(responseData);

  } catch (error) {
    console.error('[Proxy PUT /role] Error during internal fetch or processing:', error);
    res.status(500).json({ message: 'Proxy error while updating user role', error: error.message });
  }
});


app.listen(PORT, () => {
    console.log(`Custom Backend Server running on http://localhost:${PORT}`);
    console.log(`Make sure your Next.js app is configured to send requests to this address.`);
    console.log(`Frontend URL allowed by CORS (from env for server log): ${process.env.FRONTEND_URL}`);
});
