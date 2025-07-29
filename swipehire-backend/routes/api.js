const express = require('express');
const router = express.Router();
const { uploadAvatarToMemory, uploadVideoResumeToMemory, uploadDiaryImageMulter, uploadJobMediaToMemory } = require('../config/middleware');

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
const portfolioController = require('../controllers/portfolio/portfolioController');

// User routes
router.post('/users', userController.createUser);
router.get('/users/:identifier', userController.getUser);
router.get('/users/profiles/jobseekers', userController.getJobseekerProfiles);
router.post('/users/:identifier/avatar', uploadAvatarToMemory.single('avatar'), userController.uploadAvatar);
router.post('/users/:identifier/video-resume', uploadVideoResumeToMemory.single('videoResume'), userController.uploadVideoResume);
router.post('/users/:identifier/profile', userController.updateProfile);
router.post('/users/:userId/profile/visibility', userController.updateProfileVisibility);
router.post('/users/:identifier/update', userController.updateUser);
router.delete('/users/:userId/account', userController.deleteAccount);
router.post('/users/:userId/request-data-export', userController.requestDataExport);

// Auth routes
router.post('/auth/refresh', userController.refreshAuthToken);

// Job routes
router.post('/users/:userId/jobs', uploadJobMediaToMemory.single('mediaFile'), jobController.createJob);
router.get('/users/:userId/jobs', jobController.getUserJobs);
router.post('/users/:userId/jobs/:jobId/update', jobController.updateJob);
router.delete('/users/:userId/jobs/:jobId', jobController.deleteJob);
router.get('/jobs', jobController.getPublicJobs);

// Match routes
router.get('/matches/:userId', matchController.getUserMatches);
router.post('/matches/:matchId/archive', matchController.archiveMatch);

// Chat routes
router.post('/matches/:matchId/messages', chatController.createMessage);
router.get('/matches/:matchId/messages', chatController.getMessages);

// Diary routes
router.post('/diary-posts/upload-image', uploadDiaryImageMulter.single('diaryImage'), diaryController.uploadImage);
router.post('/diary-posts', diaryController.createPost);
router.get('/diary-posts', diaryController.getPosts);
router.post('/diary-posts/:postId/like', diaryController.likePost);

// Review routes
router.post('/reviews/company', reviewController.createCompanyReview);
router.get('/reviews/company/:companyUserId', reviewController.getCompanyReviews);
router.get('/reviews/company/:companyUserId/summary', reviewController.getCompanyReviewSummary);

// Interaction routes
router.post('/interactions/like', interactionController.likeProfile);
router.post('/users/:userId/pass-candidate/:candidateId', interactionController.passCandidate);
router.post('/users/:userId/pass-company/:companyId', interactionController.passCompany);
router.post('/users/:userId/retrieve-candidate/:candidateId', interactionController.retrieveCandidate);
router.post('/users/:userId/retrieve-company/:companyId', interactionController.retrieveCompany);

// Notification routes
router.get('/users/:userId/notifications', notificationController.getNotifications);
router.put('/notifications/:notificationId/read', notificationController.markAsRead);
router.delete('/notifications/:notificationId', notificationController.deleteNotification);
router.delete('/users/:userId/notifications', notificationController.clearAllNotifications);

// Event routes
router.get('/events', eventController.getEvents);
router.get('/events/recommended', eventController.getRecommendedEvents);
router.get('/events/:id', eventController.getEvent);
router.post('/events/:id/save', eventController.toggleSaveEvent);
router.post('/events/:id/register', eventController.registerForEvent);
router.get('/events/:id/feedback', eventController.getEventFeedback);
router.post('/events/:id/feedback', eventController.submitEventFeedback);
router.get('/users/:userId/saved-events', eventController.getUserSavedEvents);

// Industry Events routes
router.get('/industry-events/recommended', industryEventsController.getRecommendedEvents);
router.get('/industry-events/saved', industryEventsController.getSavedEvents);
router.get('/industry-events/registered', industryEventsController.getRegisteredEvents);
router.get('/industry-events/statistics', industryEventsController.getEventStatistics);
router.get('/industry-events/upcoming', industryEventsController.getUpcomingEvents);
router.get('/industry-events/:eventId', industryEventsController.getEventById);
router.post('/industry-events/:eventId/save', industryEventsController.saveEvent);
router.delete('/industry-events/:eventId/unsave', industryEventsController.unsaveEvent);
router.post('/industry-events/:eventId/register', industryEventsController.registerForEvent);
router.post('/industry-events/:eventId/feedback', industryEventsController.submitEventFeedback);
router.post('/industry-events/:eventId/attendance', industryEventsController.confirmAttendance);

// Follow-up Reminders routes
router.get('/users/:userId/followup-reminders', followupReminderController.getUserReminders);
router.post('/users/:userId/followup-reminders', followupReminderController.createReminder);
router.get('/followup-reminders/templates', followupReminderController.getReminderTemplates);
router.get('/followup-reminders/due', followupReminderController.getDueReminders);
router.get('/users/:userId/matches/:matchId/followup-reminders', followupReminderController.getMatchReminders);
router.put('/followup-reminders/:reminderId/status', followupReminderController.updateReminderStatus);
router.put('/followup-reminders/:reminderId/snooze', followupReminderController.snoozeReminder);
router.delete('/followup-reminders/:reminderId', followupReminderController.deleteReminder);

// Portfolio routes
router.post('/portfolios', portfolioController.createPortfolio);
router.get('/portfolios/public', portfolioController.getPublicPortfolios);
router.get('/portfolios/my', portfolioController.getUserPortfolios); // Changed from user/:userId to my
router.get('/portfolios/user/:userId', portfolioController.getUserPortfolios);
router.get('/portfolios/:id', portfolioController.getPortfolioById);
router.get('/portfolios/url/:url', portfolioController.getPortfolioByUrl);
router.put('/portfolios/:id', portfolioController.updatePortfolio);
router.delete('/portfolios/:id', portfolioController.deletePortfolio);
router.post('/portfolios/:id/like', portfolioController.togglePortfolioLike);

module.exports = router;