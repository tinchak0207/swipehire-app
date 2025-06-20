const mongoose = require('mongoose');
const User = require('../../models/User');
const Video = require('../../models/Video');
const { GCS_BUCKET_NAME } = require('../../config/constants');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

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
exports.createUser = async (req, res) => {
    try {
        const { name, email, preferences, firebaseUid, selectedRole, representedCandidateProfileId, representedCompanyProfileId } = req.body;

        if (process.env.NODE_ENV !== 'production') {
            console.log("[API /api/users Create] Request received. Body:", JSON.stringify(req.body).substring(0, 300) + "...");
        }

        // Validation checks
        if (!name || typeof name !== 'string' || name.length < 2 || name.length > 100) {
            return res.status(400).json({ message: 'Invalid name provided.' });
        }
        // Add other validation checks...

        const existingUser = await User.findOne({ $or: [{ email }, { firebaseUid }] });
        if (existingUser) {
            return res.status(200).json({ message: 'User already exists', user: existingUser });
        }

        const newUser = new User({
            name, email, preferences, firebaseUid, selectedRole,
            representedCandidateProfileId, representedCompanyProfileId
        });
        
        await newUser.save();
        return res.status(201).json({ message: 'User created!', user: newUser });
    } catch (error) {
        console.error("[API /api/users Create] Server error:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getUser = async (req, res) => {
    try {
        const { identifier } = req.params;
        
        // Find user by ID (if valid ObjectId), email, or firebaseUid
        const searchConditions = [
            { email: identifier },
            { firebaseUid: identifier }
        ];
        
        // Only add _id condition if identifier is a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(identifier)) {
            searchConditions.push({ _id: identifier });
        }

        const user = await User.findOne({
            $or: searchConditions
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            message: 'User retrieved successfully',
            user: selectUserFields(user)
        });
    } catch (error) {
        console.error("[API /api/users/:identifier] Server error:", error);
        return res.status(500).json({ 
            message: 'Server error retrieving user',
            error: error.message 
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { identifier } = req.params;
        const updates = req.body;

        console.log(`[API /api/users/:identifier/profile] Update request for identifier: ${identifier}`);
        console.log(`[API /api/users/:identifier/profile] Updates:`, JSON.stringify(updates, null, 2));

        // Validate required fields for company onboarding
        if (updates.companyProfileComplete === true) {
            const requiredFields = ['companyName', 'companyIndustry'];
            const missingFields = requiredFields.filter(field => !updates[field] && !updates[field]?.trim());
            
            if (missingFields.length > 0) {
                console.error(`[API /api/users/:identifier/profile] Missing required fields: ${missingFields.join(', ')}`);
                return res.status(400).json({ 
                    message: `Missing required fields: ${missingFields.join(', ')}`,
                    missingFields 
                });
            }
        }

        const searchConditions = [
            { email: identifier },
            { firebaseUid: identifier }
        ];
        
        if (mongoose.Types.ObjectId.isValid(identifier)) {
            searchConditions.push({ _id: identifier });
        }

        console.log(`[API /api/users/:identifier/profile] Search conditions:`, searchConditions);

        // First, find the user to check if they exist
        const existingUser = await User.findOne({ $or: searchConditions });
        if (!existingUser) {
            console.error(`[API /api/users/:identifier/profile] User not found for identifier: ${identifier}`);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`[API /api/users/:identifier/profile] Found user: ${existingUser._id}`);

        // Perform the update
        const updatedUser = await User.findOneAndUpdate(
            { $or: searchConditions },
            { $set: updates },
            { new: true, runValidators: true }
        );

        console.log(`[API /api/users/:identifier/profile] Update successful for user: ${updatedUser._id}`);

        res.status(200).json({
            message: 'Profile updated successfully',
            user: selectUserFields(updatedUser)
        });
    } catch (error) {
        console.error("[API /api/users/:identifier/profile] Server error:", error);
        
        // Handle validation errors specifically
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: 'Validation error',
                errors: validationErrors,
                error: error.message 
            });
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(400).json({ 
                message: 'Duplicate value error',
                error: 'A user with this email or firebaseUid already exists' 
            });
        }

        res.status(500).json({ 
            message: 'Error updating profile',
            error: error.message 
        });
    }
};

exports.updateProfileVisibility = async (req, res) => {
    try {
        const { userId } = req.params;
        const { visibility } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profileVisibility: visibility },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile visibility updated',
            user: selectUserFields(updatedUser)
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating profile visibility',
            error: error.message 
        });
    }
};

exports.uploadAvatar = async (req, res) => {
    try {
        const { identifier } = req.params;
        const avatarUrl = req.file.path;

        const searchConditions = [
            { email: identifier },
            { firebaseUid: identifier }
        ];
        
        if (mongoose.Types.ObjectId.isValid(identifier)) {
            searchConditions.push({ _id: identifier });
        }

        const updatedUser = await User.findOneAndUpdate(
            { $or: searchConditions },
            { profileAvatarUrl: avatarUrl },
            { new: true }
        );

        res.status(200).json({
            message: 'Avatar uploaded successfully',
            user: selectUserFields(updatedUser)
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error uploading avatar',
            error: error.message 
        });
    }
};

exports.uploadVideoResume = async (req, res) => {
    try {
        const { identifier } = req.params;
        const videoUrl = req.file.path;

        const searchConditions = [
            { email: identifier },
            { firebaseUid: identifier }
        ];
        
        if (mongoose.Types.ObjectId.isValid(identifier)) {
            searchConditions.push({ _id: identifier });
        }

        const updatedUser = await User.findOneAndUpdate(
            { $or: searchConditions },
            { videoResumeUrl: videoUrl },
            { new: true }
        );

        res.status(200).json({
            message: 'Video resume uploaded successfully',
            user: selectUserFields(updatedUser)
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error uploading video resume',
            error: error.message 
        });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { identifier } = req.params;
        const updates = req.body;

        const searchConditions = [
            { email: identifier },
            { firebaseUid: identifier }
        ];
        
        if (mongoose.Types.ObjectId.isValid(identifier)) {
            searchConditions.push({ _id: identifier });
        }

        const updatedUser = await User.findOneAndUpdate(
            { $or: searchConditions },
            updates,
            { new: true }
        );

        res.status(200).json({
            message: 'User updated successfully',
            user: selectUserFields(updatedUser)
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating user',
            error: error.message 
        });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const { userId } = req.params;
        await User.findByIdAndDelete(userId);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ 
            message: 'Error deleting account',
            error: error.message 
        });
    }
};

exports.requestDataExport = async (req, res) => {
    try {
        const { userId } = req.params;
        // Implementation for data export request
        res.status(200).json({ 
            message: 'Data export request received',
            exportId: `export_${Date.now()}` 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error processing data export request',
            error: error.message 
        });
    }
};

exports.getJobseekerProfiles = async (req, res) => {
    try {
        console.log("[API /api/users/profiles/jobseekers] Request received");
        
        // Find all users with selectedRole 'jobseeker' and visible profiles
        const jobseekers = await User.find({
            selectedRole: 'jobseeker',
            profileVisibility: { $ne: 'hidden' } // Exclude hidden profiles
        }).select(
            '_id name email selectedRole profileAvatarUrl profileHeadline ' +
            'profileExperienceSummary profileSkills country address ' +
            'profileDesiredWorkStyle profilePastProjects profileWorkExperienceLevel ' +
            'profileEducationLevel profileLocationPreference profileLanguages ' +
            'profileAvailability profileJobTypePreference profileSalaryExpectationMin ' +
            'profileSalaryExpectationMax videoResumeUrl createdAt updatedAt'
        );

        console.log(`[API /api/users/profiles/jobseekers] Found ${jobseekers.length} jobseeker profiles`);

        // Helper function to parse string arrays
        const parseStringArray = (str) => {
            if (!str) return [];
            if (Array.isArray(str)) return str;
            try {
                return JSON.parse(str);
            } catch {
                return str.split(',').map(item => item.trim()).filter(item => item);
            }
        };

        // Transform the data to match the frontend Candidate interface
        const candidateProfiles = jobseekers.map(user => ({
            id: user._id.toString(),
            name: user.name,
            role: user.profileHeadline || 'Job Seeker',
            avatarUrl: user.profileAvatarUrl,
            experienceSummary: user.profileExperienceSummary,
            skills: parseStringArray(user.profileSkills),
            location: user.address || user.country,
            desiredWorkStyle: user.profileDesiredWorkStyle,
            pastProjects: user.profilePastProjects,
            workExperienceLevel: user.profileWorkExperienceLevel,
            educationLevel: user.profileEducationLevel,
            locationPreference: user.profileLocationPreference,
            languages: parseStringArray(user.profileLanguages),
            availability: user.profileAvailability,
            jobTypePreference: parseStringArray(user.profileJobTypePreference),
            salaryExpectationMin: user.profileSalaryExpectationMin,
            salaryExpectationMax: user.profileSalaryExpectationMax,
            videoResumeUrl: user.videoResumeUrl,
            dataAiHint: "person"
        }));

        return res.status(200).json(candidateProfiles);
    } catch (error) {
        console.error("[API /api/users/profiles/jobseekers] Server error:", error);
        return res.status(500).json({ 
            message: 'Server error retrieving jobseeker profiles',
            error: error.message 
        });
    }
};

module.exports = exports;
