// Import all handlers at the top level (Workers requirement)
import handleApiRequest from './routes/api-workers-full.mjs';
import handleWebhookRequest from './routes/webhooks-workers-simple.mjs';
import handleAdminRequest from './routes/admin-workers-simple.mjs';
import { MongoClient } from 'mongodb';
import { allowedOrigins } from './config/constants.mjs';
import { getCorsHeaders, handleCorsPreflight, addCorsHeaders } from './lib/cors.mjs';

// Database connection state
let mongoClient = null;
let database = null;
let isConnecting = false;

// Initialize database connection
async function connectToDatabase(env) {
    // If already connected and healthy, return immediately
    if (mongoClient && database) {
        try {
            // Quick ping to verify connection is alive
            await database.admin().ping();
            return database;
        } catch (pingError) {
            console.log('Connection not healthy, reconnecting:', pingError.message);
            // Reset connection state to force reconnect
            mongoClient = null;
            database = null;
        }
    }
    
    // If already connecting, wait for it to finish
    if (isConnecting) {
        // Wait up to 3 seconds for connection to complete
        for (let i = 0; i < 30; i++) {
            if (database) return database;
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return database;
    }
    
    isConnecting = true;
    
    try {
        const mongoUri = env.MONGODB_URI || process.env.MONGODB_URI;
        if (!mongoUri) {
            console.warn('MongoDB URI not found in environment variables - database features will be limited');
            isConnecting = false;
            return null;
        }
        
        console.log('Connecting to MongoDB...');
        
        mongoClient = new MongoClient(mongoUri, {
            maxPoolSize: 1, // Single connection for Workers
            serverSelectionTimeoutMS: 5000, // Faster server selection
            socketTimeoutMS: 10000, // Shorter socket timeout
            connectTimeoutMS: 5000, // Faster connection timeout
            maxIdleTimeMS: 30000, // Shorter idle time
            minPoolSize: 0, // No minimum connections
            retryWrites: true,
            retryReads: true
        });
        
        await mongoClient.connect();
        database = mongoClient.db(); // Use default database from URI
        
        // Verify connection works with a quick ping
        await database.admin().ping();
        
        console.log('Connected to MongoDB successfully');
        isConnecting = false;
        return database;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        mongoClient = null;
        database = null;
        isConnecting = false;
        throw error; // Propagate error to caller
    }
}

// Export database getter
export function getDatabase() {
    return database;
}

// Close database connection (for cleanup)
export async function closeDatabase() {
    if (mongoClient) {
        await mongoClient.close();
        mongoClient = null;
        database = null;
    }
}

export default {
  async fetch(request, env) {
    // Initialize database connection with error handling
    try {
      await connectToDatabase(env);
    } catch (dbError) {
      console.error('Failed to connect to database:', dbError);
      
      // Get CORS headers for error response
      const corsHeaders = getCorsHeaders(request);
      
      return new Response(JSON.stringify({
        error: 'Database connection failed',
        details: dbError.message
      }), {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Handle CORS preflight requests
    const preflightResponse = handleCorsPreflight(request);
    if (preflightResponse) {
      return preflightResponse;
    }

    // Get dynamic CORS headers based on request origin
    const corsHeaders = getCorsHeaders(request);

    const url = new URL(request.url);
    let response;

    try {
      // Route requests to optimized handlers
      if (url.pathname.startsWith('/api/webhooks')) {
        response = await handleWebhookRequest(request, env);
      } else if (url.pathname.startsWith('/api/admin')) {
        response = await handleAdminRequest(request, env);
      } else if (url.pathname.startsWith('/api')) {
        response = await handleApiRequest(request, env);
      } else {
        response = new Response('Not found', { status: 404 });
      }

      // Add CORS headers to response
      response = addCorsHeaders(response, request);

      return response;

    } catch (error) {
      console.error('Backend error:', error);
      // Include error details in response (for debugging)
      const errorResponse = new Response(JSON.stringify({
        error: error.message,
        stack: error.stack
      }), { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
      return errorResponse;
    }
  }
};