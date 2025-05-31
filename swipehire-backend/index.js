
// custom-backend-example/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import CORS
const User = require('./User'); // Our user model

const app = express();
const PORT = process.env.PORT || 5000; // Use PORT from .env or default to 5000
const FRONTEND_URL = process.env.FRONTEND_URL;

// Log FRONTEND_URL at the point of use for CORS configuration
console.log(`[CORS Config] FRONTEND_URL from .env at CORS setup: ${FRONTEND_URL}`);

// Global OPTIONS preflight handler - Must be one of the first middleware
app.options('*', (req, res, next) => {
  console.log(`[Global OPTIONS] Received OPTIONS request for: ${req.originalUrl} from origin: ${req.headers.origin}`);
  // Check if the origin is allowed
  if (req.headers.origin === FRONTEND_URL) {
    res.header('Access-Control-Allow-Origin', FRONTEND_URL);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS'); // Explicitly list PUT
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With'); // Add X-Requested-With and other common headers
    res.header('Access-Control-Allow-Credentials', 'true');
    console.log(`[Global OPTIONS] Responding 204 to allowed origin: ${req.headers.origin} for ${req.originalUrl}`);
    res.sendStatus(204); // No Content for successful preflight
  } else {
    // If origin is not allowed, or no origin (e.g. server-to-server)
    console.warn(`[Global OPTIONS] Origin: ${req.headers.origin} not matching FRONTEND_URL: ${FRONTEND_URL} for ${req.originalUrl}. Sending 204 without specific Allow-Origin for non-matched origins or allowing all for testing.`);
    // Option 1: Send 204 without specific ACAO (browser will then block based on lack of matching origin)
    // res.sendStatus(204);

    // Option 2: Or, for broader testing if specific origin matching is problematic (less secure for prod)
    // Allow any origin for OPTIONS for now to see if it's an origin matching issue or something else
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*'); // Reflect origin or allow all
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(204);

    // Option 3: Send 403 if origin is present and not allowed (more restrictive)
    // if (req.headers.origin) {
    //   console.warn(`[Global OPTIONS] Disallowed origin: ${req.headers.origin} for ${req.originalUrl}. Allowed: ${FRONTEND_URL}`);
    //   res.status(403).send('Origin not allowed');
    // } else {
    //   // No origin, could be server-to-server, or manipulated request.
    //   // For simplicity in dev, might still send 204, but in prod, scrutinize.
    //   res.sendStatus(204);
    // }
  }
});

// Middleware to parse JSON
app.use(express.json());

// CORS Configuration for actual requests (non-preflight)
const corsOptions = {
  origin: function (origin, callback) {
    // This check is now primarily for non-preflight requests.
    // The origin here is of the actual request, not the preflight.
    console.log(`[CORS Origin Check - Actual Request] Request origin: ${origin}, Path: ${this.path}`);
    if (!origin || origin === FRONTEND_URL) {
      console.log(`[CORS Origin Check - Actual Request] Allowed origin: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`[CORS Origin Check - Actual Request] Disallowed origin: ${origin}. Allowed: ${FRONTEND_URL}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // OPTIONS is handled globally above
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
    console.log(`Frontend URL allowed by CORS: ${FRONTEND_URL}`); 
});
