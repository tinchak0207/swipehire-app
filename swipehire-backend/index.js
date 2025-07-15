export default {
  async fetch(request, env) {
    // Handle CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    const url = new URL(request.url);
    
    // Route handlers
    if (url.pathname.startsWith('/api')) {
      const apiHandler = require('./routes/api');
      return apiHandler(request, env);
    }
    if (url.pathname.startsWith('/api/webhooks')) {
      const webhookHandler = require('./routes/webhooks');
      return webhookHandler(request, env);
    }
    if (url.pathname.startsWith('/api/admin')) {
      const adminHandler = require('./routes/admin');
      return adminHandler(request, env);
    }

    return new Response('Not found', {'status': 404});
  }
}
