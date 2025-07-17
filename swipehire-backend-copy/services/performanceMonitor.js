const { MongoClient } = require('mongodb');
const CacheService = require('./cacheService');

class PerformanceMonitor {
  constructor() {
    this.queryMetrics = new Map();
    this.slowQueries = [];
    this.startTime = Date.now();
    this.metrics = {
      totalQueries: 0,
      slowQueries: 0,
      averageResponseTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0
    };
    this.connectionPoolStats = {
      active: 0,
      idle: 0,
      available: 0,
      waiting: 0
    };
  }

  /**
   * Track database query performance
   */
  async trackQuery(collection, operation, query, duration, success = true) {
    this.metrics.totalQueries++;
    
    if (!success) {
      this.metrics.errors++;
    }

    // Track slow queries (>> 100ms)
    if (duration > 100) {
      this.metrics.slowQueries++;
      this.slowQueries.push({
        collection,
        operation,
        query: this.sanitizeQuery(query),
        duration,
        timestamp: new Date(),
        success
      });

      // Keep only last 100 slow queries
      if (this.slowQueries.length > 100) {
        this.slowQueries = this.slowQueries.slice(-100);
      }

      console.warn(`Slow query detected: ${collection}.${operation} took ${duration}ms`);
    }

    // Update average response time
    this.metrics.averageResponseTime = 
      ((this.metrics.averageResponseTime * (this.metrics.totalQueries - 1)) + duration) / 
      this.metrics.totalQueries;

    // Track per-collection metrics
    const key = `${collection}.${operation}`;
    if (!this.queryMetrics.has(key)) {
      this.queryMetrics.set(key, {
        count: 0,
        totalTime: 0,
        averageTime: 0,
        maxTime: 0,
        minTime: Infinity
      });
    }

    const metrics = this.queryMetrics.get(key);
    metrics.count++;
    metrics.totalTime += duration;
    metrics.averageTime = metrics.totalTime / metrics.count;
    metrics.maxTime = Math.max(metrics.maxTime, duration);
    metrics.minTime = Math.min(metrics.minTime, duration);
  }

  /**
   * Sanitize query for logging (remove sensitive data)
   */
  sanitizeQuery(query) {
    if (typeof query !== 'object' || query === null) {
      return String(query);
    }

    // Create a sanitized copy
    const sanitized = { ...query };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'email', 'firebaseUid'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Get current performance metrics
   */
  getMetrics() {
    const uptime = Date.now() - this.startTime;
    
    return {
      uptime: Math.floor(uptime / 1000),
      queries: {
        total: this.metrics.totalQueries,
        slow: this.metrics.slowQueries,
        averageResponseTime: Math.round(this.metrics.averageResponseTime * 100) / 100,
        errors: this.metrics.errors,
        successRate: this.metrics.totalQueries > 0 ? 
          ((this.metrics.totalQueries - this.metrics.errors) / this.metrics.totalQueries * 100).toFixed(2) : 100
      },
      cache: {
        hits: this.metrics.cacheHits,
        misses: this.metrics.cacheMisses,
        hitRatio: (this.metrics.cacheHits + this.metrics.cacheMisses) > 0 ?
          (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100).toFixed(2) : 0
      },
      memory: this.getMemoryUsage(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get memory usage statistics
   */
  getMemoryUsage() {
    const memUsage = process.memoryUsage();
    return {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100,
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100,
      external: Math.round(memUsage.external / 1024 / 1024 * 100) / 100,
      rss: Math.round(memUsage.rss / 1024 / 1024 * 100) / 100
    };
  }

  /**
   * Get detailed query metrics
   */
  getQueryMetrics() {
    const metrics = [];
    for (const [key, value] of this.queryMetrics.entries()) {
      metrics.push({
        query: key,
        count: value.count,
        averageTime: Math.round(value.averageTime * 100) / 100,
        maxTime: Math.round(value.maxTime * 100) / 100,
        minTime: Math.round(value.minTime * 100) / 100,
        totalTime: Math.round(value.totalTime * 100) / 100
      });
    }
    return metrics.sort((a, b) => b.totalTime - a.totalTime).slice(0, 20);
  }

  /**
   * Get slow queries
   */
  getSlowQueries(limit = 10) {
    return this.slowQueries.slice(-limit).reverse();
  }

  /**
   * Get database performance statistics
   */
  async getDatabaseStats() {
    try {
      const { MongoClient } = require('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI || process.env.MONGO_URI);
      
      await client.connect();
      const db = client.db();

      const [dbStats, serverStatus] = await Promise.all([
        db.stats(),
        db.admin().serverStatus()
      ]);

      await client.close();

      return {
        database: {
          name: dbStats.db,
          collections: dbStats.collections,
          dataSize: Math.round(dbStats.dataSize / 1024 / 1024 * 100) / 100,
          indexSize: Math.round(dbStats.indexSize / 1024 / 1024 * 100) / 100,
          objects: dbStats.objects
        },
        server: {
          version: serverStatus.version,
          uptime: serverStatus.uptime,
          connections: serverStatus.connections,
          opcounters: serverStatus.opcounters,
          network: serverStatus.network
        }
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      return { error: error.message };
    }
  }

  /**
   * Get MongoDB query execution plans
   */
  async getQueryPlans(collectionName, query, options = {}) {
    try {
      const { MongoClient } = require('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI || process.env.MONGO_URI);
      
      await client.connect();
      const db = client.db();
      const collection = db.collection(collectionName);

      const explain = await collection.find(query, options).explain('executionStats');
      
      await client.close();

      return {
        collection: collectionName,
        query: this.sanitizeQuery(query),
        executionStats: explain.executionStats,
        winningPlan: explain.queryPlanner.winningPlan,
        indexUsed: explain.queryPlanner.winningPlan.inputStage?.indexName || 'none'
      };
    } catch (error) {
      console.error('Error getting query plan:', error);
      return { error: error.message };
    }
  }

  /**
   * Monitor cache performance
   */
  recordCacheHit() {
    this.metrics.cacheHits++;
  }

  recordCacheMiss() {
    this.metrics.cacheMisses++;
  }

  /**
   * Get Redis performance metrics
   */
  async getRedisStats() {
    try {
      const redis = require('redis');
      const client = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      });

      await client.connect();
      const info = await client.info('memory');
      const stats = await client.info('stats');
      await client.quit();

      return {
        memory: this.parseRedisInfo(info),
        stats: this.parseRedisInfo(stats),
        connected: true
      };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }

  /**
   * Parse Redis info strings
   */
  parseRedisInfo(info) {
    const lines = info.split('\r\n');
    const result = {};
    lines.forEach(line => {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        result[key] = isNaN(value) ? value : parseFloat(value);
      }
    });
    return result;
  }

  /**
   * Reset performance metrics
   */
  resetMetrics() {
    this.metrics = {
      totalQueries: 0,
      slowQueries: 0,
      averageResponseTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0
    };
    this.slowQueries = [];
    this.queryMetrics.clear();
    this.startTime = Date.now();
  }

  /**
   * Get comprehensive health check
   */
  async getHealthCheck() {
    const [dbStats, redisStats, memory] = await Promise.all([
      this.getDatabaseStats(),
      this.getRedisStats(),
      Promise.resolve(this.getMemoryUsage())
    ]);

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      database: dbStats,
      redis: redisStats,
      memory,
      performance: this.getMetrics(),
      slowQueries: this.getSlowQueries(5)
    };
  }
}

const performanceMonitor = new PerformanceMonitor();

module.exports = performanceMonitor;