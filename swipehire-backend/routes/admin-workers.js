// Helper function to parse URL parameters
function parseParams(pathname, pattern) {
    const patternParts = pattern.split('/');
    const pathParts = pathname.split('/');
    
    if (patternParts.length !== pathParts.length) {
        return null;
    }
    
    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
        if (patternParts[i].startsWith(':')) {
            const paramName = patternParts[i].substring(1);
            params[paramName] = pathParts[i];
        } else if (patternParts[i] !== pathParts[i]) {
            return null;
        }
    }
    
    return params;
}

// Helper function to create Express-like req/res objects from Workers Request/Response
async function createExpressLikeObjects(request, params = {}) {
    const url = new URL(request.url);
    const query = {};
    
    // Parse query parameters
    for (const [key, value] of url.searchParams) {
        query[key] = value;
    }
    
    // Parse body for POST/PUT requests
    let body = {};
    
    if (request.method === 'POST' || request.method === 'PUT') {
        const contentType = request.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
            try {
                body = await request.json();
            } catch (e) {
                body = {};
            }
        }
    }
    
    // Create Express-like req object
    const req = {
        method: request.method,
        url: url.pathname + url.search,
        params,
        query,
        body,
        headers: Object.fromEntries(request.headers.entries())
    };
    
    // Create Express-like res object
    let responseData = null;
    let statusCode = 200;
    const responseHeaders = {};
    
    const res = {
        status(code) {
            statusCode = code;
            return this;
        },
        json(data) {
            responseData = JSON.stringify(data);
            responseHeaders['Content-Type'] = 'application/json';
            return this;
        },
        send(data) {
            responseData = data;
            return this;
        },
        getResponse() {
            return new Response(responseData, {
                status: statusCode,
                headers: responseHeaders
            });
        }
    };
    
    return { req, res };
}

// Admin route handlers
async function handleAdminUsers(req, res) {
    console.log("[Conceptual Admin] /api/admin/users endpoint hit. Authentication and RBAC should be implemented here.");
    try {
        console.log("[Conceptual Admin] Admin RBAC and full user listing would be here.");
        res.status(501).json({ message: 'Admin user listing not implemented. Conceptual endpoint.' });
    } catch (error) {
        console.error("[Conceptual Admin] Error fetching users:", error);
        res.status(500).json({ message: 'Server error fetching users (conceptual)', error: error.message });
    }
}

async function handlePendingDiaryPosts(req, res) {
    console.log("[Conceptual Admin] /api/admin/diary-posts/pending endpoint hit. Admin RBAC for content moderation.");
    try {
        // DiaryPost model needs to be imported when actually implemented
        // const pendingPosts = await DiaryPost.find({ status: 'pending_review' }).sort({ createdAt: -1 });
        const pendingPosts = []; // Placeholder
        console.log(`[Conceptual Admin] Fetched ${pendingPosts.length} diary posts pending review.`);
        res.json(pendingPosts);
    } catch (error) {
        console.error("[Conceptual Admin] Error fetching pending diary posts:", error);
        res.status(500).json({ message: 'Server error fetching pending diary posts', error: error.message });
    }
}

async function handleUpdateDiaryPostStatus(req, res) {
    console.log("[Conceptual Admin] /api/admin/diary-posts/:postId/status endpoint hit. Admin RBAC for content moderation.");
    try {
        const { postId } = req.params;
        const { status } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value.' });
        }
        // DiaryPost model needs to be imported when actually implemented
        // const post = await DiaryPost.findByIdAndUpdate(postId, { status }, { new: true });
        const post = null; // Placeholder
        if (!post) return res.status(404).json({ message: 'Diary post not found.' });
        console.log(`[Conceptual Admin] Updated status of diary post ${postId} to ${status}.`);
        res.json(post);
    } catch (error) {
        console.error("[Conceptual Admin] Error updating diary post status:", error);
        res.status(500).json({ message: 'Server error updating diary post status', error: error.message });
    }
}

// Route definitions
const routes = [
    { method: 'GET', pattern: '/api/admin/users', handler: handleAdminUsers },
    { method: 'GET', pattern: '/api/admin/diary-posts/pending', handler: handlePendingDiaryPosts },
    { method: 'PUT', pattern: '/api/admin/diary-posts/:postId/status', handler: handleUpdateDiaryPostStatus }
];

// Main handler function for admin requests
async function handleAdminRequest(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;
    
    // Find matching route
    let matchedRoute = null;
    let params = null;
    
    for (const route of routes) {
        if (route.method === method) {
            params = parseParams(pathname, route.pattern);
            if (params !== null) {
                matchedRoute = route;
                break;
            }
        }
    }
    
    if (!matchedRoute) {
        return new Response(JSON.stringify({ error: 'Admin route not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    try {
        // Create Express-like req/res objects
        const { req, res } = await createExpressLikeObjects(request, params);
        
        // Call the handler function
        await matchedRoute.handler(req, res);
        
        // Return the response
        return res.getResponse();
    } catch (error) {
        console.error('Admin Handler Error:', error);
        return new Response(JSON.stringify({ 
            error: error.message,
            stack: error.stack 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

module.exports = handleAdminRequest;