// Import controllers
const userController = require('../controllers/users/userController');
const jobController = require('../controllers/jobs/jobController');
const matchController = require('../controllers/matches/matchController');
const chatController = require('../controllers/chat/chatController');
const diaryController = require('../controllers/diary/diaryController');
const reviewController = require('../controllers/reviews/reviewController');
const interactionController = require('../controllers/matches/interactionController');
const notificationController = require('../controllers/notifications/notificationController');
const eventController = require('../controllers/events/eventController');
const industryEventsController = require('../controllers/events/industryEventsController');
const followupReminderController = require('../controllers/followup/followupReminderController');

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

// Optimized route definitions with native Workers handling
const routes = [
    // User routes
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

    // Job routes
    { method: 'POST', pattern: '/api/users/:userId/jobs', handler: jobController.createJob },
    { method: 'GET', pattern: '/api/users/:userId/jobs', handler: jobController.getUserJobs },
    { method: 'POST', pattern: '/api/users/:userId/jobs/:jobId/update', handler: jobController.updateJob },
    { method: 'DELETE', pattern: '/api/users/:userId/jobs/:jobId', handler: jobController.deleteJob },
    { method: 'GET', pattern: '/api/jobs', handler: jobController.getPublicJobs },

    // Match routes
    { method: 'GET', pattern: '/api/matches/:userId', handler: matchController.getUserMatches },
    { method: 'POST', pattern: '/api/matches/:matchId/archive', handler: matchController.archiveMatch },

    // Chat routes
    { method: 'POST', pattern: '/api/matches/:matchId/messages', handler: chatController.createMessage },
    { method: 'GET', pattern: '/api/matches/:matchId/messages', handler: chatController.getMessages },

    // Diary routes
    { method: 'POST', pattern: '/api/diary-posts/upload-image', handler: diaryController.uploadImage },
    { method: 'POST', pattern: '/api/diary-posts', handler: diaryController.createPost },
    { method: 'GET', pattern: '/api/diary-posts', handler: diaryController.getPosts },
    { method: 'POST', pattern: '/api/diary-posts/:postId/like', handler: diaryController.likePost },

    // Review routes
    { method: 'POST', pattern: '/api/reviews/company', handler: reviewController.createCompanyReview },
    { method: 'GET', pattern: '/api/reviews/company/:companyUserId', handler: reviewController.getCompanyReviews },
    { method: 'GET', pattern: '/api/reviews/company/:companyUserId/summary', handler: reviewController.getCompanyReviewSummary },

    // Interaction routes
    { method: 'POST', pattern: '/api/interactions/like', handler: interactionController.likeProfile },
    { method: 'POST', pattern: '/api/users/:userId/pass-candidate/:candidateId', handler: interactionController.passCandidate },
    { method: 'POST', pattern: '/api/users/:userId/pass-company/:companyId', handler: interactionController.passCompany },
    { method: 'POST', pattern: '/api/users/:userId/retrieve-candidate/:candidateId', handler: interactionController.retrieveCandidate },
    { method: 'POST', pattern: '/api/users/:userId/retrieve-company/:companyId', handler: interactionController.retrieveCompany },

    // Notification routes
    { method: 'GET', pattern: '/api/users/:userId/notifications', handler: notificationController.getNotifications },
    { method: 'PUT', pattern: '/api/notifications/:notificationId/read', handler: notificationController.markAsRead },
    { method: 'DELETE', pattern: '/api/notifications/:notificationId', handler: notificationController.deleteNotification },
    { method: 'DELETE', pattern: '/api/users/:userId/notifications', handler: notificationController.clearAllNotifications },

    // Event routes
    { method: 'GET', pattern: '/api/events', handler: eventController.getEvents },
    { method: 'GET', pattern: '/api/events/recommended', handler: eventController.getRecommendedEvents },
    { method: 'GET', pattern: '/api/events/:id', handler: eventController.getEvent },
    { method: 'POST', pattern: '/api/events/:id/save', handler: eventController.toggleSaveEvent },
    { method: 'POST', pattern: '/api/events/:id/register', handler: eventController.registerForEvent },
    { method: 'GET', pattern: '/api/events/:id/feedback', handler: eventController.getEventFeedback },
    { method: 'POST', pattern: '/api/events/:id/feedback', handler: eventController.submitEventFeedback },
    { method: 'GET', pattern: '/api/users/:userId/saved-events', handler: eventController.getUserSavedEvents },

    // Industry Events routes
    { method: 'GET', pattern: '/api/industry-events/recommended', handler: industryEventsController.getRecommendedEvents },
    { method: 'GET', pattern: '/api/industry-events/saved', handler: industryEventsController.getSavedEvents },
    { method: 'GET', pattern: '/api/industry-events/registered', handler: industryEventsController.getRegisteredEvents },
    { method: 'GET', pattern: '/api/industry-events/statistics', handler: industryEventsController.getEventStatistics },
    { method: 'GET', pattern: '/api/industry-events/upcoming', handler: industryEventsController.getUpcomingEvents },
    { method: 'GET', pattern: '/api/industry-events/:eventId', handler: industryEventsController.getEventById },
    { method: 'POST', pattern: '/api/industry-events/:eventId/save', handler: industryEventsController.saveEvent },
    { method: 'DELETE', pattern: '/api/industry-events/:eventId/unsave', handler: industryEventsController.unsaveEvent },
    { method: 'POST', pattern: '/api/industry-events/:eventId/register', handler: industryEventsController.registerForEvent },
    { method: 'POST', pattern: '/api/industry-events/:eventId/feedback', handler: industryEventsController.submitEventFeedback },
    { method: 'POST', pattern: '/api/industry-events/:eventId/attendance', handler: industryEventsController.confirmAttendance },

    // Follow-up Reminders routes
    { method: 'GET', pattern: '/api/users/:userId/followup-reminders', handler: followupReminderController.getUserReminders },
    { method: 'POST', pattern: '/api/users/:userId/followup-reminders', handler: followupReminderController.createReminder },
    { method: 'GET', pattern: '/api/followup-reminders/templates', handler: followupReminderController.getReminderTemplates },
    { method: 'GET', pattern: '/api/followup-reminders/due', handler: followupReminderController.getDueReminders },
    { method: 'GET', pattern: '/api/users/:userId/matches/:matchId/followup-reminders', handler: followupReminderController.getMatchReminders },
    { method: 'PUT', pattern: '/api/followup-reminders/:reminderId/status', handler: followupReminderController.updateReminderStatus },
    { method: 'PUT', pattern: '/api/followup-reminders/:reminderId/snooze', handler: followupReminderController.snoozeReminder },
    { method: 'DELETE', pattern: '/api/followup-reminders/:reminderId', handler: followupReminderController.deleteReminder }
];

// Main optimized handler function for Cloudflare Workers
async function handleApiRequest(request, env) {
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

module.exports = handleApiRequest;