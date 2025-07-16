const mongoose = require('mongoose');

const industryEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  detailedDescription: {
    type: String,
    maxlength: 5000
  },
  eventType: {
    type: String,
    required: true,
    enum: ['seminar', 'workshop', 'job_fair', 'online_lecture', 'conference', 'networking', 'webinar', 'meetup']
  },
  industry: {
    type: String,
    required: true,
    enum: [
      'technology', 'finance', 'healthcare', 'education', 'marketing',
      'consulting', 'manufacturing', 'retail', 'media', 'non_profit',
      'government', 'real_estate', 'hospitality', 'transportation',
      'energy', 'agriculture', 'construction', 'legal', 'other'
    ]
  },
  location: {
    type: {
      type: String,
      enum: ['online', 'offline'],
      required: true
    },
    address: {
      type: String,
      required: function() { return this.location.type === 'offline'; }
    },
    city: {
      type: String,
      required: function() { return this.location.type === 'offline'; }
    },
    country: {
      type: String,
      required: function() { return this.location.type === 'offline'; }
    },
    platform: {
      type: String,
      required: function() { return this.location.type === 'online'; }
    },
    meetingUrl: {
      type: String,
      required: function() { return this.location.type === 'online'; }
    }
  },
  startDateTime: {
    type: Date,
    required: true
  },
  endDateTime: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v > this.startDateTime;
      },
      message: 'End date must be after start date'
    }
  },
  organizer: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    website: {
      type: String,
      trim: true
    },
    logoUrl: {
      type: String,
      trim: true
    }
  },
  agenda: [{
    time: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true,
      maxlength: 200
    },
    speaker: {
      type: String,
      maxlength: 100
    }
  }],
  speakers: [{
    name: {
      type: String,
      required: true,
      maxlength: 100
    },
    title: {
      type: String,
      maxlength: 150
    },
    company: {
      type: String,
      maxlength: 100
    },
    bio: {
      type: String,
      maxlength: 500
    },
    photoUrl: {
      type: String
    }
  }],
  registrationUrl: {
    type: String,
    required: true,
    trim: true
  },
  maxAttendees: {
    type: Number,
    min: 1
  },
  currentAttendees: {
    type: Number,
    default: 0,
    min: 0
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  targetAudience: [{
    type: String,
    enum: ['entry_level', 'mid_level', 'senior_level', 'executive', 'student', 'career_changer']
  }],
  skills: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  cost: {
    type: {
      type: String,
      enum: ['free', 'paid'],
      default: 'free'
    },
    amount: {
      type: Number,
      min: 0,
      required: function() { return this.cost.type === 'paid'; }
    },
    currency: {
      type: String,
      default: 'USD',
      required: function() { return this.cost.type === 'paid'; }
    }
  },
  imageUrl: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Indexes for better performance
industryEventSchema.index({ industry: 1, startDateTime: 1 });
industryEventSchema.index({ 'location.city': 1, startDateTime: 1 });
industryEventSchema.index({ eventType: 1, startDateTime: 1 });
industryEventSchema.index({ tags: 1 });
industryEventSchema.index({ targetAudience: 1 });
industryEventSchema.index({ skills: 1 });
industryEventSchema.index({ status: 1, isActive: 1 });

// Update the updatedAt field before saving
industryEventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for checking if event is full
industryEventSchema.virtual('isFull').get(function() {
  return this.maxAttendees && this.currentAttendees >= this.maxAttendees;
});

// Virtual for event duration in hours
industryEventSchema.virtual('durationHours').get(function() {
  return Math.ceil((this.endDateTime - this.startDateTime) / (1000 * 60 * 60));
});

// Method to check if event is happening soon (within 24 hours)
industryEventSchema.methods.isHappeningSoon = function() {
  const now = new Date();
  const timeDiff = this.startDateTime - now;
  return timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000; // 24 hours in milliseconds
};

// Method to check if registration is still open
industryEventSchema.methods.isRegistrationOpen = function() {
  return this.status === 'upcoming' && this.isActive && !this.isFull;
};

const IndustryEvent = mongoose.model('IndustryEvent', industryEventSchema);

module.exports = IndustryEvent;