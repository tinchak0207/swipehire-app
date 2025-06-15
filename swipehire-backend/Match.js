// swipehire-backend/Match.js
const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
    userA_Id: { // MongoDB _id of one user in the match (e.g., recruiter)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    userB_Id: { // MongoDB _id of the other user in the match (e.g., job seeker)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    candidateProfileIdForDisplay: {
        type: String,
        required: true,
    },
    companyProfileIdForDisplay: { 
        type: String,
        required: true,
    },
    jobOpeningTitle: {
        type: String,
    },
    matchedAt: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['active', 'archived_by_A', 'archived_by_B', 'archived_by_both'],
        default: 'active',
        index: true,
    },
    uniqueMatchKey: {
        type: String,
        unique: true,
        required: true, // ensure required is still here as per original
        index: true, // unique implies index, but explicit is fine
    },
    // Added for application tracking directly on the match
    applicationStatusHistory: {
        type: Array, // Array of { stage: String, timestamp: Date, description?: String, nextStepSuggestion?: String, responseNeeded?: Boolean }
        default: [],
    },
    applicationTimestamp: { // When the job seeker effectively "applied" or confirmed interest after match
        type: Date,
    },
}, { timestamps: true });


module.exports = mongoose.model('Match', MatchSchema);
