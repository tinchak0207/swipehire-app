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
    let file = null;
    
    if (request.method === 'POST' || request.method === 'PUT') {
        const contentType = request.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
            try {
                body = await request.json();
            } catch (e) {
                body = {};
            }
        } else if (contentType.includes('multipart/form-data')) {
            // Handle multipart form data (file uploads)
            const formData = await request.formData();
            body = {};
            
            for (const [key, value] of formData) {
                if (value instanceof File) {
                    // Handle file upload
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
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
            // Handle URL-encoded form data
            const text = await request.text();
            const urlParams = new URLSearchParams(text);
            for (const [key, value] of urlParams) {
                body[key] = value;
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
        file,
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
        setHeader(name, value) {
            responseHeaders[name] = value;
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

// Route definitions with their patterns and handlers
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

// Main handler function for Cloudflare Workers
async function handleApiRequest(request, env) {
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
        return new Response(JSON.stringify({ error: 'Route not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    try {
        // Create Express-like req/res objects
        const { req, res } = await createExpressLikeObjects(request, params);
        
        // Call the controller function
        await matchedRoute.handler(req, res);
        
        // Return the response
        return res.getResponse();
    } catch (error) {
        console.error('API Handler Error:', error);
        return new Response(JSON.stringify({ 
            error: error.message,
            stack: error.stack 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

module.exports = handleApiRequest;