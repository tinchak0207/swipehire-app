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
router.put('/diary-posts/:postId/like', diaryController.likePost);

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

module.exports = router;
