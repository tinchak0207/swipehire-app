
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
    profileCardTheme: { // New field for storing the selected card theme key
        type: String,
        trim: true,
        default: 'default', // A default theme key
    },
    // --- Fields for Likes and Matches ---
    likedCandidateIds: [{ // For recruiters: list of candidate profile IDs they liked (e.g., 'cand1')
        type: String,
    }],
    likedCompanyIds: [{ // For job seekers: list of company profile IDs they liked (e.g., 'comp1')
        type: String,
    }],
    representedCandidateProfileId: {
        type: String,
        index: true,
        sparse: true,
    },
    representedCompanyProfileId: {
        type: String,
        index: true,
        sparse: true,
    },
    // --- Detailed Job Seeker Profile Fields ---
    profileHeadline: { // Already exists, used for 'role'
        type: String,
        trim: true,
    },
    profileExperienceSummary: { // Already exists
        type: String,
        trim: true,
    },
    profileSkills: { // Already exists, comma-separated string
        type: String,
        trim: true,
    },
    profileDesiredWorkStyle: { // Already exists
        type: String,
        trim: true,
    },
    profilePastProjects: { // Already exists
        type: String,
        trim: true,
    },
    profileVideoPortfolioLink: { // Already exists
        type: String,
        trim: true,
    },
    // New fields for more detailed profile
    profileAvatarUrl: {
        type: String,
        trim: true,
    },
    profileWorkExperienceLevel: {
        type: String,
        // Consider enum validation if desired, but string is flexible for now
        // enum: ['intern', '1-3 years', '3-5 years', '5-10 years', '10+ years', 'unspecified'],
    },
    profileEducationLevel: {
        type: String,
        // enum: ['high_school', 'university', 'master', 'doctorate', 'unspecified'],
    },
    profileLocationPreference: { // For candidate's preference, distinct from job's location type
        type: String,
        // enum: ['specific_city', 'remote', 'hybrid', 'unspecified'],
    },
    profileLanguages: { // Storing as a comma-separated string for simplicity in form
        type: String,
        trim: true,
    },
    profileAvailability: {
        type: String,
        // enum: ['immediate', '1_month', '3_months', 'negotiable', 'unspecified'],
    },
    profileJobTypePreference: { // Storing as a comma-separated string
        type: String,
        trim: true,
    },
    profileSalaryExpectationMin: {
        type: Number,
    },
    profileSalaryExpectationMax: {
        type: Number,
    }
}, { timestamps: true });


module.exports = mongoose.model('User', UserSchema);
