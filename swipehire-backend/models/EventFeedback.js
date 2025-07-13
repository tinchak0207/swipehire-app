const mongoose = require('mongoose');

// Schema for event feedback and reviews
const EventFeedbackSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    eventId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Event', 
        required: true 
    },
    
    // Overall rating and review
    overallRating: { 
        type: Number, 
        required: true,
        min: 1, 
        max: 5 
    },
    review: { type: String, trim: true },
    
    // Detailed ratings
    contentQuality: { type: Number, min: 1, max: 5 },
    speakerQuality: { type: Number, min: 1, max: 5 },
    organizationQuality: { type: Number, min: 1, max: 5 },
    networkingValue: { type: Number, min: 1, max: 5 },
    valueForMoney: { type: Number, min: 1, max: 5 },
    
    // Recommendations
    wouldRecommend: { type: Boolean, required: true },
    wouldAttendAgain: { type: Boolean },
    
    // What did they like most/least
    mostValuable: { type: String, trim: true },
    leastValuable: { type: String, trim: true },
    suggestions: { type: String, trim: true },
    
    // Anonymous feedback option
    isAnonymous: { type: Boolean, default: false },
    
    // Moderation
    isPublic: { type: Boolean, default: true },
    isModerated: { type: Boolean, default: false },
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    moderationNotes: { type: String, trim: true },
    
    // Interaction tracking
    helpfulVotes: { type: Number, default: 0 },
    reportCount: { type: Number, default: 0 },
    
    submittedAt: { type: Date, default: Date.now },
    
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound index to ensure a user can only leave feedback once per event
EventFeedbackSchema.index({ userId: 1, eventId: 1 }, { unique: true });

// Indexes for efficient queries
EventFeedbackSchema.index({ eventId: 1, isPublic: 1, overallRating: -1 });
EventFeedbackSchema.index({ userId: 1, submittedAt: -1 });
EventFeedbackSchema.index({ isModerated: 1 });

// Virtual for average detailed rating
EventFeedbackSchema.virtual('averageDetailedRating').get(function() {
    const ratings = [
        this.contentQuality,
        this.speakerQuality,
        this.organizationQuality,
        this.networkingValue,
        this.valueForMoney
    ].filter(rating => rating != null);
    
    if (ratings.length === 0) return null;
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
});

// Static method to get event feedback summary
EventFeedbackSchema.statics.getEventSummary = async function(eventId) {
    const pipeline = [
        { 
            $match: { 
                eventId: new mongoose.Types.ObjectId(eventId),
                isPublic: true 
            } 
        },
        {
            $group: {
                _id: null,
                totalReviews: { $sum: 1 },
                averageRating: { $avg: '$overallRating' },
                recommendationPercentage: { 
                    $avg: { $cond: ['$wouldRecommend', 1, 0] } 
                },
                ratingDistribution: {
                    $push: '$overallRating'
                },
                avgContentQuality: { $avg: '$contentQuality' },
                avgSpeakerQuality: { $avg: '$speakerQuality' },
                avgOrganizationQuality: { $avg: '$organizationQuality' },
                avgNetworkingValue: { $avg: '$networkingValue' },
                avgValueForMoney: { $avg: '$valueForMoney' }
            }
        }
    ];
    
    const result = await this.aggregate(pipeline);
    
    if (result.length === 0) {
        return {
            totalReviews: 0,
            averageRating: 0,
            recommendationPercentage: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            detailedRatings: {}
        };
    }
    
    const summary = result[0];
    
    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    summary.ratingDistribution.forEach(rating => {
        distribution[rating]++;
    });
    
    return {
        totalReviews: summary.totalReviews,
        averageRating: Math.round(summary.averageRating * 10) / 10,
        recommendationPercentage: Math.round(summary.recommendationPercentage * 100),
        ratingDistribution: distribution,
        detailedRatings: {
            contentQuality: summary.avgContentQuality ? Math.round(summary.avgContentQuality * 10) / 10 : null,
            speakerQuality: summary.avgSpeakerQuality ? Math.round(summary.avgSpeakerQuality * 10) / 10 : null,
            organizationQuality: summary.avgOrganizationQuality ? Math.round(summary.avgOrganizationQuality * 10) / 10 : null,
            networkingValue: summary.avgNetworkingValue ? Math.round(summary.avgNetworkingValue * 10) / 10 : null,
            valueForMoney: summary.avgValueForMoney ? Math.round(summary.avgValueForMoney * 10) / 10 : null
        }
    };
};

// Static method to get public feedback for an event
EventFeedbackSchema.statics.getPublicFeedback = function(eventId, options = {}) {
    const { 
        limit = 10, 
        skip = 0, 
        sortBy = 'helpfulVotes', 
        sortOrder = -1,
        minRating = null
    } = options;
    
    const query = { 
        eventId: new mongoose.Types.ObjectId(eventId),
        isPublic: true 
    };
    
    if (minRating) {
        query.overallRating = { $gte: minRating };
    }
    
    return this.find(query)
        .populate('userId', 'name profileAvatarUrl')
        .sort({ [sortBy]: sortOrder, submittedAt: -1 })
        .skip(skip)
        .limit(limit);
};

// Instance method to check if feedback is helpful
EventFeedbackSchema.methods.markHelpful = function() {
    this.helpfulVotes++;
    return this.save();
};

const EventFeedback = mongoose.model('EventFeedback', EventFeedbackSchema);

module.exports = EventFeedback;