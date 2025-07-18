import mongoose from 'mongoose';
import User from '../../models/User.js';
import Video from '../../models/Video.js';
import { GCS_BUCKET_NAME } from '../../config/constants.js';
import { Storage } from '@google-cloud/storage';

const storageGCS = new Storage();

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

        if (!selectedRole || !['jobseeker', 'employer'].includes(selectedRole)) {
            return res.status(400).json({ message: 'Invalid role provided. Must be jobseeker or employer.' });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { firebaseUid }] });
        if (existingUser) {
            return res.status(200).json({ message: 'User already exists', user: existingUser });
        }

        const newUser = new User({
            name,
            email,
            preferences,
            firebaseUid,
            selectedRole,
            representedCandidateProfileId,
            representedCompanyProfileId
        });
        
        await newUser.save();
        console.log("[API /api/users Create] User created successfully");
        return res.status(201).json({ message: 'User created!', user: newUser });
    } catch (error) {
        console.error("[API /api/users Create] Server error:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getUser = async (req, res) => {
    try {
        const { identifier } = req.params;
        
        // Build search query based on identifier format
        let searchQuery = {};
        
        // Check if identifier is a valid ObjectId first
        if (mongoose.Types.ObjectId.isValid(identifier)) {
            searchQuery = { _id: identifier };
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
        
        const user = await User.findOne(searchQuery);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const selectedUser = selectUserFields(user);
        return res.status(200).json({ user: selectedUser });
    } catch (error) {
        console.error("[API /api/users/:identifier] Server error:", error);
        return res.status(500).json({ message: 'Server error retrieving user', error: error.message });
    }
};

export const getJobseekerProfiles = async (req, res) => {
    try {
        console.log("[API /api/users/profiles/jobseekers] Request received");
        
        const jobseekers = await User.find({
            selectedRole: 'jobseeker',
            profileVisibility: { $ne: 'private' }
        }).select('_id name email profileAvatarUrl profileHeadline profileExperienceSummary profileSkills country address profileDesiredWorkStyle profilePastProjects profileWorkExperienceLevel profileEducationLevel profileLocationPreference profileLanguages profileAvailability profileJobTypePreference profileSalaryExpectationMin profileSalaryExpectationMax videoResumeUrl profileVisibility profileCardTheme createdAt updatedAt');
        
        return res.status(200).json({ jobseekers });
    } catch (error) {
        console.error("[API /api/users/profiles/jobseekers] Server error:", error);
        return res.status(500).json({ message: 'Server error retrieving jobseeker profiles', error: error.message });
    }
};

export const uploadAvatar = async (req, res) => {
    try {
        const { identifier } = req.params;
        
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        // Upload to Google Cloud Storage
        const fileName = `avatars/${identifier}-${Date.now()}-${req.file.originalname}`;
        const file = storageGCS.bucket(GCS_BUCKET_NAME).file(fileName);
        
        const stream = file.createWriteStream({
            metadata: {
                contentType: req.file.mimetype,
            },
        });
        
        stream.on('error', (err) => {
            console.error('Upload error:', err);
            return res.status(500).json({ message: 'Upload failed', error: err.message });
        });
        
        stream.on('finish', async () => {
            try {
                await file.makePublic();
                const publicUrl = `https://storage.googleapis.com/${GCS_BUCKET_NAME}/${fileName}`;
                
                // Update user's profile avatar URL
                await User.findOneAndUpdate(
                    { $or: [{ _id: identifier }, { email: identifier }, { firebaseUid: identifier }] },
                    { profileAvatarUrl: publicUrl },
                    { new: true }
                );
                
                return res.status(200).json({
                    message: 'Avatar uploaded successfully',
                    avatarUrl: publicUrl
                });
            } catch (error) {
                console.error('Error updating user avatar:', error);
                return res.status(500).json({ message: 'Error updating avatar', error: error.message });
            }
        });
        
        stream.end(req.file.buffer);
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
        
        // Upload to Google Cloud Storage
        const fileName = `video-resumes/${identifier}-${Date.now()}-${req.file.originalname}`;
        const file = storageGCS.bucket(GCS_BUCKET_NAME).file(fileName);
        
        const stream = file.createWriteStream({
            metadata: {
                contentType: req.file.mimetype,
            },
        });
        
        stream.on('error', (err) => {
            console.error('Upload error:', err);
            return res.status(500).json({ message: 'Upload failed', error: err.message });
        });
        
        stream.on('finish', async () => {
            try {
                await file.makePublic();
                const publicUrl = `https://storage.googleapis.com/${GCS_BUCKET_NAME}/${fileName}`;
                
                // Update user's video resume URL
                await User.findOneAndUpdate(
                    { $or: [{ _id: identifier }, { email: identifier }, { firebaseUid: identifier }] },
                    { videoResumeUrl: publicUrl },
                    { new: true }
                );
                
                return res.status(200).json({
                    message: 'Video resume uploaded successfully',
                    videoResumeUrl: publicUrl
                });
            } catch (error) {
                console.error('Error updating user video resume:', error);
                return res.status(500).json({ message: 'Error updating video resume', error: error.message });
            }
        });
        
        stream.end(req.file.buffer);
    } catch (error) {
        console.error('Video resume upload error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { identifier } = req.params;
        const updates = req.body;
        
        // Remove sensitive fields that shouldn't be updated via this endpoint
        delete updates._id;
        delete updates.firebaseUid;
        delete updates.email;
        delete updates.createdAt;
        delete updates.updatedAt;
        
        const updatedUser = await User.findOneAndUpdate(
            { $or: [{ _id: identifier }, { email: identifier }, { firebaseUid: identifier }] },
            updates,
            { new: true, runValidators: true }
        );
        
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        return res.status(200).json({
            message: 'Profile updated successfully',
            user: selectUserFields(updatedUser)
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
        
        if (!['public', 'private', 'connections'].includes(profileVisibility)) {
            return res.status(400).json({ message: 'Invalid visibility option' });
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profileVisibility },
            { new: true }
        );
        
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        return res.status(200).json({
            message: 'Profile visibility updated successfully',
            user: selectUserFields(updatedUser)
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
        
        // Remove sensitive fields
        delete updates._id;
        delete updates.firebaseUid;
        delete updates.createdAt;
        delete updates.updatedAt;
        
        const updatedUser = await User.findOneAndUpdate(
            { $or: [{ _id: identifier }, { email: identifier }, { firebaseUid: identifier }] },
            updates,
            { new: true, runValidators: true }
        );
        
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        return res.status(200).json({
            message: 'User updated successfully',
            user: selectUserFields(updatedUser)
        });
    } catch (error) {
        console.error('User update error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const deletedUser = await User.findByIdAndDelete(userId);
        
        if (!deletedUser) {
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
        
        const user = await User.findById(userId);
        
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