const mongoose = require('mongoose');

const companyReviewSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobId: String,
    reviewerUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    responsivenessRating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    attitudeRating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    processExperienceRating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comments: {
        type: String,
        required: true
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CompanyReview', companyReviewSchema);
