import Event from '../../models/Event.js';
import SavedEvent from '../../models/SavedEvent.js';
import EventRegistration from '../../models/EventRegistration.js';
import EventFeedback from '../../models/EventFeedback.js';

// Get events with filtering, search, and pagination
export const getEvents = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            sortBy = 'relevance',
            sortOrder = 'desc',
            eventTypes,
            formats,
            industries,
            cities,
            isFree,
            searchQuery,
            startDate,
            endDate,
            minPrice,
            maxPrice,
            featured,
            skillLevel
        } = req.query;

        // Build query
        const query = { status: 'published' };

        // Date filtering - only show upcoming events by default
        if (!startDate && !endDate) {
            query.startDateTime = { $gte: new Date() };
        } else {
            if (startDate) {
                query.startDateTime = { $gte: new Date(startDate) };
            }
            if (endDate) {
                query.startDateTime = { 
                    ...query.startDateTime,
                    $lte: new Date(endDate) 
                };
            }
        }

        // Filter by event types
        if (eventTypes) {
            const types = eventTypes.split(',');
            query.eventType = { $in: types };
        }

        // Filter by formats
        if (formats) {
            const formatList = formats.split(',');
            query.format = { $in: formatList };
        }

        // Filter by industries
        if (industries) {
            const industryList = industries.split(',');
            query.industry = { $in: industryList };
        }

        // Filter by cities
        if (cities) {
            const cityList = cities.split(',');
            query['location.city'] = { $in: cityList };
        }

        // Filter by free events
        if (isFree !== undefined) {
            query.isFree = isFree === 'true';
        }

        // Filter by skill level
        if (skillLevel) {
            query.skillLevel = skillLevel;
        }

        // Filter by featured
        if (featured !== undefined) {
            query.featured = featured === 'true';
        }

        // Price range filtering
        if (minPrice !== undefined) {
            query.price = { $gte: parseFloat(minPrice) };
        }
        if (maxPrice !== undefined) {
            query.price = { 
                ...query.price,
                $lte: parseFloat(maxPrice) 
            };
        }

        // Search query
        if (searchQuery) {
            query.$text = { $search: searchQuery };
        }

        // Build sort criteria
        let sortCriteria = {};
        switch (sortBy) {
            case 'date':
                sortCriteria.startDateTime = sortOrder === 'desc' ? -1 : 1;
                break;
            case 'relevance':
                if (searchQuery) {
                    sortCriteria.score = { $meta: 'textScore' };
                } else {
                    sortCriteria.recommendationScore = -1;
                }
                sortCriteria.startDateTime = 1; // Secondary sort by date
                break;
            case 'popularity':
                sortCriteria.registeredCount = sortOrder === 'desc' ? -1 : 1;
                break;
            case 'price':
                sortCriteria.price = sortOrder === 'desc' ? -1 : 1;
                break;
            default:
                sortCriteria.startDateTime = 1;
        }

        // Execute query with pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const [events, totalCount] = await Promise.all([
            Event.find(query)
                .sort(sortCriteria)
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Event.countDocuments(query)
        ]);

        const hasMore = skip + limitNum < totalCount;

        res.json({
            events,
            totalCount,
            hasMore,
            page: pageNum,
            limit: limitNum
        });

    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
};

// Get single event by ID
export const getEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id; // From auth middleware

        const event = await Event.findById(id).lean();
        
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Add user-specific data if authenticated
        if (userId) {
            const [isSaved, isRegistered] = await Promise.all([
                SavedEvent.isEventSavedByUser(userId, id),
                EventRegistration.isUserRegistered(userId, id)
            ]);
            
            event.isSaved = isSaved;
            event.isRegistered = isRegistered;
        }

        // Increment view count
        await Event.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

        res.json(event);

    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ error: 'Failed to fetch event' });
    }
};

// Save/unsave event for user
export const toggleSaveEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id; // From auth middleware

        // Check if event exists
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Check if already saved
        const existingSave = await SavedEvent.findOne({ userId, eventId: id });

        if (existingSave) {
            // Unsave
            await SavedEvent.deleteOne({ userId, eventId: id });
            await Event.findByIdAndUpdate(id, { $inc: { saveCount: -1 } });
            res.json({ saved: false, message: 'Event removed from saved events' });
        } else {
            // Save
            await SavedEvent.create({ userId, eventId: id });
            await Event.findByIdAndUpdate(id, { $inc: { saveCount: 1 } });
            res.json({ saved: true, message: 'Event saved successfully' });
        }

    } catch (error) {
        console.error('Error toggling save event:', error);
        if (error.code === 11000) {
            // Duplicate key error - already saved
            res.status(400).json({ error: 'Event already saved' });
        } else {
            res.status(500).json({ error: 'Failed to save event' });
        }
    }
};

// Register for event
export const registerForEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if event exists and is available for registration
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (event.status !== 'published') {
            return res.status(400).json({ error: 'Event is not available for registration' });
        }

        if (event.startDateTime < new Date()) {
            return res.status(400).json({ error: 'Cannot register for past events' });
        }

        // Check capacity
        if (event.capacity && event.registeredCount >= event.capacity) {
            return res.status(400).json({ error: 'Event is at full capacity' });
        }

        // Check if already registered
        const existingRegistration = await EventRegistration.findOne({ 
            userId, 
            eventId: id,
            status: { $in: ['registered', 'confirmed', 'attended'] }
        });

        if (existingRegistration) {
            return res.status(400).json({ error: 'Already registered for this event' });
        }

        // Create registration
        await EventRegistration.create({ userId, eventId: id });
        
        // Update event registered count
        await Event.findByIdAndUpdate(id, { $inc: { registeredCount: 1 } });

        res.json({ 
            registered: true, 
            message: 'Successfully registered for event' 
        });

    } catch (error) {
        console.error('Error registering for event:', error);
        if (error.code === 11000) {
            res.status(400).json({ error: 'Already registered for this event' });
        } else {
            res.status(500).json({ error: 'Failed to register for event' });
        }
    }
};

// Get user's saved events
export const getUserSavedEvents = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const savedEvents = await SavedEvent.getUserSavedEvents(userId, {
            limit: limitNum,
            skip
        });

        const totalCount = await SavedEvent.countDocuments({ userId });
        const hasMore = skip + limitNum < totalCount;

        res.json({
            events: savedEvents.map(se => ({
                ...se.eventId.toObject(),
                savedAt: se.savedAt,
                userNotes: se.userNotes,
                isSaved: true
            })),
            totalCount,
            hasMore,
            page: pageNum,
            limit: limitNum
        });

    } catch (error) {
        console.error('Error fetching saved events:', error);
        res.status(500).json({ error: 'Failed to fetch saved events' });
    }
};

// Get recommended events for user
export const getRecommendedEvents = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { limit = 10 } = req.query;

        // For now, return featured events and events sorted by recommendation score
        // In future, implement AI-based recommendations using user profile
        
        const query = { 
            status: 'published',
            startDateTime: { $gte: new Date() }
        };

        const events = await Event.find(query)
            .sort({ 
                featured: -1, 
                recommendationScore: -1, 
                startDateTime: 1 
            })
            .limit(parseInt(limit))
            .lean();

        // Add user-specific data if authenticated
        if (userId) {
            for (const event of events) {
                const [isSaved, isRegistered] = await Promise.all([
                    SavedEvent.isEventSavedByUser(userId, event._id),
                    EventRegistration.isUserRegistered(userId, event._id)
                ]);
                
                event.isSaved = isSaved;
                event.isRegistered = isRegistered;
            }
        }

        res.json({ events });

    } catch (error) {
        console.error('Error fetching recommended events:', error);
        res.status(500).json({ error: 'Failed to fetch recommended events' });
    }
};

// Submit event feedback
export const submitEventFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const {
            overallRating,
            review,
            contentQuality,
            speakerQuality,
            organizationQuality,
            networkingValue,
            valueForMoney,
            wouldRecommend,
            wouldAttendAgain,
            mostValuable,
            leastValuable,
            suggestions,
            isAnonymous = false
        } = req.body;

        // Validate required fields
        if (!overallRating || wouldRecommend === undefined) {
            return res.status(400).json({ 
                error: 'Overall rating and recommendation are required' 
            });
        }

        // Check if event exists
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Check if user attended the event
        const registration = await EventRegistration.findOne({
            userId,
            eventId: id,
            status: { $in: ['attended', 'registered', 'confirmed'] }
        });

        if (!registration) {
            return res.status(403).json({ 
                error: 'You must be registered for this event to leave feedback' 
            });
        }

        // Create feedback
        const feedback = await EventFeedback.create({
            userId,
            eventId: id,
            overallRating,
            review,
            contentQuality,
            speakerQuality,
            organizationQuality,
            networkingValue,
            valueForMoney,
            wouldRecommend,
            wouldAttendAgain,
            mostValuable,
            leastValuable,
            suggestions,
            isAnonymous
        });

        res.status(201).json({ 
            message: 'Feedback submitted successfully',
            feedback: feedback
        });

    } catch (error) {
        console.error('Error submitting feedback:', error);
        if (error.code === 11000) {
            res.status(400).json({ error: 'You have already submitted feedback for this event' });
        } else {
            res.status(500).json({ error: 'Failed to submit feedback' });
        }
    }
};

// Get event feedback
export const getEventFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10, minRating } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const [feedback, summary] = await Promise.all([
            EventFeedback.getPublicFeedback(id, {
                limit: limitNum,
                skip,
                minRating: minRating ? parseInt(minRating) : null
            }),
            EventFeedback.getEventSummary(id)
        ]);

        const totalCount = await EventFeedback.countDocuments({
            eventId: id,
            isPublic: true
        });

        const hasMore = skip + limitNum < totalCount;

        res.json({
            feedback,
            summary,
            totalCount,
            hasMore,
            page: pageNum,
            limit: limitNum
        });

    } catch (error) {
        console.error('Error fetching event feedback:', error);
        res.status(500).json({ error: 'Failed to fetch event feedback' });
    }
};

// Default export with all methods
export default {
    getEvents,
    getEvent,
    toggleSaveEvent,
    registerForEvent,
    getUserSavedEvents,
    getRecommendedEvents,
    submitEventFeedback,
    getEventFeedback
};