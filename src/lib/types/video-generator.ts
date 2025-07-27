/**
 * TypeScript types for AI-Powered Resume Video Generator
 * State-of-the-art video generation with AI narration and synthesis
 */

export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  duration: number;
  style: 'corporate' | 'creative' | 'technology' | 'minimal' | 'executive' | 'startup';
  thumbnail: string;
  features?: string[];
  premium?: boolean;
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  accent: 'American' | 'British' | 'Australian' | 'Canadian' | 'Indian' | 'International';
  description: string;
  sample: string;
  language?: string;
  premium?: boolean;
  emotionalRange?: 'low' | 'medium' | 'high';
  speaking_rate?: number;
  pitch?: number;
}

export interface VideoSegment {
  id: string;
  type:
    | 'introduction'
    | 'experience'
    | 'skills'
    | 'education'
    | 'achievements'
    | 'conclusion'
    | 'custom';
  startTime: number;
  endTime: number;
  content: string;
  visualElements?: string[];
  animationType?: 'slide' | 'fade' | 'zoom' | 'typewriter' | 'bounce';
}

export interface VideoGenerationOptions {
  includeSubtitles?: boolean;
  includeBrandWatermark?: boolean;
  videoQuality?: 'sd' | 'hd' | '4k';
  audioQuality?: 'medium' | 'high' | 'premium';
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3';
  backgroundMusic?: boolean;
  musicGenre?: 'corporate' | 'upbeat' | 'minimal' | 'none';
  animations?: boolean;
  transitionEffects?: boolean;
  colorTheme?: 'professional' | 'creative' | 'modern' | 'classic';
  includeLogo?: boolean;
  logoUrl?: string;
}

export interface VideoGenerationRequest {
  resumeText: string;
  template: VideoTemplate;
  voice: VoiceOption;
  customScript?: string;
  title: string;
  duration: number;
  includeContactInfo: boolean;
  style: VideoTemplate['style'];
  options: VideoGenerationOptions;
  targetAudience?: 'recruiters' | 'hiring_managers' | 'executives' | 'peers';
  industry?: string;
  jobRole?: string;
  personalBranding?: {
    colorPalette?: string[];
    fonts?: string[];
    logoUrl?: string;
  };
}

export interface VideoGenerationResponse {
  success: boolean;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  fileSize: number; // in MB
  segments: VideoSegment[];
  metadata: {
    generatedAt: string;
    template: string;
    voice: string;
    processingTime: number;
    aiModel: string;
    videoId?: string;
    shareableLink?: string;
  };
  analytics?: {
    estimatedViewTime: number;
    engagementScore: number;
    professionalismScore: number;
    clarityScore: number;
  };
  error?: string;
}

export interface VideoGenerationProgress {
  stage:
    | 'initializing'
    | 'analyzing'
    | 'scripting'
    | 'voice_synthesis'
    | 'visual_creation'
    | 'rendering'
    | 'finalizing'
    | 'complete';
  progress: number; // 0-100
  message: string;
  estimatedTimeRemaining?: number; // in seconds
  currentTask?: string;
  completedTasks?: string[];
}

export interface VideoAnalytics {
  views: number;
  uniqueViews: number;
  averageWatchTime: number;
  completionRate: number;
  engagementScore: number;
  clickThroughRate?: number;
  geographicData?: {
    country: string;
    views: number;
  }[];
  deviceData?: {
    device: 'mobile' | 'tablet' | 'desktop';
    percentage: number;
  }[];
  timeSpentPerSegment?: {
    segmentId: string;
    averageTime: number;
  }[];
}

export interface VideoExportOptions {
  format: 'mp4' | 'mov' | 'avi' | 'webm';
  quality: 'sd' | 'hd' | '4k';
  includeSubtitles: boolean;
  includeAudio: boolean;
  includeWatermark: boolean;
  customWatermark?: string;
}

export interface VideoSharingOptions {
  platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'email' | 'direct_link';
  message?: string;
  hashtags?: string[];
  mentionedUsers?: string[];
  privacyLevel?: 'public' | 'connections_only' | 'private';
}

export interface AIVideoService {
  generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse>;
  getGenerationProgress(jobId: string): Promise<VideoGenerationProgress>;
  getVideoAnalytics(videoId: string): Promise<VideoAnalytics>;
  deleteVideo(videoId: string): Promise<boolean>;
  updateVideoMetadata(
    videoId: string,
    metadata: Partial<VideoGenerationResponse['metadata']>
  ): Promise<boolean>;
  exportVideo(videoId: string, options: VideoExportOptions): Promise<string>;
  shareVideo(videoId: string, options: VideoSharingOptions): Promise<string>;
  getTemplates(): Promise<VideoTemplate[]>;
  getVoices(): Promise<VoiceOption[]>;
}

export interface VideoGenerationError {
  code:
    | 'INVALID_INPUT'
    | 'PROCESSING_FAILED'
    | 'QUOTA_EXCEEDED'
    | 'SERVICE_UNAVAILABLE'
    | 'AUTHENTICATION_FAILED';
  message: string;
  details?: Record<string, any>;
  retryable: boolean;
}

export interface VideoGenerationQuota {
  totalVideos: number;
  usedVideos: number;
  remainingVideos: number;
  resetDate: string;
  plan: 'free' | 'premium' | 'enterprise';
  features: string[];
}

export interface VideoCustomization {
  brandColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts?: {
    heading: string;
    body: string;
  };
  logo?: {
    url: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    size: 'small' | 'medium' | 'large';
  };
  backgroundImages?: string[];
  animations?: {
    type: 'subtle' | 'dynamic' | 'minimal';
    speed: 'slow' | 'normal' | 'fast';
  };
}

// Enhanced types for AI integration
export interface AIScriptGeneration {
  originalText: string;
  generatedScript: string;
  confidence: number;
  improvements: string[];
  tone: 'professional' | 'casual' | 'enthusiastic' | 'authoritative' | 'friendly';
  readingTime: number;
  wordCount: number;
  sentenceCount: number;
  readabilityScore: number;
}

export interface VoiceSynthesisResult {
  audioUrl: string;
  duration: number;
  voiceId: string;
  quality: 'high' | 'premium';
  fileSize: number;
  sampleRate: number;
  bitRate: number;
  emotions?: {
    emotion: string;
    confidence: number;
  }[];
}

export interface VisualElement {
  id: string;
  type: 'text' | 'image' | 'chart' | 'timeline' | 'skillbar' | 'achievement' | 'contact';
  startTime: number;
  endTime: number;
  content: any;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  animation?: {
    type: string;
    duration: number;
    delay: number;
  };
}

export interface VideoRenderingJob {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  endTime?: string;
  errorMessage?: string;
  resultUrl?: string;
  metadata: Record<string, any>;
}

export default VideoGenerationRequest;
