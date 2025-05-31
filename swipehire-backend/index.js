
// swipehire-backend/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./User');
const DiaryPost = require('./DiaryPost');
const Match = require('./Match'); // Import the new Match model

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL;

console.log(`[CORS Config] Effective FRONTEND_URL for CORS: ${FRONTEND_URL}`);

// Global OPTIONS preflight handler
app.options('*', (req, res, next) => {
  const origin = req.headers.origin;
  const requestPath = req.originalUrl;
  console.log(`[Global OPTIONS Handler] <<< Received OPTIONS request for: ${requestPath} from origin: ${origin}`);
  
  const headersToSet = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400'
  };

  if (origin === FRONTEND_URL) {
    headersToSet['Access-Control-Allow-Origin'] = origin;
    console.log('[Global OPTIONS Handler] >>> Setting response headers for ALLOWED origin:', JSON.stringify(headersToSet));
    res.header(headersToSet);
    res.sendStatus(204);
    console.log(`[Global OPTIONS Handler] --- Responded 204 for allowed origin: ${origin} for ${requestPath} with reflected ACAO.`);
  } else {
    console.warn(`[Global OPTIONS Handler] Origin: ${origin} is NOT FRONTEND_URL (${FRONTEND_URL}). Responding with minimal 204 (no ACAO).`);
    res.header(headersToSet); // Still send other headers, ACAO is handled by main cors middleware.
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

// User API Endpoints
app.post('/api/users', async (req, res) => {
    try {
        const { name, email, preferences, firebaseUid, selectedRole, representedCandidateProfileId, representedCompanyProfileId } = req.body;
        if (!name || !email || !firebaseUid) {
 return res.status(400).json({ message: 'Name, email, and firebaseUid are required' });
        }
        const existingUser = await User.findOne({ $or: [{ email }, { firebaseUid }] });
        if (existingUser) {
 return res.status(409).json({ message: 'User already exists with this email or Firebase UID' });
        }
        // For new users, assign a mock represented ID if not provided, for demo matching.
        // This is a placeholder for a real profile creation/linking step.
        let finalRepCandidateId = representedCandidateProfileId;
        let finalRepCompanyId = representedCompanyProfileId;

        if (selectedRole === 'jobseeker' && !representedCandidateProfileId) {
            finalRepCandidateId = `cand-user-${firebaseUid.slice(0,5)}`; // Assign a conceptual ID
            console.log(`[DB Action] New jobseeker user, assigned conceptual representedCandidateProfileId: ${finalRepCandidateId}`);
        } else if (selectedRole === 'recruiter' && !representedCompanyProfileId) {
            finalRepCompanyId = `comp-user-${firebaseUid.slice(0,5)}`; // Assign a conceptual ID
            console.log(`[DB Action] New recruiter user, assigned conceptual representedCompanyProfileId: ${finalRepCompanyId}`);
        }

        const newUser = new User({
          name,
          email,
          preferences,
          firebaseUid,
          selectedRole,
          representedCandidateProfileId: finalRepCandidateId,
          representedCompanyProfileId: finalRepCompanyId,
        });
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
        
        const updatePayload = { ...update };
        if (updatePayload.firebaseUid === undefined) delete updatePayload.firebaseUid;
        if (updatePayload.email === undefined) delete updatePayload.email;


        if (mongoose.Types.ObjectId.isValid(identifier)) {
            updatedUser = await User.findByIdAndUpdate(identifier, updatePayload, { new: true, runValidators: true });
             if (updatedUser) console.log(`[DB Action - Original PUT /api/users/] Updated user by ObjectId: ${updatedUser._id}`);
        }
        if (!updatedUser) {
            updatedUser = await User.findOneAndUpdate({ firebaseUid: identifier }, updatePayload, { new: true, runValidators: true });
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

// Proxy Endpoints
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


// --- Diary Post API Endpoints ---
app.post('/api/diary-posts', async (req, res) => {
    try {
        const { title, content, authorId, authorName, authorAvatarUrl, imageUrl, diaryImageHint, tags, isFeatured } = req.body;
        if (!title || !content || !authorId || !authorName) {
            return res.status(400).json({ message: 'Title, content, authorId, and authorName are required for a diary post.' });
        }
        if (!mongoose.Types.ObjectId.isValid(authorId)) {
            return res.status(400).json({ message: 'Invalid authorId format.' });
        }
        const authorExists = await User.findById(authorId);
        if (!authorExists) {
            return res.status(404).json({ message: `User with ID ${authorId} not found.` });
        }
        const newPost = new DiaryPost({ title, content, authorId, authorName, authorAvatarUrl, imageUrl, diaryImageHint, tags, isFeatured });
        await newPost.save();
        console.log(`[DB Action] Diary post created: ${newPost._id} by author: ${authorId}`);
        res.status(201).json(newPost);
    } catch (error) {
        console.error('Error creating diary post:', error);
        res.status(500).json({ message: 'Server error while creating diary post', error: error.message });
    }
});

app.get('/api/diary-posts', async (req, res) => {
    try {
        const posts = await DiaryPost.find().sort({ createdAt: -1 });
        console.log(`[DB Action] Fetched ${posts.length} diary posts.`);
        res.json(posts);
    } catch (error) {
        console.error('Error fetching diary posts:', error);
        res.status(500).json({ message: 'Server error while fetching diary posts', error: error.message });
    }
});

app.post('/api/diary-posts/:postId/like', async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.body;
        if (!userId) { return res.status(400).json({ message: 'userId is required to like a post.' }); }
        if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid postId or userId format.' });
        }
        const post = await DiaryPost.findById(postId);
        if (!post) { return res.status(404).json({ message: 'Diary post not found.' }); }
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const likedIndex = post.likedBy.findIndex(id => id.equals(userObjectId));
        if (likedIndex > -1) {
            post.likedBy.splice(likedIndex, 1);
            post.likes = Math.max(0, post.likes - 1);
        } else {
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

// --- New Like and Match API Endpoints ---
app.post('/api/interactions/like', async (req, res) => {
    try {
        const { likingUserId, likedProfileId, likedProfileType, likingUserRole, likingUserRepresentsCandidateId, likingUserRepresentsCompanyId } = req.body;

        console.log('[Like Interaction] Received:', req.body);

        if (!likingUserId || !likedProfileId || !likedProfileType || !likingUserRole) {
            return res.status(400).json({ message: "Missing required fields for like interaction." });
        }
        if (!mongoose.Types.ObjectId.isValid(likingUserId)) {
            return res.status(400).json({ message: "Invalid likingUserId." });
        }

        const likingUser = await User.findById(likingUserId);
        if (!likingUser) {
            return res.status(404).json({ message: "Liking user not found." });
        }

        let matchMade = false;
        let newMatchDetails = null;
        let otherUser = null;

        if (likingUserRole === 'recruiter' && likedProfileType === 'candidate') {
            // Recruiter likes a candidate profile
            if (!likingUser.likedCandidateIds.includes(likedProfileId)) {
                likingUser.likedCandidateIds.push(likedProfileId);
            }
            // Check for mutual match: Find job seeker user who IS this candidate AND has liked the recruiter's company
            otherUser = await User.findOne({ selectedRole: 'jobseeker', representedCandidateProfileId: likedProfileId });
            if (otherUser && likingUser.representedCompanyProfileId && otherUser.likedCompanyIds.includes(likingUser.representedCompanyProfileId)) {
                matchMade = true;
            }
        } else if (likingUserRole === 'jobseeker' && likedProfileType === 'company') {
            // Job seeker likes a company profile
            if (!likingUser.likedCompanyIds.includes(likedProfileId)) {
                likingUser.likedCompanyIds.push(likedProfileId);
            }
            // Check for mutual match: Find recruiter user who REPRESENTS this company AND has liked this job seeker's candidate profile
            otherUser = await User.findOne({ selectedRole: 'recruiter', representedCompanyProfileId: likedProfileId });
            if (otherUser && likingUser.representedCandidateProfileId && otherUser.likedCandidateIds.includes(likingUser.representedCandidateProfileId)) {
                matchMade = true;
            }
        } else {
            return res.status(400).json({ message: "Invalid role/profile type combination." });
        }

        await likingUser.save();
        console.log(`[DB Action] Like recorded for user ${likingUser._id} (${likingUserRole}). Target: ${likedProfileId} (${likedProfileType}).`);

        if (matchMade && otherUser) {
            // Ensure consistent order for user IDs in uniqueMatchKey
            const userA_Id = likingUser._id.toString() < otherUser._id.toString() ? likingUser._id : otherUser._id;
            const userB_Id = likingUser._id.toString() < otherUser._id.toString() ? otherUser._id : likingUser._id;
            const uniqueKey = `${userA_Id.toString()}-${userB_Id.toString()}`;

            const existingMatch = await Match.findOne({ uniqueMatchKey: uniqueKey });

            if (!existingMatch) {
                let candidateDisplayId, companyDisplayId, finalUserA, finalUserB;
                if (likingUserRole === 'recruiter') { // Recruiter (likingUser) liked Candidate (otherUser represents this candidate)
                    finalUserA = likingUser._id; // Recruiter
                    finalUserB = otherUser._id; // Job Seeker
                    candidateDisplayId = likedProfileId; // This is the candidate profile ID
                    companyDisplayId = likingUser.representedCompanyProfileId;
                } else { // Jobseeker (likingUser) liked Company (otherUser represents this company)
                    finalUserA = otherUser._id; // Recruiter
                    finalUserB = likingUser._id; // Job Seeker
                    candidateDisplayId = likingUser.representedCandidateProfileId;
                    companyDisplayId = likedProfileId; // This is the company profile ID
                }
                
                if (!candidateDisplayId || !companyDisplayId) {
                    console.error("[Match Creation] Critical error: Missing represented profile ID for match detection.", {likingUser, otherUser, likedProfileId, likingUserRole});
                    // Potentially don't create match or respond with error
                } else {
                    const newMatch = new Match({
                        userA_Id: finalUserA,
                        userB_Id: finalUserB,
                        candidateProfileIdForDisplay: candidateDisplayId,
                        companyProfileIdForDisplay: companyDisplayId,
                        uniqueMatchKey: uniqueKey,
                    });
                    await newMatch.save();
                    newMatchDetails = newMatch;
                    console.log(`[DB Action] Mutual match CREATED between ${finalUserA} and ${finalUserB}. Match ID: ${newMatch._id}`);
                }
            } else {
                console.log(`[DB Action] Mutual match ALREADY EXISTS between ${userA_Id} and ${userB_Id}. Match ID: ${existingMatch._id}`);
                matchMade = true; // It was already a match or just became one.
                newMatchDetails = existingMatch;
            }
        }
        res.status(200).json({ success: true, message: "Like recorded.", matchMade, matchDetails: newMatchDetails });

    } catch (error) {
        console.error("Error recording like:", error);
        res.status(500).json({ message: "Server error while recording like.", error: error.message });
    }
});

app.get('/api/matches/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid userId." });
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);

        const matches = await Match.find({
            $or: [{ userA_Id: userObjectId }, { userB_Id: userObjectId }],
            status: 'active'
        })
        .sort({ matchedAt: -1 });

        console.log(`[DB Action] Fetched ${matches.length} matches for user ${userId}.`);
        res.status(200).json(matches);

    } catch (error) {
        console.error("Error fetching matches:", error);
        res.status(500).json({ message: "Server error while fetching matches.", error: error.message });
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

