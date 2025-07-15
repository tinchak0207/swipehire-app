module.exports = {
  async fetch(request, env) {
    // Setup CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://www.swipehire.top',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    // Handle preflight request
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    let response;

    try {
      // Route requests to optimized handlers
      if (url.pathname.startsWith('/api/webhooks')) {
        const handler = require('./routes/webhooks-workers-optimized');
        response = await handler(request, env);
      } else if (url.pathname.startsWith('/api/admin')) {
        const handler = require('./routes/admin-workers-optimized');
        response = await handler(request, env);
      } else if (url.pathname.startsWith('/api')) {
        const handler = require('./routes/api-workers-optimized');
        response = await handler(request, env);
      } else {
        response = new Response('Not found', { status: 404 });
      }

      // Add CORS headers to response
      for (const [key, value] of Object.entries(corsHeaders)) {
        response.headers.set(key, value);
      }

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
