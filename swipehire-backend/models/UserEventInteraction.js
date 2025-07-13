const mongoose = require('mongoose');

const userEventInteractionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IndustryEvent',
    required: true
  },
  interactionType: {
    type: String,
    enum: ['viewed', 'saved', 'registered', 'attended', 'feedback'],
    required: true
  },
  interactionData: {
    // For 'feedback' interactions
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: {
      type: String,
      maxlength: 1000
    },
    // For 'registered' interactions
    registrationDate: {
      type: Date
    },
    // For 'attended' interactions
    attendanceConfirmed: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique interactions per user per event per type
userEventInteractionSchema.index({ userId: 1, eventId: 1, interactionType: 1 }, { unique: true });

// Additional indexes for queries
userEventInteractionSchema.index({ userId: 1, interactionType: 1 });
userEventInteractionSchema.index({ eventId: 1, interactionType: 1 });
userEventInteractionSchema.index({ createdAt: 1 });

const UserEventInteraction = mongoose.model('UserEventInteraction', userEventInteractionSchema);

module.exports = UserEventInteraction;