const { getCorsHeaders, handleCorsPreflight, addCorsHeaders } = require('./lib/cors');

module.exports = {
  async fetch(request, env) {
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
