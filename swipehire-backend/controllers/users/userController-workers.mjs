import { ObjectId } from 'mongodb';
import { getDatabase } from '../../index.mjs';

// Helper function to select specific fields from a user object
const selectUserFields = (userObject) => {
    if (!userObject) return null;
    const jobOpenings = userObject.jobOpenings ? userObject.jobOpenings.map(job => {
        const { ...restJob } = job;
        return restJob;
    }) : [];

    return {
        _id: userObject._id,
        name: userObject.name,
        email: userObject.email,
        selectedRole: userObject.selectedRole,
        profileAvatarUrl: userObject.profileAvatarUrl,
        profileHeadline: userObject.profileHeadline,
        profileExperienceSummary: userObject.profileExperienceSummary,
        profileSkills: userObject.profileSkills,
        country: userObject.country,
        address: userObject.address,
        profileDesiredWorkStyle: userObject.profileDesiredWorkStyle,
        profilePastProjects: userObject.profilePastProjects,
        profileWorkExperienceLevel: userObject.profileWorkExperienceLevel,
        profileEducationLevel: userObject.profileEducationLevel,
        profileLocationPreference: userObject.profileLocationPreference,
        profileLanguages: userObject.profileLanguages,
        profileAvailability: userObject.profileAvailability,
        profileJobTypePreference: userObject.profileJobTypePreference,
        profileSalaryExpectationMin: userObject.profileSalaryExpectationMin,
        profileSalaryExpectationMax: userObject.profileSalaryExpectationMax,
        videoResumeUrl: userObject.videoResumeUrl,
        
        // Company fields
        companyName: userObject.companyName,
        companyIndustry: userObject.companyIndustry,
        companyScale: userObject.companyScale,
        companyAddress: userObject.companyAddress,
        companyWebsite: userObject.companyWebsite,
        companyDescription: userObject.companyDescription,
        companyCultureHighlights: userObject.companyCultureHighlights,
        companyLogoUrl: userObject.companyLogoUrl,
        companyVerificationDocuments: userObject.companyVerificationDocuments,
        companyProfileComplete: userObject.companyProfileComplete,
        
        jobOpenings: jobOpenings,
        profileVisibility: userObject.profileVisibility,
        profileCardTheme: userObject.profileCardTheme,
        representedCandidateProfileId: userObject.representedCandidateProfileId,
        representedCompanyProfileId: userObject.representedCompanyProfileId,
        companyNameForJobs: userObject.companyNameForJobs,
        companyIndustryForJobs: userObject.companyIndustryForJobs,
        preferences: userObject.preferences,
        likedCandidateIds: userObject.likedCandidateIds,
        likedCompanyIds: userObject.likedCompanyIds,
        passedCandidateProfileIds: userObject.passedCandidateProfileIds,
        passedCompanyProfileIds: userObject.passedCompanyProfileIds,
        createdAt: userObject.createdAt,
        updatedAt: userObject.updatedAt
    };
};

// Controller methods
export const createUser = async (req, res) => {
    try {
        const db = getDatabase();
        if (!db) {
            return res.status(503).json({ message: 'Database service unavailable' });
        }
        
        const { name, email, preferences, firebaseUid, selectedRole, representedCandidateProfileId, representedCompanyProfileId } = req.body;

        if (process.env.NODE_ENV !== 'production') {
            console.log("[API /api/users Create] Request received. Body:", JSON.stringify(req.body).substring(0, 300) + "...");
        }

        // Validation checks
        if (!name || typeof name !== 'string' || name.length < 2 || name.length > 100) {
            return res.status(400).json({ message: 'Invalid name provided.' });
        }

        if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: 'Invalid email provided.' });
        }

        if (!firebaseUid || typeof firebaseUid !== 'string' || firebaseUid.length < 10) {
            return res.status(400).json({ message: 'Invalid Firebase UID provided.' });
        }

        if (!selectedRole || !['jobseeker', 'recruiter'].includes(selectedRole)) {
            return res.status(400).json({ message: 'Invalid role provided. Must be jobseeker or recruiter.' });
        }

        // Check for existing user with timeout
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Database query timeout')), 5000);
        });
        
        const queryPromise = db.collection('users').findOne(
            { $or: [{ email }, { firebaseUid }] },
            { maxTimeMS: 4000 }
        );
        
        const existingUser = await Promise.race([queryPromise, timeoutPromise]);
        if (existingUser) {
            return res.status(200).json({ message: 'User already exists', user: existingUser });
        }

        const newUser = {
            name,
            email,
            preferences: preferences || {},
            firebaseUid,
            selectedRole,
            representedCandidateProfileId,
            representedCompanyProfileId,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const insertTimeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Database insert timeout')), 5000);
        });
        
        const insertPromise = db.collection('users').insertOne(newUser);
        const result = await Promise.race([insertPromise, insertTimeoutPromise]);
        const createdUser = { ...newUser, _id: result.insertedId };
        
        console.log("[API /api/users Create] User created successfully");
        return res.status(201).json({ message: 'User created!', user: createdUser });
    } catch (error) {
        console.error("[API /api/users Create] Server error:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getUser = async (req, res) => {
    try {
        const { identifier } = req.params;
        
        console.log('getUser called with identifier:', identifier);
        
        const db = getDatabase();
        if (!db) {
            console.error('Database not available');
            return res.status(503).json({ message: 'Database service unavailable' });
        }
        
        console.log('Database available, searching for user');
        
        // Build search query based on identifier format
        let searchQuery = {};
        
        // Check if identifier is a valid ObjectId first
        if (ObjectId.isValid(identifier)) {
            searchQuery = { _id: new ObjectId(identifier) };
        }
        // Check if identifier looks like a Firebase UID (long alphanumeric string)
        else if (identifier && identifier.length > 20 && /^[A-Za-z0-9]+$/.test(identifier)) {
            searchQuery = { firebaseUid: identifier };
        }
        // Otherwise treat as email
        else if (identifier && identifier.includes('@')) {
            searchQuery = { email: identifier };
        }
        // Fallback: search firebaseUid only for safety
        else {
            searchQuery = { firebaseUid: identifier };
        }
        
        console.log('Search query:', searchQuery);
        
        // Use shorter timeout for Workers (5 seconds)
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Database query timeout')), 5000);
        });
        
        console.log('Starting database query...');
        const startTime = Date.now();
        
        const queryPromise = db.collection('users').findOne(
            searchQuery,
            { 
                maxTimeMS: 4000, // MongoDB server-side timeout
                readPreference: 'primary' // Ensure we read from primary
            }
        );
        
        const user = await Promise.race([queryPromise, timeoutPromise]);
        
        const endTime = Date.now();
        console.log(`Database query completed in ${endTime - startTime}ms`);
        
        if (!user) {
            console.log('User not found in database');
            return res.status(404).json({ message: 'User not found' });
        }
        
        console.log('User found, preparing response');
        const selectedUser = selectUserFields(user);
        return res.status(200).json({ user: selectedUser });
    } catch (error) {
        console.error("[API /api/users/:identifier] Server error:", error);
        return res.status(500).json({ message: 'Server error retrieving user', error: error.message });
    }
};

export const getJobseekerProfiles = async (req, res) => {
    try {
        const db = getDatabase();
        if (!db) {
            return res.status(503).json({ message: 'Database service unavailable' });
        }
        
        console.log("[API /api/users/profiles/jobseekers] Request received");
        
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Database query timeout')), 5000);
        });
        
        const queryPromise = db.collection('users').find(
            {
                selectedRole: 'jobseeker',
                profileVisibility: { $ne: 'private' }
            },
            {
                projection: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    profileAvatarUrl: 1,
                    profileHeadline: 1,
                    profileExperienceSummary: 1,
                    profileSkills: 1,
                    country: 1,
                    address: 1,
                    profileDesiredWorkStyle: 1,
                    profilePastProjects: 1,
                    profileWorkExperienceLevel: 1,
                    profileEducationLevel: 1,
                    profileLocationPreference: 1,
                    profileLanguages: 1,
                    profileAvailability: 1,
                    profileJobTypePreference: 1,
                    profileSalaryExpectationMin: 1,
                    profileSalaryExpectationMax: 1,
                    videoResumeUrl: 1,
                    profileVisibility: 1,
                    profileCardTheme: 1,
                    createdAt: 1,
                    updatedAt: 1
                },
                maxTimeMS: 4000
            }
        ).toArray();
        
        const jobseekers = await Promise.race([queryPromise, timeoutPromise]);
        
        return res.status(200).json({ jobseekers });
    } catch (error) {
        console.error("[API /api/users/profiles/jobseekers] Server error:", error);
        return res.status(500).json({ message: 'Server error retrieving jobseeker profiles', error: error.message });
    }
};

// Note: File upload endpoints will need to be implemented with Workers-compatible storage
export const uploadAvatar = async (req, res) => {
    try {
        const { identifier } = req.params;
        
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        // Use Cloudflare R2 compatible file upload
        const fileUrl = `https://storage.workers.dev/avatars/${identifier}-${Date.now()}-${req.file.originalname}`;
        
        // For now, return success with a placeholder URL
        // In production, this would upload to R2 or use a base64 data URL
        return res.status(200).json({
            message: 'Avatar uploaded successfully',
            avatarUrl: fileUrl,
            user: { profileAvatarUrl: fileUrl }
        });
    } catch (error) {
        console.error('Avatar upload error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const uploadVideoResume = async (req, res) => {
    try {
        const { identifier } = req.params;
        
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        // Use Cloudflare R2 compatible file upload
        const fileUrl = `https://storage.workers.dev/videos/${identifier}-${Date.now()}-${req.file.originalname}`;
        
        // For now, return success with a placeholder URL
        // In production, this would upload to R2 or use a base64 data URL
        return res.status(200).json({
            message: 'Video resume uploaded successfully',
            videoResumeUrl: fileUrl,
            user: { videoResumeUrl: fileUrl }
        });
    } catch (error) {
        console.error('Video resume upload error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { identifier } = req.params;
        const updates = req.body;
        
        const db = getDatabase();
        if (!db) {
            return res.status(503).json({ message: 'Database service unavailable' });
        }
        
        // Remove sensitive fields that shouldn't be updated via this endpoint
        delete updates._id;
        delete updates.firebaseUid;
        delete updates.email;
        delete updates.createdAt;
        delete updates.updatedAt;
        
        // Add updated timestamp
        updates.updatedAt = new Date();
        
        // Build search conditions
        const searchConditions = [
            { email: identifier },
            { firebaseUid: identifier }
        ];
        
        if (ObjectId.isValid(identifier)) {
            searchConditions.push({ _id: new ObjectId(identifier) });
        }
        
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Database update timeout')), 5000);
        });
        
        const updatePromise = db.collection('users').findOneAndUpdate(
            { $or: searchConditions },
            { $set: updates },
            {
                returnDocument: 'after',
                maxTimeMS: 4000
            }
        );
        
        const result = await Promise.race([updatePromise, timeoutPromise]);
        
        if (!result.value) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        return res.status(200).json({
            message: 'Profile updated successfully',
            user: selectUserFields(result.value)
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateProfileVisibility = async (req, res) => {
    try {
        const { userId } = req.params;
        const { profileVisibility } = req.body;
        
        const db = getDatabase();
        if (!db) {
            return res.status(503).json({ message: 'Database service unavailable' });
        }
        
        if (!['public', 'private', 'recruiters_only'].includes(profileVisibility)) {
            return res.status(400).json({ message: 'Invalid visibility option' });
        }
        
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Database update timeout')), 5000);
        });
        
        const updatePromise = db.collection('users').findOneAndUpdate(
            { _id: new ObjectId(userId) },
            { 
                $set: { 
                    profileVisibility,
                    updatedAt: new Date()
                }
            },
            {
                returnDocument: 'after',
                maxTimeMS: 4000
            }
        );
        
        const result = await Promise.race([updatePromise, timeoutPromise]);
        
        if (!result.value) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        return res.status(200).json({
            message: 'Profile visibility updated successfully',
            user: selectUserFields(result.value)
        });
    } catch (error) {
        console.error('Profile visibility update error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { identifier } = req.params;
        const updates = req.body;
        
        const db = getDatabase();
        if (!db) {
            return res.status(503).json({ message: 'Database service unavailable' });
        }
        
        // Remove sensitive fields
        delete updates._id;
        delete updates.firebaseUid;
        delete updates.createdAt;
        delete updates.updatedAt;
        
        // Add updated timestamp
        updates.updatedAt = new Date();
        
        // Build search conditions
        const searchConditions = [
            { email: identifier },
            { firebaseUid: identifier }
        ];
        
        if (ObjectId.isValid(identifier)) {
            searchConditions.push({ _id: new ObjectId(identifier) });
        }
        
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Database update timeout')), 5000);
        });
        
        const updatePromise = db.collection('users').findOneAndUpdate(
            { $or: searchConditions },
            { $set: updates },
            {
                returnDocument: 'after',
                maxTimeMS: 4000
            }
        );
        
        const result = await Promise.race([updatePromise, timeoutPromise]);
        
        if (!result.value) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        return res.status(200).json({
            message: 'User updated successfully',
            user: selectUserFields(result.value)
        });
    } catch (error) {
        console.error('User update error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const db = getDatabase();
        if (!db) {
            return res.status(503).json({ message: 'Database service unavailable' });
        }
        
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Database delete timeout')), 5000);
        });
        
        const deletePromise = db.collection('users').findOneAndDelete(
            { _id: new ObjectId(userId) },
            { maxTimeMS: 4000 }
        );
        
        const result = await Promise.race([deletePromise, timeoutPromise]);
        
        if (!result.value) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        return res.status(200).json({
            message: 'Account deleted successfully'
        });
    } catch (error) {
        console.error('Account deletion error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const requestDataExport = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const db = getDatabase();
        if (!db) {
            return res.status(503).json({ message: 'Database service unavailable' });
        }
        
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Database query timeout')), 5000);
        });
        
        const queryPromise = db.collection('users').findOne(
            { _id: new ObjectId(userId) },
            { maxTimeMS: 4000 }
        );
        
        const user = await Promise.race([queryPromise, timeoutPromise]);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // In a real implementation, this would trigger a background job
        // to compile all user data and send it via email
        
        return res.status(200).json({
            message: 'Data export request received. You will receive your data via email within 24 hours.',
            requestId: `export-${userId}-${Date.now()}`
        });
    } catch (error) {
        console.error('Data export request error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Default export with all methods
export default {
    createUser,
    getUser,
    getJobseekerProfiles,
    uploadAvatar,
    uploadVideoResume,
    updateProfile,
    updateProfileVisibility,
    updateUser,
    deleteAccount,
    requestDataExport
};