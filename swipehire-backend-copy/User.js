
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
    postedAt: { type: Date, default: Date.now },
    status: { // Added job status
        type: String,
        enum: ['draft', 'active', 'paused', 'expired', 'filled', 'closed'],
        default: 'active',
    }
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
        index: true,
    },
    firebaseUid: {
        type: String,
        required: true, // Changed from false to true as per instruction
        unique: true,
        index: true, // Added index
        // sparse: true, // Sparse can be removed if required:true ensures it's always there
    },
    selectedRole: {
        type: String,
        enum: ['recruiter', 'jobseeker', null],
        default: null,
        index: true,
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
        notificationChannels: { // Added structure for clarity
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: false },
            inAppToast: { type: Boolean, default: true },
            inAppBanner: { type: Boolean, default: true },
        },
        notificationSubscriptions: { // Added structure for clarity
            companyReplies: { type: Boolean, default: true },
            matchUpdates: { type: Boolean, default: true },
            applicationStatusChanges: { type: Boolean, default: true },
            platformAnnouncements: { type: Boolean, default: true },
            welcomeAndOnboardingEmails: { type: Boolean, default: true },
            contentAndBlogUpdates: { type: Boolean, default: false },
            featureAndPromotionUpdates: { type: Boolean, default: false },
        },
    },
    profileVisibility: { // Added by user instruction
        type: String,
        enum: ['public', 'recruiters_only', 'private'],
        default: 'public',
        index: true,
    },
    profileCardTheme: { // Added now
        type: String,
        trim: true,
        default: 'default',
    },
    likedCandidateIds: [{
        type: String,
        index: true,
    }],
    likedCompanyIds: [{
        type: String,
        index: true,
    }],
    passedCandidateProfileIds: {
        type: [String],
        default: []
    },
    passedCompanyProfileIds: {
        type: [String],
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
    // Recruiter Company Profile Fields (from onboarding)
    // TODO: In a future iteration, create a separate Companies collection
    // and link recruiters to it (many-to-many or one-to-many if a company has multiple recruiters).
    // This would allow more robust company profile management.
    companyName: { type: String, trim: true },
    companyIndustry: { type: String, trim: true },
    companyScale: { type: String, trim: true }, // Enum values from CompanyScale
    companyAddress: { type: String, trim: true },
    companyWebsite: { type: String, trim: true },
    companyDescription: { type: String, trim: true },
    companyCultureHighlights: { type: [String], default: [] },
    companyLogoUrl: { type: String, trim: true }, // Potentially from GCS
    companyVerificationDocuments: { type: Array, default: [] }, // Array of objects
    companyProfileComplete: { // Flag to indicate if recruiter onboarding is done
        type: Boolean,
        default: false, // Ensure this defaults to false
    },
    // Job Seeker Profile Fields
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
    },
}, { timestamps: true });


module.exports = mongoose.model('User', UserSchema);
