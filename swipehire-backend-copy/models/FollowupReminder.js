const mongoose = require('mongoose');

const followupReminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  reminderType: {
    type: String,
    enum: ['thank_you', 'status_inquiry', 'follow_up', 'custom'],
    required: true
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'snoozed'],
    default: 'pending'
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReminderTemplate'
  },
  customMessage: String,
  completedAt: Date,
  snoozeUntil: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
followupReminderSchema.index({ userId: 1, status: 1 });
followupReminderSchema.index({ scheduledAt: 1, status: 1 });
followupReminderSchema.index({ matchId: 1 });

// Update the updatedAt field on save
followupReminderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const FollowupReminder = mongoose.model('FollowupReminder', followupReminderSchema);

module.exports = FollowupReminder;