require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");
const cors = require('cors');

const connectDB = require('./config/database');
const { PORT, corsOptions } = require('./config/constants');
const { bodyParserConfig } = require('./config/middleware');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Database connection
connectDB();

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(bodyParserConfig.json);
app.use(bodyParserConfig.urlencoded);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

(async () => {
  if (process.env.USE_REDIS_ADAPTER === 'true') {
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();
    
    pubClient.on('error', (err) => console.error('[Socket.IO Redis] Publisher client error:', err));
    subClient.on('error', (err) => console.error('[Socket.IO Redis] Subscriber client error:', err));
    
    try {
      await Promise.all([pubClient.connect(), subClient.connect()]);
      io.adapter(createAdapter(pubClient, subClient));
      console.log('[Socket.IO Redis] Successfully connected to Redis and set adapter.');
    } catch (err) {
      console.error('[Socket.IO Redis] Failed to connect to Redis or set adapter.', err);
    }
  }
})();

// Import route files
const apiRoutes = require('./routes/api');
const webhookRoutes = require('./routes/webhooks');
const adminRoutes = require('./routes/admin');

// Mount routes
app.use('/api', apiRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/admin', adminRoutes);

// Start server
server.listen(PORT, () => {
  console.log(`SwipeHire Backend Server running on http://localhost:${PORT}`);
});
