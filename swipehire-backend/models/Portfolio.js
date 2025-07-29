const mongoose = require('mongoose');

// Sub-schema for media files within projects
const MediaSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['image', 'video', 'audio'],
        required: true
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    alt: {
        type: String,
        trim: true
    },
    width: Number,
    height: Number,
    size: Number,
    duration: Number // For video/audio files
}, { _id: true });

// Sub-schema for external links within projects
const ExternalLinkSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['github', 'live', 'demo', 'documentation', 'other'],
        required: true
    },
    url: {
        type: String,
        required: true,
        trim: true,
        match: [/^https?:\/\/.+/, 'Invalid URL format']
    },
    label: {
        type: String,
        trim: true
    }
}, { _id: true });

// Sub-schema for comments on projects
const CommentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

// Sub-schema for individual projects within a portfolio
const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    media: [MediaSchema],
    links: [ExternalLinkSchema],
    tags: {
        type: [String],
        default: [],
        validate: [arrayLimit(20), 'Too many tags, maximum 20 allowed']
    },
    order: {
        type: Number,
        required: true,
        default: 0
    },
    technologies: {
        type: [String],
        default: [],
        validate: [arrayLimit(30), 'Too many technologies, maximum 30 allowed']
    },
    duration: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        trim: true,
        maxlength: 100
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    likes: {
        type: Number,
        default: 0,
        min: 0
    },
    comments: [CommentSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

// Sub-schema for portfolio statistics
const PortfolioStatsSchema = new mongoose.Schema({
    views: {
        type: Number,
        default: 0,
        min: 0
    },
    likes: {
        type: Number,
        default: 0,
        min: 0
    },
    comments: {
        type: Number,
        default: 0,
        min: 0
    },
    shares: {
        type: Number,
        default: 0,
        min: 0
    },
    lastViewed: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

// Main Portfolio schema
const portfolioSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    projects: [ProjectSchema],
    layout: {
        type: String,
        enum: ['grid', 'list', 'carousel', 'masonry'],
        default: 'grid'
    },
    tags: {
        type: [String],
        default: [],
        validate: [arrayLimit(10), 'Too many tags, maximum 10 allowed']
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    visibility: {
        type: String,
        enum: ['public', 'private', 'unlisted'],
        default: 'private',
        index: true
    },
    url: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[a-z0-9-]+$/, 'URL slug can only contain lowercase letters, numbers, and hyphens'],
        index: true
    },
    theme: {
        type: String,
        trim: true,
        default: 'default'
    },
    customCss: {
        type: String,
        trim: true,
        maxlength: 10000
    },
    seoTitle: {
        type: String,
        trim: true,
        maxlength: 60
    },
    seoDescription: {
        type: String,
        trim: true,
        maxlength: 160
    },
    socialImage: {
        type: String,
        trim: true
    },
    stats: {
        type: PortfolioStatsSchema,
        default: () => ({})
    }
}, {
    timestamps: true
});

// Helper function for array validation
function arrayLimit(val) {
    return function(val_array) {
        return val_array.length <= val;
    };
}

// Indexes for better query performance
portfolioSchema.index({ userId: 1, createdAt: -1 });
portfolioSchema.index({ isPublished: 1, visibility: 1 });
portfolioSchema.index({ tags: 1 });
portfolioSchema.index({ 'stats.views': -1 });
portfolioSchema.index({ 'stats.likes': -1 });

// Pre-save middleware to update project updatedAt timestamps
portfolioSchema.pre('save', function(next) {
    if (this.isModified('projects')) {
        this.projects.forEach(project => {
            if (project.isModified() || project.isNew) {
                project.updatedAt = new Date();
            }
        });
    }
    next();
});

// Static method to find published portfolios
portfolioSchema.statics.findPublished = function(filters = {}) {
    return this.find({
        isPublished: true,
        visibility: { $in: ['public', 'unlisted'] },
        ...filters
    });
};

// Static method to find user's portfolios
portfolioSchema.statics.findByUser = function(userId, includePrivate = true) {
    // Validate that userId is a valid ObjectId before creating new ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        // Return an empty query result if userId is invalid
        return this.find({ _id: null });
    }
    
    const query = { userId: new mongoose.Types.ObjectId(userId) };
    if (!includePrivate) {
        query.isPublished = true;
        query.visibility = { $in: ['public', 'unlisted'] };
    }
    return this.find(query).sort({ updatedAt: -1 });
};

// Instance method to increment view count
portfolioSchema.methods.incrementViews = async function() {
    this.stats.views += 1;
    this.stats.lastViewed = new Date();
    return this.save();
};

// Instance method to toggle like
portfolioSchema.methods.toggleLike = async function(increment = true) {
    if (increment) {
        this.stats.likes += 1;
    } else {
        this.stats.likes = Math.max(0, this.stats.likes - 1);
    }
    return this.save();
};

// Virtual for total project count
portfolioSchema.virtual('projectCount').get(function() {
    return this.projects ? this.projects.length : 0;
});

// Virtual for published project count
portfolioSchema.virtual('publishedProjectCount').get(function() {
    return this.projects ? this.projects.filter(p => p.isPublished).length : 0;
});

// Ensure virtual fields are serialized
portfolioSchema.set('toJSON', { virtuals: true });
portfolioSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);