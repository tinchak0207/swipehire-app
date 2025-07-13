const IndustryEvent = require('../models/IndustryEvent');
const UserEventInteraction = require('../models/UserEventInteraction');
const User = require('../models/User');

const industryEventsService = {
  /**
   * Get personalized event recommendations for a user
   * @param {string} userId - User ID
   * @param {object} filters - Filter options
   * @param {number} page - Page number
   * @param {number} limit - Number of events per page
   */
  async getRecommendedEvents(userId, filters = {}, page = 1, limit = 10) {
    try {
      // Get user profile for personalization
      const user = await User.findById(userId).select('profile preferences location');
      if (!user) {
        throw new Error('User not found');
      }

      // Build base query
      const query = {
        status: 'upcoming',
        isActive: true,
        startDateTime: { $gte: new Date() }
      };

      // Apply filters
      if (filters.industry && filters.industry !== 'all') {
        query.industry = filters.industry;
      } else if (user.profile?.industry) {
        // Use user's industry if no filter specified
        query.industry = user.profile.industry;
      }

      if (filters.eventType && filters.eventType !== 'all') {
        query.eventType = filters.eventType;
      }

      if (filters.location) {
        if (filters.location === 'online') {
          query['location.type'] = 'online';
        } else if (filters.location === 'offline') {
          query['location.type'] = 'offline';
          // If user has location preference, filter by city
          if (user.location?.city) {
            query['location.city'] = { $regex: user.location.city, $options: 'i' };
          }
        }
      }

      if (filters.dateFrom) {
        query.startDateTime.$gte = new Date(filters.dateFrom);
      }

      if (filters.dateTo) {
        query.startDateTime.$lte = new Date(filters.dateTo);
      }

      if (filters.cost) {
        query['cost.type'] = filters.cost;
      }

      if (filters.targetAudience) {
        query.targetAudience = { $in: [filters.targetAudience] };
      }

      // Skills matching
      if (user.profile?.skills && user.profile.skills.length > 0) {
        query.$or = [
          { skills: { $in: user.profile.skills } },
          { tags: { $in: user.profile.skills } }
        ];
      }

      // Search query
      if (filters.search) {
        const searchRegex = { $regex: filters.search, $options: 'i' };
        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { title: searchRegex },
            { description: searchRegex },
            { tags: searchRegex },
            { 'organizer.name': searchRegex }
          ]
        });
      }

      // Get user's interactions to filter out already saved/registered events if needed
      const userInteractions = await UserEventInteraction.find({
        userId,
        interactionType: { $in: ['saved', 'registered'] }
      }).select('eventId interactionType');

      const savedEventIds = userInteractions
        .filter(i => i.interactionType === 'saved')
        .map(i => i.eventId);
      const registeredEventIds = userInteractions
        .filter(i => i.interactionType === 'registered')
        .map(i => i.eventId);

      const skip = (page - 1) * limit;

      // Execute query with pagination
      const events = await IndustryEvent.find(query)
        .populate('createdBy', 'name email')
        .sort({ 
          // Prioritize events matching user's skills/interests
          startDateTime: 1,
          createdAt: -1 
        })
        .skip(skip)
        .limit(limit)
        .lean();

      // Add recommendation reasons and interaction status
      const eventsWithRecommendations = events.map(event => {
        const reasons = [];
        
        if (user.profile?.industry === event.industry) {
          reasons.push('Based on your industry');
        }
        
        if (user.profile?.skills?.some(skill => 
          event.skills.includes(skill) || event.tags.includes(skill)
        )) {
          reasons.push('Matches your skills');
        }
        
        if (user.location?.city && event.location.type === 'offline' && 
            event.location.city.toLowerCase().includes(user.location.city.toLowerCase())) {
          reasons.push('Near your location');
        }
        
        if (event.location.type === 'online') {
          reasons.push('Online event');
        }

        if (reasons.length === 0) {
          reasons.push('Popular in your field');
        }

        return {
          ...event,
          recommendationReasons: reasons,
          isSaved: savedEventIds.some(id => id.toString() === event._id.toString()),
          isRegistered: registeredEventIds.some(id => id.toString() === event._id.toString())
        };
      });

      // Get total count for pagination
      const totalEvents = await IndustryEvent.countDocuments(query);

      return {
        events: eventsWithRecommendations,
        pagination: {
          page,
          limit,
          total: totalEvents,
          pages: Math.ceil(totalEvents / limit)
        }
      };
    } catch (error) {
      console.error('Error getting recommended events:', error);
      throw error;
    }
  },

  /**
   * Get event details by ID
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID (for interaction data)
   */
  async getEventById(eventId, userId) {
    try {
      const event = await IndustryEvent.findById(eventId)
        .populate('createdBy', 'name email')
        .lean();

      if (!event) {
        throw new Error('Event not found');
      }

      // Get user interactions with this event
      let userInteractions = {};
      if (userId) {
        const interactions = await UserEventInteraction.find({
          userId,
          eventId
        });
        
        interactions.forEach(interaction => {
          userInteractions[interaction.interactionType] = interaction.interactionData || true;
        });
      }

      // Get related events (same industry or tags)
      const relatedEvents = await IndustryEvent.find({
        _id: { $ne: eventId },
        $or: [
          { industry: event.industry },
          { tags: { $in: event.tags } }
        ],
        status: 'upcoming',
        isActive: true,
        startDateTime: { $gte: new Date() }
      })
      .limit(5)
      .select('title startDateTime location eventType industry')
      .lean();

      return {
        ...event,
        userInteractions,
        relatedEvents
      };
    } catch (error) {
      console.error('Error getting event by ID:', error);
      throw error;
    }
  },

  /**
   * Record user interaction with an event
   * @param {string} userId - User ID
   * @param {string} eventId - Event ID
   * @param {string} interactionType - Type of interaction
   * @param {object} interactionData - Additional data for the interaction
   */
  async recordInteraction(userId, eventId, interactionType, interactionData = {}) {
    try {
      // Check if event exists
      const event = await IndustryEvent.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      // Create or update interaction
      const interaction = await UserEventInteraction.findOneAndUpdate(
        { userId, eventId, interactionType },
        { 
          userId, 
          eventId, 
          interactionType, 
          interactionData,
          createdAt: new Date()
        },
        { upsert: true, new: true }
      );

      return interaction;
    } catch (error) {
      console.error('Error recording interaction:', error);
      throw error;
    }
  },

  /**
   * Get user's saved events
   * @param {string} userId - User ID
   * @param {number} page - Page number
   * @param {number} limit - Number of events per page
   */
  async getUserSavedEvents(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const savedInteractions = await UserEventInteraction.find({
        userId,
        interactionType: 'saved'
      })
      .populate({
        path: 'eventId',
        match: { isActive: true },
        select: 'title description startDateTime endDateTime location eventType industry organizer cost imageUrl status'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

      // Filter out events that were deleted or deactivated
      const events = savedInteractions
        .filter(interaction => interaction.eventId)
        .map(interaction => ({
          ...interaction.eventId.toObject(),
          savedAt: interaction.createdAt
        }));

      const totalSaved = await UserEventInteraction.countDocuments({
        userId,
        interactionType: 'saved'
      });

      return {
        events,
        pagination: {
          page,
          limit,
          total: totalSaved,
          pages: Math.ceil(totalSaved / limit)
        }
      };
    } catch (error) {
      console.error('Error getting user saved events:', error);
      throw error;
    }
  },

  /**
   * Remove event from user's saved list
   * @param {string} userId - User ID
   * @param {string} eventId - Event ID
   */
  async unsaveEvent(userId, eventId) {
    try {
      const result = await UserEventInteraction.deleteOne({
        userId,
        eventId,
        interactionType: 'saved'
      });

      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error unsaving event:', error);
      throw error;
    }
  },

  /**
   * Get events the user has registered for
   * @param {string} userId - User ID
   */
  async getUserRegisteredEvents(userId) {
    try {
      const registeredInteractions = await UserEventInteraction.find({
        userId,
        interactionType: 'registered'
      })
      .populate({
        path: 'eventId',
        match: { isActive: true },
        select: 'title description startDateTime endDateTime location eventType industry organizer registrationUrl'
      })
      .sort({ 'interactionData.registrationDate': -1 });

      const events = registeredInteractions
        .filter(interaction => interaction.eventId)
        .map(interaction => ({
          ...interaction.eventId.toObject(),
          registrationDate: interaction.interactionData?.registrationDate,
          attendanceConfirmed: interaction.interactionData?.attendanceConfirmed
        }));

      return events;
    } catch (error) {
      console.error('Error getting user registered events:', error);
      throw error;
    }
  },

  /**
   * Get events happening soon for notifications
   * @param {Date} checkTime - Time to check against
   * @param {string} timeFrame - '1hour' or '1day'
   */
  async getUpcomingEvents(checkTime = new Date(), timeFrame = '1day') {
    try {
      const timeOffset = timeFrame === '1hour' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
      const targetTime = new Date(checkTime.getTime() + timeOffset);

      const events = await IndustryEvent.find({
        status: 'upcoming',
        isActive: true,
        startDateTime: {
          $gte: checkTime,
          $lte: targetTime
        }
      })
      .populate('createdBy', 'name email')
      .lean();

      return events;
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      throw error;
    }
  },

  /**
   * Get industry and event type statistics
   */
  async getEventStatistics() {
    try {
      const [industryStats, typeStats, locationStats] = await Promise.all([
        IndustryEvent.aggregate([
          { $match: { status: 'upcoming', isActive: true } },
          { $group: { _id: '$industry', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        IndustryEvent.aggregate([
          { $match: { status: 'upcoming', isActive: true } },
          { $group: { _id: '$eventType', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        IndustryEvent.aggregate([
          { $match: { status: 'upcoming', isActive: true } },
          { $group: { _id: '$location.type', count: { $sum: 1 } } }
        ])
      ]);

      return {
        industries: industryStats,
        eventTypes: typeStats,
        locations: locationStats
      };
    } catch (error) {
      console.error('Error getting event statistics:', error);
      throw error;
    }
  }
};

module.exports = industryEventsService;