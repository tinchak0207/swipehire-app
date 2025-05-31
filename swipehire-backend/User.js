// custom-backend-example/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    firebaseUid: {
        type: String,
        required: false,
        unique: true,
        sparse: true,
    },
    selectedRole: {
        type: String,
        enum: ['recruiter', 'jobseeker', null],
        default: null,
    },
    address: String,
    country: String,
    documentId: String,
    recruiterAIWeights: {
        skillsMatchScore: Number,
        experienceRelevanceScore: Number,
        cultureFitScore: Number,
        growthPotentialScore: Number,
    },
    jobSeekerAIWeights: {
        cultureFitScore: Number,
        jobRelevanceScore: Number,
        growthOpportunityScore: Number,
        jobConditionFitScore: Number,
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'system'],
            default: 'light',
        },
        featureFlags: {
            type: Map,
            of: Boolean,
            default: {},
        },
        defaultAIScriptTone: {
            type: String,
            enum: ['professional', 'friendly', 'technical', 'sales', 'general'],
            default: 'professional',
        },
        discoveryItemsPerPage: {
            type: Number,
            default: 10,
            min: 3,
            max: 20,
        },
        enableExperimentalFeatures: {
            type: Boolean,
            default: false,
        },
    },
    // --- Fields for Likes and Matches ---
    likedCandidateIds: [{ // For recruiters: list of candidate profile IDs they liked (e.g., 'cand1')
        type: String,
    }],
    likedCompanyIds: [{ // For job seekers: list of company profile IDs they liked (e.g., 'comp1')
        type: String,
    }],
    // Conceptual fields to link a User document to a specific profile ID they represent from mockData
    // This is crucial for matching logic if Candidate/Company profiles are not full User documents themselves
    representedCandidateProfileId: { // For a job seeker user, which candidate profile ID (e.g., 'cand1') they are
        type: String,
        index: true, 
        sparse: true, 
    },
    representedCompanyProfileId: { // For a recruiter user, which company profile ID (e.g., 'comp1') they represent
        type: String,
        index: true,
        sparse: true,
    }
}, { timestamps: true });


module.exports = mongoose.model('User', UserSchema);
