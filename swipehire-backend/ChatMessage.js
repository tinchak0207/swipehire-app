
// swipehire-backend/ChatMessage.js
const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
    matchId: { // Reference to the Match document _id
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true,
        index: true,
    },
    senderId: { // MongoDB User _id of the sender
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receiverId: { // MongoDB User _id of the receiver
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    text: {
        type: String,
        required: true,
        trim: true,
    },
    read: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
