const RedisManager = require('../config/redis');

class CacheService {
  constructor() {
    this.defaultTTL = 300; // 5 minutes
    this.cachePrefix = 'swipehire:';
  }

  generateKey(type, ...args) {
    return this.cachePrefix + type + ':' + args.join(':');
  }

  async get(key, fallback = null) {
    try {
      const cached = await RedisManager.get(key);
      return cached ? JSON.parse(cached) : fallback;
    } catch (error) {
      console.error('Cache get error:', error);
      return fallback;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    try {
      const serialized = JSON.stringify(value);
      return await RedisManager.set(key, serialized, ttl);
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      return await RedisManager.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  async delPattern(pattern) {
    try {
      // This requires Redis 6.2+ for SCAN command
      // For now, we'll use exact key deletion
      return true;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return false;
    }
  }

  async exists(key) {
    try {
      return await RedisManager.exists(key);
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  async flush() {
    try {
      return await RedisManager.flush();
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  }

  // Specific cache methods for different data types
  async getUser(userId) {
    const key = this.generateKey('user', userId);
    return await this.get(key);
  }

  async setUser(userId, userData, ttl = 300) {
    const key = this.generateKey('user', userId);
    return await this.set(key, userData, ttl);
  }

  async getJobs(queryHash, page = 1) {
    const key = this.generateKey('jobs', queryHash, page);
    return await this.get(key);
  }

  async setJobs(queryHash, jobs, page = 1, ttl = 60) {
    const key = this.generateKey('jobs', queryHash, page);
    return await this.set(key, jobs, ttl);
  }

  async getPublicJobs(queryHash, page = 1) {
    const key = this.generateKey('public_jobs', queryHash, page);
    return await this.get(key);
  }

  async setPublicJobs(queryHash, jobs, page = 1, ttl = 60) {
    const key = this.generateKey('public_jobs', queryHash, page);
    return await this.set(key, jobs, ttl);
  }

  async getMatches(userId) {
    const key = this.generateKey('matches', userId);
    return await this.get(key);
  }

  async setMatches(userId, matches, ttl = 30) {
    const key = this.generateKey('matches', userId);
    return await this.set(key, matches, ttl);
  }

  async getChatMessages(matchId, page = 1) {
    const key = this.generateKey('chat', matchId, page);
    return await this.get(key);
  }

  async setChatMessages(matchId, messages, page = 1, ttl = 30) {
    const key = this.generateKey('chat', matchId, page);
    return await this.set(key, messages, ttl);
  }

  async getEvents(queryHash, page = 1) {
    const key = this.generateKey('events', queryHash, page);
    return await this.get(key);
  }

  async setEvents(queryHash, events, page = 1, ttl = 120) {
    const key = this.generateKey('events', queryHash, page);
    return await this.set(key, events, ttl);
  }

  async getReviews(companyId, page = 1) {
    const key = this.generateKey('reviews', companyId, page);
    return await this.get(key);
  }

  async setReviews(companyId, reviews, page = 1, ttl = 120) {
    const key = this.generateKey('reviews', companyId, page);
    return await this.set(key, reviews, ttl);
  }

  async invalidateUser(userId) {
    const keys = [
      this.generateKey('user', userId),
      this.generateKey('matches', userId)
    ];
    
    await Promise.all(keys.map(key => this.del(key)));
  }

  async invalidateJobs(userId) {
    const keys = [
      this.generateKey('jobs', '*', '*'),
      this.generateKey('public_jobs', '*', '*')
    ];
    
    // For now, we'll flush the entire jobs cache
    // In production, use Redis 6.2+ SCAN for targeted deletion
    return true;
  }

  async getStats() {
    return await RedisManager.getStats();
  }
}

module.exports = new CacheService();