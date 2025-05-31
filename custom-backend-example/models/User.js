
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
        trim: true, // Added trim as good practice
    },
    // preferences for tailored experience (for instance, theme, feature flags, etc.)
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light',
        },
        // Add any other properties you require for the unique experience
        featureFlags: {
            type: Map,
            of: Boolean,
            default: {}, // e.g., { newFeatureX: true }
        },
    },
}, { timestamps: true }); // Enable timestamps for createdAt and updatedAt

// Export the model
module.exports = mongoose.model('User', User