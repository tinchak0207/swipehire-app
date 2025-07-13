const mongoose = require('mongoose');

// Sub-schema for event speakers
const EventSpeakerSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    bio: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    linkedinUrl: { type: String, trim: true },
    twitterUrl: { type: String, trim: true },
    githubUrl: { type: String, trim: true },
    portfolioUrl: { type: String, trim: true },
}, { _id: true });

// Sub-schema for event location
const EventLocationSchema = new mongoose.Schema({
    type: { 
        type: String, 
        required: true,
        enum: ['virtual', 'in_person', 'hybrid'],
        trim: true 
    },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    venue: { type: String, trim: true },
    address: { type: String, trim: true },
    platform: { type: String, trim: true }, // For virtual/hybrid events
    meetingUrl: { type: String, trim: true },
}, { _id: false });

// Sub-schema for event sessions (for multi-day events)
const EventSessionSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },
    speakers: [{ type: String, trim: true }], // Speaker IDs or names
    track: { type: String, trim: true }, // For parallel sessions
}, { _id: true });

// Main Event schema
const EventSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    shortDescription: { type: String, trim: true },
    
    eventType: { 
        type: String, 
        required: true,
        enum: ['conference', 'workshop', 'seminar', 'meetup', 'webinar', 'networking', 'job_fair', 'bootcamp'],
        trim: true 
    },
    
    format: { 
        type: String, 
        required: true,
        enum: ['virtual', 'in_person', 'hybrid'],
        trim: true 
    },
    
    location: { type: EventLocationSchema, required: true },
    
    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },
    timezone: { type: String, required: true, trim: true },
    
    organizer: { type: String, required: true, trim: true },
    organizerLogo: { type: String, trim: true },
    organizerWebsite: { type: String, trim: true },
    
    industry: { type: [String], required: true },
    tags: { type: [String], default: [] },
    targetAudience: { type: [String], default: [] },
    
    skillLevel: { 
        type: String, 
        enum: ['beginner', 'intermediate', 'advanced', 'all_levels'],
        default: 'all_levels',
        trim: true 
    },
    
    registrationUrl: { type: String, required: true, trim: true },
    price: { type: Number, default: 0 },
    currency: { type: String, default: 'USD', trim: true },
    isFree: { type: Boolean, default: true },
    
    capacity: { type: Number },
    registeredCount: { type: Number, default: 0 },
    waitlistAvailable: { type: Boolean, default: false },
    
    imageUrl: { type: String, trim: true },
    bannerUrl: { type: String, trim: true },
    
    speakers: [EventSpeakerSchema],
    sessions: [EventSessionSchema], // For multi-session events
    
    featured: { type: Boolean, default: false },
    
    // AI recommendation system fields
    recommendationScore: { type: Number, min: 0, max: 100 },
    recommendationReasons: { type: [String], default: [] },
    
    // Status and metadata
    status: {
        type: String,
        enum: ['draft', 'published', 'cancelled', 'ended'],
        default: 'published',
        trim: true
    },
    
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    
    // User interaction tracking
    viewCount: { type: Number, default: 0 },
    saveCount: { type: Number, default: 0 },
    registrationClickCount: { type: Number, default: 0 },
    
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
EventSchema.index({ startDateTime: 1 });
EventSchema.index({ industry: 1 });
EventSchema.index({ eventType: 1 });
EventSchema.index({ format: 1 });
EventSchema.index({ 'location.city': 1 });
EventSchema.index({ tags: 1 });
EventSchema.index({ featured: 1, startDateTime: 1 });
EventSchema.index({ status: 1, startDateTime: 1 });

// Text search index
EventSchema.index({
    title: 'text',
    description: 'text',
    tags: 'text',
    industry: 'text'
});

// Virtual for event duration
EventSchema.virtual('duration').get(function() {
    if (this.startDateTime && this.endDateTime) {
        return this.endDateTime - this.startDateTime;
    }
    return null;
});

// Virtual for event status based on dates
EventSchema.virtual('eventStatus').get(function() {
    const now = new Date();
    if (this.status === 'cancelled') return 'cancelled';
    if (this.startDateTime > now) return 'upcoming';
    if (this.endDateTime < now) return 'ended';
    return 'live';
});

// Virtual for spots remaining
EventSchema.virtual('spotsRemaining').get(function() {
    if (!this.capacity) return null;
    return Math.max(0, this.capacity - this.registeredCount);
});

// Pre-save middleware to update timestamps
EventSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Static methods for common queries
EventSchema.statics.findUpcoming = function() {
    return this.find({
        status: 'published',
        startDateTime: { $gte: new Date() }
    }).sort({ startDateTime: 1 });
};

EventSchema.statics.findFeatured = function() {
    return this.find({
        status: 'published',
        featured: true,
        startDateTime: { $gte: new Date() }
    }).sort({ startDateTime: 1 });
};

EventSchema.statics.findByIndustry = function(industries) {
    return this.find({
        status: 'published',
        industry: { $in: industries },
        startDateTime: { $gte: new Date() }
    }).sort({ recommendationScore: -1, startDateTime: 1 });
};

const Event = mongoose.model('Event', EventSchema);

module.exports = Event;