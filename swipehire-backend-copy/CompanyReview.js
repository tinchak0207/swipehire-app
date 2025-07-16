// swipehire-backend/CompanyReview.js
const mongoose = require('mongoose');

const CompanyReviewSchema = new mongoose.Schema({
    companyId: { // MongoDB User _id of the company/recruiter being reviewed
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming companies/recruiters are also Users
        required: true,
    },
    jobId: { // Optional: if the review is specific to a job application process
        type: String, // Could be mongoose.Schema.Types.ObjectId if jobs are separate documents
        trim: true,
    },
    reviewerUserId: { // MongoDB User _id of the job seeker writing the review
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    responsivenessRating: { // How quickly the company responded
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    attitudeRating: { // Professionalism and attitude of recruiters/interviewers
        type: Number,
        min: 1,
        max: 3, // As per UI
        required: true,
    },
    processExperienceRating: { // Overall satisfaction with the recruitment process
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    comments: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 1000,
    },
    isAnonymous: {
        type: Boolean,
        default: false,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true }); // Adds createdAt and updatedAt

module.exports = mongoose.model('CompanyReview', CompanyReviewSchema);
