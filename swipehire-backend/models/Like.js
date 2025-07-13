const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  likingUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likedProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  likedProfileType: {
    type: String,
    enum: ['candidate', 'company'],
    required: true
  },
  likingUserRole: {
    type: String,
    enum: ['recruiter', 'candidate'],
    required: true
  },
  likingUserRepresentsCandidateId: {
    type: mongoose.Schema.Types.Mixed
  },
  likingUserRepresentsCompanyId: {
    type: mongoose.Schema.Types.Mixed
  },
  jobOpeningTitle: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for efficient queries
likeSchema.index({ likingUserId: 1, likedProfileId: 1 }, { unique: true });
likeSchema.index({ likedProfileId: 1 });
likeSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Like', likeSchema);