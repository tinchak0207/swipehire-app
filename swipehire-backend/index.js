import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// Import routes
import userRoutes from './routes/users.js';
import jobRoutes from './routes/jobs.js';
import matchRoutes from './routes/matches.js';
import chatRoutes from './routes/chat.js';
import reviewRoutes from './routes/reviews.js';
import diaryRoutes from './routes/diary.js';
import eventRoutes from './routes/events.js';
import notificationRoutes from './routes/notifications.js';
import followupRoutes from './routes/followup.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet());
app.use(compression());

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
  } else if (origin === 'https://swipehire-production.up.railway.app') {
    res.setHeader('Access-Control-Allow-Origin', 'https://swipehire-production.up.railway.app');
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
  res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count, Content-Range, X-Pagination-Count');
  
  console.log(`[CORS] ${req.method} ${req.url} from origin: ${origin}`);
  
  // Handle preflight requests immediately
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/swipehire';

if (!mongoUri) {
  console.warn('⚠️  No MongoDB URI provided. Using local MongoDB: mongodb://localhost:27017/swipehire');
}

mongoose.connect(mongoUri)
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log(`🔗 Connected to: ${mongoUri.includes('localhost') ? 'Local MongoDB' : 'MongoDB Atlas'}`);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.log('💡 Make sure MONGODB_URI is set in your environment variables');
  
  // Don't crash the app in development, but log the error
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/diary', diaryRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/followup', followupRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: https://www.swipehire.top, https://swipehire.top, localhost`);
});

export default app;