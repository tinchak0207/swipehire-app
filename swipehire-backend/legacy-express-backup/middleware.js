const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { GCS_BUCKET_NAME } = require('./constants');

// Create uploads directory if not exists
const uploadsDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const diaryUploadsDir = path.join(uploadsDir, 'diary');
if (!fs.existsSync(diaryUploadsDir)) {
    fs.mkdirSync(diaryUploadsDir, { recursive: true });
}

const jobMediaUploadsDir = path.join(uploadsDir, 'job-media');
if (!fs.existsSync(jobMediaUploadsDir)) {
    fs.mkdirSync(jobMediaUploadsDir, { recursive: true });
}

// File filter functions
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) { cb(null, true); }
    else { cb(new Error('Not an image! Please upload only images.'), false); }
};

const videoFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) { cb(null, true); }
    else { cb(new Error('Not a video! Please upload only video files (e.g., mp4, webm).'), false); }
};

// Multer storage configurations
const memoryStorage = multer.memoryStorage();

const uploadAvatarToMemory = multer({ 
    storage: memoryStorage, 
    fileFilter: imageFileFilter, 
    limits: { fileSize: 5 * 1024 * 1024 } 
});

const uploadVideoResumeToMemory = multer({
    storage: memoryStorage,
    fileFilter: videoFileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }
});

const uploadDiaryImageMulter = multer({ 
    storage: memoryStorage, 
    fileFilter: imageFileFilter, 
    limits: { fileSize: 5 * 1024 * 1024 } 
});

const uploadJobMediaToMemory = multer({
    storage: memoryStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type! Only images and videos are allowed for job media.'), false);
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Body parser configuration
const bodyParserConfig = {
    json: express.json({ limit: '10mb' }),
    urlencoded: express.urlencoded({ extended: true, limit: '10mb' })
};

module.exports = {
    uploadsDir,
    uploadAvatarToMemory,
    uploadVideoResumeToMemory,
    uploadDiaryImageMulter,
    uploadJobMediaToMemory,
    bodyParserConfig
};
