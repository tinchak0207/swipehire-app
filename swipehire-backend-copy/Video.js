
// swipehire-backend/Video.js
const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  gcsObjectName: { type: String, required: true },
  gcsBucketName: { type: String, required: true },
  originalFileName: { type: String, required: true },
  contentType: { type: String, required: true },
  size: { type: Number, required: true },
  gcsPublicUrl: { type: String }, // Optional, if you make objects public or generate signed URLs
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Link to user
  uploadedAt: { type: Date, default: Date.now },
  // Add fields for processing status, processed versions, etc. later
  title: { type: String, trim: true }, // Optional title for the video
  description: { type: String, trim: true }, // Optional description
});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;
