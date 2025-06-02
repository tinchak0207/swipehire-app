
// custom-backend-example/models/User.js
const mongoose = require('mongoose');

// Sub-schema for individual job openings
const CompanyJobOpeningSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    salaryRange: { type: String, trim: true },
    jobType: { type: String, trim: true }, // e.g., 'Full-time', 'Contract'
    tags: { type: [String], default: [] },
    videoOrImageUrl: { type: String, trim: true },
    dataAiHint: { type: String, trim: true },
    requiredExperienceLevel: { type: String, trim: true },
    requiredEducationLevel: { type: String, trim: true },
    workLocationType: { type: String, trim: true }, // e.g., 'Remote', 'Hybrid', 'On-site'
    requiredLanguages: { type: [String], default: [] },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    companyCultureKeywords: { type: [String], default: [] },
    // These will be populated from the parent User document (recruiter's profile)
    companyNameForJob: { type: String, required: true },
    companyLogoForJob: { type: String },
    companyIndustryForJob: { type: String },
    postedAt: { type: Date, default: Date.now }
}, { _id: true }); // Ensure subdocuments get their own _id for potential future direct manipulation


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
    // Recruiter specific fields for company context
    companyNameForJobs: { // Used as the default company name for jobs posted by this recruiter
        type: String,
        trim: true,
    },
    companyIndustryForJobs: { // Used as the default company industry
        type: String,
        trim: true,
    },
    // Job Openings: Only relevant if selectedRole is 'recruiter'
    jobOpenings: [CompanyJobOpeningSchema],

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
    profileCardTheme: { 
        type: String,
        trim: true,
        default: 'default', 
    },
    likedCandidateIds: [{ 
        type: String, // Should ideally be mongoose.Schema.Types.ObjectId, ref: 'User' if candidates are also Users
    }],
    likedCompanyIds: [{ 
        type: String, // Should ideally be mongoose.Schema.Types.ObjectId, ref: 'User' if companies are represented by Users (recruiters)
    }],
    passedCandidateProfileIds: { // New field
        type: [String], // Stores candidate IDs (e.g., 'cand1', 'cand2')
        default: []
    },
    passedCompanyProfileIds: { // New field
        type: [String], // Stores company IDs (e.g., 'comp1', 'comp2')
        default: []
    },
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
    profileHeadline: { 
        type: String,
        trim: true,
    },
    profileExperienceSummary: { 
        type: String,
        trim: true,
    },
    profileSkills: { 
        type: String,
        trim: true,
    },
    profileDesiredWorkStyle: { 
        type: String,
        trim: true,
    },
    profilePastProjects: { 
        type: String,
        trim: true,
    },
    profileVideoPortfolioLink: { 
        type: String,
        trim: true,
    },
    profileAvatarUrl: {
        type: String,
        trim: true,
    },
    profileWorkExperienceLevel: {
        type: String,
    },
    profileEducationLevel: {
        type: String,
    },
    profileLocationPreference: { 
        type: String,
    },
    profileLanguages: { 
        type: String,
        trim: true,
    },
    profileAvailability: {
        type: String,
    },
    profileJobTypePreference: { 
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

    