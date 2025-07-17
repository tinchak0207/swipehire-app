import { MongoClient } from 'mongodb';

// Connection pooling configuration
const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://tinchak0207:cfchan%407117@swipehire.fwxspbu.mongodb.net/?retryWrites=true&w=majority&appName=swipehire';

// Global connection pool
let client = null;
let db = null;

// Connection pool configuration
const POOL_CONFIG = {
  maxPoolSize: 50,           // Increased from 20 for production load
  minPoolSize: 10,           // Increased from 5 for better connection availability
  maxIdleTimeMS: 60000,      // Increased from 30s to reduce connection churn
  waitQueueTimeoutMS: 30000, // Increased from 15s for better queue handling
  serverSelectionTimeoutMS: 15000, // Increased from 10s for better failover
  connectTimeoutMS: 15000,   // Increased from 10s for network latency
  socketTimeoutMS: 60000,    // Increased from 30s for long-running queries
  bufferMaxEntries: 0,      // Disable buffering
  bufferCommands: false,    // Disable command buffering
  retryWrites: true,        // Enable write retries
  retryReads: true,         // Enable read retries
  retryAttempts: 3,         // Add retry attempts for transient failures
  compression: {
    compressors: ['zlib', 'snappy']   // Add snappy for better performance
  },
  monitorCommands: true,    // Enable monitoring for performance insights
  appName: 'swipehire-backend', // Identify application in MongoDB logs
  directConnection: false,  // Use replica set connections
  maxConnecting: 2,         // Limit concurrent connection establishment
  waitQueueSize: 100        // Limit wait queue size
};

// Cache for frequently accessed data
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Connection health check
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

/**
 * Initialize MongoDB connection with connection pooling and retry logic
 */
export async function initializeDatabase(retries = 3) {
  try {
    if (client && client.topology && client.topology.isConnected()) {
      return db;
    }

    console.log('Initializing MongoDB connection pool...');
    
    client = new MongoClient(MONGO_URI, POOL_CONFIG);
    await client.connect();
    
    db = client.db('swipehire');
    
    // Verify connection with ping
    await client.db('admin').command({ ping: 1 });
    
    // Create indexes for performance
    await createOptimizedIndexes();
    
    console.log('MongoDB connection pool initialized successfully');
    return db;
  } catch (error) {
    console.error(`MongoDB connection error (attempt ${4 - retries}):`, error);
    
    if (retries > 0) {
      console.log(`Retrying connection in 2 seconds... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return initializeDatabase(retries - 1);
    }
    
    throw error;
  }
}

/**
 * Get database instance with connection health check and automatic retry
 */
export async function getDatabase() {
  try {
    if (!db || !client || !client.topology || !client.topology.isConnected()) {
      console.log('Database not initialized or connection lost, reconnecting...');
      await initializeDatabase(2);
    }
    
    // Periodic health check
    const now = Date.now();
    if (now - lastHealthCheck > HEALTH_CHECK_INTERVAL) {
      checkConnectionHealth().catch(console.error);
      lastHealthCheck = now;
    }
    
    return db;
  } catch (error) {
    console.error('Failed to get database instance:', error);
    throw new Error('Database connection unavailable');
  }
}

/**
 * Safe database query wrapper with timeout handling
 */
export async function safeQuery(collectionName, operation, query = {}, options = {}) {
  try {
    const db = await getDatabase();
    const collection = db.collection(collectionName);
    
    // Set default timeout for operations
    const timeout = options.timeout || 30000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      let result;
      
      switch (operation) {
        case 'findOne':
          result = await collection.findOne(query, { signal: controller.signal });
          break;
        case 'find':
          result = await collection.find(query, { ...options, signal: controller.signal }).toArray();
          break;
        case 'insertOne':
          result = await collection.insertOne(query, { signal: controller.signal });
          break;
        case 'updateOne':
          result = await collection.updateOne(query.filter, query.update, { signal: controller.signal });
          break;
        case 'deleteOne':
          result = await collection.deleteOne(query, { signal: controller.signal });
          break;
        case 'count':
          result = await collection.countDocuments(query, { signal: controller.signal });
          break;
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }
      
      clearTimeout(timeoutId);
      return result;
      
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Database query timeout');
      }
      throw error;
    }
    
  } catch (error) {
    console.error(`Database query error on ${collectionName}.${operation}:`, error);
    throw error;
  }
}

/**
 * Create optimized indexes for common queries
 */
async function createOptimizedIndexes() {
  try {
    const db = getDatabase();
    
    // User indexes
    await db.collection('users').createIndexes([
      { key: { firebaseUid: 1 }, unique: true },
      { key: { email: 1 }, unique: true },
      { key: { selectedRole: 1, createdAt: -1 } },
      { key: { 'profileSkills': 1 } },
      { key: { 'profileLocation': 1 } },
      { key: { 'profileSalaryExpectationMin': 1, 'profileSalaryExpectationMax': 1 } },
      { key: { createdAt: -1 } },
      { key: { updatedAt: -1 } }
    ]);
    
    // Job indexes
    await db.collection('jobs').createIndexes([
      { key: { userId: 1, createdAt: -1 } },
      { key: { isPublic: 1, createdAt: -1 } },
      { key: { location: 1, isPublic: 1 } },
      { key: { jobType: 1, isPublic: 1 } },
      { key: { workStyle: 1, isPublic: 1 } },
      { key: { companyIndustry: 1, isPublic: 1 } },
      { key: { salary: 1, isPublic: 1 } },
      { key: { title: 'text', description: 'text', companyName: 'text' } }
    ]);
    
    // Match indexes
    await db.collection('matches').createIndexes([
      { key: { userId1: 1, createdAt: -1 } },
      { key: { userId2: 1, createdAt: -1 } },
      { key: { userId1: 1, userId2: 1 }, unique: true },
      { key: { status: 1, createdAt: -1 } },
      { key: { isArchived: 1, createdAt: -1 } }
    ]);
    
    // Notification indexes
    await db.collection('notifications').createIndexes([
      { key: { userId: 1, createdAt: -1 } },
      { key: { userId: 1, isRead: 1, createdAt: -1 } },
      { key: { userId: 1, type: 1, createdAt: -1 } },
      { key: { createdAt: -1 } }
    ]);
    
    // Review indexes
    await db.collection('companyreviews').createIndexes([
      { key: { companyUserId: 1, createdAt: -1 } },
      { key: { companyUserId: 1, rating: 1 } },
      { key: { reviewerId: 1, companyUserId: 1 }, unique: true },
      { key: { createdAt: -1 } }
    ]);
    
    // Chat indexes
    await db.collection('chatmessages').createIndexes([
      { key: { matchId: 1, createdAt: 1 } },
      { key: { senderId: 1, createdAt: -1 } },
      { key: { createdAt: -1 } }
    ]);
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}

/**
 * Check connection health and reconnect if needed
 */
async function checkConnectionHealth() {
  try {
    if (!client || !client.topology || !client.topology.isConnected()) {
      console.log('Database connection lost, reconnecting...');
      await initializeDatabase();
    }
  } catch (error) {
    console.error('Connection health check failed:', error);
  }
}

/**
 * Simple in-memory caching with TTL
 */
export class CacheManager {
  static set(key, value, ttl = CACHE_TTL) {
    cache.set(key, {
      value,
      expires: Date.now() + ttl
    });
  }

  static get(key) {
    const item = cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  static delete(key) {
    cache.delete(key);
  }

  static clear() {
    cache.clear();
  }

  static size() {
    return cache.size;
  }

  static cleanup() {
    const now = Date.now();
    for (const [key, item] of cache.entries()) {
      if (now > item.expires) {
        cache.delete(key);
      }
    }
  }
}

/**
 * Close database connection gracefully
 */
export async function closeDatabase() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('Database connection closed');
  }
}

// Cleanup expired cache entries every minute
setInterval(() => {
  CacheManager.cleanup();
}, 60000);

// Graceful shutdown
process.on('SIGTERM', closeDatabase);
process.on('SIGINT', closeDatabase);