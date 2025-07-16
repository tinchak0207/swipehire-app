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
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    static createErrorResponse(message, status = 500) {
        return WorkersUtils.createJsonResponse({ error: message }, status);
    }
}

// Optimized admin route handlers
async function handleAdminUsers(request) {
    console.log("[Admin] GET /api/admin/users - Authentication and RBAC should be implemented here.");
    
    try {
        // TODO: Implement authentication and authorization check
        // TODO: Implement user listing with pagination and filtering
        
        console.log("[Admin] Admin RBAC and full user listing would be implemented here.");
        return WorkersUtils.createJsonResponse({
            message: 'Admin user listing not implemented. Conceptual endpoint.',
            status: 'not_implemented',
            endpoint: '/api/admin/users',
            method: 'GET'
        }, 501);
        
    } catch (error) {
        console.error("[Admin] Error fetching users:", error);
        return WorkersUtils.createErrorResponse('Server error fetching users (conceptual)', 500);
    }
}

async function handlePendingDiaryPosts(request) {
    console.log("[Admin] GET /api/admin/diary-posts/pending - Admin RBAC for content moderation.");
    
    try {
        // TODO: Implement authentication and authorization check
        // TODO: Implement diary post moderation with status filtering
        
        // Placeholder implementation
        const pendingPosts = []; // Would fetch from database
        
        console.log(`[Admin] Fetched ${pendingPosts.length} diary posts pending review.`);
        return WorkersUtils.createJsonResponse({
            posts: pendingPosts,
            count: pendingPosts.length,
            status: 'pending_review'
        });
        
    } catch (error) {
        console.error("[Admin] Error fetching pending diary posts:", error);
        return WorkersUtils.createErrorResponse('Server error fetching pending diary posts', 500);
    }
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
        
        // TODO: Implement authentication and authorization check
        // TODO: Implement diary post status update in database
        
        // Placeholder implementation
        const post = null; // Would update in database
        
        if (!post) {
            return WorkersUtils.createErrorResponse('Diary post not found', 404);
        }
        
        console.log(`[Admin] Updated status of diary post ${postId} to ${status}.`);
        return WorkersUtils.createJsonResponse({
            success: true,
            postId,
            status,
            updatedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error("[Admin] Error updating diary post status:", error);
        return WorkersUtils.createErrorResponse('Server error updating diary post status', 500);
    }
}

// Route definitions with native Workers handling
const adminRoutes = [
    { method: 'GET', pattern: '/api/admin/users', handler: handleAdminUsers },
    { method: 'GET', pattern: '/api/admin/diary-posts/pending', handler: handlePendingDiaryPosts },
    { method: 'PUT', pattern: '/api/admin/diary-posts/:postId/status', handler: handleUpdateDiaryPostStatus }
];

// Main optimized handler function for admin requests
async function handleAdminRequest(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;
    
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

module.exports = handleAdminRequest;