const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGODB_URI;
    if (!MONGO_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    await mongoose.connect(MONGO_URI, {
      maxPoolSize: 20,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      waitQueueTimeoutMS: 15000,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      retryWrites: true,
      retryReads: true,
      compressors: ['zlib']
    });

    console.log('MongoDB connected successfully');
    
    // Create indexes
    await createIndexes();
    
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    // User indexes
    await mongoose.model('User')?.collection?.createIndex({ firebaseUid: 1 }, { unique: true });
    await mongoose.model('User')?.collection?.createIndex({ email: 1 }, { unique: true });
    await mongoose.model('User')?.collection?.createIndex({ selectedRole: 1, createdAt: -1 });
    
    // Job indexes
    await mongoose.model('Job')?.collection?.createIndex({ userId: 1, createdAt: -1 });
    await mongoose.model('Job')?.collection?.createIndex({ isPublic: 1, createdAt: -1 });
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

module.exports = connectDB;
