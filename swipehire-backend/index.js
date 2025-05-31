
// swipehire-backend/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
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
  const origin = req.headers.origin;
  console.log(`[Global OPTIONS Handler] <<< Received OPTIONS request for: ${req.originalUrl} from origin: ${origin}`);
  
  if (origin === FRONTEND_URL) {
    const headersToSet = {
      'Access-Control-Allow-Origin': origin, // Reflect the specific, allowed origin
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS', // Explicitly list methods
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400' // Cache preflight for 1 day
    };
    console.log('[Global OPTIONS Handler] >>> Setting response headers for ALLOWED origin:', JSON.stringify(headersToSet));
    res.header(headersToSet);
    res.sendStatus(204);
    console.log(`[Global OPTIONS Handler] --- Responded 204 for allowed origin: ${origin} for ${req.originalUrl} with reflected ACAO.`);
  } else {
    // For disallowed origins or if no origin is present
    console.warn(`[Global OPTIONS Handler] Origin: ${origin} is NOT FRONTEND_URL (${FRONTEND_URL}). Responding with minimal 204.`);
    // Respond minimally for disallowed origins; browser will block based on main CORS config.
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.sendStatus(204);
    console.log(`[Global OPTIONS Handler] --- Responded 204 for origin: ${origin} (actual request may be blocked by browser)`);
  }
});


// Then other middleware
app.use(express.json());

// CORS configuration for actual requests (non-preflight)
const corsOptions = {
  origin: function (origin, callback) {
    // This check is now primarily for non-preflight requests.
    const requestPath = this.path; 
    console.log(`[Actual Request CORS] Origin check. Request from: ${origin}, Path: ${requestPath}`);
    if (!origin || origin === FRONTEND_URL) {
      callback(null, true); 
    } else {
      console.warn(`[Actual Request CORS] Disallowed origin: ${origin}. Allowed: ${FRONTEND_URL}`);
      callback(new Error('Not allowed by CORS')); 
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
};
app.use(cors(corsOptions));

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

// Proxy endpoint for updating user role (or other sensitive fields), NOW USING POST
app.post('/api/proxy/users/:identifier/role', async (req, res) => {
  const { identifier } = req.params;
  const requestBody = req.body; // This body will be forwarded

  console.log(`[Proxy POST /role] Received request for identifier: ${identifier} with body:`, JSON.stringify(requestBody).substring(0,200) + "...");

  try {
    // The internal request is still a PUT to the original endpoint
    const internalUrl = `http://localhost:${PORT}/api/users/${identifier}`;
    console.log(`[Proxy POST /role] Making internal PUT request to: ${internalUrl}`);

    const internalResponse = await fetch(internalUrl, {
      method: 'PUT', // Internal call remains PUT
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody), // Forward the received body
    });

    const responseData = await internalResponse.json();

    if (!internalResponse.ok) {
      console.error(`[Proxy POST /role] Internal PUT request failed with status ${internalResponse.status}:`, responseData);
      return res.status(internalResponse.status).json(responseData);
    }

    console.log(`[Proxy POST /role] Internal PUT request successful. Forwarding response to client.`);
    res.status(internalResponse.status).json(responseData);

  } catch (error) {
    console.error('[Proxy POST /role] Error during internal fetch or processing:', error);
    res.status(500).json({ message: 'Proxy error while updating user role', error: error.message || 'Unknown proxy error' });
  }
});


// Connect to MongoDB
const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://tinchak0207:cfchan%407117@swipehire.fwxspbu.mongodb.net/?retryWrites=true&w=majority&appName=swipehire';
mongoose.connect(MONGO_URI)
.then(() => console.log(`Connected to MongoDB at ${MONGO_URI}`))
.catch((err) => {
    console.error('MongoDB connection error. Make sure MongoDB is running and the URI is correct.');
    console.error(err);
    process.exit(1);
});


app.listen(PORT, () => {
    console.log(`Custom Backend Server running on http://localhost:${PORT}`);
    console.log(`Make sure your Next.js app is configured to send requests to this address.`);
    console.log(`Frontend URL allowed by CORS (from env for server log): ${process.env.FRONTEND_URL}`);
});
