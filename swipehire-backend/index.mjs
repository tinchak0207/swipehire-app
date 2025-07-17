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

// Initialize database connection with Workers-optimized settings
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
    
    // If already connecting, wait for it to finish with timeout
    if (isConnecting) {
        // Wait up to 3 seconds for connection to complete
        const startTime = Date.now();
        while (Date.now() - startTime < 3000) {
            if (database) return database;
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        throw new Error('Database connection timeout - already connecting');
    }
    
    isConnecting = true;
    
    try {
        const mongoUri = env.MONGODB_URI;
        if (!mongoUri) {
            console.warn('MongoDB URI not found in environment variables');
            isConnecting = false;
            throw new Error('MongoDB URI not configured');
        }
        
        console.log('Connecting to MongoDB...');
        
        mongoClient = new MongoClient(mongoUri, {
            maxPoolSize: 1, // Single connection for Workers
            serverSelectionTimeoutMS: 3000, // Faster server selection
            socketTimeoutMS: 5000, // Shorter socket timeout
            connectTimeoutMS: 3000, // Faster connection timeout
            maxIdleTimeMS: 10000, // Shorter idle time
            minPoolSize: 0, // No minimum connections
            retryWrites: true,
            retryReads: true,
            waitQueueTimeoutMS: 3000 // Don't wait long for connections
        });
        
        // Connect with timeout
        const connectPromise = mongoClient.connect();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('MongoDB connection timeout')), 4000)
        );
        
        await Promise.race([connectPromise, timeoutPromise]);
        
        database = mongoClient.db();
        
        // Quick verification
        await database.admin().ping();
        
        console.log('Connected to MongoDB successfully');
        isConnecting = false;
        return database;
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        
        // Clean up on error
        if (mongoClient) {
            try {
                await mongoClient.close();
            } catch (closeError) {
                console.error('Error closing MongoDB client:', closeError.message);
            }
        }
        
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
    // Handle CORS preflight requests immediately (no DB connection needed)
    const preflightResponse = handleCorsPreflight(request);
    if (preflightResponse) {
      return preflightResponse;
    }

    // Get dynamic CORS headers based on request origin
    const corsHeaders = getCorsHeaders(request);

    // Initialize database connection with timeout and error handling
    try {
      // Add timeout to prevent hanging
      const dbPromise = connectToDatabase(env);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), 5000)
      );
      
      await Promise.race([dbPromise, timeoutPromise]);
    } catch (dbError) {
      console.error('Database connection error:', dbError.message);
      
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