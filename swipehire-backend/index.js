
// swipehire-backend/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./User');
const DiaryPost = require('./DiaryPost'); // Import the new DiaryPost model

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL;

console.log(`[CORS Config] Effective FRONTEND_URL for CORS: ${FRONTEND_URL}`);

// Global OPTIONS preflight handler
app.options('*', (req, res, next) => {
  const origin = req.headers.origin;
  const requestPath = req.originalUrl;
  console.log(`[Global OPTIONS Handler] <<< Received OPTIONS request for: ${requestPath} from origin: ${origin}`);
  
  if (origin === FRONTEND_URL) {
    const headersToSet = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400'
    };
    console.log('[Global OPTIONS Handler] >>> Setting response headers for ALLOWED origin:', JSON.stringify(headersToSet));
    res.header(headersToSet);
    res.sendStatus(204);
    console.log(`[Global OPTIONS Handler] --- Responded 204 for allowed origin: ${origin} for ${requestPath} with reflected ACAO.`);
  } else {
    console.warn(`[Global OPTIONS Handler] Origin: ${origin} is NOT FRONTEND_URL (${FRONTEND_URL}). Responding with minimal 204.`);
    // For disallowed origins, still acknowledge the OPTIONS method but don't reflect ACAO.
    // The main cors middleware will handle the actual request denial.
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.sendStatus(204);
    console.log(`[Global OPTIONS Handler] --- Responded 204 for origin: ${origin} (actual request may be blocked by browser)`);
  }
});

app.use(express.json());

// CORS configuration for actual requests
const corsOptions = {
  origin: function (requestOrigin, callback) {
    console.log(`[Actual Request CORS] Checking origin. Request Origin: "${requestOrigin}" Configured FRONTEND_URL: "${FRONTEND_URL}"`);
    if (!requestOrigin || requestOrigin === FRONTEND_URL) {
      console.log(`[Actual Request CORS] Origin ALLOWED.`);
      callback(null, true);
    } else {
      console.warn(`[Actual Request CORS] Origin DISALLOWED. Request Origin: "${requestOrigin}" vs FRONTEND_URL: "${FRONTEND_URL}"`);
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

// User API Endpoints (existing)
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

app.put('/api/users/:identifier', async (req, res) => {
    try {
        const identifier = req.params.identifier;
        const update = req.body;
        let updatedUser;
        console.log(`[DB Action - Original PUT /api/users/] Attempting to update user with identifier: ${identifier}. Update data:`, JSON.stringify(update).substring(0, 200) + "...");
        if (mongoose.Types.ObjectId.isValid(identifier)) {
            updatedUser = await User.findByIdAndUpdate(identifier, update, { new: true, runValidators: true });
             if (updatedUser) console.log(`[DB Action - Original PUT /api/users/] Updated user by ObjectId: ${updatedUser._id}`);
        }
        if (!updatedUser) {
            updatedUser = await User.findOneAndUpdate({ firebaseUid: identifier }, update, { new: true, runValidators: true });
            if (updatedUser) console.log(`[DB Action - Original PUT /api/users/] Updated user by firebaseUid: ${updatedUser.firebaseUid}, ObjectId: ${updatedUser._id}`);
        }
        if (!updatedUser) {
            console.log(`[DB Action - Original PUT /api/users/] User not found for update with identifier: ${identifier}`);
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User updated!', user: updatedUser });
    } catch (error) {
        console.error('Error updating user (Original PUT /api/users/):', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.post('/api/proxy/users/:identifier/role', async (req, res) => {
  const { identifier } = req.params;
  const requestBody = req.body;
  console.log(`[Proxy POST /role] Received request for identifier: ${identifier} with body:`, JSON.stringify(requestBody).substring(0,200) + "...");
  try {
    const internalUrl = `http://localhost:${PORT}/api/users/${identifier}`;
    console.log(`[Proxy POST /role] Making internal PUT request to: ${internalUrl}`);
    const internalResponse = await fetch(internalUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
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

app.post('/api/proxy/users/:identifier/settings', async (req, res) => {
  const { identifier } = req.params;
  const requestBody = req.body;
  console.log(`[Proxy POST /settings] Received request for identifier: ${identifier} with body:`, JSON.stringify(requestBody).substring(0,200) + "...");
  try {
    const internalUrl = `http://localhost:${PORT}/api/users/${identifier}`;
    console.log(`[Proxy POST /settings] Making internal PUT request to: ${internalUrl}`);
    const internalResponse = await fetch(internalUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
    const responseData = await internalResponse.json();
    if (!internalResponse.ok) {
      console.error(`[Proxy POST /settings] Internal PUT request failed with status ${internalResponse.status}:`, responseData);
      return res.status(internalResponse.status).json(responseData);
    }
    console.log(`[Proxy POST /settings] Internal PUT request successful. Forwarding response to client.`);
    res.status(internalResponse.status).json(responseData);
  } catch (error) {
    console.error('[Proxy POST /settings] Error during internal fetch or processing:', error);
    res.status(500).json({ message: 'Proxy error while updating user settings', error: error.message || 'Unknown proxy error' });
  }
});


// --- New Diary Post API Endpoints ---

// Create a new diary post
app.post('/api/diary-posts', async (req, res) => {
    try {
        const { title, content, authorId, authorName, authorAvatarUrl, imageUrl, diaryImageHint, tags, isFeatured } = req.body;

        if (!title || !content || !authorId || !authorName) {
            return res.status(400).json({ message: 'Title, content, authorId, and authorName are required for a diary post.' });
        }

        // Validate authorId is a valid ObjectId (optional but good practice)
        if (!mongoose.Types.ObjectId.isValid(authorId)) {
            return res.status(400).json({ message: 'Invalid authorId format.' });
        }
        // Check if the user (author) exists (optional)
        const authorExists = await User.findById(authorId);
        if (!authorExists) {
            return res.status(404).json({ message: `User with ID ${authorId} not found.` });
        }

        const newPost = new DiaryPost({
            title,
            content,
            authorId,
            authorName,
            authorAvatarUrl: authorAvatarUrl || undefined, // Use provided or default from schema
            imageUrl,
            diaryImageHint,
            tags,
            isFeatured,
            // likes, likedBy, views, commentsCount will default
        });

        await newPost.save();
        console.log(`[DB Action] Diary post created: ${newPost._id} by author: ${authorId}`);
        res.status(201).json(newPost);
    } catch (error) {
        console.error('Error creating diary post:', error);
        res.status(500).json({ message: 'Server error while creating diary post', error: error.message });
    }
});

// Get all diary posts
app.get('/api/diary-posts', async (req, res) => {
    try {
        const posts = await DiaryPost.find().sort({ createdAt: -1 }); // Sort by newest first
        console.log(`[DB Action] Fetched ${posts.length} diary posts.`);
        res.json(posts);
    } catch (error) {
        console.error('Error fetching diary posts:', error);
        res.status(500).json({ message: 'Server error while fetching diary posts', error: error.message });
    }
});

// Like/Unlike a diary post
app.post('/api/diary-posts/:postId/like', async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.body; // MongoDB _id of the user liking the post

        if (!userId) {
            return res.status(400).json({ message: 'userId is required to like a post.' });
        }
        if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid postId or userId format.' });
        }

        const post = await DiaryPost.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Diary post not found.' });
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);
        const likedIndex = post.likedBy.findIndex(id => id.equals(userObjectId));

        if (likedIndex > -1) {
            // User already liked, so unlike
            post.likedBy.splice(likedIndex, 1);
            post.likes = Math.max(0, post.likes - 1); // Ensure likes don't go below 0
        } else {
            // User hasn't liked, so like
            post.likedBy.push(userObjectId);
            post.likes += 1;
        }

        await post.save();
        console.log(`[DB Action] Post ${postId} like toggled by user ${userId}. New like count: ${post.likes}`);
        res.json(post);
    } catch (error) {
        console.error('Error toggling like on diary post:', error);
        res.status(500).json({ message: 'Server error while liking post', error: error.message });
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

