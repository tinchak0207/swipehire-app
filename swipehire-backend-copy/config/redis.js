const redis = require('redis');

class RedisManager {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    if (this.client && this.isConnected) {
      return this.client;
    }

    try {
      this.client = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        db: 0,
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        family: 4
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis connected successfully');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        console.log('Redis disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      console.error('Redis connection failed:', error);
      throw error;
    }
  }

  async get(key) {
    if (!this.client || !this.isConnected) {
      await this.connect();
    }
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = 300) {
    if (!this.client || !this.isConnected) {
      await this.connect();
    }
    try {
      return await this.client.setEx(key, ttl, value);
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }

  async del(key) {
    if (!this.client || !this.isConnected) {
      await this.connect();
    }
    try {
      return await this.client.del(key);
    } catch (error) {
      console.error('Redis del error:', error);
      return false;
    }
  }

  async exists(key) {
    if (!this.client || !this.isConnected) {
      await this.connect();
    }
    try {
      return await this.client.exists(key);
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  async flush() {
    if (!this.client || !this.isConnected) {
      await this.connect();
    }
    try {
      return await this.client.flushDb();
    } catch (error) {
      console.error('Redis flush error:', error);
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.isConnected = false;
    }
  }

  async getStats() {
    if (!this.client || !this.isConnected) {
      return { connected: false };
    }
    try {
      const info = await this.client.info('memory');
      const stats = await this.client.info('stats');
      return {
        connected: true,
        memory: this.parseRedisInfo(info),
        stats: this.parseRedisInfo(stats)
      };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }

  parseRedisInfo(info) {
    const lines = info.split('\r\n');
    const result = {};
    lines.forEach(line => {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        result[key] = value;
      }
    });
    return result;
  }
}

module.exports = new RedisManager();