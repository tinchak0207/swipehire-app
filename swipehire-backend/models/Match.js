import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
    userA_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userB_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    candidateProfileIdForDisplay: String,
    companyProfileIdForDisplay: String,
    jobOpeningTitle: String,
    matchedAt: {
        type: Date,
        default: Date.now
    },
    applicationTimestamp: Date,
    uniqueMatchKey: {
        type: String,
        unique: true
    },
    status: {
        type: String,
        enum: ['active', 'archived_by_A', 'archived_by_B', 'archived_by_both'],
        default: 'active'
    },
    applicationStatusHistory: [{
        stage: String,
        timestamp: Date,
        description: String
    }]
});

// Pre-save hook to generate uniqueMatchKey
matchSchema.pre('save', function(next) {
    if (!this.uniqueMatchKey) {
        const [smallerId, largerId] = [this.userA_Id, this.userB_Id]
            .map(id => id.toString())
            .sort();
        this.uniqueMatchKey = `${smallerId}-${largerId}`;
    }
    next();
});

export default mongoose.model('Match', matchSchema);
