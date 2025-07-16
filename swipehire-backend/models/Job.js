import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    location: String,
    salaryRange: String,
    jobType: String,
    skillsRequired: [String],
    mediaUrl: String,
    isPublic: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Simple model creation for Workers environment
const Job = mongoose.model('Job', JobSchema);

export { Job };
export default Job;
