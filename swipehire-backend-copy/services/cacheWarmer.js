const User = require('../models/User');
const Job = require('../models/Job');
const IndustryEvent = require('../models/IndustryEvent');
const CacheService = require('./cacheService');
const performanceMonitor = require('./performanceMonitor');

class CacheWarmer {
  constructor() {
    this.isWarming = false;
    this.warmInterval = null;
    this.preloadQueue = [];
    this.warmPatterns = {
      users: 300,      // 5 minutes
      jobs: 60,        // 1 minute
      events: 120,     // 2 minutes
      matches: 30      // 30 seconds
    };
  }

  /**
   * Start cache warming service
   */
  async start() {
    if (this.isWarming) return;
    
    console.log('🚀 Starting cache warming service...');
    this.isWarming = true;

    // Initial warmup
    await this.initialWarmup();

    // Schedule periodic warming
    this.warmInterval = setInterval(() => {
      this.periodicWarmup().catch(console.error);
    }, 60000); // Run every minute

    console.log('✅ Cache warming service started');
  }

  /**
   * Stop cache warming service
   */
  stop() {
    if (!this.isWarming) return;
    
    console.log('🛑 Stopping cache warming service...');
    this.isWarming = false;
    
    if (this.warmInterval) {
      clearInterval(this.warmInterval);
      this.warmInterval = null;
    }
    
    console.log('❌ Cache warming service stopped');
  }

  /**
   * Initial cache warmup for critical data
   */
  async initialWarmup() {
    console.log('🔥 Starting initial cache warmup...');
    
    try {
      const startTime = Date.now();

      // Warm active user profiles
      await this.warmActiveUsers();

      // Warm popular jobs
      await this.warmPopularJobs();

      // Warm upcoming events
      await this.warmUpcomingEvents();

      // Warm recent matches
      await this.warmRecentMatches();

      const duration = Date.now() - startTime;
      console.log(`✅ Initial warmup completed in ${duration}ms`);

    } catch (error) {
      console.error('❌ Initial warmup failed:', error);
    }
  }

  /**
   * Periodic cache warmup for stale data
   */
  async periodicWarmup() {
    if (!this.isWarming) return;

    try {
      const activeUsers = await this.getActiveUserIds();
      
      // Warm user profiles
      await this.warmUserProfiles(activeUsers);
      
      // Warm user-specific data
      await this.warmUserData(activeUsers);
      
      // Warm global data
      await this.warmGlobalData();
      
    } catch (error) {
      console.error('❌ Periodic warmup failed:', error);
    }
  }

  /**
   * Get active user IDs (last 24 hours)
   */
  async getActiveUserIds() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const users = await User.find({
      updatedAt: { $gte: cutoff },
      profileVisibility: { $ne: 'hidden' }
    }).select('_id selectedRole').lean();

    return users;
  }

  /**
   * Warm active user profiles
   */
  async warmActiveUsers() {
    const activeUsers = await this.getActiveUserIds();
    
    console.log(`👥 Warming ${activeUsers.length} active user profiles...`);
    
    const batchSize = 50;
    for (let i = 0; i < activeUsers.length; i += batchSize) {
      const batch = activeUsers.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (user) => {
        try {
          const userData = await User.findById(user._id)
            .select('-password -firebaseUid -__v')
            .lean();
          
          if (userData) {
            await CacheService.setUser(user._id.toString(), userData, this.warmPatterns.users);
          }
        } catch (error) {
          console.error(`Failed to warm user ${user._id}:`, error.message);
        }
      }));
    }
  }

  /**
   * Warm popular job listings
   */
  async warmPopularJobs() {
    console.log('💼 Warming popular job listings...');
    
    // Popular public jobs
    const popularJobs = await Job.find({
      isPublic: true,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

    await Promise.all(popularJobs.map(async (job) => {
      const cacheKey = `job:${job._id}`;
      await CacheService.set(cacheKey, job, this.warmPatterns.jobs);
    }));

    // Recent jobs for discovery
    const recentJobs = await Job.find({
      isPublic: true,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

    await CacheService.set('recent_jobs', recentJobs, this.warmPatterns.jobs);
  }

  /**
   * Warm upcoming events
   */
  async warmUpcomingEvents() {
    console.log('📅 Warming upcoming events...');
    
    const upcomingEvents = await IndustryEvent.find({
      status: 'upcoming',
      isActive: true,
      startDateTime: { $gte: new Date() }
    })
    .populate('createdBy', 'name email')
    .sort({ startDateTime: 1 })
    .limit(50)
    .lean();

    await Promise.all(upcomingEvents.map(async (event) => {
      const cacheKey = `event:${event._id}`;
      await CacheService.set(cacheKey, event, this.warmPatterns.events);
    }));

    // Cache event lists by industry
    const industries = [...new Set(upcomingEvents.map(e => e.industry))];
    for (const industry of industries) {
      const industryEvents = upcomingEvents.filter(e => e.industry === industry);
      const cacheKey = `events_industry:${industry}`;
      await CacheService.set(cacheKey, industryEvents, this.warmPatterns.events);
    }
  }

  /**
   * Warm recent matches
   */
  async warmRecentMatches() {
    console.log('💕 Warming recent matches...');
    
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Get recent matches
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI || process.env.MONGO_URI);
    
    try {
      await client.connect();
      const db = client.db();
      
      const recentMatches = await db.collection('matches')
        .find({
          createdAt: { $gte: cutoff },
          status: { $in: ['pending', 'accepted'] }
        })
        .limit(100)
        .toArray();

      // Warm matches by user
      const userMatches = new Map();
      recentMatches.forEach(match => {
        const userIds = [match.userA_Id.toString(), match.userB_Id.toString()];
        userIds.forEach(userId => {
          if (!userMatches.has(userId)) {
            userMatches.set(userId, []);
          }
          userMatches.get(userId).push(match);
        });
      });

      await Promise.all(Array.from(userMatches.entries()).map(async ([userId, matches]) => {
        const cacheKey = `matches:${userId}`;
        await CacheService.set(cacheKey, matches, this.warmPatterns.matches);
      }));

    } finally {
      await client.close();
    }
  }

  /**
   * Warm user-specific data
   */
  async warmUserData(users) {
    const warmPromises = [];

    for (const user of users.slice(0, 100)) { // Limit to 100 users per cycle
      warmPromises.push(this.warmUserDashboard(user._id.toString()));
    }

    await Promise.allSettled(warmPromises);
  }

  /**
   * Warm user dashboard data
   */
  async warmUserDashboard(userId) {
    try {
      // User profile
      const user = await User.findById(userId)
        .select('-password -firebaseUid -__v')
        .lean();
      
      if (user) {
        await CacheService.setUser(userId, user, this.warmPatterns.users);
      }

      // User-specific data based on role
      if (user.selectedRole === 'recruiter') {
        // Recruiter's jobs
        const userJobs = await Job.find({ userId })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean();
        
        await CacheService.set(`user_jobs:${userId}`, userJobs, this.warmPatterns.jobs);
      } else {
        // Jobseeker's discovery data
        const publicJobs = await Job.find({
          isPublic: true,
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

        await CacheService.set(`public_jobs:${userId}`, publicJobs, this.warmPatterns.jobs);
      }

    } catch (error) {
      console.error(`Failed to warm user dashboard ${userId}:`, error.message);
    }
  }

  /**
   * Warm global data
   */
  async warmGlobalData() {
    try {
      // Global statistics
      const userStats = await User.aggregate([
        { $group: { _id: '$selectedRole', count: { $sum: 1 } } }
      ]);

      const jobStats = await Job.aggregate([
        { $match: { isPublic: true } },
        { $group: { _id: '$jobType', count: { $sum: 1 } } }
      ]);

      await CacheService.set('stats:users', userStats, 300);
      await CacheService.set('stats:jobs', jobStats, 300);

      // Skill frequency for recommendations
      const skills = await User.aggregate([
        { $unwind: '$profileSkills' },
        { $group: { _id: '$profileSkills', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 50 }
      ]);

      await CacheService.set('skills:popular', skills, 600);

    } catch (error) {
      console.error('Failed to warm global data:', error.message);
    }
  }

  /**
   * Preload critical data on startup
   */
  async preloadCriticalData() {
    console.log('📦 Preloading critical data...');
    
    try {
      // Essential static data
      const staticData = {
        skills: ['JavaScript', 'Python', 'React', 'Node.js', 'MongoDB', 'AWS', 'Docker'],
        industries: ['Technology', 'Finance', 'Healthcare', 'Education', 'Marketing'],
        jobTypes: ['Full-time', 'Part-time', 'Contract', 'Remote', 'Freelance']
      };

      for (const [key, values] of Object.entries(staticData)) {
        await CacheService.set(`static:${key}`, values, 3600); // 1 hour
      }

      // System configuration
      await CacheService.set('config:system', {
        version: '1.0.0',
        cacheWarmEnabled: true,
        lastWarm: new Date().toISOString()
      }, 300);

      console.log('✅ Critical data preloaded');

    } catch (error) {
      console.error('❌ Failed to preload critical data:', error);
    }
  }

  /**
   * Get cache warming status
   */
  getStatus() {
    return {
      isWarming: this.isWarming,
      patterns: this.warmPatterns,
      lastWarm: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000)
    };
  }

  /**
   * Force warmup for specific user
   */
  async forceUserWarmup(userId) {
    try {
      const user = await User.findById(userId);
      if (user) {
        await this.warmUserDashboard(userId);
        console.log(`🔥 Force warmup completed for user ${userId}`);
      }
    } catch (error) {
      console.error(`Failed to force warmup for user ${userId}:`, error);
    }
  }

  /**
   * Get cache warming metrics
   */
  getMetrics() {
    return {
      cacheWarmer: {
        status: this.isWarming ? 'running' : 'stopped',
        patterns: this.warmPatterns,
        lastWarm: new Date().toISOString(),
        activeUsersCount: this.activeUsersCount || 0
      }
    };
  }
}

const cacheWarmer = new CacheWarmer();

// Export singleton instance
module.exports = cacheWarmer;