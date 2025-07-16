import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
    gcsObjectName: { type: String, required: true },
    gcsBucketName: { type: String, required: true },
    originalFileName: { type: String, required: true },
    contentType: { type: String, required: true }, 
    size: { type: Number, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    gcsPublicUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Video', videoSchema);