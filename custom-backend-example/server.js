
// custom-backend-example/server.js
// This is conceptual backend code and would run as a SEPARATE process.
// You would typically start this server using 'node server.js' in its own terminal.

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User'); // Assuming User model is in models/User.js

const app = express();
const PORT = process.env.BACKEND_PORT || 5000; // Ensure this is different from your Next.js port

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:9002' })); // Allow requests from your frontend
app.use(express.json()); // Parse JSON bodies

// --- MongoDB Connection ---
// Ensure your MongoDB server is running and accessible.
// Replace with your actual MongoDB connection string, ideally from an environment variable.
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/swipehiredb';
mongoose.connect(MONGO_URI)
  .then(() => console.log(`MongoDB connected successfully to ${MONGO_URI}`))
  .catch(err => {
    console.error('MongoDB connection error. Make sure MongoDB is running and the URI is correct.');
    console.error(err);
    process.exit(1); // Exit if DB connection fails
  });
// --- End MongoDB Connection ---

// --- API Endpoints ---

// Example: Get a user by email
app.get('/api/users/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Example: Create a new user
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, uniqueSettings } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }
    const newUser = new User({ name, email, uniqueSettings });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Example: Update user's unique settings or feature flags
app.put('/api/users/:email/settings', async (req, res) => {
    try {
        const { uniqueSettings, featureFlags } = req.body;
        const user = await User.findOne({ email: req.params.email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (uniqueSettings) {
            user.uniqueSettings = { ...user.uniqueSettings, ...uniqueSettings };
        }
        if (featureFlags) {
            user.featureFlags = { ...user.featureFlags, ...featureFlags };
        }
        
        user.markModified('uniqueSettings'); // Important for mixed type updates
        user.markModified('featureFlags');  // Important for mixed type updates

        await user.save();
        res.json({ message: 'User settings updated successfully', user });
    } catch (error) {
        console.error('Error updating user settings:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// --- End API Endpoints ---

app.listen(PORT, () => {
  console.log(`Custom Backend Server running on http://localhost:${PORT}`);
  console.log(`Make sure your Next.js app is configured to send requests to this address.`);
  console.log(`Frontend URL allowed by CORS: ${process.env.FRONTEND_URL || 'http://localhost:9002'}`);
});
