const mongoose = require('mongoose');

// Schema for tracking user event registrations
const EventRegistrationSchema = new mongoose.Schema({
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
    registeredAt: { type: Date, default: Date.now },
    
    // Registration details
    registrationSource: { 
        type: String, 
        enum: ['swipehire', 'external', 'direct'],
        default: 'swipehire'
    },
    externalRegistrationId: { type: String, trim: true }, // ID from external platform
    
    // Attendance tracking
    attended: { type: Boolean, default: false },
    attendanceConfirmedAt: { type: Date },
    
    // Feedback after event
    feedback: {
        rating: { type: Number, min: 1, max: 5 },
        review: { type: String, trim: true },
        wouldRecommend: { type: Boolean },
        submittedAt: { type: Date }
    },
    
    // Status tracking
    status: {
        type: String,
        enum: ['registered', 'confirmed', 'cancelled', 'attended', 'no_show'],
        default: 'registered'
    },
    
    // Cancellation details
    cancelledAt: { type: Date },
    cancellationReason: { type: String, trim: true },
    
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound index to ensure a user can only register for an event once
EventRegistrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

// Indexes for efficient queries
EventRegistrationSchema.index({ userId: 1, registeredAt: -1 });
EventRegistrationSchema.index({ eventId: 1, status: 1 });
EventRegistrationSchema.index({ status: 1, registeredAt: -1 });

// Static method to check if user is registered for an event
EventRegistrationSchema.statics.isUserRegistered = async function(userId, eventId) {
    const registration = await this.findOne({ 
        userId, 
        eventId, 
        status: { $in: ['registered', 'confirmed', 'attended'] }
    });
    return !!registration;
};

// Static method to get user's registrations
EventRegistrationSchema.statics.getUserRegistrations = function(userId, options = {}) {
    const { 
        limit = 20, 
        skip = 0, 
        sortBy = 'registeredAt', 
        sortOrder = -1,
        status = null
    } = options;
    
    const query = { userId };
    if (status) {
        query.status = status;
    }
    
    return this.find(query)
        .populate('eventId')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit);
};

// Static method to get event registrations
EventRegistrationSchema.statics.getEventRegistrations = function(eventId, options = {}) {
    const { 
        limit = 50, 
        skip = 0, 
        status = null
    } = options;
    
    const query = { eventId };
    if (status) {
        query.status = status;
    }
    
    return this.find(query)
        .populate('userId', 'name email profileAvatarUrl')
        .sort({ registeredAt: -1 })
        .skip(skip)
        .limit(limit);
};

// Static method to get registration stats for an event
EventRegistrationSchema.statics.getEventStats = async function(eventId) {
    const stats = await this.aggregate([
        { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);
    
    const result = {
        total: 0,
        registered: 0,
        confirmed: 0,
        cancelled: 0,
        attended: 0,
        no_show: 0
    };
    
    stats.forEach(stat => {
        result[stat._id] = stat.count;
        if (stat._id !== 'cancelled') {
            result.total += stat.count;
        }
    });
    
    return result;
};

// Pre-save middleware to handle status changes
EventRegistrationSchema.pre('save', function(next) {
    if (this.isModified('status')) {
        if (this.status === 'cancelled' && !this.cancelledAt) {
            this.cancelledAt = new Date();
        }
        if (this.status === 'attended' && !this.attendanceConfirmedAt) {
            this.attendanceConfirmedAt = new Date();
            this.attended = true;
        }
    }
    next();
});

const EventRegistration = mongoose.model('EventRegistration', EventRegistrationSchema);

module.exports = EventRegistration;