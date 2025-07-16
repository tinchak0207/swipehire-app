const mongoose = require('mongoose');

const diaryPostSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: true,
        maxlength: 5000
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    authorName: {
        type: String,
        required: true
    },
    authorAvatarUrl: String,
    imageUrl: String,
    diaryImageHint: String,
    tags: [String],
    isFeatured: Boolean,
    status: {
        type: String,
        enum: ['pending_review', 'approved', 'rejected'],
        default: 'pending_review'
    },
    likes: {
        type: Number,
        default: 0
    },
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        userName: {
            type: String,
            required: true
        },
        userAvatarUrl: String,
        text: {
            type: String,
            required: true,
            maxlength: 1000
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    commentsCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('DiaryPost', diaryPostSchema);
