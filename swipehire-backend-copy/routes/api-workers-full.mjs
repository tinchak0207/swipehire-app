// Import all controllers (ES modules)
import userController from '../controllers/users/userController-workers.mjs';
// Note: Other controllers will need to be converted to ES modules as well
// For now, I'll create a hybrid approach where we gradually convert them

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
                return { body: await request.json(), file: null };
            } catch (e) {
                return { body: {}, file: null };
            }
        } else if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            const body = {};
            let file = null;
            
            for (const [key, value] of formData) {
                if (value instanceof File) {
                    const arrayBuffer = await value.arrayBuffer();
                    file = {
                        fieldname: key,
                        originalname: value.name,
                        mimetype: value.type,
                        size: value.size,
                        buffer: Buffer.from(arrayBuffer)
                    };
                } else {
                    body[key] = value;
                }
            }
            
            return { body, file };
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
            const text = await request.text();
            const urlParams = new URLSearchParams(text);
            const body = {};
            for (const [key, value] of urlParams) {
                body[key] = value;
            }
            return { body, file: null };
        }
        
        return { body: {}, file: null };
    }
    
    static parseQuery(url) {
        const query = {};
        for (const [key, value] of url.searchParams) {
            query[key] = value;
        }
        return query;
    }
    
    static createJsonResponse(data, status = 200) {
        return new Response(JSON.stringify(data), {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    static createErrorResponse(message, status = 500, error = null) {
        const errorData = { error: message };
        if (error && error.stack) {
            errorData.stack = error.stack;
        }
        return WorkersUtils.createJsonResponse(errorData, status);
    }
}

// Native Workers controller wrapper
class WorkersController {
    static async wrapController(controllerFn, request, params) {
        try {
            const url = new URL(request.url);
            const query = WorkersUtils.parseQuery(url);
            const { body, file } = await WorkersUtils.parseRequestBody(request);
            
            // Create Express-like req object for existing controllers
            const req = {
                method: request.method,
                url: url.pathname + url.search,
                params,
                query,
                body,
                file,
                headers: Object.fromEntries(request.headers.entries())
            };
            
            // Create Promise-based res object
            let responseData = null;
            let statusCode = 200;
            
            const res = {
                status(code) {
                    statusCode = code;
                    return this;
                },
                json(data) {
                    responseData = data;
                    return Promise.resolve();
                },
                send(data) {
                    responseData = data;
                    return Promise.resolve();
                }
            };
            
            // Call the controller
            await controllerFn(req, res);
            
            // Return native Workers Response
            return WorkersUtils.createJsonResponse(responseData, statusCode);
            
        } catch (error) {
            console.error('Controller Error:', error);
            return WorkersUtils.createErrorResponse(error.message, 500, error);
        }
    }
}

// Temporary placeholder for controllers that haven't been converted yet
const createPlaceholderController = (routeName) => {
    return async (req, res) => {
        return res.status(501).json({
            message: `${routeName} endpoint - Controller needs to be converted to ES modules`,
            status: 'not_implemented_yet',
            note: 'This endpoint will be available after controller conversion'
        });
    };
};

// Route definitions with full Workers handling
const routes = [
    // User routes (fully functional)
    { method: 'POST', pattern: '/api/users', handler: userController.createUser },
    { method: 'GET', pattern: '/api/users/:identifier', handler: userController.getUser },
    { method: 'GET', pattern: '/api/users/profiles/jobseekers', handler: userController.getJobseekerProfiles },
    { method: 'POST', pattern: '/api/users/:identifier/avatar', handler: userController.uploadAvatar },
    { method: 'POST', pattern: '/api/users/:identifier/video-resume', handler: userController.uploadVideoResume },
    { method: 'POST', pattern: '/api/users/:identifier/profile', handler: userController.updateProfile },
    { method: 'POST', pattern: '/api/users/:userId/profile/visibility', handler: userController.updateProfileVisibility },
    { method: 'POST', pattern: '/api/users/:identifier/update', handler: userController.updateUser },
    { method: 'DELETE', pattern: '/api/users/:userId/account', handler: userController.deleteAccount },
    { method: 'POST', pattern: '/api/users/:userId/request-data-export', handler: userController.requestDataExport },

    // Job routes (placeholder - need conversion)
    { method: 'POST', pattern: '/api/users/:userId/jobs', handler: createPlaceholderController('Create Job') },
    { method: 'GET', pattern: '/api/users/:userId/jobs', handler: createPlaceholderController('Get User Jobs') },
    { method: 'POST', pattern: '/api/users/:userId/jobs/:jobId/update', handler: createPlaceholderController('Update Job') },
    { method: 'DELETE', pattern: '/api/users/:userId/jobs/:jobId', handler: createPlaceholderController('Delete Job') },
    { method: 'GET', pattern: '/api/jobs', handler: createPlaceholderController('Get Public Jobs') },

    // Match routes (placeholder - need conversion)
    { method: 'GET', pattern: '/api/matches/:userId', handler: createPlaceholderController('Get User Matches') },
    { method: 'POST', pattern: '/api/matches/:matchId/archive', handler: createPlaceholderController('Archive Match') },

    // Chat routes (placeholder - need conversion)
    { method: 'POST', pattern: '/api/matches/:matchId/messages', handler: createPlaceholderController('Create Message') },
    { method: 'GET', pattern: '/api/matches/:matchId/messages', handler: createPlaceholderController('Get Messages') },

    // Diary routes (placeholder - need conversion)
    { method: 'POST', pattern: '/api/diary-posts/upload-image', handler: createPlaceholderController('Upload Diary Image') },
    { method: 'POST', pattern: '/api/diary-posts', handler: createPlaceholderController('Create Diary Post') },
    { method: 'GET', pattern: '/api/diary-posts', handler: createPlaceholderController('Get Diary Posts') },
    { method: 'POST', pattern: '/api/diary-posts/:postId/like', handler: createPlaceholderController('Like Diary Post') },

    // Review routes (placeholder - need conversion)
    { method: 'POST', pattern: '/api/reviews/company', handler: createPlaceholderController('Create Company Review') },
    { method: 'GET', pattern: '/api/reviews/company/:companyUserId', handler: createPlaceholderController('Get Company Reviews') },
    { method: 'GET', pattern: '/api/reviews/company/:companyUserId/summary', handler: createPlaceholderController('Get Company Review Summary') },

    // Interaction routes (placeholder - need conversion)
    { method: 'POST', pattern: '/api/interactions/like', handler: createPlaceholderController('Like Profile') },
    { method: 'POST', pattern: '/api/users/:userId/pass-candidate/:candidateId', handler: createPlaceholderController('Pass Candidate') },
    { method: 'POST', pattern: '/api/users/:userId/pass-company/:companyId', handler: createPlaceholderController('Pass Company') },
    { method: 'POST', pattern: '/api/users/:userId/retrieve-candidate/:candidateId', handler: createPlaceholderController('Retrieve Candidate') },
    { method: 'POST', pattern: '/api/users/:userId/retrieve-company/:companyId', handler: createPlaceholderController('Retrieve Company') },

    // Notification routes (placeholder - need conversion)
    { method: 'GET', pattern: '/api/users/:userId/notifications', handler: createPlaceholderController('Get Notifications') },
    { method: 'PUT', pattern: '/api/notifications/:notificationId/read', handler: createPlaceholderController('Mark Notification as Read') },
    { method: 'DELETE', pattern: '/api/notifications/:notificationId', handler: createPlaceholderController('Delete Notification') },
    { method: 'DELETE', pattern: '/api/users/:userId/notifications', handler: createPlaceholderController('Clear All Notifications') },

    // Event routes (placeholder - need conversion)
    { method: 'GET', pattern: '/api/events', handler: createPlaceholderController('Get Events') },
    { method: 'GET', pattern: '/api/events/recommended', handler: createPlaceholderController('Get Recommended Events') },
    { method: 'GET', pattern: '/api/events/:id', handler: createPlaceholderController('Get Event') },
    { method: 'POST', pattern: '/api/events/:id/save', handler: createPlaceholderController('Toggle Save Event') },
    { method: 'POST', pattern: '/api/events/:id/register', handler: createPlaceholderController('Register for Event') },
    { method: 'GET', pattern: '/api/events/:id/feedback', handler: createPlaceholderController('Get Event Feedback') },
    { method: 'POST', pattern: '/api/events/:id/feedback', handler: createPlaceholderController('Submit Event Feedback') },
    { method: 'GET', pattern: '/api/users/:userId/saved-events', handler: createPlaceholderController('Get User Saved Events') },

    // Industry Events routes (placeholder - need conversion)
    { method: 'GET', pattern: '/api/industry-events/recommended', handler: createPlaceholderController('Get Recommended Industry Events') },
    { method: 'GET', pattern: '/api/industry-events/saved', handler: createPlaceholderController('Get Saved Industry Events') },
    { method: 'GET', pattern: '/api/industry-events/registered', handler: createPlaceholderController('Get Registered Industry Events') },
    { method: 'GET', pattern: '/api/industry-events/statistics', handler: createPlaceholderController('Get Industry Event Statistics') },
    { method: 'GET', pattern: '/api/industry-events/upcoming', handler: createPlaceholderController('Get Upcoming Industry Events') },
    { method: 'GET', pattern: '/api/industry-events/:eventId', handler: createPlaceholderController('Get Industry Event by ID') },
    { method: 'POST', pattern: '/api/industry-events/:eventId/save', handler: createPlaceholderController('Save Industry Event') },
    { method: 'DELETE', pattern: '/api/industry-events/:eventId/unsave', handler: createPlaceholderController('Unsave Industry Event') },
    { method: 'POST', pattern: '/api/industry-events/:eventId/register', handler: createPlaceholderController('Register for Industry Event') },
    { method: 'POST', pattern: '/api/industry-events/:eventId/feedback', handler: createPlaceholderController('Submit Industry Event Feedback') },
    { method: 'POST', pattern: '/api/industry-events/:eventId/attendance', handler: createPlaceholderController('Confirm Industry Event Attendance') },

    // Follow-up Reminders routes (placeholder - need conversion)
    { method: 'GET', pattern: '/api/users/:userId/followup-reminders', handler: createPlaceholderController('Get User Reminders') },
    { method: 'POST', pattern: '/api/users/:userId/followup-reminders', handler: createPlaceholderController('Create Reminder') },
    { method: 'GET', pattern: '/api/followup-reminders/templates', handler: createPlaceholderController('Get Reminder Templates') },
    { method: 'GET', pattern: '/api/followup-reminders/due', handler: createPlaceholderController('Get Due Reminders') },
    { method: 'GET', pattern: '/api/users/:userId/matches/:matchId/followup-reminders', handler: createPlaceholderController('Get Match Reminders') },
    { method: 'PUT', pattern: '/api/followup-reminders/:reminderId/status', handler: createPlaceholderController('Update Reminder Status') },
    { method: 'PUT', pattern: '/api/followup-reminders/:reminderId/snooze', handler: createPlaceholderController('Snooze Reminder') },
    { method: 'DELETE', pattern: '/api/followup-reminders/:reminderId', handler: createPlaceholderController('Delete Reminder') }
];

// Main handler function for Cloudflare Workers
export default async function handleApiRequest(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;
    
    // Find matching route
    for (const route of routes) {
        if (route.method === method) {
            const params = WorkersUtils.parseParams(pathname, route.pattern);
            if (params !== null) {
                return await WorkersController.wrapController(route.handler, request, params);
            }
        }
    }
    
    // Route not found
    return WorkersUtils.createErrorResponse('Route not found', 404);
}