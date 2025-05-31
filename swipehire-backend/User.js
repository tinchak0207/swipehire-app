
// custom-backend-example/models/User.js
const mongoose = require('mongoose');

// Define a schema for user data. You can customize it with the fields you need.
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
        required: false, // Or true, depending on your needs
        unique: true,
        sparse: true, // sparse index allows multiple documents to have a null value for the indexed field.
    },
    selectedRole: { // Added selectedRole based on frontend logic
        type: String,
        enum: ['recruiter', 'jobseeker', null],
        default: null,
    },
    address: String, // Added optional address
    country: String, // Added optional country
    documentId: String, // Added optional documentId
    recruiterAIWeights: { // Added AI weights
        skillsMatchScore: Number,
        experienceRelevanceScore: Number,
        cultureFitScore: Number,
        growthPotentialScore: Number,
    },
    jobSeekerAIWeights: { // Added AI weights
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
            default: {}, // e.g., { newFeatureX: true }
        },
        // New tailored experience fields
        defaultAIScriptTone: {
            type: String,
            enum: ['professional', 'friendly', 'technical', 'sales', 'general'],
            default: 'professional',
        },
        discoveryItemsPerPage: {
            type: Number,
            default: 10, // Example default
            min: 3,
            max: 20,
        },
        enableExperimentalFeatures: { // More explicit than just a feature flag
            type: Boolean,
            default: false,
        },
    },
}, { timestamps: true }); // Enable timestamps for createdAt and updatedAt

// Export the model
module.exports = mongoose.model('User', UserSchema);

