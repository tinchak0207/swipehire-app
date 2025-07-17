import { getDatabase, CacheManager } from '../config/database-optimized.mjs';
import { ObjectId } from 'mongodb';

// Aggressive caching strategies
const CACHE_STRATEGIES = {
  USER_PROFILE: 300000, // 5 minutes
  JOB_LIST: 30000,      // 30 seconds
  PUBLIC_JOBS: 60000,   // 1 minute
  REVIEWS: 120000,      // 2 minutes
  MATCHES: 10000,       // 10 seconds
  NOTIFICATIONS: 5000,  // 5 seconds
  DIARY: 60000,         // 1 minute
  CHAT: 10000,          // 10 seconds
  EVENTS: 120000,       // 2 minutes
  REMINDERS: 30000      // 30 seconds
};

// Projection mappings to reduce data transfer
const PROJECTIONS = {
  USER_PUBLIC: {
    password: 0, firebaseUid: 0, __v: 0, preferences: 0, 
    'companyVerificationDocuments': 0, 'likedCandidateIds': 0, 
    'likedCompanyIds': 0, 'passedCandidateProfileIds': 0, 
    'passedCompanyProfileIds': 0
  },
  JOB_LIST: {
    _id: 1, title: 1, description: 1, location: 1, salary: 1, 
    jobType: 1, companyName: 1, companyIndustry: 1, 
    companyLogo: 1, createdAt: 1, updatedAt: 1,
    applicationCount: { $size: { $ifNull: ['$applications', []] } }
  },
  JOB_DETAIL: {
    password: 0, __v: 0, 'applications.resume': 0, 'applications.coverLetter': 0
  }
};

/**
 * Ultra-fast user controller with aggressive caching
 */
const userController = {
  async getUsers() {
    const cacheKey = 'users_all';
    const cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    const db = getDatabase();
    const users = await db.collection('users')
      .find({}, { projection: PROJECTIONS.USER_PUBLIC })
      .limit(50)
      .sort({ createdAt: -1 })
      .toArray();

    const result = { users };
    CacheManager.set(cacheKey, result, 30000);
    return result;
  },

  async getUser(identifier) {
    const cacheKey = `user_${identifier}`;
    const cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    const db = getDatabase();
    
    let query = {};
    if (ObjectId.isValid(identifier)) {
      query._id = new ObjectId(identifier);
    } else if (identifier.includes('@')) {
      query.email = identifier;
    } else {
      query.firebaseUid = identifier;
    }

    const user = await db.collection('users')
      .findOne(query, { projection: PROJECTIONS.USER_PUBLIC });

    if (!user) return null;

    CacheManager.set(cacheKey, { user }, CACHE_STRATEGIES.USER_PROFILE);
    return { user };
  },

  async getJobseekerProfiles() {
    const cacheKey = 'jobseekers_all';
    const cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    const db = getDatabase();
    
    const pipeline = [
      {
        $match: {
          selectedRole: 'jobseeker',
          profileVisibility: { $ne: 'private' }
        }
      },
      {
        $project: {
          _id: 1, name: 1, email: 1, profileAvatarUrl: 1, 
          profileHeadline: 1, profileExperienceSummary: 1, 
          profileSkills: 1, country: 1, address: 1,
          profileDesiredWorkStyle: 1, profileWorkExperienceLevel: 1,
          profileEducationLevel: 1, profileLocationPreference: 1,
          profileLanguages: 1, profileAvailability: 1,
          profileJobTypePreference: 1, profileSalaryExpectationMin: 1,
          profileSalaryExpectationMax: 1, createdAt: 1, updatedAt: 1
        }
      },
      { $sort: { createdAt: -1 } },
      { $limit: 100 }
    ];

    const jobseekers = await db.collection('users').aggregate(pipeline).toArray();
    const result = { jobseekers };
    CacheManager.set(cacheKey, result, 60000);
    return result;
  },

  async createUser(userData) {
    const db = getDatabase();
    const newUser = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('users').insertOne(newUser);
    
    // Invalidate cache
    CacheManager.delete(`user_${userData.email}`);
    CacheManager.delete(`user_${userData.firebaseUid}`);
    CacheManager.delete('users_all');

    return { user: { ...newUser, _id: result.insertedId } };
  },

  async updateUser(identifier, updates) {
    const db = getDatabase();
    
    let query = {};
    if (ObjectId.isValid(identifier)) {
      query._id = new ObjectId(identifier);
    } else if (identifier.includes('@')) {
      query.email = identifier;
    } else {
      query.firebaseUid = identifier;
    }

    const result = await db.collection('users').findOneAndUpdate(
      query,
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after', projection: PROJECTIONS.USER_PUBLIC }
    );

    if (!result.value) return null;

    // Invalidate all user caches
    CacheManager.delete(`user_${identifier}`);
    CacheManager.delete(`user_${result.value.email}`);
    CacheManager.delete(`user_${result.value.firebaseUid}`);
    CacheManager.delete('users_all');

    return { user: result.value };
  }
};

/**
 * Ultra-fast job controller with projection optimization
 */
const jobController = {
  async getPublicJobs(queryParams) {
    const cacheKey = `public_jobs_${JSON.stringify(queryParams)}`;
    const cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    const db = getDatabase();
    const page = Math.max(parseInt(queryParams.page) || 1, 1);
    const limit = Math.min(parseInt(queryParams.limit) || 20, 100);
    const skip = (page - 1) * limit;

    // Build optimized query
    const query = { isPublic: true };
    if (queryParams.location) query.location = { $regex: queryParams.location, $options: 'i' };
    if (queryParams.jobType) query.jobType = queryParams.jobType;
    if (queryParams.search) {
      query.$or = [
        { title: { $regex: queryParams.search, $options: 'i' } },
        { description: { $regex: queryParams.search, $options: 'i' } },
        { companyName: { $regex: queryParams.search, $options: 'i' } }
      ];
    }

    const pipeline = [
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1, title: 1, description: 1, location: 1, salary: 1,
          jobType: 1, workStyle: 1, companyName: 1, companyIndustry: 1,
          companyLogo: 1, companySize: 1, createdAt: 1, updatedAt: 1,
          applicationCount: { $size: { $ifNull: ['$applications', []] } }
        }
      }
    ];

    const [jobs, totalCount] = await Promise.all([
      db.collection('jobs').aggregate(pipeline).toArray(),
      db.collection('jobs').countDocuments(query)
    ]);

    const result = {
      jobs,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    };

    CacheManager.set(cacheKey, result, CACHE_STRATEGIES.PUBLIC_JOBS);
    return result;
  },

  async getUserJobs(userId, queryParams = {}) {
    const cacheKey = `user_jobs_${userId}_${JSON.stringify(queryParams)}`;
    const cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    const db = getDatabase();
    if (!ObjectId.isValid(userId)) return null;

    const page = Math.max(parseInt(queryParams.page) || 1, 1);
    const limit = Math.min(parseInt(queryParams.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const query = { userId: userId };
    const pipeline = [
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1, title: 1, description: 1, location: 1, salary: 1,
          jobType: 1, workStyle: 1, companyName: 1, companyIndustry: 1,
          companyLogo: 1, isPublic: 1, createdAt: 1, updatedAt: 1,
          applicationCount: { $size: { $ifNull: ['$applications', []] } }
        }
      }
    ];

    const [jobs, totalCount] = await Promise.all([
      db.collection('jobs').aggregate(pipeline).toArray(),
      db.collection('jobs').countDocuments(query)
    ]);

    const result = {
      jobs,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    };

    CacheManager.set(cacheKey, result, 60000);
    return result;
  },

  async createJob(userId, jobData) {
    const db = getDatabase();
    if (!ObjectId.isValid(userId)) return null;

    const newJob = {
      ...jobData,
      userId: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      applications: [],
      views: 0
    };

    const result = await db.collection('jobs').insertOne(newJob);
    
    // Invalidate caches
    CacheManager.delete(`user_jobs_${userId}`);
    CacheManager.delete('public_jobs_');

    return { job: { ...newJob, _id: result.insertedId } };
  }
};

/**
 * Ultra-fast match controller with optimized queries
 */
const matchController = {
  async getUserMatches(userId) {
    const cacheKey = `matches_${userId}`;
    const cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    const db = getDatabase();
    if (!ObjectId.isValid(userId)) return null;

    const userObjectId = new ObjectId(userId);
    const pipeline = [
      {
        $match: {
          $or: [
            { userId1: userObjectId },
            { userId2: userObjectId }
          ],
          isArchived: { $ne: true }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId1',
          foreignField: '_id',
          as: 'user1Info'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId2',
          foreignField: '_id',
          as: 'user2Info'
        }
      },
      {
        $project: {
          _id: 1, status: 1, createdAt: 1, updatedAt: 1,
          user1: { $arrayElemAt: ['$user1Info', 0] },
          user2: { $arrayElemAt: ['$user2Info', 0] }
        }
      },
      { $sort: { createdAt: -1 } },
      { $limit: 50 }
    ];

    const matches = await db.collection('matches').aggregate(pipeline).toArray();
    const result = { matches };
    
    CacheManager.set(cacheKey, result, CACHE_STRATEGIES.MATCHES);
    return result;
  },

  async createMatch(matchData) {
    const db = getDatabase();
    
    const newMatch = {
      ...matchData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'pending'
    };

    const result = await db.collection('matches').insertOne(newMatch);
    
    // Invalidate cache for both users
    CacheManager.delete(`matches_${matchData.userId1}`);
    CacheManager.delete(`matches_${matchData.userId2}`);

    return { match: { ...newMatch, _id: result.insertedId } };
  },

  async updateMatchStatus(matchId, status, userId) {
    const db = getDatabase();
    if (!ObjectId.isValid(matchId)) return null;

    const result = await db.collection('matches').findOneAndUpdate(
      { _id: new ObjectId(matchId) },
      { 
        $set: { 
          status: status, 
          updatedAt: new Date(),
          updatedBy: userId
        } 
      },
      { returnDocument: 'after' }
    );

    if (!result.value) return null;

    // Invalidate cache for both users
    CacheManager.delete(`matches_${result.value.userId1}`);
    CacheManager.delete(`matches_${result.value.userId2}`);

    return { match: result.value };
  }
};

/**
 * Ultra-fast notification controller
 */
const notificationController = {
  async getNotifications(userId, queryParams = {}) {
    const cacheKey = `notifications_${userId}_${JSON.stringify(queryParams)}`;
    const cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    const db = getDatabase();
    if (!ObjectId.isValid(userId)) return null;

    const page = Math.max(parseInt(queryParams.page) || 1, 1);
    const limit = Math.min(parseInt(queryParams.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const query = { userId: userId };
    if (queryParams.type) query.type = queryParams.type;
    if (queryParams.isRead !== undefined) query.isRead = queryParams.isRead === 'true';

    const pipeline = [
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1, userId: 1, type: 1, title: 1, message: 1,
          data: 1, isRead: 1, createdAt: 1, updatedAt: 1
        }
      }
    ];

    const [notifications, totalCount, unreadCount] = await Promise.all([
      db.collection('notifications').aggregate(pipeline).toArray(),
      db.collection('notifications').countDocuments(query),
      db.collection('notifications').countDocuments({ userId: userId, isRead: false })
    ]);

    const result = {
      notifications,
      summary: {
        total: totalCount,
        unread: unreadCount,
        read: totalCount - unreadCount
      },
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    };

    CacheManager.set(cacheKey, result, CACHE_STRATEGIES.NOTIFICATIONS);
    return result;
  },

  async markAllAsRead(userId) {
    const db = getDatabase();
    if (!ObjectId.isValid(userId)) return null;

    const result = await db.collection('notifications').updateMany(
      { userId: userId, isRead: false },
      { $set: { isRead: true, updatedAt: new Date() } }
    );

    // Invalidate cache
    CacheManager.delete(`notifications_${userId}`);

    return { modifiedCount: result.modifiedCount };
  }
};

/**
 * Ultra-fast review controller
 */
const reviewController = {
  async getCompanyReviews(companyUserId, queryParams = {}) {
    const cacheKey = `reviews_${companyUserId}_${JSON.stringify(queryParams)}`;
    const cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    const db = getDatabase();
    if (!ObjectId.isValid(companyUserId)) return null;

    const page = Math.max(parseInt(queryParams.page) || 1, 1);
    const limit = Math.min(parseInt(queryParams.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const pipeline = [
      { $match: { companyUserId: companyUserId } },
      {
        $lookup: {
          from: 'users',
          localField: 'reviewerId',
          foreignField: '_id',
          as: 'reviewerInfo'
        }
      },
      { $unwind: '$reviewerInfo' },
      {
        $project: {
          _id: 1, companyUserId: 1, reviewerId: 1, rating: 1, comment: 1,
          createdAt: 1, updatedAt: 1,
          reviewerName: '$reviewerInfo.name',
          reviewerAvatar: '$reviewerInfo.profileAvatarUrl'
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ];

    const [reviews, totalCount] = await Promise.all([
      db.collection('companyreviews').aggregate(pipeline).toArray(),
      db.collection('companyreviews').countDocuments({ companyUserId: companyUserId })
    ]);

    const result = {
      reviews,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    };

    CacheManager.set(cacheKey, result, CACHE_STRATEGIES.REVIEWS);
    return result;
  },

  async getCompanyReviewSummary(companyUserId) {
    const cacheKey = `review_summary_${companyUserId}`;
    const cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    const db = getDatabase();
    if (!ObjectId.isValid(companyUserId)) return null;

    const pipeline = [
      { $match: { companyUserId: companyUserId } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
          rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } }
        }
      },
      {
        $project: {
          _id: 0,
          totalReviews: 1,
          averageRating: { $round: ['$averageRating', 2] },
          ratingDistribution: ['$rating1', '$rating2', '$rating3', '$rating4', '$rating5']
        }
      }
    ];

    const [summary] = await db.collection('companyreviews').aggregate(pipeline).toArray();
    
    const result = summary || {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: [0, 0, 0, 0, 0]
    };

    CacheManager.set(cacheKey, result, 300000);
    return result;
  }
};

/**
 * Ultra-fast chat controller
 */
const chatController = {
  async getChatMessages(matchId, queryParams = {}) {
    const cacheKey = `chat_${matchId}_${JSON.stringify(queryParams)}`;
    const cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    const db = getDatabase();
    if (!ObjectId.isValid(matchId)) return null;

    const page = Math.max(parseInt(queryParams.page) || 1, 1);
    const limit = Math.min(parseInt(queryParams.limit) || 50, 100);
    const skip = (page - 1) * limit;

    const query = { matchId: new ObjectId(matchId) };
    const pipeline = [
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1, matchId: 1, senderId: 1, message: 1, createdAt: 1
        }
      }
    ];

    const [messages, totalCount] = await Promise.all([
      db.collection('chatmessages').aggregate(pipeline).toArray(),
      db.collection('chatmessages').countDocuments(query)
    ]);

    const result = {
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    };

    CacheManager.set(cacheKey, result, CACHE_STRATEGIES.CHAT);
    return result;
  },

  async createChatMessage(matchId, senderId, message) {
    const db = getDatabase();
    if (!ObjectId.isValid(matchId) || !ObjectId.isValid(senderId)) return null;

    const newMessage = {
      matchId: new ObjectId(matchId),
      senderId: new ObjectId(senderId),
      message,
      createdAt: new Date()
    };

    const result = await db.collection('chatmessages').insertOne(newMessage);
    
    // Invalidate cache
    CacheManager.delete(`chat_${matchId}`);

    return { message: { ...newMessage, _id: result.insertedId } };
  }
};

/**
 * Ultra-fast industry events controller
 */
const eventsController = {
  async getIndustryEvents(queryParams = {}) {
    const cacheKey = `events_${JSON.stringify(queryParams)}`;
    const cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    const db = getDatabase();
    const page = Math.max(parseInt(queryParams.page) || 1, 1);
    const limit = Math.min(parseInt(queryParams.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const query = { isActive: true };
    if (queryParams.location) query.location = { $regex: queryParams.location, $options: 'i' };
    if (queryParams.industry) query.industry = queryParams.industry;
    if (queryParams.type) query.type = queryParams.type;

    const pipeline = [
      { $match: query },
      { $sort: { date: 1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1, title: 1, description: 1, date: 1, location: 1,
          industry: 1, type: 1, registrationUrl: 1, company: 1,
          createdAt: 1, updatedAt: 1
        }
      }
    ];

    const [events, totalCount] = await Promise.all([
      db.collection('industryevents').aggregate(pipeline).toArray(),
      db.collection('industryevents').countDocuments(query)
    ]);

    const result = {
      events,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    };

    CacheManager.set(cacheKey, result, CACHE_STRATEGIES.EVENTS);
    return result;
  },

  async getEvent(eventId) {
    const cacheKey = `event_${eventId}`;
    const cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    const db = getDatabase();
    if (!ObjectId.isValid(eventId)) return null;

    const event = await db.collection('industryevents').findOne(
      { _id: new ObjectId(eventId) }
    );

    if (!event) return null;

    const result = { event };
    CacheManager.set(cacheKey, result, CACHE_STRATEGIES.EVENTS);
    return result;
  }
};

/**
 * Ultra-fast follow-up reminder controller
 */
const reminderController = {
  async getReminders(userId, queryParams = {}) {
    const cacheKey = `reminders_${userId}_${JSON.stringify(queryParams)}`;
    const cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    const db = getDatabase();
    if (!ObjectId.isValid(userId)) return null;

    const page = Math.max(parseInt(queryParams.page) || 1, 1);
    const limit = Math.min(parseInt(queryParams.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const query = { userId: userId };
    if (queryParams.status) query.status = queryParams.status;
    if (queryParams.type) query.type = queryParams.type;

    const pipeline = [
      { $match: query },
      { $sort: { scheduledDate: 1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1, userId: 1, type: 1, title: 1, description: 1,
          scheduledDate: 1, status: 1, createdAt: 1, updatedAt: 1
        }
      }
    ];

    const [reminders, totalCount] = await Promise.all([
      db.collection('followupreminders').aggregate(pipeline).toArray(),
      db.collection('followupreminders').countDocuments(query)
    ]);

    const result = {
      reminders,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    };

    CacheManager.set(cacheKey, result, CACHE_STRATEGIES.REMINDERS);
    return result;
  },

  async createReminder(userId, reminderData) {
    const db = getDatabase();
    if (!ObjectId.isValid(userId)) return null;

    const newReminder = {
      ...reminderData,
      userId: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('followupreminders').insertOne(newReminder);
    
    // Invalidate cache
    CacheManager.delete(`reminders_${userId}`);

    return { reminder: { ...newReminder, _id: result.insertedId } };
  },

  async updateReminder(reminderId, userId, updates) {
    const db = getDatabase();
    if (!ObjectId.isValid(reminderId) || !ObjectId.isValid(userId)) return null;

    const result = await db.collection('followupreminders').findOneAndUpdate(
      { _id: new ObjectId(reminderId), userId: userId },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result.value) return null;

    // Invalidate cache
    CacheManager.delete(`reminders_${userId}`);

    return { reminder: result.value };
  },

  async deleteReminder(reminderId, userId) {
    const db = getDatabase();
    if (!ObjectId.isValid(reminderId) || !ObjectId.isValid(userId)) return null;

    const result = await db.collection('followupreminders').deleteOne({
      _id: new ObjectId(reminderId),
      userId: userId
    });

    if (result.deletedCount === 0) return null;

    // Invalidate cache
    CacheManager.delete(`reminders_${userId}`);

    return { deleted: true };
  }
};

/**
 * Ultra-fast diary controller
 */
  async getDiaryPosts(userId, queryParams = {}) {
    const cacheKey = `diary_${userId}_${JSON.stringify(queryParams)}`;
    const cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    const db = getDatabase();
    if (!ObjectId.isValid(userId)) return null;

    const page = Math.max(parseInt(queryParams.page) || 1, 1);
    const limit = Math.min(parseInt(queryParams.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const query = { userId: new ObjectId(userId) };
    const pipeline = [
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1, userId: 1, title: 1, content: 1, images: 1,
          createdAt: 1, updatedAt: 1
        }
      }
    ];

    const [posts, totalCount] = await Promise.all([
      db.collection('diaryposts').aggregate(pipeline).toArray(),
      db.collection('diaryposts').countDocuments(query)
    ]);

    const result = {
      posts,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    };

    CacheManager.set(cacheKey, result, 60000);
    return result;
  },

  async getDiaryPost(postId) {
    const cacheKey = `diary_post_${postId}`;
    const cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    const db = getDatabase();
    if (!ObjectId.isValid(postId)) return null;

    const post = await db.collection('diaryposts').findOne(
      { _id: new ObjectId(postId) },
      {
        projection: {
          _id: 1, userId: 1, title: 1, content: 1, images: 1,
          createdAt: 1, updatedAt: 1
        }
      }
    );

    if (!post) return null;

    const result = { post };
    CacheManager.set(cacheKey, result, 300000);
    return result;
  },

  async createDiaryPost(userId, postData) {
    const db = getDatabase();
    if (!ObjectId.isValid(userId)) return null;

    const newPost = {
      ...postData,
      userId: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('diaryposts').insertOne(newPost);
    
    // Invalidate cache
    CacheManager.delete(`diary_${userId}`);

    return { post: { ...newPost, _id: result.insertedId } };
  },

  async updateDiaryPost(postId, userId, updates) {
    const db = getDatabase();
    if (!ObjectId.isValid(postId) || !ObjectId.isValid(userId)) return null;

    const result = await db.collection('diaryposts').findOneAndUpdate(
      { _id: new ObjectId(postId), userId: userId },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result.value) return null;

    // Invalidate cache
    CacheManager.delete(`diary_${userId}`);

    return { post: result.value };
  },

  async deleteDiaryPost(postId, userId) {
    const db = getDatabase();
    if (!ObjectId.isValid(postId) || !ObjectId.isValid(userId)) return null;

    const result = await db.collection('diaryposts').deleteOne({
      _id: new ObjectId(postId),
      userId: userId
    });

    if (result.deletedCount === 0) return null;

    // Invalidate cache
    CacheManager.delete(`diary_${userId}`);

    return { deleted: true };
  }
};

/**
 * Main optimized API handler
 */
export default async function handleApiRequest(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  const path = url.pathname;
  
  try {
    // GET endpoints with caching
    if (method === 'GET') {
      // Users
      if (path === '/api/users') {
        return new Response(JSON.stringify(await userController.getUsers()), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (path.match(/^\/api\/users\/([^\/]+)$/)) {
        const identifier = path.split('/')[3];
        const result = await userController.getUser(identifier);
        if (!result) {
          return new Response(JSON.stringify({ message: 'User not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (path === '/api/users/profiles/jobseekers') {
        return new Response(JSON.stringify(await userController.getJobseekerProfiles()), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Jobs
      if (path === '/api/jobs/public') {
        return new Response(JSON.stringify(await jobController.getPublicJobs(
          Object.fromEntries(url.searchParams)
        )), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (path.match(/^\/api\/users\/([^\/]+)\/jobs$/)) {
        const userId = path.split('/')[3];
        const result = await jobController.getUserJobs(userId, Object.fromEntries(url.searchParams));
        if (!result) {
          return new Response(JSON.stringify({ message: 'Invalid user ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Matches
      if (path.match(/^\/api\/users\/([^\/]+)\/matches$/)) {
        const userId = path.split('/')[3];
        const result = await matchController.getUserMatches(userId);
        if (!result) {
          return new Response(JSON.stringify({ message: 'Invalid user ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Notifications
      if (path.match(/^\/api\/users\/([^\/]+)\/notifications$/)) {
        const userId = path.split('/')[3];
        const result = await notificationController.getNotifications(userId, Object.fromEntries(url.searchParams));
        if (!result) {
          return new Response(JSON.stringify({ message: 'Invalid user ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Reviews
      if (path.match(/^\/api\/companies\/([^\/]+)\/reviews$/)) {
        const companyUserId = path.split('/')[3];
        const result = await reviewController.getCompanyReviews(companyUserId, Object.fromEntries(url.searchParams));
        if (!result) {
          return new Response(JSON.stringify({ message: 'Invalid company ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (path.match(/^\/api\/companies\/([^\/]+)\/reviews\/summary$/)) {
        const companyUserId = path.split('/')[3];
        const result = await reviewController.getCompanyReviewSummary(companyUserId);
        if (!result) {
          return new Response(JSON.stringify({ message: 'Invalid company ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Diary
      if (path.match(/^\/api\/users\/([^\/]+)\/diary-posts$/)) {
        const userId = path.split('/')[3];
        const result = await diaryController.getDiaryPosts(userId, Object.fromEntries(url.searchParams));
        if (!result) {
          return new Response(JSON.stringify({ message: 'Invalid user ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (path.match(/^\/api\/diary-posts\/([^\/]+)$/)) {
        const postId = path.split('/')[3];
        const result = await diaryController.getDiaryPost(postId);
        if (!result) {
          return new Response(JSON.stringify({ message: 'Diary post not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Events
      if (path === '/api/events') {
        return new Response(JSON.stringify(await eventsController.getIndustryEvents(
          Object.fromEntries(url.searchParams)
        )), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (path.match(/^\/api\/events\/([^\/]+)$/)) {
        const eventId = path.split('/')[3];
        const result = await eventsController.getEvent(eventId);
        if (!result) {
          return new Response(JSON.stringify({ message: 'Event not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Reminders
      if (path.match(/^\/api\/users\/([^\/]+)\/reminders$/)) {
        const userId = path.split('/')[3];
        const result = await reminderController.getReminders(userId, Object.fromEntries(url.searchParams));
        if (!result) {
          return new Response(JSON.stringify({ message: 'Invalid user ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // POST endpoints with cache invalidation
    if (method === 'POST') {
      const body = await request.json();
      
      if (path === '/api/users') {
        const result = await userController.createUser(body);
        return new Response(JSON.stringify(result), {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (path.match(/^\/api\/users\/([^\/]+)\/jobs$/)) {
        const userId = path.split('/')[3];
        const result = await jobController.createJob(userId, body);
        if (!result) {
          return new Response(JSON.stringify({ message: 'Invalid user ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify(result), {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (path.match(/^\/api\/users\/([^\/]+)\/notifications\/mark-all-read$/)) {
        const userId = path.split('/')[3];
        const result = await notificationController.markAllAsRead(userId);
        if (!result) {
          return new Response(JSON.stringify({ message: 'Invalid user ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (path.match(/^\/api\/users\/([^\/]+)\/diary-posts$/)) {
        const userId = path.split('/')[3];
        const result = await diaryController.createDiaryPost(userId, body);
        if (!result) {
          return new Response(JSON.stringify({ message: 'Invalid user ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify(result), {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (path === '/api/events') {
        const result = await eventsController.createEvent(body);
        return new Response(JSON.stringify(result), {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (path === '/api/matches') {
        const result = await matchController.createMatch(body);
        return new Response(JSON.stringify(result), {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (path.match(/^\/api\/matches\/([^\/]+)\/messages$/)) {
        const matchId = path.split('/')[3];
        const result = await chatController.createChatMessage(matchId, body.senderId, body.message);
        if (!result) {
          return new Response(JSON.stringify({ message: 'Invalid match ID or sender ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify(result), {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (path.match(/^\/api\/users\/([^\/]+)\/reminders$/)) {
        const userId = path.split('/')[3];
        const result = await reminderController.createReminder(userId, body);
        if (!result) {
          return new Response(JSON.stringify({ message: 'Invalid user ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify(result), {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // PUT/PATCH endpoints with cache invalidation
    if (method === 'PUT' || method === 'PATCH') {
      const body = await request.json();
      
      if (path.match(/^\/api\/users\/([^\/]+)$/)) {
        const identifier = path.split('/')[3];
        const result = await userController.updateUser(identifier, body);
        if (!result) {
          return new Response(JSON.stringify({ message: 'User not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (path.match(/^\/api\/diary-posts\/([^\/]+)$/)) {
        const postId = path.split('/')[3];
        const userId = body.userId;
        const result = await diaryController.updateDiaryPost(postId, userId, body);
        if (!result) {
          return new Response(JSON.stringify({ message: 'Diary post not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (path.match(/^\/api\/reminders\/([^\/]+)$/)) {
        const reminderId = path.split('/')[3];
        const userId = body.userId;
        const result = await reminderController.updateReminder(reminderId, userId, body);
        if (!result) {
          return new Response(JSON.stringify({ message: 'Reminder not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // DELETE endpoints with cache invalidation
    if (method === 'DELETE') {
      if (path.match(/^\/api\/diary-posts\/([^\/]+)$/)) {
        const body = await request.json();
        const postId = path.split('/')[3];
        const userId = body.userId;
        const result = await diaryController.deleteDiaryPost(postId, userId);
        if (!result) {
          return new Response(JSON.stringify({ message: 'Diary post not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (path.match(/^\/api\/reminders\/([^\/]+)$/)) {
        const body = await request.json();
        const reminderId = path.split('/')[3];
        const userId = body.userId;
        const result = await reminderController.deleteReminder(reminderId, userId);
        if (!result) {
          return new Response(JSON.stringify({ message: 'Reminder not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    }
    
    return new Response(JSON.stringify({ message: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}