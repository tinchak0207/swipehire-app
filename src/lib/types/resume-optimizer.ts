/**
 * TypeScript types and interfaces for the Resume Optimizer feature
 */

// File upload and processing types
export interface FileUploadState {
  file: File | null;
  isUploading: boolean;
  error: string | null;
  extractedText: string | null;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

// Target job information
export interface TargetJobInfo {
  title: string;
  keywords: string;
  description?: string;
  company?: string;
}

// Profile data structure
export interface UserProfileData {
  name: string;
  email: string;
  phone: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  experience: ProfileExperience[];
  education: ProfileEducation[];
  skills: string[];
  summary?: string;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
    credentialId?: string;
    expiryDate?: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    duration?: string;
    role?: string;
    url?: string;
  }>;
  languages?: Array<{
    language: string;
    proficiency: 'native' | 'fluent' | 'conversational' | 'basic';
  }>;
}

export interface ProfileExperience {
  id?: string;
  title: string;
  company: string;
  location?: string;
  duration: string;
  startDate?: string;
  endDate?: string;
  description: string;
  achievements?: string[];
  technologies?: string[];
}

export interface ProfileEducation {
  id?: string;
  degree: string;
  school: string;
  location?: string;
  year: string;
  gpa?: string;
  honors?: string;
  relevantCourses?: string[];
}

// Resume templates
export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  category: 'tech' | 'business' | 'creative' | 'general' | 'healthcare' | 'education';
  content: string;
  previewImage?: string;
  tags?: string[];
}

// Analysis and scoring types
export interface ResumeAnalysisRequest {
  resumeText: string;
  targetJob: TargetJobInfo;
  templateId?: string;
  userId?: string;
}

export interface ResumeAnalysisResponse {
  id: string;
  overallScore: number;
  atsScore: number;
  keywordAnalysis: KeywordAnalysis;
  suggestions: OptimizationSuggestion[];
  grammarCheck: GrammarCheckResult;
  formatAnalysis: FormatAnalysis;
  quantitativeAnalysis: QuantitativeAnalysis;
  strengths: string[];
  weaknesses: string[];
  createdAt: string;
  processingTime: number;
  sectionAnalysis?: Record<string, {
    present: boolean;
    score: number;
    suggestions: string[];
  }>;
  optimizedContent?: string;
  metadata?: {
    analysisDate: string;
    targetJobTitle: string;
    targetCompany?: string;
    templateUsed?: string;
    wordCount: number;
    processingTime: number;
  };
}

export interface KeywordAnalysis {
  score: number;
  totalKeywords: number;
  matchedKeywords: MatchedKeyword[];
  missingKeywords: MissingKeyword[];
  keywordDensity: Record<string, number>;
  recommendations: string[];
}

export interface MatchedKeyword {
  keyword: string;
  frequency: number;
  relevanceScore: number;
  context: string[];
}

export interface MissingKeyword {
  keyword: string;
  importance: 'high' | 'medium' | 'low';
  suggestedPlacement: string[];
  relatedTerms: string[];
}

export interface OptimizationSuggestion {
  id: string;
  type: 'keyword' | 'grammar' | 'format' | 'achievement' | 'structure' | 'ats';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  suggestion: string;
  beforeText?: string;
  afterText?: string;
  section?: string;
  priority: number;
  estimatedScoreImprovement: number;
  category?: 'contact' | 'content' | 'formatting';
}

export interface GrammarCheckResult {
  score: number;
  totalIssues: number;
  issues: GrammarIssue[];
  overallReadability: number;
}

export interface GrammarIssue {
  id: string;
  type: 'spelling' | 'grammar' | 'punctuation' | 'style';
  severity: 'error' | 'warning' | 'suggestion';
  message: string;
  context: string;
  suggestions: string[];
  position: {
    start: number;
    end: number;
    line?: number;
    column?: number;
  };
}

export interface FormatAnalysis {
  score: number;
  atsCompatibility: number;
  issues: FormatIssue[];
  recommendations: string[];
  sectionStructure: SectionStructure[];
}

export interface FormatIssue {
  type: 'spacing' | 'font' | 'structure' | 'length' | 'sections';
  severity: 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
}

export interface SectionStructure {
  name: string;
  present: boolean;
  order: number;
  recommended: boolean;
  content?: string;
}

export interface QuantitativeAnalysis {
  score: number;
  achievementsWithNumbers: number;
  totalAchievements: number;
  suggestions: QuantitativeSuggestion[];
  impactWords: string[];
}

export interface QuantitativeSuggestion {
  section: string;
  originalText: string;
  suggestedText: string;
  reasoning: string;
}

// Editor and interaction types
export interface EditorState {
  content: string;
  isDirty: boolean;
  lastSaved?: string;
  cursorPosition?: number;
}

export interface SuggestionAction {
  suggestionId: string;
  action: 'adopt' | 'ignore' | 'modify';
  modifiedText?: string;
  timestamp: string;
}

// Download and export types
export interface ExportOptions {
  format: 'pdf' | 'docx' | 'txt';
  template?: string;
  includeAnalysis?: boolean;
  fileName?: string;
}

export interface ExportResult {
  success: boolean;
  url?: string;
  error?: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Error types
export interface ResumeOptimizerError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// State management types
export interface ResumeOptimizerState {
  currentStep: 'upload' | 'import' | 'create' | 'analyze' | 'report' | 'editor';
  resumeText: string | null;
  targetJob: TargetJobInfo | null;
  analysisResult: ResumeAnalysisResponse | null;
  selectedTemplate: ResumeTemplate | null;
  editorState: EditorState;
  adoptedSuggestions: Set<string>;
  ignoredSuggestions: Set<string>;
  isLoading: boolean;
  error: ResumeOptimizerError | null;
}

// Component prop types
export interface ResumeOptimizerPageProps {
  initialData?: Partial<ResumeOptimizerState>;
  userId?: string;
  onComplete?: (result: ResumeAnalysisResponse) => void;
}

export interface TemplateCardProps {
  template: ResumeTemplate;
  isSelected: boolean;
  onSelect: (template: ResumeTemplate) => void;
}

export interface SuggestionCardProps {
  suggestion: OptimizationSuggestion;
  isAdopted: boolean;
  isIgnored: boolean;
  onAdopt: (suggestionId: string) => void;
  onIgnore: (suggestionId: string) => void;
  onModify?: (suggestionId: string, modifiedText: string) => void;
  onApplyToEditor?: (suggestionId: string, suggestion: OptimizationSuggestion) => void;
}

export interface ScoreDisplayProps {
  score: number;
  label: string;
  maxScore?: number;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Utility types
export type ResumeSection =
  | 'header'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'awards';

export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type FileType = 'pdf' | 'docx' | 'txt';

// Constants
export const SUPPORTED_FILE_TYPES: FileType[] = ['pdf', 'docx'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MIN_RESUME_LENGTH = 100; // characters
export const MAX_RESUME_LENGTH = 10000; // characters

// Type guards
export const isValidFileType = (type: string): type is FileType => {
  return SUPPORTED_FILE_TYPES.includes(type as FileType);
};

export const isResumeAnalysisResponse = (obj: unknown): obj is ResumeAnalysisResponse => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'overallScore' in obj &&
    'atsScore' in obj &&
    'keywordAnalysis' in obj &&
    'suggestions' in obj
  );
};
