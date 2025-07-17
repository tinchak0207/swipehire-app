// CORS utility functions for handling dynamic origins
// Compatible with Cloudflare Workers CommonJS environment

// Define allowed origins directly to avoid import issues
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:9002',
    'https://6000-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',
    'https://swipehire.top',
    'http://swipehire.top',
    'https://www.swipehire.top',
    'http://www.swipehire.top'
];

/**
 * Get CORS headers based on the request origin
 * @param {Request} request - The incoming request
 * @returns {Object} CORS headers object
 */
function getCorsHeaders(request) {
  const origin = request.headers.get('origin') || '';
  
  // Check if the origin is allowed
  const isAllowedOrigin = allowedOrigins.some(allowed => 
    origin === allowed || (allowed.includes('localhost') && origin.includes('localhost'))
  );
  
  // Use the request origin if it's allowed, otherwise use primary domain
  const corsOrigin = isAllowedOrigin ? origin : 'https://www.swipehire.top';
  
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400' // 24 hours
  };
}

/**
 * Handle CORS preflight requests
 * @param {Request} request - The incoming request
 * @returns {Response|null} Response for preflight or null if not preflight
 */
function handleCorsPreflight(request) {
  if (request.method === 'OPTIONS') {
    const corsHeaders = getCorsHeaders(request);
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  return null;
}

/**
 * Add CORS headers to an existing response
 * @param {Response} response - The response to modify
 * @param {Request} request - The original request
 * @returns {Response} Response with CORS headers added
 */
function addCorsHeaders(response, request) {
  const corsHeaders = getCorsHeaders(request);
  
  // Add CORS headers to the response
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

// CommonJS exports for Workers
module.exports = {
  getCorsHeaders,
  handleCorsPreflight,
  addCorsHeaders
};