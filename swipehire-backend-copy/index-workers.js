/**
 * Cloudflare Workers Optimized Entry Point
 * Uses MongoDB Data API + KV caching to stay within free tier limits
 */

import service from './services/cloudflare-optimized-service.js';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400'
};

// Rate limiting (simple per-IP)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute

function checkRateLimit(ip) {
  const now = Date.now();
  const userLimit = rateLimit.get(ip);
  
  if (!userLimit) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (now > userLimit.resetTime) {
    userLimit.count = 1;
    userLimit.resetTime = now + RATE_LIMIT_WINDOW;
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

// Clean up old rate limit entries
function cleanupRateLimit() {
  const now = Date.now();
  for (const [ip, userLimit] of rateLimit.entries()) {
    if (now > userLimit.resetTime) {
      rateLimit.delete(ip);
    }
  }
}

export default {
  async fetch(request, env, ctx) {
    // Initialize services with env
    if (env.CACHE) {
      const kvCache = await import('./lib/workers-kv-cache.js');
      kvCache.default.init(env.CACHE);
    }

    // Set environment variables
    process.env.MONGO_DATA_API_URL = env.MONGO_DATA_API_URL;
    process.env.MONGO_DATA_API_KEY = env.MONGO_DATA_API_KEY;
    process.env.MONGO_DATA_SOURCE = env.MONGO_DATA_SOURCE || 'Cluster0';
    process.env.MONGO_DATABASE = env.MONGO_DATABASE || 'swipehire';

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Rate limiting
    const clientIP = request.headers.get('CF-Connecting-IP') || 
                    request.headers.get('X-Forwarded-For') || 
                    'unknown';

    if (!checkRateLimit(clientIP)) {
      return new Response('Rate limit exceeded', { 
        status: 429,
        headers: corsHeaders 
      });
    }

    try {
      const url = new URL(request.url);
      const path = url.pathname;
      const method = request.method;

      // Route handling
      let response;

      switch (path) {
        case '/api/health':
          response = await handleHealth(request);
          break;
        case '/api/users':
          response = await handleUsers(request);
          break;
        case '/api/jobs':
          response = await handleJobs(request);
          break;
        case '/api/events':
          response = await handleEvents(request);
          break;
        case '/api/matches':
          response = await handleMatches(request);
          break;
        case '/api/search':
          response = await handleSearch(request);
          break;
        case '/api/dashboard':
          response = await handleDashboard(request);
          break;
        case '/api/stats':
          response = await handleStats(request);
          break;
        default:
          response = new Response('Not Found', { status: 404 });
      }

      // Add CORS headers
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

// Request handlers
async function handleHealth(request) {
  const health = await service.getPerformanceMetrics();
  return new Response(JSON.stringify(health), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleUsers(request) {
  const url = new URL(request.url);
  
  if (request.method === 'GET') {
    const userId = url.searchParams.get('id');
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const user = await service.getUser(userId);
    return new Response(JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (request.method === 'PUT') {
    const { userId, ...updateData } = await request.json();
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const result = await service.updateUser(userId, updateData);
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response('Method not allowed', { status: 405 });
}

async function handleJobs(request) {
  const url = new URL(request.url);
  
  if (request.method === 'GET') {
    const filters = Object.fromEntries(url.searchParams.entries());
    const jobs = await service.getJobs(filters);
    return new Response(JSON.stringify(jobs), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (request.method === 'POST') {
    const jobData = await request.json();
    const result = await service.createJob(jobData);
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response('Method not allowed', { status: 405 });
}

async function handleEvents(request) {
  const url = new URL(request.url);
  
  if (request.method === 'GET') {
    const filters = Object.fromEntries(url.searchParams.entries());
    const events = await service.getUpcomingEvents(filters);
    return new Response(JSON.stringify(events), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response('Method not allowed', { status: 405 });
}

async function handleMatches(request) {
  const url = new URL(request.url);
  
  if (request.method === 'GET') {
    const userId = url.searchParams.get('userId');
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const matches = await service.getUserMatches(userId);
    return new Response(JSON.stringify(matches), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response('Method not allowed', { status: 405 });
}

async function handleSearch(request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const query = url.searchParams.get('q');
  const filters = Object.fromEntries(url.searchParams.entries());
  delete filters.type;
  delete filters.q;
  
  if (!type || !query) {
    return new Response(JSON.stringify({ error: 'Type and query required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const results = await service.search(type, query, filters);
  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleDashboard(request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  
  if (!userId) {
    return new Response(JSON.stringify({ error: 'User ID required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const dashboard = await service.getUserDashboard(userId);
  return new Response(JSON.stringify(dashboard), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleStats(request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type') || 'users';
  
  const stats = await service.getStats(type);
  return new Response(JSON.stringify(stats), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// Cleanup rate limit every 5 minutes
setInterval(cleanupRateLimit, 300000);