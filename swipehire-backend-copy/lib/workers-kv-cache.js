/**
 * Cloudflare Workers KV Cache
 * Optimized for free tier limits with TTL support
 */

class WorkersKVCache {
  constructor() {
    this.namespace = null;
    this.defaultTTL = 300; // 5 minutes
    this.maxKeyLength = 512;
    this.maxValueSize = 25 * 1024 * 1024; // 25MB
  }

  /**
   * Initialize KV namespace (called from worker context)
   */
  init(namespace) {
    this.namespace = namespace;
  }

  /**
   * Generate cache key with namespace prefix
   */
  generateKey(type, id) {
    const key = `${type}:${id}`;
    if (key.length > this.maxKeyLength) {
      // Hash long keys
      const hash = this.simpleHash(key);
      return `${type}:${hash}`;
    }
    return key;
  }

  /**
   * Simple hash function for long keys
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get value from KV cache
   */
  async get(key) {
    if (!this.namespace) return null;
    
    try {
      const value = await this.namespace.get(key);
      if (!value) return null;
      
      const parsed = JSON.parse(value);
      
      // Check TTL
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        await this.delete(key);
        return null;
      }
      
      return parsed.data;
    } catch (error) {
      console.error('KV get error:', error);
      return null;
    }
  }

  /**
   * Set value in KV cache with TTL
   */
  async set(key, value, ttl = null) {
    if (!this.namespace) return false;
    
    try {
      const ttlSeconds = ttl || this.defaultTTL;
      const expiresAt = Date.now() + (ttlSeconds * 1000);
      
      const cacheData = {
        data: value,
        expiresAt,
        createdAt: Date.now()
      };
      
      const serialized = JSON.stringify(cacheData);
      
      if (serialized.length > this.maxValueSize) {
        console.warn('Value too large for KV:', key);
        return false;
      }
      
      await this.namespace.put(key, serialized, { expirationTtl: ttlSeconds });
      return true;
    } catch (error) {
      console.error('KV set error:', error);
      return false;
    }
  }

  /**
   * Delete key from KV cache
   */
  async delete(key) {
    if (!this.namespace) return false;
    
    try {
      await this.namespace.delete(key);
      return true;
    } catch (error) {
      console.error('KV delete error:', error);
      return false;
    }
  }

  /**
   * Check if key exists and is not expired
   */
  async exists(key) {
    const value = await this.get(key);
    return value !== null;
  }

  /**
   * Get multiple keys at once
   */
  async getMulti(keys) {
    if (!this.namespace) {
      return keys.map(() => null);
    }
    
    const promises = keys.map(key => this.get(key));
    return Promise.all(promises);
  }

  /**
   * Set multiple keys at once
   */
  async setMulti(items) {
    if (!this.namespace) return false;
    
    const promises = items.map(({ key, value, ttl }) => 
      this.set(key, value, ttl)
    );
    
    const results = await Promise.all(promises);
    return results.every(Boolean);
  }

  /**
   * Clear cache with prefix
   */
  async clearPrefix(prefix) {
    if (!this.namespace) return false;
    
    try {
      // List keys with prefix (limited by KV API)
      const list = await this.namespace.list({ prefix });
      
      const promises = list.keys.map(key => 
        this.namespace.delete(key.name)
      );
      
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('KV clear prefix error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(prefix = '') {
    if (!this.namespace) return null;
    
    try {
      const list = await this.namespace.list({ prefix });
      
      return {
        totalKeys: list.keys.length,
        keys: list.keys.map(key => ({
          name: key.name,
          expiration: key.expiration
        })),
        prefix
      };
    } catch (error) {
      console.error('KV stats error:', error);
      return null;
    }
  }

  /**
   * Cache key patterns for different data types
   */
  static getKeyPatterns() {
    return {
      user: (userId) => `user:${userId}`,
      job: (jobId) => `job:${jobId}`,
      event: (eventId) => `event:${eventId}`,
      match: (matchId) => `match:${matchId}`,
      chat: (chatId) => `chat:${chatId}`,
      stats: (type) => `stats:${type}`,
      query: (queryHash) => `query:${queryHash}`,
      list: (type, filters) => `list:${type}:${this.hashFilters(filters)}`
    };
  }

  /**
   * Hash filter objects for consistent cache keys
   */
  static hashFilters(filters) {
    const str = JSON.stringify(filters || {});
    return this.simpleHash(str);
  }

  /**
   * TTL configurations for different data types
   */
  static getTTLConfig() {
    return {
      user: 300,      // 5 minutes
      job: 60,        // 1 minute
      event: 120,     // 2 minutes
      match: 30,      // 30 seconds
      chat: 60,       // 1 minute
      stats: 600,     // 10 minutes
      query: 180,     // 3 minutes
      list: 120       // 2 minutes
    };
  }
}

// Create singleton instance
const kvCache = new WorkersKVCache();

module.exports = kvCache;