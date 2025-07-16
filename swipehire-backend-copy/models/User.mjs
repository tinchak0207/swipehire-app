import mongoose from 'mongoose';

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

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format']
    },
    firebaseUid: { 
        type: String, 
        required: true, 
        unique: true,
        index: true
    },
    selectedRole: { 
        type: String, 
        enum: ['jobseeker', 'recruiter', 'admin', null], 
        default: null,
        index: true
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
    
    // Recruiter Company Profile Fields (from onboarding)
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
    profileAvatarUrl: {
        type: String,
        trim: true,
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
    country: String,
    address: String,
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
    videoResumeUrl: {
        type: String,
        trim: true,
    },
    
    profileVisibility: {
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
    
    // AI Weights
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
    
    documentId: String,
}, {
    timestamps: true
});

export default mongoose.model('User', userSchema);