
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

const app = express();
const server = http.createServer(app); // Create HTTP server from Express app

const PORT = process.env.PORT || 5000;

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

const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, uploadsDir); },
    filename: function (req, file, cb) {
        const fileExtension = path.extname(file.originalname);
        const safeBaseName = path.basename(file.originalname, fileExtension).toLowerCase().replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
        const finalFilename = Date.now() + '-' + (safeBaseName || 'uploaded_file') + fileExtension;
        cb(null, finalFilename);
    }
});
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) { cb(null, true); }
    else { cb(new Error('Not an image! Please upload only images.'), false); }
};
const upload = multer({ storage: storage, fileFilter: imageFileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

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
            companyNameForJobs: selectedRole === 'recruiter' ? name : undefined, // Set default company name for recruiter
            companyIndustryForJobs: selectedRole === 'recruiter' ? 'Various' : undefined // Set default company industry
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

app.post('/api/users/:identifier/avatar', upload.single('avatar'), async (req, res) => {
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
        // If recruiter and company name for jobs is not set, default it from user's name
        if (userToUpdate.selectedRole === 'recruiter' && !userToUpdate.companyNameForJobs) {
            userToUpdate.companyNameForJobs = userToUpdate.name;
        }
        if (userToUpdate.selectedRole === 'recruiter' && !userToUpdate.companyIndustryForJobs) {
            userToUpdate.companyIndustryForJobs = 'Various'; // Default industry
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
        // If updating to recruiter and company fields are not provided, set defaults
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
        const jobOpeningData = req.body; // This should be the CompanyJobOpening object

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

        // Populate company details for the job from the recruiter's profile
        const newJob = {
            ...jobOpeningData,
            companyNameForJob: recruiter.companyNameForJobs || recruiter.name,
            companyLogoForJob: recruiter.profileAvatarUrl, // Use recruiter's avatar as company logo for now
            companyIndustryForJob: recruiter.companyIndustryForJobs || 'Various',
        };

        recruiter.jobOpenings.push(newJob);
        await recruiter.save();
        
        // Return only the newly added job opening, which is the last one in the array
        const postedJob = recruiter.jobOpenings[recruiter.jobOpenings.length - 1];
        res.status(201).json({ message: 'Job posted successfully!', job: postedJob });

    } catch (error) {
        res.status(500).json({ message: 'Server error posting job', error: error.message });
    }
});

// GET all job openings from all recruiters
app.get('/api/jobs', async (req, res) => {
    try {
        const recruiters = await User.find({ selectedRole: 'recruiter', 'jobOpenings.0': { $exists: true } });
        
        const allJobs = recruiters.flatMap(recruiter => {
            return recruiter.jobOpenings.map(job => ({
                // This structure mimics a 'Company' object for the JobDiscoveryPage
                id: `comp-user-${recruiter._id.toString()}-job-${job._id.toString()}`, // Unique ID for the "company-job" context
                name: job.companyNameForJob || recruiter.name,
                industry: job.companyIndustryForJob || recruiter.companyIndustryForJobs || 'Various',
                description: `Job posting by ${recruiter.name}`, // Generic company description
                cultureHighlights: job.companyCultureKeywords || [],
                logoUrl: job.companyLogoForJob || recruiter.profileAvatarUrl || 'https://placehold.co/100x100.png',
                dataAiHint: 'company logo', // Placeholder
                jobOpenings: [{ ...job.toObject(), _id: job._id.toString() }], // Ensure job has its own _id as string
                // Other company fields (introVideoUrl, companyNeeds) can be added if available on User model
            }));
        });
        
        res.json(allJobs);
    } catch (error) {
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
            // A 'company' like is a like on a job posting, which is owned by a recruiter user.
            // We need to find the recruiter User who posted the job represented by 'likedProfileId' (which is a composite company-job ID)
            // For now, let's assume likedProfileId for a company will be the mongoDbUserId of the recruiter.
            // Or, if it's a `comp-user-` type ID, we need a way to map that back.
            // This part needs refinement based on how `likedProfileId` for companies is structured.
            // For this iteration, if likedProfileType is 'company', likedProfileId is expected to be the User._id of the recruiter.
             if (!mongoose.Types.ObjectId.isValid(likedProfileId)) { // If likedProfileId is NOT a mongo ObjectId
                console.warn(`[Like Interaction] likedProfileId for company is not a Mongo ObjectId: ${likedProfileId}. Attempting lookup by representedCompanyProfileId (if that was the intent). This path might need review for job postings.`);
                // This logic path is tricky if 'likedProfileId' is a mock company ID like 'comp1'
                // and not the recruiter's User._id.
                // For jobs now stored in User.jobOpenings, the "company" is the recruiter User.
                // So, `likedProfileId` *should* be the recruiter's `User._id`
                // or an ID that resolves to the recruiter's `User._id`.
                // Let's assume for now that `likedProfileId` for a "company" (job) will be the User ID of the recruiter.
                 otherUser = await User.findById(likedProfileId); // Assuming likedProfileId for company IS the recruiter's User ID
             } else {
                otherUser = await User.findById(likedProfileId);
             }
        }

        if (!otherUser) return res.status(404).json({ message: "Liked profile's owner (user or recruiter) not found." });

        if (likingUserRole === 'recruiter' && likedProfileType === 'candidate') {
            // Recruiter likes a candidate. 'likedProfileId' is the candidate's User._id
            if (!likingUser.likedCandidateIds.includes(likedProfileId)) likingUser.likedCandidateIds.push(likedProfileId);
            // Check if candidate (otherUser) has liked this recruiter's "company"
            // The recruiter's "company" is represented by their own User._id in this simplified model
            if (otherUser.likedCompanyIds.includes(likingUser._id.toString())) matchMade = true;

        } else if (likingUserRole === 'jobseeker' && likedProfileType === 'company') {
            // Job seeker likes a company (job posting by a recruiter). 'likedProfileId' is the recruiter's User._id
            if (!likingUser.likedCompanyIds.includes(likedProfileId)) likingUser.likedCompanyIds.push(likedProfileId);
            // Check if recruiter (otherUser) has liked this job seeker (likingUser)
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
                // Determine who is candidate and who represents company for display purposes.
                // This uses the MongoDB _id as the primary display identifier now.
                if (likingUser.selectedRole === 'jobseeker') {
                    candidateDisplayIdForMatch = likingUser._id.toString(); // Job seeker's own ID
                    companyDisplayIdForMatch = otherUser._id.toString();   // Recruiter's User ID (representing the company)
                } else { // likingUser is recruiter
                    candidateDisplayIdForMatch = otherUser._id.toString();   // Candidate's User ID
                    companyDisplayIdForMatch = likingUser._id.toString();  // Recruiter's own User ID
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


    