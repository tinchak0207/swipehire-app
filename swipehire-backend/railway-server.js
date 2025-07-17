import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Explicit CORS middleware for Railway deployment
app.use((req, res, next) => {
  const origin = req.get('origin');
  
  // Railway-specific CORS handling for new subdomain setup
  if (origin === 'https://www.swipehire.top') {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.swipehire.top');
  } else if (origin === 'https://swipehire.top') {
    res.setHeader('Access-Control-Allow-Origin', 'https://swipehire.top');
  } else if (origin === 'https://api.swipehire.top') {
    res.setHeader('Access-Control-Allow-Origin', 'https://api.swipehire.top');
  } else if (origin === 'https://swipehire.railway.app') {
    res.setHeader('Access-Control-Allow-Origin', 'https://swipehire.railway.app');
  } else if (origin === 'https://railway.com') {
    // Handle Railway's platform behavior
    res.setHeader('Access-Control-Allow-Origin', 'https://api.swipehire.top');
  } else if (origin) {
    // Allow any origin that requests
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  // Explicitly set all CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, X-Auth-Token, Access-Control-Request-Headers');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count, Content-Range');
  
  console.log(`[CORS] ${req.method} ${req.url} from origin: ${origin}`);
  
  // Handle preflight requests immediately
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database connection
let db;
let mongoClient;

async function connectDB() {
  if (mongoClient) return db;
  
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    
    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    db = mongoClient.db();
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// Users routes (basic implementation)
app.post('/api/users', async (req, res) => {
  try {
    const database = await connectDB();
    const result = await database.collection('users').insertOne(req.body);
    res.json({ success: true, userId: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:identifier', async (req, res) => {
  try {
    const database = await connectDB();
    const user = await database.collection('users').findOne({ 
      $or: [
        { _id: req.params.identifier },
        { email: req.params.identifier }
      ]
    });
    res.json(user || { error: 'User not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Jobs routes (basic implementation)
app.post('/api/users/:userId/jobs', async (req, res) => {
  try {
    const database = await connectDB();
    const job = {
      ...req.body,
      userId: req.params.userId,
      createdAt: new Date()
    };
    const result = await database.collection('jobs').insertOne(job);
    res.json({ success: true, jobId: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/jobs', async (req, res) => {
  try {
    const database = await connectDB();
    const jobs = await database.collection('jobs').find({}).toArray();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Catch-all route for 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  if (mongoClient) {
    await mongoClient.close();
  }
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB().catch(console.error);
});