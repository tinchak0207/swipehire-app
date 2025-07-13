const mongoose = require('mongoose');

const reminderTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  reminderType: {
    type: String,
    enum: ['thank-you', 'status-check', 'offer-consideration'],
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  defaultScheduleDelay: {
    type: Number, // Hours after application/interview to schedule reminder
    required: true
  },
  placeholders: [{
    name: String,
    description: String
  }],
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
reminderTemplateSchema.index({ reminderType: 1, isActive: 1 });
reminderTemplateSchema.index({ isDefault: 1 });

// Update the updatedAt field on save
reminderTemplateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const ReminderTemplate = mongoose.model('ReminderTemplate', reminderTemplateSchema);

module.exports = ReminderTemplate;