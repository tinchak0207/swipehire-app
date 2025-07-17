// Simple Workers-compatible admin handler

// Native Workers utility functions
class WorkersUtils {
    static parseParams(pathname, pattern) {
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
    
    static async parseRequestBody(request) {
        const contentType = request.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
            try {
                return await request.json();
            } catch (e) {
                return {};
            }
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
            const text = await request.text();
            const urlParams = new URLSearchParams(text);
            const body = {};
            for (const [key, value] of urlParams) {
                body[key] = value;
            }
            return body;
        }
        
        return {};
    }
    
    static createJsonResponse(data, status = 200) {
        return new Response(JSON.stringify(data), {
            status,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'https://www.swipehire.top',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        });
    }
    
    static createErrorResponse(message, status = 500) {
        return WorkersUtils.createJsonResponse({ error: message }, status);
    }
}

// Simplified admin route handlers
async function handleAdminUsers(request) {
    console.log("[Admin] GET /api/admin/users - Authentication and RBAC should be implemented here.");
    
    return WorkersUtils.createJsonResponse({
        message: 'Admin user listing endpoint',
        status: 'not_implemented',
        note: 'Database connection needed for full functionality',
        endpoint: '/api/admin/users',
        method: 'GET'
    }, 501);
}

async function handlePendingDiaryPosts(request) {
    console.log("[Admin] GET /api/admin/diary-posts/pending - Admin RBAC for content moderation.");
    
    return WorkersUtils.createJsonResponse({
        message: 'Admin diary posts moderation endpoint',
        status: 'not_implemented',
        note: 'Database connection needed for full functionality',
        endpoint: '/api/admin/diary-posts/pending',
        method: 'GET'
    }, 501);
}

async function handleUpdateDiaryPostStatus(request, params) {
    console.log("[Admin] PUT /api/admin/diary-posts/:postId/status - Admin RBAC for content moderation.");
    
    try {
        const { postId } = params;
        const body = await WorkersUtils.parseRequestBody(request);
        const { status } = body;
        
        // Validate status
        if (!['approved', 'rejected'].includes(status)) {
            return WorkersUtils.createErrorResponse('Invalid status value. Must be "approved" or "rejected"', 400);
        }
        
        // Validate postId
        if (!postId || postId.length < 3) {
            return WorkersUtils.createErrorResponse('Invalid post ID', 400);
        }
        
        console.log(`[Admin] Would update status of diary post ${postId} to ${status}.`);
        return WorkersUtils.createJsonResponse({
            message: 'Admin diary post status update endpoint',
            status: 'not_implemented',
            note: 'Database connection needed for full functionality',
            postId,
            requestedStatus: status,
            endpoint: `/api/admin/diary-posts/${postId}/status`,
            method: 'PUT'
        }, 501);
        
    } catch (error) {
        console.error("[Admin] Error updating diary post status:", error);
        return WorkersUtils.createErrorResponse('Server error updating diary post status', 500);
    }
}

// Route definitions
const adminRoutes = [
    { method: 'GET', pattern: '/api/admin/users', handler: handleAdminUsers },
    { method: 'GET', pattern: '/api/admin/diary-posts/pending', handler: handlePendingDiaryPosts },
    { method: 'PUT', pattern: '/api/admin/diary-posts/:postId/status', handler: handleUpdateDiaryPostStatus }
];

// Main handler function for admin requests
export default async function handleAdminRequest(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;
    
    // Handle preflight OPTIONS requests
    if (method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': 'https://www.swipehire.top',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        });
    }
    
    // Find matching route
    for (const route of adminRoutes) {
        if (route.method === method) {
            const params = WorkersUtils.parseParams(pathname, route.pattern);
            if (params !== null) {
                try {
                    return await route.handler(request, params);
                } catch (error) {
                    console.error('Admin Handler Error:', error);
                    return WorkersUtils.createErrorResponse(error.message, 500);
                }
            }
        }
    }
    
    // Route not found
    return WorkersUtils.createErrorResponse('Admin route not found', 404);
}