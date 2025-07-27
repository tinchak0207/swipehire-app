/**
 * AI-Powered Resume Video Generator Components
 * Export all video generation related components
 */

// Re-export types for convenience
export type {
  VideoAnalytics,
  VideoExportOptions,
  VideoGenerationOptions,
  VideoGenerationRequest,
  VideoGenerationResponse,
  VideoSegment,
  VideoSharingOptions,
  VideoTemplate,
  VoiceOption,
} from '@/lib/types/video-generator';
// Re-export service
export { videoGenerationService } from '@/services/videoGenerationService';
export { AIResumeVideoGenerator } from './AIResumeVideoGenerator';
