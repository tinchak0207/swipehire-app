import { initializeDatabase, getDatabase, CacheManager } from './config/database-optimized.mjs';
import { getCorsHeaders, handleCorsPreflight, addCorsHeaders } from './lib/cors.mjs';
import { ObjectId } from 'mongodb';

// Global error handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Performance monitoring
const perfMetrics = {
  totalRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  avgResponseTime: 0,
  errors: 0
};

// Request rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // requests per minute

/**
 * Rate limiting middleware
 */
function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(ip) || [];
  
  // Clean old requests
  const validRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (validRequests.length >= RATE_LIMIT_MAX) {
    return false;
  }
  
  validRequests.push(now);
  rateLimitMap.set(ip, validRequests);
  return true;
}

/**
 * Performance-optimized job controller
 */
const jobController = {
  async getPublicJobs(req, env) {
    const url = new URL(req.url);
    const cacheKey = `public_jobs_${url.searchParams.toString()}`;
    
    // Check cache first
    const cached = CacheManager.get(cacheKey);
    if (cached) {
      perfMetrics.cacheHits++;
      return new Response(JSON.stringify(cached), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const db = getDatabase();
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 20, 50);
    const skip = (page - 1) * limit;
    
    // Build optimized query
    const query = { isPublic: true };
    const location = url.searchParams.get('location');
    const jobType = url.searchParams.get('jobType');
    const search = url.searchParams.get('search');
    
    if (location) query.location = { $regex: location, $options: 'i' };
    if (jobType) query.jobType = jobType;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }
    
    const pipeline = [
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          requirements: 1,
          salary: 1,
          location: 1,
          jobType: 1,
          workStyle: 1,
          companyName: 1,
          companyIndustry: 1,
          companyLogo: 1,
          companySize: 1,
          createdAt: 1,
          updatedAt: 1,
          applicationCount: { $size: { $ifNull: ['$applications', []] } }
        }
      }
    ];
    
    const [jobs, totalCount] = await Promise.all([
      db.collection('jobs').aggregate(pipeline).toArray(),
      db.collection('jobs').countDocuments(query)
    ]);
    
    const result = {
      jobs,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    };
    
    // Cache for 30 seconds
    CacheManager.set(cacheKey, result, 30000);
    perfMetrics.cacheMisses++;
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  },
  
  async getUserJobs(req, env) {
    const url = new URL(req.url);
    const userId = url.pathname.split('/')[4];
    
    if (!ObjectId.isValid(userId)) {
      return new Response(JSON.stringify({ error: 'Invalid user ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const cacheKey = `user_jobs_${userId}_${url.searchParams.toString()}`;
    const cached = CacheManager.get(cacheKey);
    if (cached) {
      perfMetrics.cacheHits++;
      return new Response(JSON.stringify(cached), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const db = getDatabase();
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 20, 50);
    const skip = (page - 1) * limit;
    
    const query = { userId: userId };
    const pipeline = [
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          location: 1,
          salary: 1,
          jobType: 1,
          companyName: 1,
          isPublic: 1,
          createdAt: 1,
          updatedAt: 1,
          applicationCount: { $size: { $ifNull: ['$applications', []] } }
        }
      }
    ];
    
    const [jobs, totalCount] = await Promise.all([
      db.collection('jobs').aggregate(pipeline).toArray(),
      db.collection('jobs').countDocuments(query)
    ]);
    
    const result = {
      jobs,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    };
    
    CacheManager.set(cacheKey, result, 60000); // Cache for 1 minute
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * Performance-optimized user controller
 */
const userController = {
  async getUser(req, env) {
    const url = new URL(req.url);
    const identifier = url.pathname.split('/')[3];
    
    const cacheKey = `user_${identifier}`;
    const cached = CacheManager.get(cacheKey);
    if (cached) {
      perfMetrics.cacheHits++;
      return new Response(JSON.stringify(cached), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const db = getDatabase();
    
    // Build compound query for efficient lookup
    let searchQuery = {};
    const searchConditions = [];
    
    if (ObjectId.isValid(identifier)) {
      searchConditions.push({ _id: new ObjectId(identifier) });
    }
    
    if (identifier.includes('@')) {
      searchConditions.push({ email: identifier });
    } else if (identifier.length > 20) {
      searchConditions.push({ firebaseUid: identifier });
    }
    
    searchQuery = searchConditions.length > 0 ? { $or: searchConditions } : { firebaseUid: identifier };
    
    const user = await db.collection('users').findOne(searchQuery, {
      projection: {
        password: 0,
        __v: 0
      },
      maxTimeMS: 2000
    });
    
    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    CacheManager.set(cacheKey, { user }, 300000); // Cache for 5 minutes
    return new Response(JSON.stringify({ user }), {
      headers: { 'Content-Type': 'application/json' }
    });
  },
  
  async getJobseekerProfiles(req, env) {
    const url = new URL(req.url);
    const cacheKey = `jobseekers_${url.searchParams.toString()}`;
    const cached = CacheManager.get(cacheKey);
    if (cached) {
      perfMetrics.cacheHits++;
      return new Response(JSON.stringify(cached), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const db = getDatabase();
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 20, 50);
    const skip = (page - 1) * limit;
    
    const pipeline = [
      {
        $match: {
          selectedRole: 'jobseeker',
          profileVisibility: { $ne: 'private' }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          profileAvatarUrl: 1,
          profileHeadline: 1,
          profileExperienceSummary: 1,
          profileSkills: 1,
          country: 1,
          address: 1,
          profileDesiredWorkStyle: 1,
          profilePastProjects: 1,
          profileWorkExperienceLevel: 1,
          profileEducationLevel: 1,
          profileLocationPreference: 1,
          profileLanguages: 1,
          profileAvailability: 1,
          profileJobTypePreference: 1,
          profileSalaryExpectationMin: 1,
          profileSalaryExpectationMax: 1,
          profileVisibility: 1,
          createdAt: 1,
          updatedAt: 1
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ];
    
    const [jobseekers, totalCount] = await Promise.all([
      db.collection('users').aggregate(pipeline).toArray(),
      db.collection('users').countDocuments({ selectedRole: 'jobseeker', profileVisibility: { $ne: 'private' } })
    ]);
    
    const result = {
      jobseekers,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    };
    
    CacheManager.set(cacheKey, result, 60000); // Cache for 1 minute
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * Health check endpoint
 */
const healthCheck = {
  async status() {
    const start = Date.now();
    
    try {
      const db = getDatabase();
      await db.admin().ping();
      
      const response = {
        status: 'healthy',
        responseTime: Date.now() - start,
        cache: {
          hits: perfMetrics.cacheHits,
          misses: perfMetrics.cacheMisses,
          size: CacheManager.size()
        },
        timestamp: new Date().toISOString()
      };
      
      return new Response(JSON.stringify(response), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ status: 'unhealthy', error: error.message }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};

/**
 * Main request handler with performance optimizations
 */
export default {
  async fetch(request, env) {
    const start = Date.now();
    perfMetrics.totalRequests++;
    
    // Handle CORS preflight
    const preflightResponse = handleCorsPreflight(request);
    if (preflightResponse) {
      return preflightResponse;
    }
    
    const corsHeaders = getCorsHeaders(request);
    const url = new URL(request.url);
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    
    // Rate limiting
    if (!checkRateLimit(clientIP)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    try {
      // Initialize database with retry
      try {
        await initializeDatabase(2);
      } catch (dbError) {
        console.error('Database initialization failed:', dbError);
        return new Response(JSON.stringify({ error: 'Database service unavailable', message: dbError.message }), {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Route requests to optimized handlers
      let response;
      
      // Health check
      if (url.pathname === '/health') {
        response = await healthCheck.status();
      }
      // Public jobs (cached)
      else if (url.pathname === '/api/jobs/public') {
        response = await jobController.getPublicJobs(request, env);
      }
      // User jobs
      else if (url.pathname.match(/^\/api\/users\/[^\/]+\/jobs$/)) {
        response = await jobController.getUserJobs(request, env);
      }
      // User profile
      else if (url.pathname.match(/^\/api\/users\/[^\/]+$/)) {
        response = await userController.getUser(request, env);
      }
      // Jobseeker profiles
      else if (url.pathname === '/api/users/profiles/jobseekers') {
        response = await userController.getJobseekerProfiles(request, env);
      }
      // Default to optimized handlers
      else {
        // Import optimized route handlers
        const handleApiRequest = await import('./routes/api-workers-optimized.mjs').then(m => m.default);
        response = await handleApiRequest(request, env);
      }
      
      // Add performance headers
      response = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers),
          'X-Response-Time': `${Date.now() - start}ms`,
          'X-Cache-Hits': String(perfMetrics.cacheHits),
          'X-Cache-Misses': String(perfMetrics.cacheMisses)
        }
      });
      
      return addCorsHeaders(response, request);
      
    } catch (error) {
      perfMetrics.errors++;
      console.error('Request error:', error);
      
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};