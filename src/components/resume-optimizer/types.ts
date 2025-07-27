/**
 * Core TypeScript interfaces and types for Resume Optimizer components
 * Following strict TypeScript guidelines with comprehensive type definitions
 */

// User Profile and Authentication Types
export interface UserProfile {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly avatar?: string;
  readonly role: 'user' | 'admin' | 'editor';
  readonly industry?: string;
  readonly experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  readonly preferences: UserPreferences;
  readonly createdAt: Date;
  readonly lastActive: Date;
}

export interface UserPreferences {
  readonly theme: 'light' | 'dark' | 'auto';
  readonly language: string;
  readonly notifications: NotificationSettings;
  readonly privacy: PrivacySettings;
}

export interface NotificationSettings {
  readonly email: boolean;
  readonly push: boolean;
  readonly analysisComplete: boolean;
  readonly weeklyTips: boolean;
}

export interface PrivacySettings {
  readonly shareAnalytics: boolean;
  readonly allowPeerReview: boolean;
  readonly publicProfile: boolean;
}

// Analysis and Scoring Types
export interface EnhancedAnalysisResult {
  readonly id: string;
  readonly overallScore: number;
  readonly categoryScores: CategoryScores;
  readonly suggestions: Suggestion[];
  readonly achievements: Achievement[];
  readonly nextMilestones: Milestone[];
  readonly industryBenchmarks: BenchmarkData;
  readonly analysisTimestamp: Date;
  readonly version: string;
}

export interface CategoryScores {
  readonly ats: number;
  readonly keywords: number;
  readonly format: number;
  readonly content: number;
  readonly impact: number;
  readonly readability: number;
}

export interface Suggestion {
  readonly id: string;
  readonly type: SuggestionType;
  readonly priority: 'low' | 'medium' | 'high' | 'critical';
  readonly category: keyof CategoryScores;
  readonly title: string;
  readonly description: string;
  readonly impact: ImpactMetrics;
  readonly effort: EffortLevel;
  readonly beforePreview?: string;
  readonly afterPreview?: string;
  readonly isApplied: boolean;
  readonly canAutoApply: boolean;
}

export type SuggestionType =
  | 'keyword-optimization'
  | 'format-improvement'
  | 'content-enhancement'
  | 'ats-compatibility'
  | 'grammar-correction'
  | 'structure-reorganization';

export interface ImpactMetrics {
  readonly scoreIncrease: number;
  readonly atsCompatibility: number;
  readonly readabilityImprovement: number;
  readonly keywordDensity: number;
}

export interface EffortLevel {
  readonly timeMinutes: number;
  readonly difficulty: 'easy' | 'medium' | 'hard';
  readonly requiresManualReview: boolean;
}

// Gamification and Achievement Types
export interface Achievement {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly category: AchievementCategory;
  readonly points: number;
  readonly unlockedAt: Date;
  readonly rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export type AchievementCategory =
  | 'first-steps'
  | 'optimization-master'
  | 'consistency'
  | 'collaboration'
  | 'expertise';

export interface Milestone {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly targetScore: number;
  readonly currentProgress: number;
  readonly reward: Achievement;
  readonly estimatedTimeToComplete: number;
}

export interface BenchmarkData {
  readonly industry: string;
  readonly role: string;
  readonly averageScore: number;
  readonly topPercentileScore: number;
  readonly commonKeywords: string[];
  readonly trendingSkills: string[];
}

// Upload and File Processing Types
export interface UploadProgress {
  readonly fileId: string;
  readonly fileName: string;
  readonly progress: number;
  readonly status: UploadStatus;
  readonly error?: string;
  readonly estimatedTimeRemaining?: number;
}

export type UploadStatus =
  | 'pending'
  | 'uploading'
  | 'processing'
  | 'analyzing'
  | 'complete'
  | 'error';

export interface ContentAnalysis {
  readonly extractedText: string;
  readonly detectedSections: ResumeSection[];
  readonly fileMetadata: FileMetadata;
  readonly qualityIndicators: QualityIndicators;
}

export interface ResumeSection {
  readonly type: SectionType;
  readonly content: string;
  readonly startIndex: number;
  readonly endIndex: number;
  readonly confidence: number;
}

export type SectionType =
  | 'contact'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'awards'
  | 'languages'
  | 'references';

export interface FileMetadata {
  readonly name: string;
  readonly size: number;
  readonly type: string;
  readonly lastModified: Date;
  readonly pageCount?: number;
  readonly wordCount: number;
}

export interface QualityIndicators {
  readonly completeness: number;
  readonly formatting: number;
  readonly atsCompatibility: number;
  readonly readability: number;
}

// Onboarding and User Flow Types
export interface OnboardingState {
  readonly currentStep: number;
  readonly totalSteps: number;
  readonly completedSteps: readonly number[];
  readonly userResponses: Record<string, unknown>;
  readonly recommendedPath: OnboardingPath;
}

export type OnboardingPath = 'quick-start' | 'comprehensive' | 'guided-tutorial' | 'expert-mode';

export interface OptimizationGoals {
  readonly primaryObjective:
    | 'ats-optimization'
    | 'content-improvement'
    | 'format-enhancement'
    | 'keyword-optimization';
  readonly targetIndustry: string;
  readonly targetRole: string;
  readonly timeframe: 'immediate' | 'week' | 'month' | 'quarter';
  readonly experienceLevel: UserProfile['experienceLevel'];
}

// Component Props Interfaces
export interface EnhancedLandingPageProps {
  readonly userProfile?: UserProfile;
  readonly onboardingComplete: boolean;
  readonly previousAnalyses: readonly AnalysisHistory[];
  readonly industryBenchmarks: BenchmarkData;
  readonly onStartOnboarding: () => void;
  readonly onQuickStart: () => void;
}

export interface SmartUploadProps {
  readonly acceptedFormats: readonly FileFormat[];
  readonly maxFileSize: number;
  readonly enableMultipleFiles: boolean;
  readonly enableCloudImport: boolean;
  readonly enableSmartSuggestions: boolean;
  readonly onUploadProgress: (progress: UploadProgress) => void;
  readonly onContentAnalysis: (analysis: ContentAnalysis) => void;
  readonly onContentExtracted: (content: ExtractedContent) => void;
  readonly onUploadComplete: (result: UploadResult) => void;
  readonly onAnalysisReady: (analysis: EnhancedAnalysisResult) => void;
  readonly onError: (error: UploadError) => void;
}

// Enhanced Upload Features Types
export interface ExtractedContent {
  readonly sections: ExtractedSection[];
  readonly metadata: DocumentMetadata;
  readonly suggestions: ContentSuggestion[];
  readonly missingContent: MissingContentAlert[];
  readonly atsCompatibility: ATSCompatibilityResult;
}

export interface ExtractedSection {
  readonly id: string;
  readonly type: SectionType;
  readonly title: string;
  readonly content: string;
  readonly confidence: number;
  readonly suggestions: string[];
  readonly isComplete: boolean;
}

export interface DocumentMetadata {
  readonly fileName: string;
  readonly fileSize: number;
  readonly fileType: string;
  readonly pageCount: number;
  readonly wordCount: number;
  readonly characterCount: number;
  readonly createdDate?: Date;
  readonly modifiedDate: Date;
  readonly author?: string;
  readonly language: string;
}

export interface ContentSuggestion {
  readonly id: string;
  readonly type: 'format' | 'content' | 'structure' | 'keyword';
  readonly priority: 'low' | 'medium' | 'high' | 'critical';
  readonly title: string;
  readonly description: string;
  readonly section: SectionType;
  readonly impact: number;
  readonly autoApplicable: boolean;
}

export interface MissingContentAlert {
  readonly section: SectionType;
  readonly importance: 'optional' | 'recommended' | 'required';
  readonly description: string;
  readonly examples: string[];
  readonly impact: number;
}

export interface ATSCompatibilityResult {
  readonly score: number;
  readonly issues: ATSIssue[];
  readonly recommendations: ATSRecommendation[];
  readonly formatCompliance: FormatCompliance;
}

export interface ATSIssue {
  readonly type: 'format' | 'content' | 'structure' | 'keyword';
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly description: string;
  readonly location: string;
  readonly fix: string;
}

export interface ATSRecommendation {
  readonly title: string;
  readonly description: string;
  readonly impact: number;
  readonly effort: 'low' | 'medium' | 'high';
  readonly category: string;
}

export interface FormatCompliance {
  readonly fonts: boolean;
  readonly spacing: boolean;
  readonly margins: boolean;
  readonly headers: boolean;
  readonly bullets: boolean;
  readonly tables: boolean;
  readonly images: boolean;
  readonly links: boolean;
}

// Cloud Storage Integration Types
export interface CloudStorageProvider {
  readonly name: 'google-drive' | 'dropbox' | 'onedrive' | 'box';
  readonly displayName: string;
  readonly icon: string;
  readonly isConnected: boolean;
  readonly authUrl?: string;
}

export interface CloudFile {
  readonly id: string;
  readonly name: string;
  readonly size: number;
  readonly type: string;
  readonly modifiedDate: Date;
  readonly downloadUrl: string;
  readonly thumbnailUrl?: string;
  readonly provider: CloudStorageProvider['name'];
}

// Camera Capture Types
export interface CameraCapture {
  readonly isSupported: boolean;
  readonly isActive: boolean;
  readonly stream?: MediaStream;
  readonly constraints: MediaStreamConstraints;
}

export interface CapturedImage {
  readonly blob: Blob;
  readonly dataUrl: string;
  readonly width: number;
  readonly height: number;
  readonly timestamp: Date;
}

// Batch Upload Processing Types
export interface BatchUploadConfig {
  readonly maxConcurrentUploads: number;
  readonly retryAttempts: number;
  readonly retryDelay: number;
  readonly progressUpdateInterval: number;
}

export interface BatchUploadResult {
  readonly totalFiles: number;
  readonly successfulUploads: number;
  readonly failedUploads: number;
  readonly results: UploadResult[];
  readonly errors: UploadError[];
  readonly processingTime: number;
}

// Real-Time Processing Types
export interface LivePreview {
  readonly isEnabled: boolean;
  readonly previewUrl?: string;
  readonly thumbnailUrl?: string;
  readonly extractedText?: string;
  readonly detectedSections: ExtractedSection[];
  readonly qualityScore: number;
}

export interface ProcessingETA {
  readonly estimatedSeconds: number;
  readonly confidence: number;
  readonly factors: ETAFactor[];
}

export interface ETAFactor {
  readonly name: string;
  readonly impact: number;
  readonly description: string;
}

// Error Recovery Types
export interface ErrorRecovery {
  readonly canRetry: boolean;
  readonly retryAttempts: number;
  readonly maxRetries: number;
  readonly retryDelay: number;
  readonly alternativeActions: RecoveryAction[];
}

export interface RecoveryAction {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly action: () => Promise<void>;
  readonly icon: string;
}

// Quality Assessment Types
export interface QualityAssessment {
  readonly overallScore: number;
  readonly categories: QualityCategory[];
  readonly recommendations: QualityRecommendation[];
  readonly benchmarkComparison: BenchmarkComparison;
}

export interface QualityCategory {
  readonly name: string;
  readonly score: number;
  readonly weight: number;
  readonly issues: QualityIssue[];
  readonly strengths: string[];
}

export interface QualityIssue {
  readonly type: string;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly description: string;
  readonly suggestion: string;
  readonly impact: number;
}

export interface QualityRecommendation {
  readonly priority: number;
  readonly title: string;
  readonly description: string;
  readonly expectedImprovement: number;
  readonly effort: 'low' | 'medium' | 'high';
}

export interface BenchmarkComparison {
  readonly industry: string;
  readonly role: string;
  readonly percentile: number;
  readonly averageScore: number;
  readonly topPercentileScore: number;
  readonly improvementPotential: number;
}

// Template Recommendation Types
export interface TemplateRecommendation {
  readonly templateId: string;
  readonly name: string;
  readonly description: string;
  readonly previewUrl: string;
  readonly compatibility: number;
  readonly reasons: string[];
  readonly industry: string;
  readonly experienceLevel: string;
}

// Integration Enhancement Types
export interface IntegrationConfig {
  readonly enableEditorHandoff: boolean;
  readonly enableContentBlocks: boolean;
  readonly enableAutoAnalysis: boolean;
  readonly enableTemplateRecommendation: boolean;
}

export interface EditorHandoff {
  readonly content: ExtractedContent;
  readonly analysis: EnhancedAnalysisResult;
  readonly recommendations: TemplateRecommendation[];
  readonly userPreferences: UserPreferences;
}

export interface ContentBlock {
  readonly id: string;
  readonly type: SectionType;
  readonly title: string;
  readonly content: string;
  readonly isEditable: boolean;
  readonly suggestions: ContentSuggestion[];
  readonly metadata: BlockMetadata;
}

export interface BlockMetadata {
  readonly wordCount: number;
  readonly characterCount: number;
  readonly readabilityScore: number;
  readonly keywordDensity: Record<string, number>;
  readonly lastModified: Date;
}

export interface AnalysisDashboardProps {
  readonly analysisResult: EnhancedAnalysisResult;
  readonly userGoals: OptimizationGoals;
  readonly industryBenchmarks: BenchmarkData;
  readonly enableRealTimeUpdates: boolean;
  readonly onSuggestionInteraction: (action: SuggestionAction) => void;
  readonly onScoreUpdate: (newScore: number) => void;
}

export interface ResponsiveLayoutProps {
  readonly breakpoint: 'mobile' | 'tablet' | 'desktop';
  readonly orientation: 'portrait' | 'landscape';
  readonly touchCapable: boolean;
  readonly screenSize: ScreenDimensions;
  readonly children: React.ReactNode;
}

// Utility Types
export interface FileFormat {
  readonly extension: string;
  readonly mimeType: string;
  readonly maxSize: number;
}

export interface AnalysisHistory {
  readonly id: string;
  readonly fileName: string;
  readonly score: number;
  readonly analyzedAt: Date;
  readonly improvements: number;
}

export interface UploadResult {
  readonly fileId: string;
  readonly analysisId: string;
  readonly initialScore: number;
  readonly processingTime: number;
}

export interface UploadError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
}

export interface SuggestionAction {
  readonly type: 'apply' | 'dismiss' | 'preview' | 'customize';
  readonly suggestionId: string;
  readonly customization?: Record<string, unknown>;
}

export interface ScreenDimensions {
  readonly width: number;
  readonly height: number;
  readonly pixelRatio: number;
}

export interface AchievementSystem {
  readonly badges: readonly Achievement[];
  readonly milestones: readonly Milestone[];
  readonly streaks: StreakData;
  readonly leaderboards: readonly LeaderboardEntry[];
  readonly challenges: readonly Challenge[];
}

export interface StreakData {
  readonly current: number;
  readonly longest: number;
  readonly lastActivity: Date;
}

export interface LeaderboardEntry {
  readonly userId: string;
  readonly username: string;
  readonly score: number;
  readonly rank: number;
  readonly achievements: number;
}

export interface Challenge {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly type: 'daily' | 'weekly' | 'monthly' | 'special';
  readonly reward: Achievement;
  readonly progress: number;
  readonly target: number;
  readonly expiresAt: Date;
}

// Animation and Interaction Types
export interface AnimationConfig {
  readonly duration: number;
  readonly easing: string;
  readonly delay?: number;
  readonly stagger?: number;
}

export interface GestureConfig {
  readonly swipeThreshold: number;
  readonly longPressDelay: number;
  readonly doubleTapDelay: number;
  readonly pinchSensitivity: number;
}

// API and Data Fetching Types
export interface ApiResponse<T> {
  readonly data: T;
  readonly status: number;
  readonly message: string;
  readonly timestamp: Date;
}

export interface PaginatedResponse<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;
}

// Error Handling Types
export interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly error?: Error;
  readonly errorInfo?: React.ErrorInfo;
}

export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly code: string;
}

// Performance Monitoring Types
export interface PerformanceMetrics {
  readonly loadTime: number;
  readonly renderTime: number;
  readonly interactionTime: number;
  readonly memoryUsage: number;
}

// Accessibility Types
export interface AccessibilityConfig {
  readonly highContrast: boolean;
  readonly reducedMotion: boolean;
  readonly screenReader: boolean;
  readonly keyboardNavigation: boolean;
}

// Type Guards and Utility Functions
export const isValidUserProfile = (obj: unknown): obj is UserProfile => {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'email' in obj && 'name' in obj;
};

export const isValidAnalysisResult = (obj: unknown): obj is EnhancedAnalysisResult => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'overallScore' in obj &&
    'categoryScores' in obj
  );
};

// Mapped Types for Dynamic Properties
export type PartialUserProfile = Partial<UserProfile>;
export type RequiredAnalysisResult = Required<EnhancedAnalysisResult>;
export type SuggestionKeys = keyof Suggestion;
export type CategoryScoreKeys = keyof CategoryScores;

// Conditional Types for Advanced Type Safety
export type SuggestionByType<T extends SuggestionType> = Suggestion & {
  readonly type: T;
};

export type ComponentPropsWithAnalysis<T> = T & {
  readonly analysisResult: EnhancedAnalysisResult;
};

// Template Literal Types for Dynamic Strings
export type EventName = `resume-optimizer-${string}`;
export type ComponentName = `ResumeOptimizer${string}`;
export type ApiEndpoint = `/api/resume-optimizer/${string}`;

// Collaborative Commenting and Suggestions
export interface Comment {
  readonly id: string;
  readonly author: UserProfile;
  readonly content: string;
  readonly timestamp: Date;
  readonly replies: Comment[];
  readonly position: {
    readonly section: SectionType;
    readonly line: number;
  };
}

export interface CollaborativeSuggestion extends Suggestion {
  readonly author: UserProfile;
  readonly votes: {
    readonly up: number;
    readonly down: number;
  };
  readonly comments: Comment[];
}

// Collaboration and Version History Types
export interface CollaborationUser {
  readonly id: string;
  readonly name: string;
  readonly avatar: string;
  readonly cursor: {
    readonly line: number;
    readonly column: number;
  };
  readonly isActive: boolean;
  readonly lastSeen: Date;
}

export interface VersionHistoryEntry {
  readonly id: string;
  readonly content: string;
  readonly timestamp: Date;
  readonly author: string;
  readonly changes: VersionChange[];
  readonly score?: number;
}

export interface VersionChange {
  readonly type: 'addition' | 'deletion' | 'modification';
  readonly section: string;
  readonly description: string;
  readonly impact: number;
}
