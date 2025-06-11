
// swipehire-backend/Notification.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    userId: { // User who should receive this notification
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    type: { // e.g., 'new_match', 'new_message', 'application_update', 'system_alert'
        type: String,
        required: true,
        enum: [
            'new_match', 
            'new_message', 
            'interview_scheduled', 
            'offer_extended', 
            'application_viewed',
            'feedback_request',
            'general_alert', 
            'system_update'
        ],
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    link: { // Optional: deep link into the app, e.g., /matches/:matchId
        type: String,
        trim: true,
    },
    read: {
        type: Boolean,
        default: false,
    },
    isUrgent: { // To differentiate in UI
        type: Boolean,
        default: false,
    },
    // Potentially add: sourceUserId (who triggered the notification, if applicable)
    // Potentially add: sourceEntityId (e.g., matchId, messageId, postId)
}, { timestamps: true }); // Adds createdAt and updatedAt

module.exports = mongoose.model('Notification', NotificationSchema);
