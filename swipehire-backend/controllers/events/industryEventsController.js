import industryEventsService from '../../services/industryEventsService.js';

const industryEventsController = {
  // Get recommended events for user
  async getRecommendedEvents(req, res) {
    try {
      const userId = req.user.id;
      const {
        page = 1,
        limit = 10,
        industry,
        eventType,
        location,
        dateFrom,
        dateTo,
        cost,
        targetAudience,
        search
      } = req.query;

      const filters = {
        industry,
        eventType,
        location,
        dateFrom,
        dateTo,
        cost,
        targetAudience,
        search
      };

      const result = await industryEventsService.getRecommendedEvents(
        userId,
        filters,
        parseInt(page),
        parseInt(limit)
      );

      res.status(200).json({
        success: true,
        data: result,
        message: 'Recommended events retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting recommended events:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recommended events',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  },

  // Get event details by ID
  async getEventById(req, res) {
    try {
      const { eventId } = req.params;
      const userId = req.user?.id;

      if (!eventId) {
        return res.status(400).json({
          success: false,
          message: 'Event ID is required'
        });
      }

      const event = await industryEventsService.getEventById(eventId, userId);

      // Record view interaction if user is logged in
      if (userId) {
        try {
          await industryEventsService.recordInteraction(userId, eventId, 'viewed');
        } catch (viewError) {
          console.error('Error recording view interaction:', viewError);
          // Don't fail the request if interaction recording fails
        }
      }

      res.status(200).json({
        success: true,
        data: event,
        message: 'Event details retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting event details:', error);
      if (error.message === 'Event not found') {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to get event details',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  },

  // Save an event
  async saveEvent(req, res) {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      if (!eventId) {
        return res.status(400).json({
          success: false,
          message: 'Event ID is required'
        });
      }

      const interaction = await industryEventsService.recordInteraction(
        userId,
        eventId,
        'saved'
      );

      res.status(201).json({
        success: true,
        data: interaction,
        message: 'Event saved successfully'
      });
    } catch (error) {
      console.error('Error saving event:', error);
      if (error.message === 'Event not found') {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to save event',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  },

  // Unsave an event
  async unsaveEvent(req, res) {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      if (!eventId) {
        return res.status(400).json({
          success: false,
          message: 'Event ID is required'
        });
      }

      const success = await industryEventsService.unsaveEvent(userId, eventId);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Saved event not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Event removed from saved list'
      });
    } catch (error) {
      console.error('Error unsaving event:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to unsave event',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  },

  // Get user's saved events
  async getSavedEvents(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;

      const result = await industryEventsService.getUserSavedEvents(
        userId,
        parseInt(page),
        parseInt(limit)
      );

      res.status(200).json({
        success: true,
        data: result,
        message: 'Saved events retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting saved events:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get saved events',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  },

  // Record event registration
  async registerForEvent(req, res) {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      if (!eventId) {
        return res.status(400).json({
          success: false,
          message: 'Event ID is required'
        });
      }

      const interaction = await industryEventsService.recordInteraction(
        userId,
        eventId,
        'registered',
        { registrationDate: new Date() }
      );

      res.status(201).json({
        success: true,
        data: interaction,
        message: 'Event registration recorded successfully'
      });
    } catch (error) {
      console.error('Error recording event registration:', error);
      if (error.message === 'Event not found') {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to record event registration',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  },

  // Get user's registered events
  async getRegisteredEvents(req, res) {
    try {
      const userId = req.user.id;

      const events = await industryEventsService.getUserRegisteredEvents(userId);

      res.status(200).json({
        success: true,
        data: events,
        message: 'Registered events retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting registered events:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get registered events',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  },

  // Submit event feedback
  async submitEventFeedback(req, res) {
    try {
      const { eventId } = req.params;
      const { rating, comments } = req.body;
      const userId = req.user.id;

      if (!eventId) {
        return res.status(400).json({
          success: false,
          message: 'Event ID is required'
        });
      }

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }

      const interaction = await industryEventsService.recordInteraction(
        userId,
        eventId,
        'feedback',
        { rating, comments }
      );

      res.status(201).json({
        success: true,
        data: interaction,
        message: 'Event feedback submitted successfully'
      });
    } catch (error) {
      console.error('Error submitting event feedback:', error);
      if (error.message === 'Event not found') {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to submit event feedback',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  },

  // Confirm event attendance
  async confirmAttendance(req, res) {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      if (!eventId) {
        return res.status(400).json({
          success: false,
          message: 'Event ID is required'
        });
      }

      const interaction = await industryEventsService.recordInteraction(
        userId,
        eventId,
        'attended',
        { attendanceConfirmed: true }
      );

      res.status(201).json({
        success: true,
        data: interaction,
        message: 'Event attendance confirmed successfully'
      });
    } catch (error) {
      console.error('Error confirming event attendance:', error);
      if (error.message === 'Event not found') {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to confirm event attendance',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  },

  // Get upcoming events for notifications
  async getUpcomingEvents(req, res) {
    try {
      const { timeFrame = '1day' } = req.query;
      const checkTime = new Date();

      const events = await industryEventsService.getUpcomingEvents(checkTime, timeFrame);

      res.status(200).json({
        success: true,
        data: events,
        message: 'Upcoming events retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get upcoming events',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  },

  // Get event statistics
  async getEventStatistics(req, res) {
    try {
      const stats = await industryEventsService.getEventStatistics();

      res.status(200).json({
        success: true,
        data: stats,
        message: 'Event statistics retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting event statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get event statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
};

export default industryEventsController;