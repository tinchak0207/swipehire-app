
// swipehire-backend/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./User');
const DiaryPost = require('./DiaryPost');
const Match = require('./Match');
const ChatMessage = require('./ChatMessage');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const http = require('http'); // Required for socket.io
const { Server } = require("socket.io"); // socket.io server
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

const app = express();
const server = http.createServer(app); // Create HTTP server from Express app for Socket.io integration

const PORT = process.env.PORT || 5000;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379"; // Default to local Redis

const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`[File System] Created uploads directory at: ${uploadsDir}`);
} else {
    console.log(`[File System] Uploads directory already exists at: ${uploadsDir}`);
}

const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  'https://studio--swipehire-3bscz.us-central1.hosted.app',
  'https://6000-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',
  'https://9002-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',
  'http://localhost:9002', // For local Next.js dev
  'http://localhost:3000', // Common local dev port
].filter(Boolean);

console.log(`[CORS Config] Effective ALLOWED_ORIGINS for CORS: ${JSON.stringify(ALLOWED_ORIGINS)}`);

// Socket.io initialization
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"]
  }
});

// Setup Redis Adapter for Socket.IO
(async () => {
  if (process.env.USE_REDIS_ADAPTER === 'true') {
    console.log(`[Socket.IO Redis] Attempting to connect to Redis at ${REDIS_URL} for Socket.IO adapter.`);
    const pubClient = createClient({ url: REDIS_URL });
    const subClient = pubClient.duplicate();

    pubClient.on('error', (err) => console.error('[Socket.IO Redis] Publisher client error:', err));
    subClient.on('error', (err) => console.error('[Socket.IO Redis] Subscriber client error:', err));

    try {
      await Promise.all([pubClient.connect(), subClient.connect()]);
      io.adapter(createAdapter(pubClient, subClient));
      console.log('[Socket.IO Redis] Successfully connected to Redis and set adapter.');
    } catch (err) {
      console.error('[Socket.IO Redis] Failed to connect to Redis or set adapter. Running in single-server mode.', err);
    }
  } else {
    console.log('[Socket.IO] Not using Redis adapter (USE_REDIS_ADAPTER not set to "true"). Running in single-server mode.');
  }
})();


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
    res.header(headersToSet);
    res.sendStatus(204);
    console.log(`[Global OPTIONS Handler] --- Responded 204 for allowed origin: ${origin} for ${requestPath} with reflected ACAO.`);
  } else {
    res.header(headersToSet);
    res.sendStatus(204);
    console.log(`[Global OPTIONS Handler] --- Responded 204 for origin: ${origin} (actual request may be blocked by browser if not allowed by main CORS config)`);
  }
});

app.use(express.json());
const corsOptions = {
  origin: function (requestOrigin, callback) {
    if (!requestOrigin || ALLOWED_ORIGINS.includes(requestOrigin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
};
app.use(cors(corsOptions));

const staticUploadsPath = path.resolve(__dirname, 'uploads');
const uploadsLoggingMiddleware = (req, res, next) => {
    console.log(`[Uploads Static Entry] Request for: ${req.originalUrl}`);
    const requestedFilename = req.path.startsWith('/') ? req.path.substring(1) : req.path;
    const physicalPath = path.join(staticUploadsPath, decodeURIComponent(requestedFilename));
    console.log(`[Uploads Static Entry]   Raw req.path: ${req.path}`);
    console.log(`[Uploads Static Entry]   Decoded req.path: ${decodeURIComponent(req.path)}`);
    console.log(`[Uploads Static Entry]   Attempting to serve physical path: ${physicalPath}`);
    if (fs.existsSync(physicalPath)) {
        console.log(`[Uploads Static Entry]   File EXISTS at physical path.`);
    } else {
        console.warn(`[Uploads Static Entry]   File DOES NOT EXIST at physical path.`);
    }
    next();
};

app.get('/uploads/:filename', uploadsLoggingMiddleware, (req, res) => {
    const filename = req.params.filename;
    console.log(`[Manual /uploads/:filename Handler] Request for filename: ${filename}`);
    if (filename.includes('..')) {
        console.warn(`[Manual /uploads/:filename Handler] Directory traversal attempt blocked for: ${filename}`);
        return res.status(400).send('Invalid filename.');
    }
    const filePath = path.join(staticUploadsPath, decodeURIComponent(filename)); // Decode filename
    console.log(`[Manual /uploads/:filename Handler] Attempting to serve physical path: ${filePath}`);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error(`[Manual /uploads/:filename Handler] Error sending file ${filePath}:`, err);
            if (!res.headersSent) {
                if (err.code === 'ENOENT') {
                    res.status(404).send('File not found.');
                } else {
                    res.status(500).send('Error sending file.');
                }
            }
        } else {
            console.log(`[Manual /uploads/:filename Handler] File sent successfully: ${filePath}`);
        }
    });
});

// Multer storage configuration for general files (like avatars)
const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, uploadsDir); },
    filename: function (req, file, cb) {
        const fileExtension = path.extname(file.originalname);
        const safeBaseName = path.basename(file.originalname, fileExtension).toLowerCase().replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
        const finalFilename = Date.now() + '-' + (safeBaseName || 'uploaded_file') + fileExtension;
        cb(null, finalFilename);
    }
});

// Multer file filter for images
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) { cb(null, true); }
    else { cb(new Error('Not an image! Please upload only images.'), false); }
};
const uploadAvatar = multer({ storage: storage, fileFilter: imageFileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit for avatars

// Multer file filter for videos
const videoFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) { cb(null, true); }
    else { cb(new Error('Not a video! Please upload only video files (e.g., mp4, webm).'), false); }
};
const uploadVideo = multer({ storage: storage, fileFilter: videoFileFilter, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit for videos


app.get('/', (req, res) => res.send('Welcome to SwipeHire Backend API!'));

app.post('/api/users', async (req, res) => {
    try {
        const { name, email, preferences, firebaseUid, selectedRole, representedCandidateProfileId, representedCompanyProfileId } = req.body;
        if (!name || !email || !firebaseUid) return res.status(400).json({ message: 'Name, email, and firebaseUid are required' });
        const existingUser = await User.findOne({ $or: [{ email }, { firebaseUid }] });
        if (existingUser) return res.status(409).json({ message: 'User already exists with this email or Firebase UID' });
        let finalRepCandidateId = representedCandidateProfileId;
        let finalRepCompanyId = representedCompanyProfileId;
        if (selectedRole === 'jobseeker' && !representedCandidateProfileId) finalRepCandidateId = `cand-user-${firebaseUid.slice(0,5)}`;
        else if (selectedRole === 'recruiter' && !representedCompanyProfileId) finalRepCompanyId = `comp-user-${firebaseUid.slice(0,5)}`;
        
        const newUserPayload = { 
            name, email, preferences, firebaseUid, selectedRole, 
            representedCandidateProfileId: finalRepCandidateId, 
            representedCompanyProfileId: finalRepCompanyId,
            companyNameForJobs: selectedRole === 'recruiter' ? name : undefined, 
            companyIndustryForJobs: selectedRole === 'recruiter' ? 'Various' : undefined 
        };
        const newUser = new User(newUserPayload);
        await newUser.save();
        res.status(201).json({ message: 'User created!', user: newUser });
    } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
});

app.get('/api/users/:identifier', async (req, res) => {
    try {
        const identifier = req.params.identifier;
        let user;
        if (mongoose.Types.ObjectId.isValid(identifier)) user = await User.findById(identifier);
        if (!user) user = await User.findOne({ firebaseUid: identifier });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
});

app.post('/api/users/:identifier/avatar', uploadAvatar.single('avatar'), async (req, res) => {
    const { identifier } = req.params;
    if (!req.file) return res.status(400).json({ message: 'No avatar file uploaded.' });
    try {
        let userToUpdate;
        if (mongoose.Types.ObjectId.isValid(identifier)) userToUpdate = await User.findById(identifier);
        else userToUpdate = await User.findOne({ firebaseUid: identifier });
        if (!userToUpdate) {
            fs.unlink(req.file.path, err => { if (err) console.error("[Avatar Upload] Error deleting orphaned file:", err); });
            return res.status(404).json({ message: 'User not found' });
        }
        const avatarUrl = `/uploads/${req.file.filename}`;
        userToUpdate.profileAvatarUrl = avatarUrl;
        await userToUpdate.save();
        res.json({ message: 'Avatar uploaded successfully!', profileAvatarUrl: avatarUrl, user: userToUpdate });
    } catch (error) {
        fs.unlink(req.file.path, err => { if (err) console.error("[Avatar Upload] Error deleting file after DB error:", err); });
        res.status(500).json({ message: 'Server error while updating avatar', error: error.message });
    }
});

app.post('/api/users/:identifier/video-resume', uploadVideo.single('videoResume'), async (req, res) => {
    const { identifier } = req.params;
    if (!req.file) return res.status(400).json({ message: 'No video resume file uploaded.' });
    try {
        let userToUpdate;
        if (mongoose.Types.ObjectId.isValid(identifier)) userToUpdate = await User.findById(identifier);
        else userToUpdate = await User.findOne({ firebaseUid: identifier });

        if (!userToUpdate) {
            fs.unlink(req.file.path, err => { if (err) console.error("[Video Resume Upload] Error deleting orphaned file:", err); });
            return res.status(404).json({ message: 'User not found' });
        }

        const videoUrl = `/uploads/${req.file.filename}`;
        userToUpdate.profileVideoPortfolioLink = videoUrl; 
        await userToUpdate.save();
        res.json({ message: 'Video resume uploaded successfully!', videoUrl: videoUrl, user: userToUpdate });
    } catch (error) {
        fs.unlink(req.file.path, err => { if (err) console.error("[Video Resume Upload] Error deleting file after DB error:", err); });
        res.status(500).json({ message: 'Server error while uploading video resume', error: error.message });
    }
});

app.post('/api/users/:identifier/profile', async (req, res) => {
    try {
        const { identifier } = req.params;
        const profileData = req.body;
        let userToUpdate;
        if (mongoose.Types.ObjectId.isValid(identifier)) userToUpdate = await User.findById(identifier);
        else userToUpdate = await User.findOne({ firebaseUid: identifier });
        if (!userToUpdate) return res.status(404).json({ message: 'User not found' });
        Object.keys(profileData).forEach(key => {
            if (profileData[key] !== undefined) userToUpdate[key] = profileData[key];
        });
        if (userToUpdate.selectedRole === 'jobseeker' && !userToUpdate.representedCandidateProfileId) {
            userToUpdate.representedCandidateProfileId = userToUpdate.firebaseUid ? `cand-user-${userToUpdate.firebaseUid.slice(0,5)}` : `cand-user-${userToUpdate._id.toString().slice(-5)}`;
        }
        if (userToUpdate.selectedRole === 'recruiter' && !userToUpdate.companyNameForJobs) {
            userToUpdate.companyNameForJobs = userToUpdate.name;
        }
        if (userToUpdate.selectedRole === 'recruiter' && !userToUpdate.companyIndustryForJobs) {
            userToUpdate.companyIndustryForJobs = 'Various';
        }
        const updatedUser = await userToUpdate.save();
        res.json({ message: 'User profile updated successfully!', user: updatedUser });
    } catch (error) { res.status(500).json({ message: 'Server error while updating profile', error: error.message }); }
});

app.put('/api/users/:identifier', async (req, res) => {
    try {
        const identifier = req.params.identifier;
        const update = req.body;
        let updatedUser;
        const updatePayload = { ...update };
        if (updatePayload.firebaseUid === undefined) delete updatePayload.firebaseUid;
        if (updatePayload.email === undefined) delete updatePayload.email;
        if (updatePayload.selectedRole === 'recruiter') {
            if (updatePayload.companyNameForJobs === undefined || updatePayload.companyNameForJobs === '') {
                updatePayload.companyNameForJobs = updatePayload.name || 'Default Company Name';
            }
            if (updatePayload.companyIndustryForJobs === undefined || updatePayload.companyIndustryForJobs === '') {
                updatePayload.companyIndustryForJobs = 'Various';
            }
        }

        if (mongoose.Types.ObjectId.isValid(identifier)) updatedUser = await User.findByIdAndUpdate(identifier, updatePayload, { new: true, runValidators: true });
        if (!updatedUser) updatedUser = await User.findOneAndUpdate({ firebaseUid: identifier }, updatePayload, { new: true, runValidators: true });
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User updated!', user: updatedUser });
    } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
});

// POST a new job for a specific user (recruiter)
app.post('/api/users/:userId/jobs', async (req, res) => {
    try {
        const { userId } = req.params;
        const jobOpeningData = req.body; 

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format.' });
        }

        const recruiter = await User.findById(userId);
        if (!recruiter) {
            return res.status(404).json({ message: 'Recruiter not found.' });
        }
        if (recruiter.selectedRole !== 'recruiter') {
            return res.status(403).json({ message: 'User is not a recruiter.' });
        }

        // Ensure recruiter's company name and industry are set if missing
        if (!recruiter.companyNameForJobs) {
            recruiter.companyNameForJobs = recruiter.name; // Default to recruiter's name
        }
        if (!recruiter.companyIndustryForJobs) {
            recruiter.companyIndustryForJobs = 'Various'; // Default industry
        }
        
        const newJob = {
            ...jobOpeningData,
            companyNameForJob: recruiter.companyNameForJobs,
            companyLogoForJob: recruiter.profileAvatarUrl, 
            companyIndustryForJob: recruiter.companyIndustryForJobs,
        };

        recruiter.jobOpenings.push(newJob);
        await recruiter.save();
        
        const postedJob = recruiter.jobOpenings[recruiter.jobOpenings.length - 1];
        console.log(`[Backend POST Job] Successfully saved job "${postedJob.title}" for recruiter ${recruiter.name} (${recruiter._id}). Total jobs: ${recruiter.jobOpenings.length}`);
        res.status(201).json({ message: 'Job posted successfully!', job: postedJob });

    } catch (error) {
        console.error(`[Backend POST Job] Error posting job for user ${req.params.userId}:`, error);
        res.status(500).json({ message: 'Server error posting job', error: error.message });
    }
});

// GET all job openings from all recruiters
app.get('/api/jobs', async (req, res) => {
    try {
        const recruiters = await User.find({ selectedRole: 'recruiter', 'jobOpenings.0': { $exists: true } });
        console.log(`[Backend GET Jobs] Found ${recruiters.length} recruiters with job openings.`);
        
        const allJobs = recruiters.flatMap(recruiter => {
            console.log(`[Backend GET Jobs] Processing recruiter ${recruiter.name} (${recruiter._id}) with ${recruiter.jobOpenings.length} jobs.`);
            return recruiter.jobOpenings.map(job => {
                // Ensure job._id is a string
                const jobIdString = job._id ? job._id.toString() : `generated-${Math.random().toString(36).substring(2, 15)}`;
                if (!job._id) {
                    console.warn(`[Backend GET Jobs] Job for recruiter ${recruiter.name} missing _id, generated: ${jobIdString}. Title: ${job.title}`);
                }
                
                const jobObject = job.toObject ? job.toObject() : { ...job }; // Handle if job is not a full Mongoose subdocument instance (less likely here)
                
                const companyLikeObject = {
                    id: `comp-user-${recruiter._id.toString()}-job-${jobIdString}`, 
                    recruiterUserId: recruiter._id.toString(), 
                    name: job.companyNameForJob || recruiter.name || 'Unknown Company', // Added fallback
                    industry: job.companyIndustryForJob || recruiter.companyIndustryForJobs || 'Various',
                    description: `Job posting by ${recruiter.name || 'a recruiter'}`, 
                    cultureHighlights: job.companyCultureKeywords || [],
                    logoUrl: job.companyLogoForJob || recruiter.profileAvatarUrl || 'https://placehold.co/100x100.png',
                    dataAiHint: 'company logo', 
                    jobOpenings: [{ ...jobObject, _id: jobIdString }], 
                };
                // console.log(`[Backend GET Jobs] Mapped job: ${job.title} from ${recruiter.name} to company-like ID: ${companyLikeObject.id}`);
                return companyLikeObject;
            });
        });
        
        allJobs.sort((a, b) => {
             const dateA = a.jobOpenings[0].postedAt ? new Date(a.jobOpenings[0].postedAt) : new Date(0);
             const dateB = b.jobOpenings[0].postedAt ? new Date(b.jobOpenings[0].postedAt) : new Date(0);
             return dateB.getTime() - dateA.getTime();
        });
        console.log(`[Backend GET Jobs] Returning ${allJobs.length} total jobs to frontend.`);
        res.json(allJobs);
    } catch (error) {
        console.error(`[Backend GET Jobs] Error fetching jobs:`, error);
        res.status(500).json({ message: 'Server error fetching jobs', error: error.message });
    }
});


app.post('/api/proxy/users/:identifier/role', async (req, res) => {
  const { identifier } = req.params;
  try {
    const internalResponse = await fetch(`http://localhost:${PORT}/api/users/${identifier}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req.body),
    });
    const responseData = await internalResponse.json();
    if (!internalResponse.ok) return res.status(internalResponse.status).json(responseData);
    res.status(internalResponse.status).json(responseData);
  } catch (error) { res.status(500).json({ message: 'Proxy error while updating user role', error: error.message || 'Unknown proxy error' }); }
});

app.post('/api/proxy/users/:identifier/settings', async (req, res) => {
  const { identifier } = req.params;
  try {
    const internalResponse = await fetch(`http://localhost:${PORT}/api/users/${identifier}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req.body),
    });
    const responseData = await internalResponse.json();
    if (!internalResponse.ok) return res.status(internalResponse.status).json(responseData);
    res.status(internalResponse.status).json(responseData);
  } catch (error) { res.status(500).json({ message: 'Proxy error while updating user settings', error: error.message || 'Unknown proxy error' }); }
});

app.get('/api/users/profiles/jobseekers', async (req, res) => {
    try {
        const jobSeekerUsers = await User.find({
            $or: [ { selectedRole: 'jobseeker' }, { profileHeadline: { $exists: true, $ne: "", $ne: null }, profileExperienceSummary: { $exists: true, $ne: "", $ne: null } } ]
        });
        if (!jobSeekerUsers || jobSeekerUsers.length === 0) return res.json([]);
        const candidates = jobSeekerUsers.map(user => ({
            id: user._id.toString(), name: user.name || 'N/A', role: user.profileHeadline || 'Role not specified',
            experienceSummary: user.profileExperienceSummary || 'No summary available.',
            skills: user.profileSkills ? user.profileSkills.split(',').map(s => s.trim()).filter(s => s) : [],
            avatarUrl: user.profileAvatarUrl || `https://placehold.co/100x100.png?text=${encodeURIComponent(user.name ? user.name.charAt(0) : 'U')}`,
            dataAiHint: 'person portrait', videoResumeUrl: user.profileVideoPortfolioLink || undefined,
            profileStrength: Math.floor(Math.random() * 40) + 60, location: user.country || 'Location not specified',
            desiredWorkStyle: user.profileDesiredWorkStyle || 'Not specified', pastProjects: user.profilePastProjects || 'Not specified',
            workExperienceLevel: user.profileWorkExperienceLevel || 'unspecified', educationLevel: user.profileEducationLevel || 'unspecified',
            locationPreference: user.profileLocationPreference || 'unspecified',
            languages: user.profileLanguages ? user.profileLanguages.split(',').map(s => s.trim()).filter(s => s) : ['English'],
            availability: user.profileAvailability || 'unspecified',
            jobTypePreference: user.profileJobTypePreference ? user.profileJobTypePreference.split(',').map(s => s.trim()).filter(s => s) : ['Unspecified'],
            salaryExpectationMin: user.profileSalaryExpectationMin, salaryExpectationMax: user.profileSalaryExpectationMax,
            personalityAssessment: [], optimalWorkStyles: [], isUnderestimatedTalent: Math.random() < 0.15,
            underestimatedReasoning: Math.random() < 0.15 ? 'Shows unique potential based on raw data.' : undefined,
            cardTheme: user.profileCardTheme || 'default',
        }));
        res.json(candidates);
    } catch (error) { res.status(500).json({ message: 'Server error while fetching jobseeker profiles', error: error.message }); }
});

app.post('/api/diary-posts', async (req, res) => {
    try {
        const { title, content, authorId, authorName, authorAvatarUrl, imageUrl, diaryImageHint, tags, isFeatured } = req.body;
        if (!title || !content || !authorId || !authorName) return res.status(400).json({ message: 'Title, content, authorId, and authorName are required.' });
        if (!mongoose.Types.ObjectId.isValid(authorId)) return res.status(400).json({ message: 'Invalid authorId format.' });
        const authorExists = await User.findById(authorId);
        if (!authorExists) return res.status(404).json({ message: `User with ID ${authorId} not found.` });
        const newPost = new DiaryPost({ title, content, authorId, authorName, authorAvatarUrl, imageUrl, diaryImageHint, tags, isFeatured });
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) { res.status(500).json({ message: 'Server error creating diary post', error: error.message }); }
});

app.get('/api/diary-posts', async (req, res) => {
    try {
        const posts = await DiaryPost.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) { res.status(500).json({ message: 'Server error fetching diary posts', error: error.message }); }
});

app.post('/api/diary-posts/:postId/like', async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ message: 'userId is required.' });
        if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: 'Invalid ID format.' });
        const post = await DiaryPost.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found.' });
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const likedIndex = post.likedBy.findIndex(id => id.equals(userObjectId));
        if (likedIndex > -1) { post.likedBy.splice(likedIndex, 1); post.likes = Math.max(0, post.likes - 1); }
        else { post.likedBy.push(userObjectId); post.likes += 1; }
        await post.save();
        res.json(post);
    } catch (error) { res.status(500).json({ message: 'Server error liking post', error: error.message }); }
});

app.post('/api/interactions/like', async (req, res) => {
    try {
        const { likingUserId, likedProfileId, likedProfileType, likingUserRole, likingUserRepresentsCandidateId, likingUserRepresentsCompanyId } = req.body;
        if (!likingUserId || !likedProfileId || !likedProfileType || !likingUserRole) return res.status(400).json({ message: "Missing required fields." });
        if (!mongoose.Types.ObjectId.isValid(likingUserId)) return res.status(400).json({ message: "Invalid likingUserId." });
        const likingUser = await User.findById(likingUserId);
        if (!likingUser) return res.status(404).json({ message: "Liking user not found." });
        let matchMade = false, newMatchDetails = null, otherUser = null;
        if (likedProfileType === 'candidate') {
            if (!mongoose.Types.ObjectId.isValid(likedProfileId)) return res.status(400).json({ message: "Invalid candidate profile ID." });
            otherUser = await User.findById(likedProfileId);
        } else if (likedProfileType === 'company') {
             if (!mongoose.Types.ObjectId.isValid(likedProfileId)) { 
                console.warn(`[Like Interaction] likedProfileId for company is not a Mongo ObjectId: ${likedProfileId}.`);
                return res.status(400).json({ message: "Invalid company/recruiter profile ID." });
             } else {
                otherUser = await User.findById(likedProfileId); 
             }
        }

        if (!otherUser) return res.status(404).json({ message: "Liked profile's owner (user or recruiter) not found." });

        if (likingUserRole === 'recruiter' && likedProfileType === 'candidate') {
            if (!likingUser.likedCandidateIds.includes(likedProfileId)) likingUser.likedCandidateIds.push(likedProfileId);
            if (otherUser.likedCompanyIds.includes(likingUser._id.toString())) matchMade = true;

        } else if (likingUserRole === 'jobseeker' && likedProfileType === 'company') {
            if (!likingUser.likedCompanyIds.includes(likedProfileId)) likingUser.likedCompanyIds.push(likedProfileId);
            if (otherUser.likedCandidateIds.includes(likingUser._id.toString())) matchMade = true;
        } else return res.status(400).json({ message: "Invalid role/profile type combination." });
        
        await likingUser.save();

        if (matchMade) {
            const userA_Id = likingUser._id.toString() < otherUser._id.toString() ? likingUser._id : otherUser._id;
            const userB_Id = likingUser._id.toString() < otherUser._id.toString() ? otherUser._id : likingUser._id;
            const uniqueKey = `${userA_Id.toString()}-${userB_Id.toString()}`;
            const existingMatch = await Match.findOne({ uniqueMatchKey: uniqueKey });
            
            if (!existingMatch) {
                let candidateDisplayIdForMatch, companyDisplayIdForMatch;

                if (likingUser.selectedRole === 'jobseeker') {
                    candidateDisplayIdForMatch = likingUser.representedCandidateProfileId || likingUser._id.toString();
                    companyDisplayIdForMatch = otherUser.representedCompanyProfileId || otherUser._id.toString();
                } else { 
                    candidateDisplayIdForMatch = otherUser.representedCandidateProfileId || otherUser._id.toString();
                    companyDisplayIdForMatch = likingUser.representedCompanyProfileId || likingUser._id.toString();
                }
                
                const newMatch = new Match({ 
                    userA_Id, 
                    userB_Id, 
                    candidateProfileIdForDisplay: candidateDisplayIdForMatch, 
                    companyProfileIdForDisplay: companyDisplayIdForMatch, 
                    uniqueMatchKey 
                });
                await newMatch.save(); newMatchDetails = newMatch;
            } else { newMatchDetails = existingMatch; }
        }
        res.status(200).json({ success: true, message: "Like recorded.", matchMade, matchDetails: newMatchDetails });
    } catch (error) { res.status(500).json({ message: 'Server error recording like.', error: error.message }); }
});

app.get('/api/matches/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: "Invalid userId." });
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const matches = await Match.find({ $or: [{ userA_Id: userObjectId }, { userB_Id: userObjectId }], status: 'active' }).sort({ matchedAt: -1 });
        res.status(200).json(matches);
    } catch (error) { res.status(500).json({ message: 'Server error fetching matches.', error: error.message }); }
});

app.post('/api/users/:userId/pass-candidate/:candidateId', async (req, res) => {
    const { userId, candidateId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: 'Invalid user ID.' });
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        if (!user.passedCandidateProfileIds.includes(candidateId)) {
            user.passedCandidateProfileIds.push(candidateId);
            await user.save();
        }
        res.status(200).json({ message: 'Candidate passed successfully.', passedCandidateProfileIds: user.passedCandidateProfileIds });
    } catch (error) { res.status(500).json({ message: 'Server error passing candidate.', error: error.message }); }
});

app.post('/api/users/:userId/pass-company/:companyId', async (req, res) => {
    const { userId, companyId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: 'Invalid user ID.' });
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        if (!user.passedCompanyProfileIds.includes(companyId)) {
            user.passedCompanyProfileIds.push(companyId);
            await user.save();
        }
        res.status(200).json({ message: 'Company passed successfully.', passedCompanyProfileIds: user.passedCompanyProfileIds });
    } catch (error) { res.status(500).json({ message: 'Server error passing company.', error: error.message }); }
});

app.post('/api/users/:userId/retrieve-candidate/:candidateId', async (req, res) => {
    const { userId, candidateId } = req.params;
     if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: 'Invalid user ID.' });
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        user.passedCandidateProfileIds = user.passedCandidateProfileIds.filter(id => id !== candidateId);
        await user.save();
        res.status(200).json({ message: 'Candidate retrieved successfully.', passedCandidateProfileIds: user.passedCandidateProfileIds });
    } catch (error) { res.status(500).json({ message: 'Server error retrieving candidate.', error: error.message }); }
});

app.post('/api/users/:userId/retrieve-company/:companyId', async (req, res) => {
    const { userId, companyId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: 'Invalid user ID.' });
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        user.passedCompanyProfileIds = user.passedCompanyProfileIds.filter(id => id !== companyId);
        await user.save();
        res.status(200).json({ message: 'Company retrieved successfully.', passedCompanyProfileIds: user.passedCompanyProfileIds });
    } catch (error) { res.status(500).json({ message: 'Server error retrieving company.', error: error.message }); }
});


app.post('/api/matches/:matchId/messages', async (req, res) => {
    try {
        const { matchId } = req.params;
        const { senderId, receiverId, text } = req.body;
        if (!mongoose.Types.ObjectId.isValid(matchId) || !mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) return res.status(400).json({ message: 'Invalid ID.' });
        if (!text || text.trim() === '') return res.status(400).json({ message: 'Message text cannot be empty.' });
        const match = await Match.findById(matchId);
        if (!match) return res.status(404).json({ message: 'Match not found.' });
        const matchUserIds = [match.userA_Id.toString(), match.userB_Id.toString()];
        if (!matchUserIds.includes(senderId) || !matchUserIds.includes(receiverId) || senderId === receiverId) return res.status(400).json({ message: 'Invalid sender/receiver for this match.' });
        
        const newMessage = new ChatMessage({ matchId, senderId, receiverId, text: text.trim(), read: false });
        await newMessage.save();
        
        const roomName = `chat-${matchId}`;
        const savedMessageWithId = { ...newMessage.toObject(), id: newMessage._id.toString() };
        io.to(roomName).emit('newMessage', savedMessageWithId); 
        console.log(`[Socket.io] Emitted 'newMessage' to room ${roomName}:`, newMessage._id);
        res.status(201).json(savedMessageWithId);
    } catch (error) { res.status(500).json({ message: 'Server error creating chat message.', error: error.message }); }
});

app.get('/api/matches/:matchId/messages', async (req, res) => {
    try {
        const { matchId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(matchId)) return res.status(400).json({ message: 'Invalid matchId.' });
        const messages = await ChatMessage.find({ matchId }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (error) { res.status(500).json({ message: 'Server error fetching messages.', error: error.message }); }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  const connectedUserId = socket.handshake.auth.userId; 
  const clientIp = socket.handshake.address;
  console.log(`[Socket.io] User connected: ${socket.id} (User ID: ${connectedUserId || 'Anonymous'}, IP: ${clientIp})`);

  socket.on('joinRoom', async (matchId) => {
    if (!matchId) {
        console.warn(`[Socket.io] User ${socket.id} (User ID: ${connectedUserId}) tried to join room with invalid matchId: ${matchId}`);
        socket.emit('joinRoomError', { message: `Failed to join chat room: Invalid Match ID provided.` });
        return;
    }
    if (!connectedUserId) {
        console.warn(`[Socket.io] User ${socket.id} (Anonymous) tried to join room ${matchId} without a userId in handshake auth.`);
        socket.emit('joinRoomError', { message: 'Authentication required to join chat room.' });
        return;
    }
    if (!mongoose.Types.ObjectId.isValid(matchId) || !mongoose.Types.ObjectId.isValid(connectedUserId)) {
      console.warn(`[Socket.io] Invalid ObjectId format for matchId (${matchId}) or connectedUserId (${connectedUserId}) for socket ${socket.id}.`);
      socket.emit('joinRoomError', { message: 'Failed to join chat room: Invalid ID format.' });
      return;
    }

    try {
      const match = await Match.findById(matchId);
      if (!match) {
        console.warn(`[Socket.io] Match not found for ID: ${matchId}. User ${socket.id} (User ID: ${connectedUserId}) cannot join.`);
        socket.emit('joinRoomError', { message: `Failed to join chat room: Match not found.` });
        return;
      }

      const userObjectId = new mongoose.Types.ObjectId(connectedUserId);
      const isUserInMatch = match.userA_Id.equals(userObjectId) || match.userB_Id.equals(userObjectId);

      if (isUserInMatch) {
        const roomName = `chat-${matchId}`;
        socket.join(roomName);
        console.log(`[Socket.io] User ${socket.id} (User ID: ${connectedUserId}) successfully joined room: ${roomName}`);
      } else {
        console.warn(`[Socket.io] Unauthorized attempt: User ${socket.id} (User ID: ${connectedUserId}) tried to join room ${matchId} but is not a participant.`);
        socket.emit('joinRoomError', { message: 'Not authorized to join this chat room.' });
      }
    } catch (error) {
      console.error(`[Socket.io] Error during joinRoom for matchId ${matchId}, userId ${connectedUserId}, socket ${socket.id}:`, error);
      socket.emit('joinRoomError', { message: 'Server error while trying to join chat room.' });
    }
  });

  socket.on('typing', ({ matchId, userId, userName }) => {
    if (matchId && userId && userName && connectedUserId === userId) {
        const roomName = `chat-${matchId}`;
        socket.to(roomName).emit('userTyping', { matchId, userId, userName });
    } else if (connectedUserId !== userId) {
        console.warn(`[Socket.io] Typing event received from unauthenticated or mismatched user. Socket ID: ${socket.id}, Auth UserID: ${connectedUserId}, Event UserID: ${userId}`);
    }
  });

  socket.on('stopTyping', ({ matchId, userId }) => {
     if (matchId && userId && connectedUserId === userId) {
        const roomName = `chat-${matchId}`;
        socket.to(roomName).emit('userStopTyping', { matchId, userId });
    } else if (connectedUserId !== userId) {
        console.warn(`[Socket.io] StopTyping event received from unauthenticated or mismatched user. Socket ID: ${socket.id}, Auth UserID: ${connectedUserId}, Event UserID: ${userId}`);
    }
  });

  socket.on('markMessagesAsRead', async ({ matchId, readerUserId }) => {
    if (!matchId || !readerUserId) {
      console.warn(`[Socket.io ReadReceipt] Invalid data for markMessagesAsRead: matchId=${matchId}, readerUserId=${readerUserId}`);
      return;
    }
    if (!mongoose.Types.ObjectId.isValid(matchId) || !mongoose.Types.ObjectId.isValid(readerUserId)) {
      console.warn(`[Socket.io ReadReceipt] Invalid ObjectId format for markMessagesAsRead: matchId=${matchId}, readerUserId=${readerUserId}`);
      return;
    }

    try {
      const result = await ChatMessage.updateMany(
        { matchId: matchId, receiverId: readerUserId, read: false },
        { $set: { read: true } }
      );
      console.log(`[Socket.io ReadReceipt] Updated ${result.modifiedCount} messages to read=true for match ${matchId}, reader ${readerUserId}`);
      
      if (result.modifiedCount > 0) {
        const roomName = `chat-${matchId}`;
        io.to(roomName).emit('messagesAcknowledgedAsRead', { matchId, readerUserId });
        console.log(`[Socket.io ReadReceipt] Emitted 'messagesAcknowledgedAsRead' to room ${roomName} for reader ${readerUserId}`);
      }
    } catch (error) {
      console.error(`[Socket.io ReadReceipt] Error updating messages to read for match ${matchId}, reader ${readerUserId}:`, error);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`[Socket.io] User disconnected: ${socket.id} (User ID: ${connectedUserId || 'Anonymous'}). Reason: ${reason}`);
  });
});

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://tinchak0207:cfchan%407117@swipehire.fwxspbu.mongodb.net/?retryWrites=true&w=majority&appName=swipehire';
mongoose.connect(MONGO_URI)
.then(() => console.log(`Connected to MongoDB at ${MONGO_URI}`))
.catch((err) => { console.error('MongoDB connection error:', err); process.exit(1); });

server.listen(PORT, () => {
    console.log(`SwipeHire Backend Server with WebSocket support running on http://localhost:${PORT}`);
    console.log(`Frontend URLs allowed by CORS: ${JSON.stringify(ALLOWED_ORIGINS)}`);
});

    
