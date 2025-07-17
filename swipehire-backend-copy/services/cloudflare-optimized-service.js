//**
 * Cloudflare Workers Optimized Service
 * Uses MongoDB Data API + Workers KV to stay within free tier limits
 */

const mongoAPI = require('../lib/mongodb-data-api');
const kvCache = require('../lib/workers-kv-cache');
const performanceMonitor = require('./performanceMonitor');

class CloudflareOptimizedService {
  constructor() {
    this.cachePatterns = {
      user: { ttl: 300, prefix: 'user' },
      job: { ttl: 60, prefix: 'job' },
      event: { ttl: 120, prefix: 'event' },
      match: { ttl: 30, prefix: 'match' },
      chat: { ttl: 60, prefix: 'chat' },
      stats: { ttl: 600, prefix: 'stats' }
    };
  }

  /**
   * Get user profile with caching
   */
  async getUser(userId) {
    const cacheKey = `user:${userId}`;
    
    // Try cache first
    const cached = await kvCache.get(cacheKey);
    if (cached) {
      performanceMonitor.recordCacheHit('user');
      return cached;
    }

    // Fetch from MongoDB Data API
    const user = await mongoAPI.findOne('users', { _id: { $oid: userId } });
    
    if (user) {
      // Remove sensitive data before caching
      const safeUser = this.sanitizeUser(user);
      await kvCache.set(cacheKey, safeUser, this.cachePatterns.user.ttl);
      performanceMonitor.recordCacheMiss('user');
    }

    return user;
  }

  /**
   * Get job listings with caching
   */
  async getJobs(filters = {}, options = {}) {
    const queryHash = this.hashQuery({ filters, options });
    const cacheKey = `jobs:${queryHash}`;
    
    // Try cache first
    const cached = await kvCache.get(cacheKey);
    if (cached) {
      performanceMonitor.recordCacheHit('jobs');
      return cached;
    }

    // Build optimized query
    const mongoFilters = {
      isPublic: true,
      ...this.buildJobFilters(filters)
    };

    const mongoOptions = {
      limit: Math.min(options.limit || 20, 50), // Respect limits
      sort: options.sort || { createdAt: -1 },
      projection: this.getJobProjection()
    };

    const jobs = await mongoAPI.find('jobs', mongoFilters, mongoOptions);
    
    if (jobs.length > 0) {
      await kvCache.set(cacheKey, jobs, this.cachePatterns.job.ttl);
      performanceMonitor.recordCacheMiss('jobs');
    }

    return jobs;
  }

  /**
   * Get upcoming events with caching
   */
  async getUpcomingEvents(filters = {}) {
    const queryHash = this.hashQuery(filters);
    const cacheKey = `events:${queryHash}`;
    
    const cached = await kvCache.get(cacheKey);
    if (cached) {
      performanceMonitor.recordCacheHit('events');
      return cached;
    }

    const mongoFilters = {
      status: 'upcoming',
      isActive: true,
      startDateTime: { $gte: new Date() },
      ...this.buildEventFilters(filters)
    };

    const events = await mongoAPI.find('industryevents', mongoFilters, {
      limit: 50,
      sort: { startDateTime: 1 },
      projection: this.getEventProjection()
    });

    if (events.length > 0) {
      await kvCache.set(cacheKey, events, this.cachePatterns.event.ttl);
      performanceMonitor.recordCacheMiss('events');
    }

    return events;
  }

  /**
   * Get user matches with caching
   */
  async getUserMatches(userId) {
    const cacheKey = `matches:${userId}`;
    
    const cached = await kvCache.get(cacheKey);
    if (cached) {
      performanceMonitor.recordCacheHit('matches');
      return cached;
    }

    const matches = await mongoAPI.find('matches', {
      $or: [
        { userA_Id: userId },
        { userB_Id: userId }
      ]
    }, {
      limit: 100,
      sort: { createdAt: -1 }
    });

    if (matches.length > 0) {
      await kvCache.set(cacheKey, matches, this.cachePatterns.match.ttl);
      performanceMonitor.recordCacheMiss('matches');
    }

    return matches;
  }

  /**
   * Get user dashboard data
   */
  async getUserDashboard(userId) {
    const cacheKey = `dashboard:${userId}`;
    
    const cached = await kvCache.get(cacheKey);
    if (cached) {
      performanceMonitor.recordCacheHit('dashboard');
      return cached;
    }

    // Use batch operations for efficiency
    const [user, matches, jobs, events] = await Promise.allSettled([
      this.getUser(userId),
      this.getUserMatches(userId),
      this.getJobs({ userId }),
      this.getUpcomingEvents({ userId })
    ]);

    const dashboard = {
      user: user.status === 'fulfilled' ? user.value : null,
      matches: matches.status === 'fulfilled' ? matches.value : [],
      jobs: jobs.status === 'fulfilled' ? jobs.value : [],
      events: events.status === 'fulfilled' ? events.value : []
    };

    await kvCache.set(cacheKey, dashboard, 180); // 3 minutes
    performanceMonitor.recordCacheMiss('dashboard');

    return dashboard;
  }

  /**
   * Get statistics with caching
   */
  async getStats(type) {
    const cacheKey = `stats:${type}`;
    
    const cached = await kvCache.get(cacheKey);
    if (cached) {
      performanceMonitor.recordCacheHit('stats');
      return cached;
    }

    let stats;
    switch (type) {
      case 'users':
        stats = await mongoAPI.aggregate('users', [
          { $group: { _id: '$selectedRole', count: { $sum: 1 } } }
        ]);
        break;
      case 'jobs':
        stats = await mongoAPI.aggregate('jobs', [
          { $match: { isPublic: true } },
          { $group: { _id: '$jobType', count: { $sum: 1 } } }
        ]);
        break;
      case 'events':
        stats = await mongoAPI.aggregate('industryevents', [
          { $match: { status: 'upcoming', startDateTime: { $gte: new Date() } } },
          { $group: { _id: '$industry', count: { $sum: 1 } } }
        ]);
        break;
      default:
        stats = { error: 'Unknown stats type' };
    }

    await kvCache.set(cacheKey, stats, this.cachePatterns.stats.ttl);
    performanceMonitor.recordCacheMiss('stats');

    return stats;
  }

  /**
   * Update user data with cache invalidation
   */
  async updateUser(userId, updateData) {
    // Update in MongoDB
    const result = await mongoAPI.updateOne('users', 
      { _id: { $oid: userId } }, 
      { $set: updateData }
    );

    // Invalidate cache
    await kvCache.delete(`user:${userId}`);
    await kvCache.delete(`dashboard:${userId}`);

    return result;
  }

  /**
   * Create job with cache invalidation
   */
  async createJob(jobData) {
    const result = await mongoAPI.insertOne('jobs', jobData);
    
    // Clear job list caches
    await kvCache.clearPrefix('jobs:');
    
    return result;
  }

  /**
   * Search functionality with caching
   */
  async search(type, query, filters = {}) {
    const searchHash = this.hashQuery({ query, filters });
    const cacheKey = `search:${type}:${searchHash}`;
    
    const cached = await kvCache.get(cacheKey);
    if (cached) {
      performanceMonitor.recordCacheHit('search');
      return cached;
    }

    let results;
    const searchRegex = new RegExp(query, 'i');

    switch (type) {
      case 'jobs':
        results = await mongoAPI.find('jobs', {
          isPublic: true,
          $or: [
            { title: searchRegex },
            { company: searchRegex },
            { description: searchRegex }
          ],
          ...filters
        }, { limit: 20 });
        break;
      case 'users':
        results = await mongoAPI.find('users', {
          profileVisibility: 'public',
          $or: [
            { name: searchRegex },
            { headline: searchRegex },
            { profileSkills: { $in: [query] } }
          ]
        }, { limit: 20 });
        break;
      case 'events':
        results = await mongoAPI.find('industryevents', {
          status: 'upcoming',
          $or: [
            { title: searchRegex },
            { description: searchRegex },
            { industry: searchRegex }
          ]
        }, { limit: 20 });
        break;
    }

    if (results.length > 0) {
      await kvCache.set(cacheKey, results, 120); // 2 minutes
      performanceMonitor.recordCacheMiss('search');
    }

    return results;
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics() {
    return {
      cache: performanceMonitor.getCacheMetrics(),
      api: await mongoAPI.healthCheck(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Utility methods
   */
  sanitizeUser(user) {
    if (!user) return user;
    const { password, firebaseUid, __v, ...safeUser } = user;
    return safeUser;
  }

  buildJobFilters(filters) {
    const mongoFilters = {};
    
    if (filters.jobType) mongoFilters.jobType = filters.jobType;
    if (filters.location) mongoFilters.location = new RegExp(filters.location, 'i');
    if (filters.salaryMin) mongoFilters.salary = { $gte: filters.salaryMin };
    if (filters.skills) mongoFilters.requiredSkills = { $in: filters.skills };
    if (filters.company) mongoFilters.company = new RegExp(filters.company, 'i');
    
    return mongoFilters;
  }

  buildEventFilters(filters) {
    const mongoFilters = {};
    
    if (filters.industry) mongoFilters.industry = filters.industry;
    if (filters.location) mongoFilters.location = new RegExp(filters.location, 'i');
    if (filters.startDate) mongoFilters.startDateTime = { $gte: new Date(filters.startDate) };
    
    return mongoFilters;
  }

  getJobProjection() {
    return {
      title: 1,
      company: 1,
      location: 1,
      salary: 1,
      jobType: 1,
      description: 1,
      requiredSkills: 1,
      createdAt: 1,
      userId: 1,
      isPublic: 1
    };
  }

  getEventProjection() {
    return {
      title: 1,
      description: 1,
      industry: 1,
      location: 1,
      startDateTime: 1,
      endDateTime: 1,
      capacity: 1,
      createdBy: 1,
      status: 1,
      isActive: 1
    };
  }

  hashQuery(query) {
    return Buffer.from(JSON.stringify(query)).toString('base64').replace(/[/+=]/g, '');
  }
}

const cfOptimizedService = new CloudflareOptimizedService();

module.exports = cfOptimizedService;