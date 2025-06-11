
// swipehire-backend/index.js
require('dotenv').config();
const fetch = require('node-fetch'); // Ensure this is one of the first requires
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// const fetch = require('node-fetch'); // Removed from here as it's moved up
const User = require('./User');
const DiaryPost = require('./DiaryPost');
const Match = require('./Match');
const ChatMessage = require('./ChatMessage');
const Video = require('./Video');
const CompanyReview = require('./CompanyReview');
const Notification = require('./Notification');
const notificationService = require('./services/notificationService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Storage } = require('@google-cloud/storage');
const http = require('http');
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const NEXTJS_APP_URL = process.env.NEXTJS_INTERNAL_APP_URL || 'http://localhost:3000';

// --- Security: CORS Configuration ---
const allowedOrigins = [
    process.env.FRONTEND_URL_PRIMARY,
    process.env.FRONTEND_URL_SECONDARY,
    process.env.FRONTEND_URL_TERTIARY,
    process.env.FRONTEND_URL_QUATERNARY,
    'http://localhost:3000',
    'http://localhost:9002',
    'https://6000-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',
    'https://swipehire.top', // Added new domain
    'http://swipehire.top',  // Added new domain (for completeness, though HTTPS is preferred)
    'https://www.swipehire.top', // Added new www domain
    'http://www.swipehire.top',  // Added new www domain
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.warn(`[CORS Blocked] Origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-HTTP-Method-Override', 'X-Firebase-AppCheck', 'X-Firebase-Auth'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Explicitly handle OPTIONS requests for preflight

console.log("[CORS Debug] Express CORS configured. Allowed origins (if set):", allowedOrigins.length > 0 ? allowedOrigins : "Development (permissive - any origin allowed)");


// --- Security: Body Parser with Limits ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`[File System] Created uploads directory at: ${uploadsDir}`);
} else {
    console.log(`[File System] Uploads directory already exists at: ${uploadsDir}`);
}

const diaryUploadsDir = path.join(uploadsDir, 'diary');
if (!fs.existsSync(diaryUploadsDir)) {
    fs.mkdirSync(diaryUploadsDir, { recursive: true });
    console.log(`[File System] Created diary uploads directory at: ${diaryUploadsDir}`);
}

const jobMediaUploadsDir = path.join(uploadsDir, 'job-media');
if (!fs.existsSync(jobMediaUploadsDir)) {
    fs.mkdirSync(jobMediaUploadsDir, { recursive: true });
    console.log(`[File System] Created job-media uploads directory at: ${jobMediaUploadsDir}`);
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log(`[Static Serving] Serving static files from ${path.join(__dirname, 'uploads')} at /uploads`);

const memoryStorage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) { cb(null, true); }
    else { cb(new Error('Not an image! Please upload only images.'), false); }
};
const uploadAvatarToMemory = multer({ storage: memoryStorage, fileFilter: imageFileFilter, limits: { fileSize: 5 * 1024 * 1024 } });


const videoFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) { cb(null, true); }
    else { cb(new Error('Not a video! Please upload only video files (e.g., mp4, webm).'), false); }
};
const uploadVideoResumeToMemory = multer({
    storage: memoryStorage,
    fileFilter: videoFileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }
});

const diaryImageStorage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, diaryUploadsDir); },
    filename: function (req, file, cb) {
        const fileExtension = path.extname(file.originalname);
        const safeBaseName = path.basename(file.originalname, fileExtension).toLowerCase().replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
        const finalFilename = `diary-${Date.now()}-${(safeBaseName || 'image')}${fileExtension}`;
        cb(null, finalFilename);
    }
});
const uploadDiaryImageMulter = multer({ storage: diaryImageStorage, fileFilter: imageFileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

const uploadJobMediaToMemory = multer({
    storage: memoryStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type! Only images and videos are allowed for job media.'), false);
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 }
});


const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

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

// --- ROUTES ---
app.get('/', (req, res) => res.send('Welcome to SwipeHire Backend API!'));


app.get('/api/admin/users', async (req, res) => {
    console.log("[Conceptual Admin] /api/admin/users endpoint hit. Authentication and RBAC (Role-Based Access Control) should be implemented here.");
    try {
        console.log("[Conceptual Admin] Admin RBAC and full user listing would be here.");
        res.status(501).json({ message: 'Admin user listing not implemented. Conceptual endpoint.' });
    } catch (error) {
        console.error("[Conceptual Admin] Error fetching users:", error);
        res.status(500).json({ message: 'Server error fetching users (conceptual)', error: error.message });
    }
});

app.get('/api/admin/diary-posts/pending', async (req, res) => {
    console.log("[Conceptual Admin] /api/admin/diary-posts/pending endpoint hit. Admin RBAC for content moderation.");
    try {
        const pendingPosts = await DiaryPost.find({ status: 'pending_review' }).sort({ createdAt: -1 });
        console.log(`[Conceptual Admin] Fetched ${pendingPosts.length} diary posts pending review.`);
        res.json(pendingPosts);
    } catch (error) {
        console.error("[Conceptual Admin] Error fetching pending diary posts:", error);
        res.status(500).json({ message: 'Server error fetching pending diary posts', error: error.message });
    }
});

app.put('/api/admin/diary-posts/:postId/status', async (req, res) => {
    console.log("[Conceptual Admin] /api/admin/diary-posts/:postId/status endpoint hit. Admin RBAC for content moderation.");
    try {
        const { postId } = req.params;
        const { status } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value.' });
        }
        const post = await DiaryPost.findByIdAndUpdate(postId, { status }, { new: true });
        if (!post) return res.status(404).json({ message: 'Diary post not found.' });
        console.log(`[Conceptual Admin] Updated status of diary post ${postId} to ${status}.`);
        res.json(post);
    } catch (error) {
        console.error("[Conceptual Admin] Error updating diary post status:", error);
        res.status(500).json({ message: 'Server error updating diary post status', error: error.message });
    }
});


app.post('/api/users', async (req, res) => {
    console.log("[API /api/users Create] Request received. Body:", JSON.stringify(req.body).substring(0, 300) + "...");
    try {
        const { name, email, preferences, firebaseUid, selectedRole, representedCandidateProfileId, representedCompanyProfileId } = req.body;

        if (!name || typeof name !== 'string' || name.length < 2 || name.length > 100) {
            console.warn("[API /api/users Create] Invalid name:", name);
            return res.status(400).json({ message: 'Invalid name provided. Must be 2-100 characters.' });
        }
        if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            console.warn("[API /api/users Create] Invalid email:", email);
             return res.status(400).json({ message: 'Invalid email format.' });
        }
        if (!firebaseUid || typeof firebaseUid !== 'string' || firebaseUid.length < 1) {
            console.warn("[API /api/users Create] Missing or invalid firebaseUid:", firebaseUid);
             return res.status(400).json({ message: 'Firebase UID is required and must be a non-empty string.' });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { firebaseUid }] });
        if (existingUser) {
            console.log(`[API /api/users Create] User already exists with email ${email} or UID ${firebaseUid}. Existing ID: ${existingUser._id}`);
            return res.status(200).json({ message: 'User already exists with this email or Firebase UID', user: existingUser }); // Changed to 200 for idempotency
        }

        let finalRepCandidateId = representedCandidateProfileId;
        let finalRepCompanyId = representedCompanyProfileId;

        if (selectedRole === 'jobseeker' && !representedCandidateProfileId) {
            finalRepCandidateId = `cand-user-${firebaseUid.slice(0,5)}`;
        } else if (selectedRole === 'recruiter' && !representedCompanyProfileId) {
            finalRepCompanyId = `comp-user-${firebaseUid.slice(0,5)}`;
        }

        const newUserPayload = {
            name,
            email,
            preferences,
            firebaseUid,
            selectedRole,
            representedCandidateProfileId: finalRepCandidateId,
            representedCompanyProfileId: finalRepCompanyId,
            companyNameForJobs: selectedRole === 'recruiter' ? name : undefined,
            companyIndustryForJobs: selectedRole === 'recruiter' ? 'Various' : undefined
        };

        const newUser = new User(newUserPayload);
        await newUser.save();
        console.log(`[API /api/users Create] New user created. ID: ${newUser._id}, Firebase UID: ${firebaseUid}`);
        res.status(201).json({ message: 'User created!', user: newUser });
    } catch (error) {
        console.error("[API /api/users Create] Server error:", error);
        if (error.code === 11000) { // Duplicate key error
            const field = Object.keys(error.keyPattern)[0];
            return res.status(409).json({ message: `User already exists with this ${field}.` });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.get('/api/users/:identifier', async (req, res) => {
    console.log(`[API /api/users/:identifier Get] Request for identifier: ${req.params.identifier}`);
    try {
        const identifier = req.params.identifier;
        let user;

        if (mongoose.Types.ObjectId.isValid(identifier)) {
            user = await User.findById(identifier);
        }
        if (!user) {
            user = await User.findOne({ firebaseUid: identifier });
        }

        if (!user) {
            console.warn(`[API /api/users/:identifier Get] User not found for identifier: ${identifier}`);
            return res.status(404).json({ message: 'User not found' });
        }
        console.log(`[API /api/users/:identifier Get] User found: ${user._id}`);
        res.json(user);
    } catch (error) {
        console.error(`[API /api/users/:identifier Get] Error fetching user ${req.params.identifier}:`, error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

const storageGCS = new Storage();
const GCS_BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'YOUR_GCS_BUCKET_NAME_HERE'; // Ensure this is set in .env

app.post('/api/users/:identifier/avatar', uploadAvatarToMemory.single('avatar'), async (req, res) => {
    console.log(`[API Avatar Upload] Request for user ${req.params.identifier}. File received: ${req.file ? req.file.originalname : 'No file'}`);
    const { identifier } = req.params;
    if (!req.file) {
        console.warn(`[API Avatar Upload] No avatar file provided for user ${identifier}.`);
        return res.status(400).json({ message: 'No avatar file uploaded.' });
    }

    if (GCS_BUCKET_NAME === 'YOUR_GCS_BUCKET_NAME_HERE' || !GCS_BUCKET_NAME) {
        console.error("GCS_BUCKET_NAME is not configured in environment variables. Avatar upload failed.");
        return res.status(500).json({ message: 'Server configuration error: GCS bucket not specified. Avatar upload failed.' });
    }

    let userToUpdate;
    try {
        if (mongoose.Types.ObjectId.isValid(identifier)) {
            userToUpdate = await User.findById(identifier);
        } else {
            userToUpdate = await User.findOne({ firebaseUid: identifier });
        }

        if (!userToUpdate) {
            console.warn(`[API Avatar Upload] User ${identifier} not found for avatar upload.`);
            return res.status(404).json({ message: 'User not found' });
        }

        const bucket = storageGCS.bucket(GCS_BUCKET_NAME);
        const originalFileName = req.file.originalname;
        const fileExtension = path.extname(originalFileName);
        const safeBaseName = path.basename(originalFileName, fileExtension).toLowerCase().replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
        const gcsObjectName = `avatars/${userToUpdate._id}/${Date.now()}-${safeBaseName}${fileExtension}`;
        const file = bucket.file(gcsObjectName);
        const gcsPublicUrl = `https://storage.googleapis.com/${GCS_BUCKET_NAME}/${gcsObjectName}`;

        console.log(`[API Avatar Upload] Attempting to upload avatar for user ${userToUpdate._id} to GCS: ${gcsPublicUrl}`);

        const stream = file.createWriteStream({
            metadata: { contentType: req.file.mimetype, },
            resumable: false,
        });

        stream.on('error', (err) => {
            console.error('[API Avatar Upload] Error uploading avatar to GCS:', err);
            res.status(500).json({ message: 'Failed to upload avatar to cloud storage.', error: err.message });
        });

        stream.on('finish', async () => {
            try {
                userToUpdate.profileAvatarUrl = gcsPublicUrl;
                await userToUpdate.save();
                console.log(`[API Avatar Upload] Avatar for user ${userToUpdate._id} uploaded to GCS and URL saved: ${gcsPublicUrl}`);
                res.json({ message: 'Avatar uploaded successfully to GCS!', profileAvatarUrl: gcsPublicUrl, user: userToUpdate });
            } catch (dbError) {
                console.error('[API Avatar Upload] Error saving avatar GCS URL to MongoDB:', dbError);
                try { await bucket.file(gcsObjectName).delete(); console.log(`[API Avatar Upload] Orphaned GCS avatar ${gcsObjectName} deleted due to DB error.`); }
                catch (gcsDeleteError) { console.error(`[API Avatar Upload] Failed to delete orphaned GCS avatar ${gcsObjectName}:`, gcsDeleteError); }
                res.status(500).json({ message: 'Failed to save avatar metadata.', error: dbError.message });
            }
        });

        stream.end(req.file.buffer);

    } catch (error) {
        console.error('[API Avatar Upload] Error processing avatar upload:', error);
        res.status(500).json({ message: 'Server error while uploading avatar', error: error.message });
    }
});


app.post('/api/users/:identifier/video-resume', uploadVideoResumeToMemory.single('videoResume'), async (req, res) => {
    const { identifier } = req.params;
    if (!req.file) {
        return res.status(400).json({ message: 'No video resume file uploaded.' });
    }

    if (GCS_BUCKET_NAME === 'YOUR_GCS_BUCKET_NAME_HERE' || !GCS_BUCKET_NAME) {
        console.error("GCS_BUCKET_NAME is not configured in environment variables.");
        return res.status(500).json({ message: 'Server configuration error: GCS bucket not specified.' });
    }

    let userToUpdate;
    try {
        if (mongoose.Types.ObjectId.isValid(identifier)) {
            userToUpdate = await User.findById(identifier);
        } else {
            userToUpdate = await User.findOne({ firebaseUid: identifier });
        }

        if (!userToUpdate) {
            return res.status(404).json({ message: 'User not found' });
        }

        const bucket = storageGCS.bucket(GCS_BUCKET_NAME);
        const originalFileName = req.file.originalname;
        const fileExtension = path.extname(originalFileName);
        const safeBaseName = path.basename(originalFileName, fileExtension).toLowerCase().replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
        const gcsObjectName = `video-resumes/${userToUpdate._id}/${Date.now()}-${safeBaseName}${fileExtension}`;
        const file = bucket.file(gcsObjectName);
        const gcsPublicUrl = `https://storage.googleapis.com/${GCS_BUCKET_NAME}/${gcsObjectName}`;

        const stream = file.createWriteStream({
            metadata: { contentType: req.file.mimetype, },
            resumable: true,
        });

        stream.on('error', (err) => {
            console.error('Error uploading video resume to GCS:', err);
            res.status(500).json({ message: 'Failed to upload video to cloud storage.', error: err.message });
        });

        stream.on('finish', async () => {
            try {
                const newVideoDoc = new Video({
                    gcsObjectName: gcsObjectName,
                    gcsBucketName: GCS_BUCKET_NAME,
                    originalFileName: originalFileName,
                    contentType: req.file.mimetype,
                    size: req.file.size,
                    uploadedBy: userToUpdate._id,
                    gcsPublicUrl: gcsPublicUrl,
                });
                await newVideoDoc.save();

                userToUpdate.profileVideoPortfolioLink = gcsPublicUrl;
                await userToUpdate.save();

                res.json({
                    message: 'Video resume uploaded and GCS link saved successfully!',
                    videoUrl: gcsPublicUrl,
                    gcsObjectName: gcsObjectName,
                    videoId: newVideoDoc._id,
                    user: userToUpdate
                });
            } catch (dbError) {
                console.error('Error saving video metadata to MongoDB:', dbError);
                 try { await bucket.file(gcsObjectName).delete(); console.log(`Orphaned GCS object ${gcsObjectName} deleted due to DB error.`); }
                 catch (gcsDeleteError) { console.error(`Failed to delete orphaned GCS object ${gcsObjectName}:`, gcsDeleteError); }
                res.status(500).json({ message: 'Failed to save video metadata.', error: dbError.message });
            }
        });

        stream.end(req.file.buffer);

    } catch (error) {
        console.error('Error processing video resume upload:', error);
        res.status(500).json({ message: 'Server error while uploading video resume', error: error.message });
    }
});

app.post('/api/users/:identifier/profile', async (req, res) => {
    console.log(`[API /api/users/:identifier/profile Post] Request for ${req.params.identifier}. Body:`, JSON.stringify(req.body).substring(0,300) + "...");
    try {
        const { identifier } = req.params;
        const profileData = req.body;

        let userToUpdate;
        if (mongoose.Types.ObjectId.isValid(identifier)) {
            userToUpdate = await User.findById(identifier);
        } else {
            userToUpdate = await User.findOne({ firebaseUid: identifier });
        }

        if (!userToUpdate) {
            console.warn(`[API /api/users/:identifier/profile Post] User ${identifier} not found.`);
            return res.status(404).json({ message: 'User not found' });
        }

        Object.keys(profileData).forEach(key => {
            if (profileData[key] !== undefined) {
                userToUpdate[key] = profileData[key];
            }
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
        console.log(`[API /api/users/:identifier/profile Post] Profile updated for user ${updatedUser._id}`);
        res.json({ message: 'User profile updated successfully!', user: updatedUser });
    } catch (error) {
        console.error(`[API /api/users/:identifier/profile Post] Error updating profile for ${req.params.identifier}:`, error);
        res.status(500).json({ message: 'Server error while updating profile', error: error.message });
    }
});

app.post('/api/users/:userId/profile/visibility', async (req, res) => {
    console.log(`[Profile Visibility] Request for user ${req.params.userId}, new visibility: ${req.body.profileVisibility}`);
    try {
        const { userId } = req.params;
        const { profileVisibility } = req.body;

        const allowedVisibilities = ['public', 'recruiters_only', 'private'];
        if (!allowedVisibilities.includes(profileVisibility)) {
            return res.status(400).json({ message: 'Invalid profile visibility value provided.' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { profileVisibility: profileVisibility } },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }
        console.log(`[Profile Visibility] Updated visibility for user ${userId} to ${profileVisibility}.`);
        res.status(200).json({ message: 'Profile visibility updated successfully.', user: updatedUser });
    } catch (error) {
        console.error(`[Profile Visibility] Error updating visibility for user ${req.params.userId}:`, error);
        res.status(500).json({ message: 'Server error updating profile visibility.', error: error.message });
    }
});

// This is the user update endpoint (was PUT, now POST)
app.post('/api/users/:identifier/update', async (req, res) => {
    console.log(`[API POST /api/users/:identifier/update] Request for ${req.params.identifier}.`);
    console.log(`[API POST /api/users/:identifier/update] Request Body:`, JSON.stringify(req.body).substring(0,300) + "...");
    try {
        const identifier = req.params.identifier;
        const update = req.body;
        let updatedUser;

        const updatePayload = { ...update };
        if (updatePayload.firebaseUid !== undefined) delete updatePayload.firebaseUid;
        // Keep email if present, as frontend settings page allows updating it (though not if it's the auth email)
        // if (updatePayload.email !== undefined) delete updatePayload.email;

        if (updatePayload.selectedRole === 'recruiter') {
            if (updatePayload.companyNameForJobs === undefined || updatePayload.companyNameForJobs === '') {
                updatePayload.companyNameForJobs = updatePayload.name || 'Default Company Name From Update';
            }
            if (updatePayload.companyIndustryForJobs === undefined || updatePayload.companyIndustryForJobs === '') {
                updatePayload.companyIndustryForJobs = 'Various';
            }
        }

        console.log(`[API POST /api/users/:identifier/update] Attempting update with payload:`, JSON.stringify(updatePayload).substring(0,300) + "...");

        if (mongoose.Types.ObjectId.isValid(identifier)) {
            updatedUser = await User.findByIdAndUpdate(identifier, { $set: updatePayload }, { new: true, runValidators: true });
        }
        if (!updatedUser) {
            updatedUser = await User.findOneAndUpdate({ firebaseUid: identifier }, { $set: updatePayload }, { new: true, runValidators: true });
        }

        if (!updatedUser) {
            console.warn(`[API POST /api/users/:identifier/update] User ${identifier} not found.`);
            return res.status(404).json({ message: 'User not found' });
        }
        console.log(`[API POST /api/users/:identifier/update] User ${updatedUser._id} updated.`);
        res.json({ message: 'User updated!', user: updatedUser });
    } catch (error) {
        console.error(`[API POST /api/users/:identifier/update] Error updating user ${req.params.identifier}:`, error);
        res.status(500).json({ message: 'Server error during user update.', error: error.message });
    }
});

// --- Account Deletion and Data Export ---
app.delete('/api/users/:userId/account', async (req, res) => {
    const { userId } = req.params;
    console.log(`[Account Deletion] Request received for user ID: ${userId}.`);
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format.' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        console.log(`[Account Deletion] Conceptual GCS cleanup for user ${userId}'s files.`);
        console.log(`[Account Deletion] Conceptual data cleanup for user ${userId} across other collections.`);
        await notificationService.deleteAllNotificationsForUser(userId);
        await User.findByIdAndDelete(userId);
        console.log(`[Account Deletion] User ${userId} document deleted from MongoDB.`);
        res.status(200).json({ success: true, message: 'Account deletion process initiated. User removed from our database.' });
    } catch (error) {
        console.error(`[Account Deletion] Error deleting user ${userId}:`, error);
        res.status(500).json({ success: false, message: 'Server error during account deletion.', error: error.message });
    }
});

app.post('/api/users/:userId/request-data-export', async (req, res) => {
    const { userId } = req.params;
    console.log(`[Data Export] Request for user ${userId}.`);
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format.' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        console.log(`[Data Export] Data export requested for user ${userId}. Conceptual: Gather user data, job postings, diary posts, messages, matches, reviews, notifications, etc.`);
        res.status(202).json({ success: true, message: 'Data export request received. We will process your request and notify you when your data is ready for download (this is a conceptual process).' });
    } catch (error) {
        console.error(`[Data Export] Error requesting data export for user ${userId}:`, error);
        res.status(500).json({ success: false, message: 'Server error during data export request.', error: error.message });
    }
});


// Job Postings by a Recruiter (User)
app.post('/api/users/:userId/jobs', uploadJobMediaToMemory.single('mediaFile'), async (req, res) => {
    console.log(`[API Job Create] Request for user ${req.params.userId}. Body text fields:`, JSON.stringify(req.body).substring(0, 300) + "...", "File:", req.file ? req.file.originalname : "No file");
    const { userId } = req.params;
    const jobOpeningDataFromRequest = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format.' });
        }
        const recruiter = await User.findById(userId);
        if (!recruiter) {
            return res.status(404).json({ message: 'Recruiter not found.' });
        }
        if (recruiter.selectedRole !== 'recruiter') {
            return res.status(403).json({ message: 'Forbidden: Only users with the recruiter role can post jobs.' });
        }
        if (!recruiter.companyProfileComplete) {
            console.warn(`[API Job Create] Recruiter ${userId} attempted to post job but company profile is not complete.`);
            return res.status(403).json({ message: 'Please complete your company profile onboarding before posting jobs.' });
        }


        recruiter.companyNameForJobs = recruiter.companyNameForJobs || recruiter.name || 'Default Company Name From Post';
        recruiter.companyIndustryForJobs = recruiter.companyIndustryForJobs || 'Various From Post';
        const companyLogoForJob = recruiter.companyLogoUrl || recruiter.profileAvatarUrl || 'https://placehold.co/100x100.png';

        let videoOrImageUrlValue;
        let dataAiHintValue;

        if (req.file) {
            console.log(`[API Job Create] File received: ${req.file.originalname}, size: ${req.file.size}, type: ${req.file.mimetype}`);
             if (GCS_BUCKET_NAME === 'YOUR_GCS_BUCKET_NAME_HERE' || !GCS_BUCKET_NAME) {
                 const uploadsDir = path.join(__dirname, 'uploads', 'job-media');
                 if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

                 const originalFileName = req.file.originalname;
                 const fileExtension = path.extname(originalFileName);
                 const safeBaseName = path.basename(originalFileName, fileExtension).toLowerCase().replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
                 const localFileName = `job-${Date.now()}-${safeBaseName}${fileExtension}`;
                 const localFilePath = path.join(uploadsDir, localFileName);

                 fs.writeFileSync(localFilePath, req.file.buffer);
                 videoOrImageUrlValue = `/uploads/job-media/${localFileName}`;
                 dataAiHintValue = jobOpeningDataFromRequest.title ? jobOpeningDataFromRequest.title.substring(0,20) : 'job media local';
                 console.log(`[API Job Create] Media file saved locally: ${videoOrImageUrlValue}`);
            } else {
                const bucket = storageGCS.bucket(GCS_BUCKET_NAME);
                const originalFileName = req.file.originalname;
                const fileExtension = path.extname(originalFileName);
                const safeBaseName = path.basename(originalFileName, fileExtension).toLowerCase().replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
                const gcsObjectName = `job-media/${recruiter._id}/${Date.now()}-${safeBaseName}${fileExtension}`;
                const file = bucket.file(gcsObjectName);
                videoOrImageUrlValue = `https://storage.googleapis.com/${GCS_BUCKET_NAME}/${gcsObjectName}`;
                dataAiHintValue = jobOpeningDataFromRequest.title ? jobOpeningDataFromRequest.title.substring(0,20) : 'job media';

                console.log(`[API Job Create] Uploading job media to GCS: ${gcsObjectName}`);
                const stream = file.createWriteStream({ metadata: { contentType: req.file.mimetype, }, resumable: false });
                await new Promise((resolve, reject) => {
                    stream.on('error', reject);
                    stream.on('finish', resolve);
                    stream.end(req.file.buffer);
                }).catch(gcsErr => {
                    console.error('[API Job Create] GCS Upload Error:', gcsErr);
                    videoOrImageUrlValue = undefined;
                    dataAiHintValue = undefined;
                });
                 console.log(`[API Job Create] Media file uploaded to GCS: ${videoOrImageUrlValue}`);
            }
        } else if (jobOpeningDataFromRequest.videoOrImageUrl) {
            try {
                new URL(jobOpeningDataFromRequest.videoOrImageUrl);
                videoOrImageUrlValue = jobOpeningDataFromRequest.videoOrImageUrl;
            } catch (_) {
                console.warn(`[API Job Create] Invalid manual URL provided: ${jobOpeningDataFromRequest.videoOrImageUrl}`);
            }
            dataAiHintValue = jobOpeningDataFromRequest.dataAiHint || (jobOpeningDataFromRequest.title ? jobOpeningDataFromRequest.title.substring(0,20) : 'job media external');
        }


        const newJobSubdocument = {
            ...jobOpeningDataFromRequest,
            videoOrImageUrl: videoOrImageUrlValue,
            dataAiHint: dataAiHintValue,
            tags: jobOpeningDataFromRequest.actualTags || (jobOpeningDataFromRequest.tags ? jobOpeningDataFromRequest.tags.split(',').map(t => t.trim()).filter(t => t) : []),
            companyNameForJob: recruiter.companyNameForJobs,
            companyIndustryForJob: recruiter.companyIndustryForJobs,
            companyLogoForJob: companyLogoForJob,
            postedAt: new Date(),
            status: jobOpeningDataFromRequest.status || 'active',
        };

        recruiter.jobOpenings.push(newJobSubdocument);
        const updatedRecruiter = await recruiter.save();
        const postedJob = updatedRecruiter.jobOpenings[updatedRecruiter.jobOpenings.length - 1];
        console.log(`[API Job Create] Job "${postedJob.title}" created for recruiter ${recruiter._id}`);
        res.status(201).json({ message: 'Job posted successfully!', job: postedJob });
    } catch (error) {
        console.error("[API Job Create] Server error posting job:", error);
        res.status(500).json({ message: 'Server error posting job', error: error.message });
    }
});


// Get all jobs for a specific recruiter
app.get('/api/users/:userId/jobs', async (req, res) => {
    console.log(`[API /api/users/:userId/jobs Get] Request for user ${req.params.userId}`);
    try {
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format.' });
        }
        const user = await User.findById(userId).lean();
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const jobs = user.jobOpenings || [];
        res.status(200).json(jobs.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()));
    } catch (error) {
        console.error(`[API /api/users/:userId/jobs Get] Error fetching jobs for user ${req.params.userId}:`, error);
        res.status(500).json({ message: 'Server error fetching user jobs', error: error.message });
    }
});

// Update a specific job posting for a recruiter
app.post('/api/users/:userId/jobs/:jobId/update', async (req, res) => {
    console.log(`[API POST /api/users/:userId/jobs/:jobId/update] Request for user ${req.params.userId}, job ${req.params.jobId}. Body:`, JSON.stringify(req.body).substring(0,300) + "...");
    try {
        const { userId, jobId } = req.params;
        const updatedJobData = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: 'Invalid ID format.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        if (user.selectedRole !== 'recruiter') {
            return res.status(403).json({ message: 'Forbidden: Only recruiters can manage jobs.' });
        }

        const jobIndex = user.jobOpenings.findIndex(job => job._id.toString() === jobId);
        if (jobIndex === -1) {
            return res.status(404).json({ message: 'Job posting not found.' });
        }

        const allowedStatusUpdates = ['draft', 'active', 'paused', 'expired', 'filled', 'closed'];
        if (updatedJobData.status && !allowedStatusUpdates.includes(updatedJobData.status)) {
            return res.status(400).json({ message: 'Invalid job status provided.' });
        }

        Object.keys(updatedJobData).forEach(key => {
             if (key !== '_id' && key !== 'companyNameForJob' && key !== 'companyIndustryForJob' && key !== 'companyLogoForJob' && key !== 'postedAt') {
                user.jobOpenings[jobIndex][key] = updatedJobData[key];
             }
        });

        if (updatedJobData.actualTags && Array.isArray(updatedJobData.actualTags)) {
            user.jobOpenings[jobIndex].tags = updatedJobData.actualTags.map(tag => tag.trim()).filter(tag => tag);
        } else if (updatedJobData.tags && typeof updatedJobData.tags === 'string') {
            user.jobOpenings[jobIndex].tags = updatedJobData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }

        await user.save();
        console.log(`[API POST /api/users/:userId/jobs/:jobId/update] Job ${jobId} updated for user ${userId}.`);
        res.status(200).json({ message: 'Job updated successfully!', job: user.jobOpenings[jobIndex] });
    } catch (error) {
        console.error(`[API POST /api/users/:userId/jobs/:jobId/update] Error updating job ${req.params.jobId} for user ${req.params.userId}:`, error);
        res.status(500).json({ message: 'Server error updating job', error: error.message });
    }
});

// Delete a specific job posting for a recruiter
app.delete('/api/users/:userId/jobs/:jobId', async (req, res) => {
    console.log(`[API /api/users/:userId/jobs/:jobId Delete] Request for user ${req.params.userId}, job ${req.params.jobId}`);
    try {
        const { userId, jobId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: 'Invalid ID format.' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        if (user.selectedRole !== 'recruiter') {
            return res.status(403).json({ message: 'Forbidden: Only recruiters can manage jobs.' });
        }

        const result = await User.updateOne(
            { _id: userId },
            { $pull: { jobOpenings: { _id: jobId } } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'User not found (during update operation).' });
        }
        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Job posting not found for this user or already deleted.' });
        }
        console.log(`[API /api/users/:userId/jobs/:jobId Delete] Job ${jobId} deleted for user ${userId}.`);
        res.status(200).json({ message: 'Job posting deleted successfully.' });
    } catch (error) {
        console.error(`[API /api/users/:userId/jobs/:jobId Delete] Error deleting job ${req.params.jobId} for user ${req.params.userId}:`, error);
        res.status(500).json({ message: 'Server error deleting job', error: error.message });
    }
});


// Publicly accessible job listings
app.get('/api/jobs', async (req, res) => {
    console.log('[GET /api/jobs] Request received.');
    try {
        const queryConditions = {
            selectedRole: 'recruiter',
            'jobOpenings.0': { $exists: true },
            'jobOpenings.status': 'active'
        };
        console.log('[GET /api/jobs] Executing query for User model:', JSON.stringify(queryConditions));

        const usersWithJobs = await User.find(queryConditions).lean();
        console.log(`[GET /api/jobs] Found ${usersWithJobs.length} users matching criteria.`);

        if (usersWithJobs.length > 0) {
            console.log(`[GET /api/jobs] First raw document snippet: _id=${usersWithJobs[0]._id}, selectedRole=${usersWithJobs[0].selectedRole}, profileVisibility=${usersWithJobs[0].profileVisibility}`);
        }

        if (!usersWithJobs || usersWithJobs.length === 0) {
            console.log('[GET /api/jobs] No job seekers found matching criteria.');
            return res.json([]);
        }

        const allJobs = usersWithJobs.flatMap(user => {
            if (!user.jobOpenings || user.jobOpenings.length === 0) {
                console.log(`[GET /api/jobs] User ${user._id} has no jobOpenings array or it's empty.`);
                return [];
            }

            const activeUserJobs = user.jobOpenings.filter(job => job.status === 'active');
            if (activeUserJobs.length === 0) {
                 console.log(`[GET /api/jobs] User ${user._id} has jobOpenings, but none are currently 'active'. Count: ${user.jobOpenings.length}`);
                return [];
            }
            console.log(`[GET /api/jobs] User ${user._id} has ${activeUserJobs.length} active jobs. Processing them.`);

            return activeUserJobs.map(job => {
                const jobIdString = job._id ? job._id.toString() : `generated-${Math.random().toString(36).substring(2, 15)}`;
                const jobObject = job;

                const companyName = job.companyNameForJob || user.companyNameForJobs || user.name || 'Unknown Company';
                const companyIndustry = job.companyIndustryForJob || user.companyIndustryForJobs || 'Various';
                const companyLogo = job.companyLogoForJob || user.companyLogoUrl || user.profileAvatarUrl || 'https://placehold.co/100x100.png';

                return {
                    id: `comp-user-${user._id.toString()}-job-${jobIdString}`,
                    recruiterUserId: user._id.toString(),
                    name: companyName,
                    industry: companyIndustry,
                    description: `Job posting by ${user.name || 'a recruiter'}`,
                    cultureHighlights: job.companyCultureKeywords || [],
                    logoUrl: companyLogo,
                    dataAiHint: 'company logo',
                    jobOpenings: [{ ...jobObject, _id: jobIdString, postedAt: job.postedAt || new Date() }],
                    reputationScore: user.preferences?.featureFlags?.reputationScore || 80,
                    reputationGrade: "良好",
                    timelyReplyRate: 90,
                    commonRejectionReasons: ["經驗不符"],
                };
            });
        });

        allJobs.sort((a, b) => {
            const dateA = a.jobOpenings[0].postedAt ? new Date(a.jobOpenings[0].postedAt) : new Date(0);
            const dateB = b.jobOpenings[0].postedAt ? new Date(b.jobOpenings[0].postedAt) : new Date(0);
            return dateB.getTime() - dateA.getTime();
        });

        console.log(`[GET /api/jobs] Returning ${allJobs.length} active jobs to frontend.`);
        console.log("Conceptual: Tracked job listing view event for multiple jobs.");
        res.json(allJobs);
    } catch (error) {
        console.error("[API /api/jobs Get] Server error fetching jobs:", error);
        res.status(500).json({ message: 'Server error fetching jobs', error: error.message });
    }
});


// Proxy endpoints to avoid CORS issues
app.post('/api/proxy/users/:identifier/role', async (req, res) => {
  const { identifier } = req.params;
  console.log(`[API Proxy /api/proxy/users/:identifier/role Post] Forwarding request for ${identifier}. Body:`, JSON.stringify(req.body).substring(0,300) + "...");
  try {
    const internalResponse = await fetch(`http://localhost:${PORT}/api/users/${identifier}/update`, {
      method: 'POST', // Changed from PUT to POST
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const responseData = await internalResponse.json();
    if (!internalResponse.ok) {
      console.error(`[API Proxy /api/proxy/users/:identifier/role Post] Target responded with ${internalResponse.status}:`, responseData);
      return res.status(internalResponse.status).json(responseData);
    }
    res.status(internalResponse.status).json(responseData);
  } catch (error) {
    console.error(`[API Proxy /api/proxy/users/:identifier/role Post] Fetch error details:`, error.message, error.stack);
    res.status(500).json({ message: 'Proxy error while updating user role', errorDetails: error.message || 'Unknown proxy fetch error', errorStack: error.stack });
  }
});

app.post('/api/proxy/users/:identifier/settings', async (req, res) => {
  const { identifier } = req.params;
  console.log(`[API Proxy /api/proxy/users/:identifier/settings Post] Forwarding request for ${identifier}. Body:`, JSON.stringify(req.body).substring(0,300) + "...");
  try {
    // Ensure the internal call is to the correct, updated endpoint if User update was changed to POST and path adjusted
    const internalResponse = await fetch(`http://localhost:${PORT}/api/users/${identifier}/update`, {
      method: 'POST', // Changed from PUT to POST
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const responseData = await internalResponse.json();
    if (!internalResponse.ok) {
       console.error(`[API Proxy /api/proxy/users/:identifier/settings Post] Target responded with ${internalResponse.status}:`, responseData);
      return res.status(internalResponse.status).json(responseData);
    }
    res.status(internalResponse.status).json(responseData);
  } catch (error) {
    console.error(`[API Proxy /api/proxy/users/:identifier/settings Post] Fetch error details:`, error.message, error.stack);
    res.status(500).json({ message: 'Proxy error while updating user settings', errorDetails: error.message || 'Unknown proxy fetch error', errorStack: error.stack });
  }
});


// Endpoint to get jobseeker profiles (for recruiters)
app.get('/api/users/profiles/jobseekers', async (req, res) => {
    const { requesterRole, requesterId } = req.query;
    console.log(`[API /api/users/profiles/jobseekers] Request received. Requester role: ${requesterRole}, ID: ${requesterId}`);

    const query = {
        selectedRole: 'jobseeker',
        $or: [
            { profileVisibility: 'public' },
            { profileVisibility: { $exists: false } }
        ]
    };
    console.log('[API /api/users/profiles/jobseekers] Executing query:', JSON.stringify(query));
    try {
        const jobSeekerUsers = await User.find(query).lean();
        console.log(`[API /api/users/profiles/jobseekers] MongoDB query returned ${jobSeekerUsers.length} raw user documents.`);

        if (jobSeekerUsers.length > 0) {
            console.log(`[API /api/users/profiles/jobseekers] First raw document snippet: _id=${jobSeekerUsers[0]._id}, selectedRole=${jobSeekerUsers[0].selectedRole}, profileVisibility=${jobSeekerUsers[0].profileVisibility}`);
        }

        if (!jobSeekerUsers || jobSeekerUsers.length === 0) {
            console.log('[API /api/users/profiles/jobseekers] No job seekers found matching criteria.');
            return res.json([]);
        }

        const candidates = jobSeekerUsers.map(user => ({
            id: user._id.toString(),
            name: user.name || 'N/A',
            role: user.profileHeadline || 'Role not specified',
            experienceSummary: user.profileExperienceSummary || 'No summary available.',
            skills: user.profileSkills ? user.profileSkills.split(',').map(s => s.trim()).filter(s => s) : [],
            avatarUrl: user.profileAvatarUrl || `https://placehold.co/100x100.png?text=${encodeURIComponent(user.name ? user.name.charAt(0) : 'U')}`,
            dataAiHint: 'person portrait',
            videoResumeUrl: user.profileVideoPortfolioLink || undefined,
            profileStrength: Math.floor(Math.random() * 40) + 60,
            location: user.country || user.address || 'Location not specified',
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
            cardTheme: user.profileCardTheme || 'default',
        }));
        console.log(`[API /api/users/profiles/jobseekers] Mapped ${candidates.length} candidates for response.`);
        res.json(candidates);
    } catch (error) {
        console.error("[API /api/users/profiles/jobseekers] Server error:", error);
        res.status(500).json({ message: 'Server error while fetching jobseeker profiles', error: error.message });
    }
});


// --- Diary Posts ---
app.post('/api/diary-posts/upload-image', uploadDiaryImageMulter.single('diaryImage'), (req, res) => {
    console.log("[API /api/diary-posts/upload-image Post] Image upload request received.");
    if (!req.file) {
        return res.status(400).json({ message: 'No image file uploaded for diary post.' });
    }
    const imageUrl = `/uploads/diary/${req.file.filename}`;
    console.log(`[API /api/diary-posts/upload-image Post] Image uploaded, URL: ${imageUrl}`);
    res.json({ success: true, imageUrl: imageUrl });
});


app.post('/api/diary-posts', async (req, res) => {
    console.log("[API /api/diary-posts Post] Request received. Body:", JSON.stringify(req.body).substring(0,300) + "...");
    try {
        const { title, content, authorId, authorName, authorAvatarUrl, imageUrl, diaryImageHint, tags, isFeatured } = req.body;
        if (!title || !content || !authorId || !authorName) {
            return res.status(400).json({ message: 'Title, content, authorId, and authorName are required.' });
        }
        if (title.length > 200 || content.length > 5000) {
            return res.status(400).json({message: "Title or content too long."});
        }
        if (!mongoose.Types.ObjectId.isValid(authorId)) {
            return res.status(400).json({ message: 'Invalid authorId format.' });
        }
        const authorExists = await User.findById(authorId);
        if (!authorExists) {
            return res.status(404).json({ message: `User with ID ${authorId} not found.` });
        }

        const newPost = new DiaryPost({
            title, content, authorId, authorName, authorAvatarUrl,
            imageUrl, diaryImageHint, tags, isFeatured,
            status: 'approved'
        });
        await newPost.save();
        console.log(`[API /api/diary-posts Post] Diary post "${newPost.title}" created by ${authorName} (${authorId}).`);
        res.status(201).json(newPost);
    } catch (error) {
        console.error("[API /api/diary-posts Post] Server error:", error);
        res.status(500).json({ message: 'Server error creating diary post', error: error.message });
    }
});

app.get('/api/diary-posts', async (req, res) => {
    console.log("[API /api/diary-posts Get] Request received.");
    try {
        const posts = await DiaryPost.find({ status: 'approved' }).sort({ createdAt: -1 });
        console.log(`[API /api/diary-posts Get] Fetched ${posts.length} approved diary posts.`);
        res.json(posts);
    } catch (error) {
        console.error("[API /api/diary-posts Get] Server error:", error);
        res.status(500).json({ message: 'Server error fetching diary posts', error: error.message });
    }
});

app.put('/api/diary-posts/:postId/comments/:commentId', async (req, res) => {
    console.log(`[API Comment Update] PostID: ${req.params.postId}, CommentID: ${req.params.commentId}, UserID: ${req.body.userId}`);
    try {
        const { postId, commentId } = req.params;
        const { userId, text } = req.body;

        if (!userId || !text || text.trim() === '') {
            return res.status(400).json({ message: 'User ID and comment text are required.' });
        }
        if (text.length > 1000) {
            return res.status(400).json({message: "Comment too long."});
        }
        if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(commentId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid ID format.' });
        }

        const post = await DiaryPost.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Diary post not found.' });
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        if (comment.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Forbidden: You can only edit your own comments.' });
        }

        comment.text = text.trim();
        comment.timestamp = new Date();
        await post.save();
        console.log(`[API Comment Update] Comment ${commentId} on post ${postId} updated.`);
        res.json(post);
    } catch (error) {
        console.error("Error updating diary comment:", error);
        res.status(500).json({ message: 'Server error updating comment.', error: error.message });
    }
});

app.delete('/api/diary-posts/:postId/comments/:commentId', async (req, res) => {
    console.log(`[API Comment Delete] PostID: ${req.params.postId}, CommentID: ${req.params.commentId}, UserID: ${req.body.userId}`);
    try {
        const { postId, commentId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }
        if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(commentId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid ID format.' });
        }

        const post = await DiaryPost.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Diary post not found.' });
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        if (comment.userId.toString() !== userId && post.authorId.toString() !== userId ) {
            return res.status(403).json({ message: 'Forbidden: Not authorized to delete this comment.' });
        }

        post.comments.pull({ _id: commentId });
        post.commentsCount = Math.max(0, (post.commentsCount || 0) - 1);
        await post.save();
        console.log(`[API Comment Delete] Comment ${commentId} on post ${postId} deleted.`);
        res.json(post);
    } catch (error) {
        console.error("Error deleting diary comment:", error);
        res.status(500).json({ message: 'Server error deleting comment.', error: error.message });
    }
});


app.post('/api/diary-posts/:postId/comments', async (req, res) => {
    console.log(`[API Comment Create] PostID: ${req.params.postId}, UserID: ${req.body.userId}`);
    try {
        const { postId } = req.params;
        const { userId, userName, userAvatarUrl, text } = req.body;

        if (!userId || !userName || !text) {
            return res.status(400).json({ message: 'User ID, user name, and comment text are required.' });
        }
        if (text.length > 1000) {
            return res.status(400).json({message: "Comment too long."});
        }
        if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid ID format for post or user.' });
        }

        const post = await DiaryPost.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Diary post not found.' });
        }
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({ message: `Commenting user with ID ${userId} not found.` });
        }

        const newComment = {
            userId: new mongoose.Types.ObjectId(userId),
            userName: userName,
            userAvatarUrl: userAvatarUrl || 'https://placehold.co/40x40.png',
            text: text,
            timestamp: new Date()
        };

        post.comments.push(newComment);
        post.commentsCount = (post.commentsCount || 0) + 1;
        await post.save();
        console.log(`[API Comment Create] Comment added to post ${postId} by user ${userId}.`);
        res.status(201).json(post);
    } catch (error) {
        console.error("Error adding comment to diary post:", error);
        res.status(500).json({ message: 'Server error adding comment.', error: error.message });
    }
});

app.post('/api/diary-posts/:postId/like', async (req, res) => {
    console.log(`[API Post Like] PostID: ${req.params.postId}, UserID: ${req.body.userId}`);
    try {
        const { postId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'userId is required.' });
        }
        if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid ID format.' });
        }

        const post = await DiaryPost.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

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
        console.log(`[API Post Like] Like status toggled for post ${postId} by user ${userId}. New likes: ${post.likes}`);
        res.json(post);
    } catch (error) {
        console.error("[API /api/diary-posts/:postId/like Post] Server error:", error);
        res.status(500).json({ message: 'Server error liking post', error: error.message });
    }
});

// --- Matches & Interactions ---
app.post('/api/interactions/like', async (req, res) => {
    console.log("[API /api/interactions/like Post] Like request received. Body:", JSON.stringify(req.body).substring(0,300) + "...");
    try {
        const { likingUserId, likedProfileId, likedProfileType, likingUserRole, likingUserRepresentsCandidateId, likingUserRepresentsCompanyId, jobOpeningTitle } = req.body;

        if (!likingUserId || !likedProfileId || !likedProfileType || !likingUserRole) {
            return res.status(400).json({ message: "Missing required fields." });
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

        if (likedProfileType === 'candidate') {
            if (!mongoose.Types.ObjectId.isValid(likedProfileId)) return res.status(400).json({ message: "Invalid candidate profile ID (should be User _id)." });
            otherUser = await User.findById(likedProfileId);
        } else if (likedProfileType === 'company') {
             if (!mongoose.Types.ObjectId.isValid(likedProfileId)) {
                return res.status(400).json({ message: "Invalid company/recruiter profile ID (should be User _id)." });
             } else {
                otherUser = await User.findById(likedProfileId);
             }
        }

        if (!otherUser) {
            return res.status(404).json({ message: "Liked profile's owner (user or recruiter) not found." });
        }

        const userA_Id = likingUser._id.toString() < otherUser._id.toString() ? likingUser._id : otherUser._id;
        const userB_Id = likingUser._id.toString() < otherUser._id.toString() ? otherUser._id : likingUser._id;
        const uniqueMatchKey = `${userA_Id.toString()}-${userB_Id.toString()}`;


        if (likingUserRole === 'recruiter' && likedProfileType === 'candidate') {
            if (!likingUser.likedCandidateIds.includes(likedProfileId)) {
                likingUser.likedCandidateIds.push(likedProfileId);
            }
            if (otherUser.likedCompanyIds.includes(likingUser._id.toString())) {
                matchMade = true;
            }
        } else if (likingUserRole === 'jobseeker' && likedProfileType === 'company') {
            if (!likingUser.likedCompanyIds.includes(likedProfileId)) {
                likingUser.likedCompanyIds.push(likedProfileId);
            }
            if (otherUser.likedCandidateIds.includes(likingUser._id.toString())) {
                matchMade = true;
            }
        } else {
            return res.status(400).json({ message: "Invalid role/profile type combination." });
        }

        await likingUser.save();
        console.log(`[API /api/interactions/like Post] Like recorded for user ${likingUserId} on profile ${likedProfileId}. Match made: ${matchMade}`);

        if (matchMade) {
            const existingMatch = await Match.findOne({ uniqueMatchKey: uniqueMatchKey });
            const currentTimestamp = new Date();

            if (!existingMatch) {
                let candidateDisplayIdForMatch, companyDisplayIdForMatch;
                if (likingUser.selectedRole === 'jobseeker') {
                    candidateDisplayIdForMatch = likingUser.representedCandidateProfileId || likingUser._id.toString();
                    companyDisplayIdForMatch = otherUser.representedCompanyProfileId || otherUser._id.toString();
                } else { // likingUser is recruiter
                    candidateDisplayIdForMatch = otherUser.representedCandidateProfileId || otherUser._id.toString();
                    companyDisplayIdForMatch = likingUser.representedCompanyProfileId || likingUser._id.toString();
                }
                const newMatch = new Match({
                    userA_Id, userB_Id,
                    candidateProfileIdForDisplay: candidateDisplayIdForMatch,
                    companyProfileIdForDisplay: companyDisplayIdForMatch,
                    jobOpeningTitle: jobOpeningTitle || "General Interest",
                    applicationTimestamp: currentTimestamp, // Set for new matches
                    uniqueMatchKey,
                    status: 'active',
                     applicationStatusHistory: [{
                        stage: 'Submitted',
                        timestamp: currentTimestamp.toISOString(),
                        description: "Mutual interest established.",
                    }],
                });
                await newMatch.save();
                newMatchDetails = newMatch;
                console.log(`[API /api/interactions/like Post] New match created: ${newMatch._id}`);
                await notificationService.createAndStoreNotification(userA_Id.toString(), 'new_match', 'New Mutual Match!', `You've matched with ${userB_Id.equals(likingUser._id) ? likingUser.name : otherUser.name}.`, `/matches/${newMatch._id}`);
                await notificationService.createAndStoreNotification(userB_Id.toString(), 'new_match', 'New Mutual Match!', `You've matched with ${userA_Id.equals(likingUser._id) ? likingUser.name : otherUser.name}.`, `/matches/${newMatch._id}`);
            } else {
                existingMatch.status = 'active'; // Ensure it's active
                if (!existingMatch.applicationTimestamp) existingMatch.applicationTimestamp = currentTimestamp; // Set if missing
                if (!existingMatch.jobOpeningTitle && jobOpeningTitle) existingMatch.jobOpeningTitle = jobOpeningTitle; // Set if missing and provided

                if (!existingMatch.applicationStatusHistory.find(h => h.description === "Mutual interest established.")) {
                    existingMatch.applicationStatusHistory.push({
                        stage: 'Submitted',
                        timestamp: currentTimestamp.toISOString(),
                        description: "Mutual interest established.",
                    });
                }
                await existingMatch.save();
                newMatchDetails = existingMatch;
                console.log(`[API /api/interactions/like Post] Match updated: ${existingMatch._id}`);
            }
        }
        res.status(200).json({ success: true, message: "Like recorded.", matchMade, matchDetails: newMatchDetails });
    } catch (error) {
        console.error("[API /api/interactions/like Post] Server error:", error);
        res.status(500).json({ message: 'Server error recording like.', error: error.message });
    }
});

app.get('/api/matches/:userId', async (req, res) => {
    console.log(`[API /api/matches/:userId Get] Request for user ${req.params.userId}`);
    try {
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid userId." });
        }
        const userObjectId = new mongoose.Types.ObjectId(userId);

        const matchesRaw = await Match.find({
            $or: [{ userA_Id: userObjectId }, { userB_Id: userObjectId }],
            status: 'active'
        })
        .populate({ path: 'userA_Id', select: 'name selectedRole profileAvatarUrl companyName companyIndustry logoUrl profileHeadline representedCandidateProfileId representedCompanyProfileId' })
        .populate({ path: 'userB_Id', select: 'name selectedRole profileAvatarUrl companyName companyIndustry logoUrl profileHeadline representedCandidateProfileId representedCompanyProfileId' })
        .sort({ matchedAt: -1 })
        .lean(); 

        console.log(`[API /api/matches/:userId Get] Found ${matchesRaw.length} raw active matches for user ${userId}.`);

        const processedMatches = matchesRaw.map(match => {
            const userA = match.userA_Id;
            const userB = match.userB_Id;
            let candidateUser, companyUser, candidateProfileId, companyProfileId;

            if (userA.selectedRole === 'jobseeker' && userB.selectedRole === 'recruiter') {
                candidateUser = userA;
                companyUser = userB;
                candidateProfileId = userA.representedCandidateProfileId || userA._id.toString();
                companyProfileId = userB.representedCompanyProfileId || userB._id.toString();
            } else if (userB.selectedRole === 'jobseeker' && userA.selectedRole === 'recruiter') {
                candidateUser = userB;
                companyUser = userA;
                candidateProfileId = userB.representedCandidateProfileId || userB._id.toString();
                companyProfileId = userA.representedCompanyProfileId || userA._id.toString();
            } else {
                console.warn(`[API /api/matches/:userId Get] Ambiguous roles for match ${match._id}. User A: ${userA.selectedRole}, User B: ${userB.selectedRole}. Assigning based on who is the requester.`);
                if (userA._id.equals(userObjectId) && userA.selectedRole === 'jobseeker') { 
                    candidateUser = userA; companyUser = userB;
                    candidateProfileId = userA.representedCandidateProfileId || userA._id.toString();
                    companyProfileId = userB.representedCompanyProfileId || userB._id.toString();
                } else if (userB._id.equals(userObjectId) && userB.selectedRole === 'jobseeker') { 
                    candidateUser = userB; companyUser = userA;
                    candidateProfileId = userB.representedCandidateProfileId || userB._id.toString();
                    companyProfileId = userA.representedCompanyProfileId || userA._id.toString();
                } else if (userA._id.equals(userObjectId) && userA.selectedRole === 'recruiter') { 
                    companyUser = userA; candidateUser = userB;
                    companyProfileId = userA.representedCompanyProfileId || userA._id.toString();
                    candidateProfileId = userB.representedCandidateProfileId || userB._id.toString();
                } else { 
                    companyUser = userB; candidateUser = userA;
                    companyProfileId = userB.representedCompanyProfileId || userB._id.toString();
                    candidateProfileId = userA.representedCandidateProfileId || userA._id.toString();
                }
            }

            return {
                ...match,
                candidate: {
                    id: candidateUser._id.toString(),
                    name: candidateUser.name || 'Candidate Name',
                    role: candidateUser.profileHeadline || 'Candidate Role',
                    avatarUrl: candidateUser.profileAvatarUrl || 'https://placehold.co/100x100.png?text=C',
                },
                company: {
                    id: companyUser._id.toString(),
                    name: companyUser.companyName || companyUser.name || 'Company Name',
                    industry: companyUser.companyIndustry || 'Company Industry',
                    logoUrl: companyUser.logoUrl || companyUser.profileAvatarUrl || 'https://placehold.co/100x100.png?text=Co',
                    cultureHighlights: companyUser.companyCultureHighlights || [],
                    description: companyUser.companyDescription || 'Company Description',
                },
                candidateProfileIdForDisplay: candidateProfileId,
                companyProfileIdForDisplay: companyProfileId,
            };
        });

        console.log(`[API /api/matches/:userId Get] Processed ${processedMatches.length} matches for response for user ${userId}.`);
        res.status(200).json(processedMatches);
    } catch (error) {
        console.error(`[API /api/matches/:userId Get] Error fetching matches for user ${req.params.userId}:`, error);
        res.status(500).json({ message: 'Server error fetching matches.', error: error.message });
    }
});

app.post('/api/matches/:matchId/archive', async (req, res) => {
    console.log(`[API Match Archive] Request for match ${req.params.matchId}, archiving user: ${req.body.archivingUserId}`);
    try {
        const { matchId } = req.params;
        const { archivingUserId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(matchId) || !mongoose.Types.ObjectId.isValid(archivingUserId)) {
            return res.status(400).json({ message: 'Invalid matchId or archivingUserId.' });
        }

        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(404).json({ message: 'Match not found.' });
        }

        const archivingUserObjectId = new mongoose.Types.ObjectId(archivingUserId);
        if (match.userA_Id.equals(archivingUserObjectId)) {
            if (match.status === 'active') match.status = 'archived_by_A';
            else if (match.status === 'archived_by_B') match.status = 'archived_by_both';
        } else if (match.userB_Id.equals(archivingUserObjectId)) {
            if (match.status === 'active') match.status = 'archived_by_B';
            else if (match.status === 'archived_by_A') match.status = 'archived_by_both';
        } else {
            return res.status(403).json({ message: 'User not part of this match.' });
        }

        await match.save();
        console.log(`[API Match Archive] Match ${matchId} archived. New status: ${match.status}`);
        res.status(200).json({ message: 'Match archived successfully.', match });
    } catch (error) {
        console.error('Error archiving match:', error);
        res.status(500).json({ message: 'Server error archiving match.', error: error.message });
    }
});


app.post('/api/users/:userId/pass-candidate/:candidateId', async (req, res) => {
    const { userId, candidateId } = req.params;
    console.log(`[API Pass Candidate] User ${userId} passing candidate ${candidateId}`);
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: 'Invalid user ID.' });
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        if (!user.passedCandidateProfileIds.includes(candidateId)) {
            user.passedCandidateProfileIds.push(candidateId);
            await user.save();
        }
        res.status(200).json({ message: 'Candidate passed successfully.', passedCandidateProfileIds: user.passedCandidateProfileIds });
    } catch (error) {
        console.error(`[API /api/users/:userId/pass-candidate/:candidateId Post] Server error:`, error);
        res.status(500).json({ message: 'Server error passing candidate.', error: error.message });
    }
});

app.post('/api/users/:userId/pass-company/:companyId', async (req, res) => {
    const { userId, companyId } = req.params;
    console.log(`[API Pass Company] User ${userId} passing company ${companyId}`);
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: 'Invalid user ID.' });
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        if (!user.passedCompanyProfileIds.includes(companyId)) {
            user.passedCompanyProfileIds.push(companyId);
            await user.save();
        }
        res.status(200).json({ message: 'Company passed successfully.', passedCompanyProfileIds: user.passedCompanyProfileIds });
    } catch (error) {
        console.error(`[API /api/users/:userId/pass-company/:companyId Post] Server error:`, error);
        res.status(500).json({ message: 'Server error passing company.', error: error.message });
    }
});

app.post('/api/users/:userId/retrieve-candidate/:candidateId', async (req, res) => {
    const { userId, candidateId } = req.params;
    console.log(`[API Retrieve Candidate] User ${userId} retrieving candidate ${candidateId}`);
     if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: 'Invalid user ID.' });
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        user.passedCandidateProfileIds = user.passedCandidateProfileIds.filter(id => id !== candidateId);
        await user.save();
        res.status(200).json({ message: 'Candidate retrieved successfully.', passedCandidateProfileIds: user.passedCandidateProfileIds });
    } catch (error) {
        console.error(`[API /api/users/:userId/retrieve-candidate/:candidateId Post] Server error:`, error);
        res.status(500).json({ message: 'Server error retrieving candidate.', error: error.message });
    }
});

app.post('/api/users/:userId/retrieve-company/:companyId', async (req, res) => {
    const { userId, companyId } = req.params;
    console.log(`[API Retrieve Company] User ${userId} retrieving company ${companyId}`);
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: 'Invalid user ID.' });
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        user.passedCompanyProfileIds = user.passedCompanyProfileIds.filter(id => id !== companyId);
        await user.save();
        res.status(200).json({ message: 'Company retrieved successfully.', passedCompanyProfileIds: user.passedCompanyProfileIds });
    } catch (error) {
        console.error(`[API /api/users/:userId/retrieve-company/:companyId Post] Server error:`, error);
        res.status(500).json({ message: 'Server error retrieving company.', error: error.message });
    }
});


// --- Chat Messages ---
app.post('/api/matches/:matchId/messages', async (req, res) => {
    console.log(`[API Message Create] MatchID: ${req.params.matchId}, SenderID: ${req.body.senderId}`);
    try {
        const { matchId } = req.params;
        const { senderId, receiverId, text } = req.body;

        if (!mongoose.Types.ObjectId.isValid(matchId) || !mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ message: 'Invalid ID.' });
        }
        if (!text || text.trim() === '' || text.length > 2000) {
            return res.status(400).json({ message: 'Message text cannot be empty or too long.' });
        }

        const match = await Match.findById(matchId);
        if (!match) return res.status(404).json({ message: 'Match not found.' });

        const matchUserIds = [match.userA_Id.toString(), match.userB_Id.toString()];
        if (!matchUserIds.includes(senderId) || !matchUserIds.includes(receiverId) || senderId === receiverId) {
            return res.status(400).json({ message: 'Invalid sender/receiver for this match.' });
        }

        const senderUser = await User.findById(senderId);
        if (!senderUser) return res.status(404).json({ message: 'Sender user not found.' });


        const newMessage = new ChatMessage({
            matchId, senderId, receiverId, text: text.trim(), read: false,
        });
        await newMessage.save();

        await notificationService.createAndStoreNotification(
            receiverId, 'new_message', `New message from ${senderUser.name}`,
            text.trim().substring(0, 50) + (text.trim().length > 50 ? '...' : ''),
            `/matches/${matchId}`
        );

        const roomName = `chat-${matchId}`;
        const savedMessageWithId = { ...newMessage.toObject(), id: newMessage._id.toString() };
        io.to(roomName).emit('newMessage', savedMessageWithId);
        console.log(`[Socket.io] Emitted 'newMessage' to room ${roomName}:`, newMessage._id);

        res.status(201).json(savedMessageWithId);
    } catch (error) {
        console.error("Error creating chat message:", error);
        res.status(500).json({ message: 'Server error creating chat message.', error: error.message });
    }
});

app.get('/api/matches/:matchId/messages', async (req, res) => {
    console.log(`[API Message Get] MatchID: ${req.params.matchId}`);
    try {
        const { matchId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(matchId)) {
            return res.status(400).json({ message: 'Invalid matchId.' });
        }
        const messages = await ChatMessage.find({ matchId }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error(`[API /api/matches/:matchId/messages Get] Error fetching messages for match ${req.params.matchId}:`, error);
        res.status(500).json({ message: 'Server error fetching messages.', error: error.message });
    }
});

// --- Company Reviews ---
app.post('/api/reviews/company', async (req, res) => {
    console.log("[API Company Review Create] Request received. Body:", JSON.stringify(req.body).substring(0,300) + "...");
    try {
        const { companyId, jobId, reviewerUserId, responsivenessRating, attitudeRating, processExperienceRating, comments, isAnonymous } = req.body;

        if (!companyId || !reviewerUserId || responsivenessRating === undefined || attitudeRating === undefined || processExperienceRating === undefined || !comments) {
            return res.status(400).json({ message: 'Missing required review fields.' });
        }
        if (!mongoose.Types.ObjectId.isValid(companyId) || !mongoose.Types.ObjectId.isValid(reviewerUserId)) {
            return res.status(400).json({ message: 'Invalid ID format for company or reviewer.' });
        }

        const newReview = new CompanyReview({
            companyId, jobId, reviewerUserId, responsivenessRating,
            attitudeRating, processExperienceRating, comments, isAnonymous,
            timestamp: new Date(),
        });
        await newReview.save();
        console.log(`[API Company Review Create] Review submitted for company ${companyId} by user ${reviewerUserId}.`);
        res.status(201).json({ success: true, message: 'Review submitted successfully!', review: newReview });
    } catch (error) {
        console.error('Error submitting company review:', error);
        res.status(500).json({ success: false, message: 'Server error submitting review.', error: error.message });
    }
});

app.get('/api/reviews/company/:companyUserId', async (req, res) => {
    console.log(`[API Company Review Get] Request for company user ID: ${req.params.companyUserId}`);
    try {
        const { companyUserId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(companyUserId)) {
            return res.status(400).json({ message: 'Invalid company user ID format.' });
        }
        const reviews = await CompanyReview.find({ companyId: companyUserId }).sort({ timestamp: -1 });
        console.log(`[API Company Review Get] Found ${reviews.length} reviews for company user ${companyUserId}.`);
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching company reviews:', error);
        res.status(500).json({ message: 'Server error fetching company reviews.', error: error.message });
    }
});

app.get('/api/reviews/company/:companyUserId/summary', async (req, res) => {
    console.log(`[API Company Review Summary Get] Request for company user ID: ${req.params.companyUserId}`);
    try {
        const { companyUserId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(companyUserId)) {
            return res.status(400).json({ message: 'Invalid company user ID format.' });
        }
        const reviews = await CompanyReview.find({ companyId: companyUserId });
        if (reviews.length === 0) {
            return res.json({ averageResponsiveness: 0, averageAttitude: 0, averageProcessExperience: 0, totalReviews: 0 });
        }

        const totalReviews = reviews.length;
        const sumResponsiveness = reviews.reduce((sum, r) => sum + r.responsivenessRating, 0);
        const sumAttitude = reviews.reduce((sum, r) => sum + r.attitudeRating, 0);
        const sumProcessExperience = reviews.reduce((sum, r) => sum + r.processExperienceRating, 0);

        const summary = {
            averageResponsiveness: parseFloat((sumResponsiveness / totalReviews).toFixed(1)),
            averageAttitude: parseFloat((sumAttitude / totalReviews).toFixed(1)),
            averageProcessExperience: parseFloat((sumProcessExperience / totalReviews).toFixed(1)),
            totalReviews,
        };
        console.log(`[API Company Review Summary Get] Summary for company user ${companyUserId}:`, summary);
        res.json(summary);
    } catch (error) {
        console.error('Error fetching company review summary:', error);
        res.status(500).json({ message: 'Server error fetching review summary.', error: error.message });
    }
});


// Proxy AI Request
app.post('/api/proxy-ai/icebreaker', async (req, res) => {
    try {
        console.log('[Express /api/proxy-ai/icebreaker] Received request with body:', req.body);
        const nextJsApiUrl = `${NEXTJS_APP_URL}/api/ai/generate-icebreaker`;

        const aiResponse = await fetch(nextJsApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify(req.body),
        });

        const responseData = await aiResponse.json();

        if (!aiResponse.ok) {
            console.error(`[Express /api/proxy-ai/icebreaker] Error from Next.js API (${aiResponse.status}):`, responseData);
            return res.status(aiResponse.status).json(responseData);
        }
        console.log('[Express /api/proxy-ai/icebreaker] Successfully received response from Next.js API:', responseData);
        res.status(200).json(responseData);
    } catch (error) {
        console.error('[Express /api/proxy-ai/icebreaker] Error proxying AI request:', error);
        res.status(500).json({ message: 'Server error proxying AI request', error: error.message });
    }
});


// Socket.IO Connection Handling
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
    if (readerUserId !== connectedUserId) {
      console.warn(`[Socket.io ReadReceipt] Mismatch: readerUserId ${readerUserId} does not match connectedUserId ${connectedUserId}. Aborting.`);
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
.then(() => {
    console.log(`Connected to MongoDB at ${MONGO_URI.replace(/:[^:]+@/, ':****@')}`);
    console.log("Conceptual: Ensure database indexes are created for fields like User.firebaseUid, User.email, DiaryPost.authorId, ChatMessage.matchId, etc., for performance.");
})
.catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

console.log("Reminder: Ensure regular database backups are configured.");
console.log("Reminder: For schema changes in production, use a data migration tool.");
console.log("Conceptual: Add Helmet.js for various HTTP security headers in production.");
console.log("Conceptual: Implement a global error handling middleware for consistent error responses and logging.");
console.log("Reminder: If adding email/password auth, use strong hashing (bcrypt/argon2) for passwords.");
console.log("Conceptual: Implement API rate limiting (e.g., with express-rate-limit) to prevent abuse.");
console.log("Conceptual: Set up comprehensive logging and monitoring for production.");

server.listen(PORT, () => {
    console.log(`SwipeHire Backend Server with WebSocket support running on http://localhost:${PORT}`);
    console.log(`CORS configuration for HTTP routes based on allowedOrigins. Socket.IO CORS is currently permissive ("*") for debugging.`);
    console.log(`Express backend will attempt to call Next.js AI flows at: ${NEXTJS_APP_URL}/api/ai/...`);
    console.log("Reminder: Ensure HTTPS is configured in production for secure communication.");
});

