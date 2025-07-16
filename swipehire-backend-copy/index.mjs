// Import all handlers at the top level (Workers requirement)
import handleApiRequest from './routes/api-workers-full.mjs';
import handleWebhookRequest from './routes/webhooks-workers-simple.mjs';
import handleAdminRequest from './routes/admin-workers-simple.mjs';
import mongoose from 'mongoose';
import { allowedOrigins } from './config/constants.mjs';
import { getCorsHeaders, handleCorsPreflight, addCorsHeaders } from './lib/cors.mjs';

// Database connection state
let isConnected = false;

// Initialize database connection
async function connectToDatabase(env) {
    if (isConnected) {
        return;
    }
    
    try {
        const mongoUri = env.MONGODB_URI || process.env.MONGODB_URI;
        if (!mongoUri) {
            console.warn('MongoDB URI not found in environment variables');
            return;
        }
        
        await mongoose.connect(mongoUri, {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        isConnected = true;
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        isConnected = false;
    }
}

export default {
async fetch(request, env) {
    // Initialize database connection
    await connectToDatabase(env);
    
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