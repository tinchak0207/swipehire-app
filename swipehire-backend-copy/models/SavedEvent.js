const mongoose = require('mongoose');

// Schema for tracking user's saved events
const SavedEventSchema = new mongoose.Schema({
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
    savedAt: { type: Date, default: Date.now },
    
    // Optional notes user can add
    userNotes: { type: String, trim: true },
    
    // Reminder preferences
    reminderSet: { type: Boolean, default: false },
    reminderTime: { type: Date }, // When to send reminder
    reminderSent: { type: Boolean, default: false },
    
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound index to ensure a user can only save an event once
SavedEventSchema.index({ userId: 1, eventId: 1 }, { unique: true });

// Index for efficient queries
SavedEventSchema.index({ userId: 1, savedAt: -1 });
SavedEventSchema.index({ eventId: 1 });
SavedEventSchema.index({ reminderTime: 1, reminderSent: 1 });

// Static method to check if user has saved an event
SavedEventSchema.statics.isEventSavedByUser = async function(userId, eventId) {
    const saved = await this.findOne({ userId, eventId });
    return !!saved;
};

// Static method to get user's saved events
SavedEventSchema.statics.getUserSavedEvents = function(userId, options = {}) {
    const { limit = 20, skip = 0, sortBy = 'savedAt', sortOrder = -1 } = options;
    
    return this.find({ userId })
        .populate('eventId')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit);
};

// Static method to get events that need reminders
SavedEventSchema.statics.getEventsNeedingReminders = function() {
    const now = new Date();
    return this.find({
        reminderSet: true,
        reminderSent: false,
        reminderTime: { $lte: now }
    }).populate(['userId', 'eventId']);
};

const SavedEvent = mongoose.model('SavedEvent', SavedEventSchema);

module.exports = SavedEvent;