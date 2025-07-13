const followupReminderService = require('../../services/followupReminderService');

const followupReminderController = {
  // Create a new follow-up reminder
  async createReminder(req, res) {
    try {
      const { matchId, reminderType, scheduledDate, customMessage } = req.body;
      const { userId } = req.params;

      if (!matchId || !reminderType || !scheduledDate) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: matchId, reminderType, scheduledDate'
        });
      }

      const reminder = await followupReminderService.createReminder(
        userId, 
        matchId, 
        reminderType, 
        new Date(scheduledDate), // Convert to Date object - service expects scheduledAt
        null, // templateId
        customMessage
      );

      res.status(201).json({
        success: true,
        data: reminder,
        message: 'Follow-up reminder created successfully'
      });
    } catch (error) {
      console.error('Error creating follow-up reminder:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create follow-up reminder',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  },

  // Get all reminders for a user
  async getUserReminders(req, res) {
    try {
      const { userId } = req.params;
      const { status, page = 1, limit = 10 } = req.query;

      const reminders = await followupReminderService.getUserReminders(
        userId, 
        status, 
        parseInt(page), 
        parseInt(limit)
      );

      res.status(200).json({
        success: true,
        data: reminders,
        message: 'Reminders retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching user reminders:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reminders',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  },

  // Get reminders for a specific match
  async getMatchReminders(req, res) {
    try {
      const { userId, matchId } = req.params;

      if (!matchId) {
        return res.status(400).json({
          success: false,
          message: 'Match ID is required'
        });
      }

      const reminders = await followupReminderService.getMatchReminders(userId, matchId);

      res.status(200).json({
        success: true,
        data: reminders,
        message: 'Match reminders retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching match reminders:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch match reminders',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  },

  // Update reminder status
  async updateReminderStatus(req, res) {
    try {
      const { reminderId } = req.params;
      const { status } = req.body;

      if (!reminderId || !status) {
        return res.status(400).json({
          success: false,
          message: 'Reminder ID and status are required'
        });
      }

      const updatedReminder = await followupReminderService.updateReminderStatus(
        reminderId, 
        status
      );

      res.status(200).json({
        success: true,
        data: updatedReminder,
        message: 'Reminder status updated successfully'
      });
    } catch (error) {
      console.error('Error updating reminder status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update reminder status',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  },

  // Snooze a reminder
  async snoozeReminder(req, res) {
    try {
      const { reminderId } = req.params;
      const { newDate } = req.body;

      if (!reminderId || !newDate) {
        return res.status(400).json({
          success: false,
          message: 'Reminder ID and new date are required'
        });
      }

      const snoozedReminder = await followupReminderService.updateReminderStatus(
        reminderId, 
        'snoozed',
        new Date(newDate)
      );

      res.status(200).json({
        success: true,
        data: snoozedReminder,
        message: 'Reminder snoozed successfully'
      });
    } catch (error) {
      console.error('Error snoozing reminder:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to snooze reminder',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  },

  // Delete a reminder
  async deleteReminder(req, res) {
    try {
      const { reminderId } = req.params;
      const { userId } = req.query; // Get userId from query parameter for now

      if (!reminderId) {
        return res.status(400).json({
          success: false,
          message: 'Reminder ID is required'
        });
      }

      await followupReminderService.deleteReminder(reminderId, userId || 'temp_user');

      res.status(200).json({
        success: true,
        message: 'Reminder deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting reminder:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete reminder',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  },

  // Get due reminders (for notifications)
  async getDueReminders(req, res) {
    try {
      const { time } = req.query;
      const checkTime = time ? new Date(time) : new Date();

      const dueReminders = await followupReminderService.getDueReminders(checkTime);

      res.status(200).json({
        success: true,
        data: dueReminders,
        message: 'Due reminders retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching due reminders:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch due reminders',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  },

  // Get reminder templates
  async getReminderTemplates(req, res) {
    try {
      const { type } = req.query;
      const templates = await followupReminderService.getReminderTemplates(type);

      res.status(200).json({
        success: true,
        data: templates,
        message: 'Reminder templates retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching reminder templates:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reminder templates',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
};

module.exports = followupReminderController;