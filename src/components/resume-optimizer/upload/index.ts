/**
 * Enhanced Upload Module - Export Index
 *
 * This module provides a comprehensive multi-modal upload system for the resume optimizer
 * with advanced features including cloud storage integration, camera capture, real-time
 * processing, and intelligent content analysis.
 */

// Re-export types for convenience
export type {
  CameraCapture,
  CapturedImage,
  CloudFile,
  CloudStorageProvider,
  ContentAnalysis,
  ExtractedContent,
  LivePreview,
  ProcessingETA,
  QualityAssessment,
  SmartUploadProps,
  UploadError,
  UploadProgress,
  UploadResult,
} from '../types';
export { default as CameraCaptureModal } from './CameraCaptureModal';
// Supporting components
export { default as CloudStorageModal } from './CloudStorageModal';
export { default as EnhancedFileUploadCard } from './EnhancedFileUploadCard';
// Main upload component
export { default as EnhancedSmartUpload } from './EnhancedSmartUpload';

/**
 * Usage Examples:
 *
 * Basic Upload:
 * ```tsx
 * import { EnhancedSmartUpload } from '@/components/resume-optimizer/upload';
 *
 * <EnhancedSmartUpload
 *   enableCloudImport={true}
 *   enableMultipleFiles={true}
 *   onUploadComplete={(result) => console.log('Upload complete:', result)}
 *   onContentExtracted={(content) => console.log('Content extracted:', content)}
 *   onAnalysisReady={(analysis) => console.log('Analysis ready:', analysis)}
 *   onError={(error) => console.error('Upload error:', error)}
 * />
 * ```
 *
 * Cloud Storage Only:
 * ```tsx
 * import { CloudStorageModal } from '@/components/resume-optimizer/upload';
 *
 * <CloudStorageModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   onFileSelect={(files) => handleFiles(files)}
 * />
 * ```
 *
 * Camera Capture Only:
 * ```tsx
 * import { CameraCaptureModal } from '@/components/resume-optimizer/upload';
 *
 * <CameraCaptureModal
 *   isOpen={showCamera}
 *   onClose={() => setShowCamera(false)}
 *   onCapture={(files) => handleCapture(files)}
 *   videoRef={videoRef}
 *   canvasRef={canvasRef}
 * />
 * ```
 */
