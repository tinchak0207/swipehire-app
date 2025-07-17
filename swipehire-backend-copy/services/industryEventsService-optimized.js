const IndustryEvent = require('../models/IndustryEvent');
const UserEventInteraction = require('../models/UserEventInteraction');
const User = require('../models/User');
const CacheService = require('./cacheService');

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
      // Get user profile with all necessary fields for optimization
      const user = await User.findById(userId).select('profile preferences location');
      if (!user) {
        throw new Error('User not found');
      }

      // Generate cache key for this query
      const queryHash = Buffer.from(JSON.stringify({ userId, filters, page, limit })).toString('base64');
      const cacheKey = `events:${queryHash}`;

      // Check cache first
      const cached = await CacheService.getEvents(queryHash, page);
      if (cached) {
        return cached;
      }

      // Build base query
      const query = {
        status: 'upcoming',
        isActive: true,
        startDateTime: { $gte: new Date() }
      };

      // Apply filters efficiently
      if (filters.industry && filters.industry !== 'all') {
        query.industry = filters.industry;
      } else if (user.profile?.industry) {
        query.industry = user.profile.industry;
      }

      if (filters.eventType && filters.eventType !== 'all') {
        query.eventType = filters.eventType;
      }

      if (filters.location) {
        if (filters.location === 'online') {
          query['location.type'] = 'online';
        } else if (filters.location === 'offline' && user.location?.city) {
          query['location.city'] = { $regex: user.location.city, $options: 'i' };
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

      // Skills matching - optimized with compound query
      if (user.profile?.skills && user.profile.skills.length > 0) {
        query.$or = [
          { skills: { $in: user.profile.skills } },
          { tags: { $in: user.profile.skills } }
        ];
      }

      // Search query optimization
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

      // Batch fetch user interactions for all events at once
      const skip = (page - 1) * limit;

      // Get events with efficient pagination
      const [events, totalEvents, userInteractions] = await Promise.all([
        IndustryEvent.find(query)
          .populate('createdBy', 'name email')
          .sort({ startDateTime: 1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        IndustryEvent.countDocuments(query),
        UserEventInteraction.find({
          userId,
          interactionType: { $in: ['saved', 'registered'] }
        }).select('eventId interactionType')
      ]);

      // Create efficient lookup maps
      const interactionMap = new Map();
      userInteractions.forEach(interaction => {
        interactionMap.set(interaction.eventId.toString(), interaction.interactionType);
      });

      // Process events with recommendation reasons
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
          isSaved: interactionMap.get(event._id.toString()) === 'saved',
          isRegistered: interactionMap.get(event._id.toString()) === 'registered'
        };
      });

      const result = {
        events: eventsWithRecommendations,
        pagination: {
          page,
          limit,
          total: totalEvents,
          pages: Math.ceil(totalEvents / limit)
        }
      };

      // Cache the result
      await CacheService.setEvents(queryHash, result, page, 60); // 1 minute cache

      return result;
    } catch (error) {
      console.error('Error getting recommended events:', error);
      throw error;
    }
  },

  /**
   * Get event details by ID with optimized user interaction loading
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID (for interaction data)
   */
  async getEventById(eventId, userId) {
    try {
      // Check cache first
      const cacheKey = `event:${eventId}:${userId}`;
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Get event with populated data
      const event = await IndustryEvent.findById(eventId)
        .populate('createdBy', 'name email')
        .lean();

      if (!event) {
        throw new Error('Event not found');
      }

      // Batch fetch user interactions for this specific event
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

      // Get related events efficiently using aggregation
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
      .select('title startDateTime endDateTime location eventType industry')
      .lean();

      const result = {
        ...event,
        userInteractions,
        relatedEvents
      };

      // Cache the result
      await CacheService.set(cacheKey, result, 300); // 5 minute cache

      return result;
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

      // Create or update interaction atomically
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

      // Invalidate related caches
      await this.invalidateUserEventCaches(userId, eventId);

      return interaction;
    } catch (error) {
      console.error('Error recording interaction:', error);
      throw error;
    }
  },

  /**
   * Get user's saved events with optimized population
   * @param {string} userId - User ID
   * @param {number} page - Page number
   * @param {number} limit - Number of events per page
   */
  async getUserSavedEvents(userId, page = 1, limit = 10) {
    try {
      const cacheKey = `saved_events:${userId}:${page}:${limit}`;
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const skip = (page - 1) * limit;

      // Use aggregation for better performance
      const pipeline = [
        {
          $match: {
            userId: require('mongoose').Types.ObjectId(userId),
            interactionType: 'saved'
          }
        },
        {
          $lookup: {
            from: 'industryevents',
            localField: 'eventId',
            foreignField: '_id',
            as: 'event'
          }
        },
        {
          $unwind: '$event'
        },
        {
          $match: {
            'event.isActive': true
          }
        },
        {
          $project: {
            event: 1,
            savedAt: '$createdAt',
            _id: 0
          }
        },
        {
          $sort: { savedAt: -1 }
        },
        {
          $skip: skip
        },
        {
          $limit: limit
        }
      ];

      const savedEvents = await UserEventInteraction.aggregate(pipeline);

      const events = savedEvents.map(item => ({
        ...item.event,
        savedAt: item.savedAt
      }));

      const totalSaved = await UserEventInteraction.countDocuments({
        userId,
        interactionType: 'saved'
      });

      const result = {
        events,
        pagination: {
          page,
          limit,
          total: totalSaved,
          pages: Math.ceil(totalSaved / limit)
        }
      };

      // Cache for 2 minutes
      await CacheService.set(cacheKey, result, 120);

      return result;
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

      if (result.deletedCount > 0) {
        await this.invalidateUserEventCaches(userId, eventId);
      }

      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error unsaving event:', error);
      throw error;
    }
  },

  /**
   * Get events the user has registered for with optimized query
   * @param {string} userId - User ID
   */
  async getUserRegisteredEvents(userId) {
    try {
      const cacheKey = `registered_events:${userId}`;
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const pipeline = [
        {
          $match: {
            userId: require('mongoose').Types.ObjectId(userId),
            interactionType: 'registered'
          }
        },
        {
          $lookup: {
            from: 'industryevents',
            localField: 'eventId',
            foreignField: '_id',
            as: 'event'
          }
        },
        {
          $unwind: '$event'
        },
        {
          $match: {
            'event.isActive': true
          }
        },
        {
          $project: {
            event: 1,
            registrationDate: '$interactionData.registrationDate',
            attendanceConfirmed: '$interactionData.attendanceConfirmed',
            _id: 0
          }
        },
        {
          $sort: { registrationDate: -1 }
        }
      ];

      const registeredEvents = await UserEventInteraction.aggregate(pipeline);

      const events = registeredEvents.map(item => ({
        ...item.event,
        registrationDate: item.registrationDate,
        attendanceConfirmed: item.attendanceConfirmed
      }));

      // Cache for 5 minutes
      await CacheService.set(cacheKey, events, 300);

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
      const cacheKey = `upcoming_events:${timeFrame}:${Math.floor(checkTime.getTime() / 60000)}`;
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

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

      // Cache for 15 minutes
      await CacheService.set(cacheKey, events, 900);

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
      const cacheKey = 'event_statistics';
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

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

      const result = {
        industries: industryStats,
        eventTypes: typeStats,
        locations: locationStats
      };

      // Cache for 30 minutes
      await CacheService.set(cacheKey, result, 1800);

      return result;
    } catch (error) {
      console.error('Error getting event statistics:', error);
      throw error;
    }
  },

  /**
   * Invalidate user event caches
   * @param {string} userId - User ID
   * @param {string} eventId - Event ID
   */
  async invalidateUserEventCaches(userId, eventId) {
    try {
      // Invalidate user-specific caches
      await CacheService.invalidateUser(userId);
      
      // Invalidate event-specific caches
      const keysToInvalidate = [
        `event:${eventId}:${userId}`,
        `saved_events:${userId}:*`,
        `registered_events:${userId}`,
        `events:*:*` // Invalidate all event lists
      ];

      // In a production environment, use Redis patterns or specific deletions
      return true;
    } catch (error) {
      console.error('Error invalidating caches:', error);
    }
  }
};

module.exports = industryEventsService;