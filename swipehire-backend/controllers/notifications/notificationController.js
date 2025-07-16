import Notification from '../../models/Notification.js';
import notificationService from '../../services/notificationService.js';

const notificationController = {
  /**
   * Get all notifications for a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getNotifications(req, res) {
    try {
      const { userId } = req.params;
      const notifications = await notificationService.getUserNotifications(userId);
      res.status(200).json(notifications);
    } catch (error) {
      console.error('Error getting notifications:', error);
      res.status(500).json({ message: 'Error getting notifications' });
    }
  },

  /**
   * Mark notification as read
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async markAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const updatedNotification = await notificationService.markNotificationAsRead(notificationId);
      res.status(200).json(updatedNotification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ message: 'Error marking notification as read' });
    }
  },

  /**
   * Delete a notification
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;
      await notificationService.deleteNotification(notificationId);
      res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ message: 'Error deleting notification' });
    }
  },

  /**
   * Clear all notifications for a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async clearAllNotifications(req, res) {
    try {
      const { userId } = req.params;
      await notificationService.clearUserNotifications(userId);
      res.status(200).json({ message: 'All notifications cleared' });
    } catch (error) {
      console.error('Error clearing notifications:', error);
      res.status(500).json({ message: 'Error clearing notifications' });
    }
  }
};

export default notificationController;
