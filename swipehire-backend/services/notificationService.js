
// swipehire-backend/services/notificationService.js
const Notification = require('../models/Notification');
const User = require('../models/User'); // To check user preferences

async function createAndStoreNotification(
    recipientUserId,
    type,
    title,
    message,
    link = null,
    isUrgent = false
) {
    try {
        if (!recipientUserId || !type || !title || !message) {
            console.error('[NotificationService] Missing required fields for notification.');
            return null;
        }

        const recipient = await User.findById(recipientUserId).select('preferences.notificationChannels preferences.notificationSubscriptions');
        if (!recipient) {
            console.warn(`[NotificationService] Recipient user ${recipientUserId} not found. Cannot create notification.`);
            return null;
        }

        // Conceptual: Check user's notification preferences before creating/sending
        // For example:
        // if (type === 'new_message' && !recipient.preferences?.notificationSubscriptions?.matchUpdates) {
        //   console.log(`[NotificationService] User ${recipientUserId} has unsubscribed from matchUpdates. Notification for new_message not created.`);
        //   return null;
        // }
        // if (!recipient.preferences?.notificationChannels?.inAppToast && !recipient.preferences?.notificationChannels?.inAppBanner) {
        //   console.log(`[NotificationService] User ${recipientUserId} has disabled all in-app notifications. Notification not created.`);
        //   return null;
        // }


        const notification = new Notification({
            userId: recipientUserId,
            type,
            title,
            message,
            link,
            isUrgent,
            read: false,
        });
        await notification.save();
        console.log(`[NotificationService] Notification created and stored for user ${recipientUserId}, type: ${type}`);

        // TODO: Conceptual - Integrate with actual push notification service (Firebase FCM, OneSignal, etc.)
        // if (recipient.preferences?.notificationChannels?.email) { /* Send email */ }
        // if (recipient.preferences?.notificationChannels?.sms) { /* Send SMS */ }
        // Real-time push via Socket.IO might be handled directly in the route or by emitting an event here.

        return notification;
    } catch (error) {
        console.error(`[NotificationService] Error creating notification for user ${recipientUserId}:`, error);
        // Depending on retry strategy, you might re-throw or handle differently
        return null; 
    }
}

async function deleteAllNotificationsForUser(userId) {
    try {
        const result = await Notification.deleteMany({ userId: userId });
        console.log(`[NotificationService] Deleted ${result.deletedCount} notifications for user ${userId}.`);
        return result;
    } catch (error) {
        console.error(`[NotificationService] Error deleting notifications for user ${userId}:`, error);
        throw error;
    }
}


module.exports = {
    createAndStoreNotification,
    deleteAllNotificationsForUser,
};
