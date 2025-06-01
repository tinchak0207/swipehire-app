
// swipehire-backend/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./User');
const DiaryPost = require('./DiaryPost'); // Assuming DiaryPost model exists
const Match = require('./Match'); // Assuming Match model exists
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`[File System] Created uploads directory at: ${uploadsDir}`);
} else {
    console.log(`[File System] Uploads directory already exists at: ${uploadsDir}`);
}


// Define allowed frontend origins
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL, // Your existing test/dev frontend URL from .env
  'https://studio--swipehire-3bscz.us-central1.hosted.app', // Your new production frontend URL
  // Add any other specific origins you need to allow, e.g., IDX preview URLs
  'https://6000-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',
  'https://9002-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',
].filter(Boolean); // Filter out undefined/null values if FRONTEND_URL isn't set

console.log(`[CORS Config] Effective ALLOWED_ORIGINS for CORS: ${JSON.stringify(ALLOWED_ORIGINS)}`);

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

  if (ALLOWED_ORIGINS.includes(origin)) {
    headersToSet['Access-Control-Allow-Origin'] = origin;
    console.log('[Global OPTIONS Handler] >>> Setting response headers for ALLOWED origin:', JSON.stringify(headersToSet));
    res.header(headersToSet);
    res.sendStatus(204);
    console.log(`[Global OPTIONS Handler] --- Responded 204 for allowed origin: ${origin} for ${requestPath} with reflected ACAO.`);
  } else {
    console.warn(`[Global OPTIONS Handler] Origin: ${origin} is NOT in ALLOWED_ORIGINS. Responding with minimal 204 (no ACAO reflection).`);
    res.header(headersToSet); // Still send generic headers, main cors middleware will enforce
    res.sendStatus(204);
    console.log(`[Global OPTIONS Handler] --- Responded 204 for origin: ${origin} (actual request may be blocked by browser if not allowed by main CORS config)`);
  }
});

app.use(express.json());

// CORS configuration for actual requests
const corsOptions = {
  origin: function (requestOrigin, callback) {
    console.log(`[Actual Request CORS] Checking origin. Request Origin: "${requestOrigin}" Configured ALLOWED_ORIGINS: "${JSON.stringify(ALLOWED_ORIGINS)}"`);
    if (!requestOrigin || ALLOWED_ORIGINS.includes(requestOrigin)) {
      console.log(`[Actual Request CORS] Origin ALLOWED.`);
      callback(null, true);
    } else {
      console.warn(`[Actual Request CORS] Origin DISALLOWED. Request Origin: "${requestOrigin}" not in ALLOWED_ORIGINS.`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
};
app.use(cors(corsOptions));

// Serve static files from the 'uploads' directory
const staticUploadsPath = path.resolve(__dirname, 'uploads'); // Ensures absolute path
console.log(`[Static Serving Config] Serving static files from /uploads mapped to physical path: ${staticUploadsPath}`);

// Enhanced logging middleware for /uploads route
app.use('/uploads', (req, res, next) => {
  console.log(`[Uploads Static Entry] Request for: ${req.originalUrl}`);
  console.log(`[Uploads Static Entry]   Raw req.path: ${req.path}`);
  
  let decodedReqPath = req.path;
  try {
    decodedReqPath = decodeURIComponent(req.path);
    console.log(`[Uploads Static Entry]   Decoded req.path: ${decodedReqPath}`);
  } catch (e) {
    console.error(`[Uploads Static Entry]   Error decoding req.path: ${req.path}`, e);
    // If decoding fails, proceed with the raw path, or handle error as appropriate
  }

  // req.path for a route mounted at /uploads will be like '/filename.png'
  // We need the part after the initial '/' for path.join with an absolute base
  const relativeFilePath = decodedReqPath.startsWith('/') ? decodedReqPath.substring(1) : decodedReqPath;
  const physicalPath = path.join(staticUploadsPath, relativeFilePath);
  console.log(`[Uploads Static Entry]   Attempting to serve physical path: ${physicalPath}`);

  const fileExists = fs.existsSync(physicalPath);
  console.log(`[Uploads Static Entry]   File ${fileExists ? 'EXISTS' : 'DOES NOT EXIST'} at physical path.`);
  
  if (!fileExists) {
      console.warn(`[Uploads Static Entry] File not found at: ${physicalPath}. Original requested path: ${req.originalUrl}`);
      // Optionally, you could res.status(404).send('File not found via custom log') here if express.static doesn't handle it
  }
  
  next();
}, express.static(staticUploadsPath));


// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir); // Save files to the 'uploads' directory
    },
    filename: function (req, file, cb) {
        const fileExtension = path.extname(file.originalname);
        const safeBaseName = path.basename(file.originalname, fileExtension)
            .toLowerCase()
            .replace(/\s+/g, '_') // Replace spaces with underscores
            .replace(/[^\w.-]/g, ''); // Remove non-alphanumeric chars except underscore, dot, hyphen

        const finalFilename = Date.now() + '-' + (safeBaseName || 'uploaded_file') + fileExtension;
        console.log(`[Multer] Original filename: ${file.originalname}, Sanitized and timestamped: ${finalFilename}`);
        cb(null, finalFilename);
    }
});

// Multer file filter for images
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB file size limit

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

        let finalRepCandidateId = representedCandidateProfileId;
        let finalRepCompanyId = representedCompanyProfileId;

        if (selectedRole === 'jobseeker' && !representedCandidateProfileId) {
            finalRepCandidateId = `cand-user-${firebaseUid.slice(0,5)}`;
            console.log(`[DB Action] New jobseeker user, assigned conceptual representedCandidateProfileId: ${finalRepCandidateId}`);
        } else if (selectedRole === 'recruiter' && !representedCompanyProfileId) {
            finalRepCompanyId = `comp-user-${firebaseUid.slice(0,5)}`;
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


// --- New Endpoint for Avatar Upload ---
app.post('/api/users/:identifier/avatar', upload.single('avatar'), async (req, res) => {
    const { identifier } = req.params;
    console.log(`[Backend Route] HIT: POST /api/users/${identifier}/avatar`);

    if (!req.file) {
        console.log('[Avatar Upload] No file uploaded.');
        return res.status(400).json({ message: 'No avatar file uploaded.' });
    }

    console.log('[Avatar Upload] File received:', req.file);

    try {
        let userToUpdate;
        if (mongoose.Types.ObjectId.isValid(identifier)) {
            userToUpdate = await User.findById(identifier);
        } else {
            userToUpdate = await User.findOne({ firebaseUid: identifier });
        }

        if (!userToUpdate) {
            console.log(`[Avatar Upload] User not found with identifier: ${identifier}`);
            // Optionally, delete the uploaded file if user not found
            fs.unlink(req.file.path, err => {
                if (err) console.error("[Avatar Upload] Error deleting orphaned file:", err);
            });
            return res.status(404).json({ message: 'User not found' });
        }

        // Construct the URL path for the avatar
        // req.file.filename is the unique name generated by multer
        const avatarUrl = `/uploads/${req.file.filename}`;
        userToUpdate.profileAvatarUrl = avatarUrl;

        await userToUpdate.save();
        console.log(`[DB Action POST /avatar] User ${userToUpdate._id} profileAvatarUrl updated to: ${avatarUrl}`);
        res.json({ message: 'Avatar uploaded successfully!', profileAvatarUrl: avatarUrl, user: userToUpdate });

    } catch (error) {
        console.error('Error updating avatar:', error);
        // If error, delete the uploaded file to prevent orphaned files
        fs.unlink(req.file.path, err => {
            if (err) console.error("[Avatar Upload] Error deleting file after DB error:", err);
        });
        res.status(500).json({ message: 'Server error while updating avatar', error: error.message });
    }
});


app.post('/api/users/:identifier/profile', async (req, res) => {
    console.log(`[Backend Route] HIT: POST /api/users/${req.params.identifier}/profile with body:`, JSON.stringify(req.body).substring(0, 200) + "...");
    try {
        const { identifier } = req.params;
        const {
            profileHeadline,
            profileExperienceSummary,
            profileSkills,
            profileDesiredWorkStyle,
            profilePastProjects,
            profileVideoPortfolioLink,
            profileAvatarUrl,
            profileWorkExperienceLevel,
            profileEducationLevel,
            profileLocationPreference,
            profileLanguages,
            profileAvailability,
            profileJobTypePreference,
            profileSalaryExpectationMin,
            profileSalaryExpectationMax
        } = req.body;

        console.log(`[DB Action POST /profile] Attempting to update profile for user identifier: ${identifier}.`);

        let userToUpdate;
        if (mongoose.Types.ObjectId.isValid(identifier)) {
            userToUpdate = await User.findById(identifier);
        } else {
            userToUpdate = await User.findOne({ firebaseUid: identifier });
        }

        if (!userToUpdate) {
            console.log(`[DB Action POST /profile] User not found with identifier: ${identifier}`);
            return res.status(404).json({ message: 'User not found' });
        }

        // Update profile-specific fields
        if (profileHeadline !== undefined) userToUpdate.profileHeadline = profileHeadline;
        if (profileExperienceSummary !== undefined) userToUpdate.profileExperienceSummary = profileExperienceSummary;
        if (profileSkills !== undefined) userToUpdate.profileSkills = profileSkills;
        if (profileDesiredWorkStyle !== undefined) userToUpdate.profileDesiredWorkStyle = profileDesiredWorkStyle;
        if (profilePastProjects !== undefined) userToUpdate.profilePastProjects = profilePastProjects;
        if (profileVideoPortfolioLink !== undefined) userToUpdate.profileVideoPortfolioLink = profileVideoPortfolioLink;
        if (profileAvatarUrl !== undefined) userToUpdate.profileAvatarUrl = profileAvatarUrl;
        if (profileWorkExperienceLevel !== undefined) userToUpdate.profileWorkExperienceLevel = profileWorkExperienceLevel;
        if (profileEducationLevel !== undefined) userToUpdate.profileEducationLevel = profileEducationLevel;
        if (profileLocationPreference !== undefined) userToUpdate.profileLocationPreference = profileLocationPreference;
        if (profileLanguages !== undefined) userToUpdate.profileLanguages = profileLanguages;
        if (profileAvailability !== undefined) userToUpdate.profileAvailability = profileAvailability;
        if (profileJobTypePreference !== undefined) userToUpdate.profileJobTypePreference = profileJobTypePreference;
        if (profileSalaryExpectationMin !== undefined) userToUpdate.profileSalaryExpectationMin = profileSalaryExpectationMin;
        if (profileSalaryExpectationMax !== undefined) userToUpdate.profileSalaryExpectationMax = profileSalaryExpectationMax;

        if (userToUpdate.selectedRole === 'jobseeker' && !userToUpdate.representedCandidateProfileId) {
            const defaultCandidateId = userToUpdate.firebaseUid ? `cand-user-${userToUpdate.firebaseUid.slice(0,5)}` : `cand-user-${userToUpdate._id.toString().slice(-5)}`;
            userToUpdate.representedCandidateProfileId = defaultCandidateId;
            console.log(`[DB Action POST /profile] Assigned conceptual representedCandidateProfileId: ${defaultCandidateId} to jobseeker ${userToUpdate._id}`);
        }

        const updatedUser = await userToUpdate.save();
        console.log(`[DB Action POST /profile] User profile updated for ${updatedUser._id}`);
        res.json({ message: 'User profile updated successfully!', user: updatedUser });

    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Server error while updating profile', error: error.message });
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

// --- New Endpoint to Fetch Jobseeker Profiles ---
app.get('/api/users/profiles/jobseekers', async (req, res) => {
    console.log(`[Backend Route] HIT: GET /api/users/profiles/jobseekers`);
    try {
        const jobSeekerUsers = await User.find({
            $or: [
                { selectedRole: 'jobseeker' },
                {
                    // selectedRole can be 'recruiter' or even null
                    profileHeadline: { $exists: true, $ne: "", $ne: null }, // Check if they have a headline
                    profileExperienceSummary: { $exists: true, $ne: "", $ne: null } // And a summary
                }
            ]
        });

        console.log(`[DB Action GET /jobseekers] Found ${jobSeekerUsers.length} raw user documents matching jobseeker criteria (explicit or dev convenience).`);
        if (jobSeekerUsers.length > 0) {
          console.log('[DB Action GET /jobseekers] First few raw jobseeker users (selected fields):',
            jobSeekerUsers.slice(0, 3).map(u => ({
              _id: u._id,
              name: u.name,
              email: u.email,
              selectedRole: u.selectedRole,
              profileHeadline: u.profileHeadline,
              profileExperienceSummaryLength: u.profileExperienceSummary?.length,
              profileSkills: u.profileSkills,
              profileAvatarUrl: u.profileAvatarUrl,
              representedCandidateProfileId: u.representedCandidateProfileId
            }))
          );
        }

        if (!jobSeekerUsers || jobSeekerUsers.length === 0) {
            console.log('[DB Action GET /jobseekers] No jobseeker profiles found in DB, returning empty array.');
            return res.json([]);
        }

        const candidates = jobSeekerUsers.map(user => ({
            id: user._id.toString(), // This is the User._id from MongoDB
            name: user.name || 'N/A',
            role: user.profileHeadline || 'Role not specified',
            experienceSummary: user.profileExperienceSummary || 'No summary available.',
            skills: user.profileSkills ? user.profileSkills.split(',').map(s => s.trim()).filter(s => s) : [],
            avatarUrl: user.profileAvatarUrl || `https://placehold.co/100x100.png?text=${encodeURIComponent(user.name ? user.name.charAt(0) : 'U')}`,
            dataAiHint: 'person portrait',
            videoResumeUrl: user.profileVideoPortfolioLink || undefined,
            profileStrength: Math.floor(Math.random() * 40) + 60,
            location: user.country || 'Location not specified',
            desiredWorkStyle: user.profileDesiredWorkStyle || 'Not specified',
            pastProjects: user.profilePastProjects || 'Not specified',
            workExperienceLevel: user.profileWorkExperienceLevel || 'unspecified',
            educationLevel: user.profileEducationLevel || 'unspecified',
            locationPreference: user.profileLocationPreference || 'unspecified',
            languages: user.profileLanguages ? user.profileLanguages.split(',').map(s => s.trim()).filter(s => s) : ['English'],
            availability: user.profileAvailability || 'unspecified',
            jobTypePreference: user.profileJobTypePreference ? user.profileJobTypePreference.split(',').map(s => s.trim()).filter(s => s) : ['Unspecified'],
            salaryExpectationMin: user.profileSalaryExpectationMin,
            salaryExpectationMax: user.profileSalaryExpectationMax,
            personalityAssessment: [],
            optimalWorkStyles: [],
            isUnderestimatedTalent: Math.random() < 0.15,
            underestimatedReasoning: Math.random() < 0.15 ? 'Shows unique potential based on raw data.' : undefined,
        }));

        console.log(`[DB Action GET /jobseekers] Transformed ${candidates.length} jobseeker profiles to send to frontend.`);
        if (candidates.length > 0) {
            console.log('[DB Action GET /jobseekers] First transformed candidate to send (selected fields):', {
                id: candidates[0].id,
                name: candidates[0].name,
                role: candidates[0].role,
                skills: candidates[0].skills,
                avatarUrl: candidates[0].avatarUrl
            });
        }
        res.json(candidates);
    } catch (error) {
        console.error('Error fetching jobseeker profiles:', error);
        res.status(500).json({ message: 'Server error while fetching jobseeker profiles', error: error.message });
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

        // Logic to find the "other user" based on the profile being liked
        if (likedProfileType === 'candidate') {
            // Liked profile is a candidate. The "other user" is this candidate's User document.
            // 'likedProfileId' in this case is the User._id of the candidate.
             if (!mongoose.Types.ObjectId.isValid(likedProfileId)) {
                console.warn(`[Like Interaction] Invalid likedProfileId for candidate type: ${likedProfileId}`);
                return res.status(400).json({ message: "Invalid candidate profile ID." });
            }
            otherUser = await User.findById(likedProfileId);
        } else if (likedProfileType === 'company') {
            // Liked profile is a company. The "other user" is the recruiter User document
            // that represents this company.
            // 'likedProfileId' in this case is the conceptual company ID (e.g., 'comp1').
            // We need to find the User whose `representedCompanyProfileId` matches this.
            otherUser = await User.findOne({ selectedRole: 'recruiter', representedCompanyProfileId: likedProfileId });
        }

        if (!otherUser) {
            console.warn(`[Like Interaction] Could not find the "other user" for likedProfileId: ${likedProfileId} (type: ${likedProfileType})`);
            // Decide if this is an error or just means no match possible.
            // For now, proceed with saving the like, but no match can be made.
        }
        
        // Record the like
        if (likingUserRole === 'recruiter' && likedProfileType === 'candidate') {
            // Recruiter likes a candidate. `likedProfileId` is the candidate's User._id.
            if (!likingUser.likedCandidateIds.includes(likedProfileId)) {
                likingUser.likedCandidateIds.push(likedProfileId);
            }
            // Check for match: Does the candidate (otherUser) like the recruiter's company?
            if (otherUser && likingUser.representedCompanyProfileId && otherUser.likedCompanyIds.includes(likingUser.representedCompanyProfileId)) {
                matchMade = true;
            }
        } else if (likingUserRole === 'jobseeker' && likedProfileType === 'company') {
            // Job seeker likes a company. `likedProfileId` is the company's display ID (e.g. 'comp1').
            if (!likingUser.likedCompanyIds.includes(likedProfileId)) {
                likingUser.likedCompanyIds.push(likedProfileId);
            }
            // Check for match: Does the recruiter (otherUser) for this company like this job seeker (likingUser)?
            // `otherUser.likedCandidateIds` stores User._ids of candidates liked by the recruiter.
            if (otherUser && otherUser.likedCandidateIds.includes(likingUser._id.toString())) {
                matchMade = true;
            }
        } else {
            return res.status(400).json({ message: "Invalid role/profile type combination." });
        }

        await likingUser.save();
        console.log(`[DB Action] Like recorded for user ${likingUser._id} (${likingUserRole}). Target: ${likedProfileId} (${likedProfileType}).`);

        if (matchMade && otherUser) {
            const userA_Id = likingUser._id.toString() < otherUser._id.toString() ? likingUser._id : otherUser._id;
            const userB_Id = likingUser._id.toString() < otherUser._id.toString() ? otherUser._id : likingUser._id;
            const uniqueKey = `${userA_Id.toString()}-${userB_Id.toString()}`;

            const existingMatch = await Match.findOne({ uniqueMatchKey: uniqueKey });

            if (!existingMatch) {
                let candidateDisplayIdForMatch, companyDisplayIdForMatch;

                if (likingUserRole === 'recruiter') { // Recruiter (likingUser) likes a candidate (otherUser)
                    candidateDisplayIdForMatch = otherUser.representedCandidateProfileId || otherUser._id.toString(); // Candidate is otherUser
                    companyDisplayIdForMatch = likingUser.representedCompanyProfileId;    // Company is represented by likingUser
                } else { // Job Seeker (likingUser) likes a company (represented by otherUser)
                    candidateDisplayIdForMatch = likingUser.representedCandidateProfileId || likingUser._id.toString(); // Candidate is likingUser
                    companyDisplayIdForMatch = otherUser.representedCompanyProfileId;    // Company is represented by otherUser
                }
                
                if (!candidateDisplayIdForMatch || !companyDisplayIdForMatch) {
                    console.error("[Match Creation] Critical error: Missing represented profile ID for match.", {
                        likingUserId: likingUser._id, likingUserRole,
                        otherUserId: otherUser._id, otherUserRole: otherUser.selectedRole,
                        candidateDisplayIdForMatch, companyDisplayIdForMatch
                    });
                } else {
                    const newMatch = new Match({
                        userA_Id: userA_Id,
                        userB_Id: userB_Id,
                        candidateProfileIdForDisplay: candidateDisplayIdForMatch,
                        companyProfileIdForDisplay: companyDisplayIdForMatch,
                        uniqueMatchKey: uniqueKey,
                    });
                    await newMatch.save();
                    newMatchDetails = newMatch;
                    console.log(`[DB Action] Mutual match CREATED between ${userA_Id} and ${userB_Id}. Match ID: ${newMatch._id}`);
                }
            } else {
                console.log(`[DB Action] Mutual match ALREADY EXISTS between ${userA_Id} and ${userB_Id}. Match ID: ${existingMatch._id}`);
                matchMade = true; // Ensure it's true if match already existed
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
    console.log(`Frontend URLs allowed by CORS (from env and hardcoded): ${JSON.stringify(ALLOWED_ORIGINS)}`);
});

