
// swipehire-backend/DiaryPost.js
const mongoose = require('mongoose');

const DiaryPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
    },
    authorId: { // MongoDB _id of the User who created the post
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    authorName: {
        type: String,
        required: true,
    },
    authorAvatarUrl: {
        type: String,
        default: 'https://placehold.co/100x100.png', // Default placeholder
    },
    imageUrl: {
        type: String,
        trim: true,
    },
    diaryImageHint: {
        type: String,
        trim: true,
    },
    tags: {
        type: [String],
        default: [],
    },
    likes: {
        type: Number,
        default: 0,
    },
    likedBy: { // Array of User MongoDB _ids who liked this post
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: [],
    },
    // Conceptual fields, not fully implemented for interaction yet
    views: {
        type: Number,
        default: 0,
    },
    commentsCount: { // Renamed from 'comments' to avoid confusion if we add actual comment objects
        type: Number,
        default: 0,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true }); // Enable timestamps for createdAt and updatedAt

module.exports = mongoose.model('DiaryPost', DiaryPostSchema);
