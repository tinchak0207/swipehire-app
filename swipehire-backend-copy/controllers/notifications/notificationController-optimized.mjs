import { ObjectId } from 'mongodb';
import { getDatabase } from '../../index.mjs';

// Helper function to select specific fields from a notification object
const selectNotificationFields = (notificationObject) => {
    if (!notificationObject) return null;
    
    return {
        _id: notificationObject._id,
        userId: notificationObject.userId,
        type: notificationObject.type,
        title: notificationObject.title,
        message: notificationObject.message,
        data: notificationObject.data,
        isRead: notificationObject.isRead,
        createdAt: notificationObject.createdAt,
        updatedAt: notificationObject.updatedAt
    };
};

// SOTA: Optimized notification creation with proper indexing
export const createNotification = async (req, res) => {
    try {
        const { userId, type, title, message, data } = req.body;
        
        const db = getDatabase();
        if (!db) {
            return res.status(503).json({ message: 'Database service unavailable' });
        }

        // Validation
        if (!userId || !ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        if (!type || typeof type !== 'string' || type.trim().length === 0) {
            return res.status(400).json({ message: 'Notification type is required' });
        }

        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            return res.status(400).json({ message: 'Notification title is required' });
        }

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({ message: 'Notification message is required' });
        }

        // SOTA: Check if user exists
        const userExists = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        if (!userExists) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newNotification = {
            userId: userId,
            type: type.trim(),
            title: title.trim(),
            message: message.trim(),
            data: data || {},
            isRead: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection('notifications').insertOne(newNotification);
        const createdNotification = { ...newNotification, _id: result.insertedId };

        return res.status(201).json({
            message: 'Notification created successfully',
            notification: selectNotificationFields(createdNotification)
        });
    } catch (error) {
        console.error('Notification creation error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// SOTA: Optimized query with pagination and filtering
export const getNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const { 
            type, 
            isRead, 
            page = 1, 
            limit = 20, 
            sortBy = 'newest' 
        } = req.query;
        
        const db = getDatabase();
        if (!db) {
            return res.status(503).json({ message: 'Database service unavailable' });
        }

        if (!userId || !ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // SOTA: Compound query with multiple filters
        let query = { userId: userId };
        
        if (type) {
            query.type = type;
        }
        
        if (isRead !== undefined) {
            query.isRead = isRead === 'true';
        }

        // SOTA: Optimized aggregation with pagination
        const pipeline = [
            { $match: query },
            {
                $sort: sortBy === 'oldest' 
                    ? { createdAt: 1 } 
                    : { createdAt: -1 }
            },
            { $skip: skip },
            { $limit: parseInt(limit) },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    type: 1,
                    title: 1,
                    message: 1,
                    data: 1,
                    isRead: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ];

        const [notifications, totalCount, unreadCount] = await Promise.all([
            db.collection('notifications').aggregate(pipeline).toArray(),
            db.collection('notifications').countDocuments(query),
            db.collection('notifications').countDocuments({ userId: userId, isRead: false })
        ]);

        return res.status(200).json({
            notifications,
            summary: {
                total: totalCount,
                unread: unreadCount,
                read: totalCount - unreadCount
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// SOTA: Optimized mark as read with bulk operations
export const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const { userId } = req.body;
        
        const db = getDatabase();
        if (!db) {
            return res.status(503).json({ message: 'Database service unavailable' });
        }

        if (!notificationId || !ObjectId.isValid(notificationId)) {
            return res.status(400).json({ message: 'Invalid notification ID' });
        }

        const query = { _id: new ObjectId(notificationId) };
        if (userId) {
            query.userId = userId;
        }

        const result = await db.collection('notifications').findOneAndUpdate(
            query,
            { $set: { isRead: true, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );

        if (!result.value) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        return res.status(200).json({
            message: 'Notification marked as read',
            notification: selectNotificationFields(result.value)
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// SOTA: Bulk mark as read for all user notifications
export const markAllAsRead = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const db = getDatabase();
        if (!db) {
            return res.status(503).json({ message: 'Database service unavailable' });
        }

        if (!userId || !ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const result = await db.collection('notifications').updateMany(
            { userId: userId, isRead: false },
            { $set: { isRead: true, updatedAt: new Date() } }
        );

        return res.status(200).json({
            message: `${result.modifiedCount} notifications marked as read`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// SOTA: Optimized deletion with proper authorization
export const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const { userId } = req.body;
        
        const db = getDatabase();
        if (!db) {
            return res.status(503).json({ message: 'Database service unavailable' });
        }

        if (!notificationId || !ObjectId.isValid(notificationId)) {
            return res.status(400).json({ message: 'Invalid notification ID' });
        }

        const query = { _id: new ObjectId(notificationId) };
        if (userId) {
            query.userId = userId;
        }

        const result = await db.collection('notifications').findOneAndDelete(query);

        if (!result.value) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        return res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// SOTA: Bulk clear all notifications for a user
export const clearAllNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const db = getDatabase();
        if (!db) {
            return res.status(503).json({ message: 'Database service unavailable' });
        }

        if (!userId || !ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const result = await db.collection('notifications').deleteMany({
            userId: userId
        });

        return res.status(200).json({
            message: `${result.deletedCount} notifications cleared`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error clearing notifications:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// SOTA: Get notification statistics for a user
export const getNotificationStats = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const db = getDatabase();
        if (!db) {
            return res.status(503).json({ message: 'Database service unavailable' });
        }

        if (!userId || !ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const pipeline = [
            { $match: { userId: userId } },
            {
                $group: {
                    _id: null,
                    totalNotifications: { $sum: 1 },
                    unreadNotifications: {
                        $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
                    },
                    readNotifications: {
                        $sum: { $cond: [{ $eq: ['$isRead', true] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalNotifications: 1,
                    unreadNotifications: 1,
                    readNotifications: 1
                }
            }
        ];

        const [stats] = await db.collection('notifications').aggregate(pipeline).toArray();

        if (!stats) {
            return res.status(200).json({
                totalNotifications: 0,
                unreadNotifications: 0,
                readNotifications: 0
            });
        }

        return res.status(200).json(stats);
    } catch (error) {
        console.error('Error fetching notification stats:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// SOTA: Create notifications for multiple users (bulk operation)
export const createBulkNotifications = async (req, res) => {
    try {
        const { notifications } = req.body;
        
        const db = getDatabase();
        if (!db) {
            return res.status(503).json({ message: 'Database service unavailable' });
        }

        if (!Array.isArray(notifications) || notifications.length === 0) {
            return res.status(400).json({ message: 'Notifications array is required' });
        }

        // Validate all notifications
        const validNotifications = notifications.filter(notification => {
            return (
                notification.userId && ObjectId.isValid(notification.userId) &&
                notification.type && typeof notification.type === 'string' &&
                notification.title && typeof notification.title === 'string' &&
                notification.message && typeof notification.message === 'string'
            );
        });

        if (validNotifications.length === 0) {
            return res.status(400).json({ message: 'No valid notifications provided' });
        }

        const notificationsToInsert = validNotifications.map(notification => ({
            userId: notification.userId,
            type: notification.type.trim(),
            title: notification.title.trim(),
            message: notification.message.trim(),
            data: notification.data || {},
            isRead: false,
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        const result = await db.collection('notifications').insertMany(notificationsToInsert);

        return res.status(201).json({
            message: `${result.insertedCount} notifications created successfully`,
            insertedCount: result.insertedCount,
            insertedIds: result.insertedIds
        });
    } catch (error) {
        console.error('Error creating bulk notifications:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export default {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getNotificationStats,
    createBulkNotifications
};