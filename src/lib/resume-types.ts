// Resume Optimizer specific types
export interface ResumeUploadState {
  file: File | null;
  isUploading: boolean;
  error: string | null;
  extractedText: string | null;
  progress?: number;
}

export interface TargetJobInfo {
  title: string;
  keywords: string;
  company?: string;
  description?: string;
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  category: 'tech' | 'business' | 'creative' | 'general' | 'healthcare' | 'education';
  content: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
}

export interface ProfileImportState {
  isLoading: boolean;
  error: string | null;
  profileData: UserProfileData | null;
  hasProfile: boolean;
}

export interface UserProfileData {
  name: string;
  email: string;
  phone: string;
  location?: string;
  headline?: string;
  summary?: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  certifications?: CertificationItem[];
  projects?: ProjectItem[];
  languages?: LanguageItem[];
}

export interface ExperienceItem {
  title: string;
  company: string;
  duration: string;
  location?: string;
  description: string;
  achievements?: string[];
  technologies?: string[];
}

export interface EducationItem {
  degree: string;
  school: string;
  year: string;
  location?: string;
  gpa?: string;
  honors?: string[];
}

export interface CertificationItem {
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
}

export interface ProjectItem {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  duration?: string;
  role?: string;
}

export interface LanguageItem {
  language: string;
  proficiency: 'native' | 'fluent' | 'conversational' | 'basic';
}

export interface ResumeAnalysisRequest {
  resumeText: string;
  targetJob: TargetJobInfo;
  templateId?: string;
  userId?: string;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  fileInfo?: {
    name: string;
    size: number;
    type: string;
  };
}

export interface ResumeParsingProgress {
  stage: 'uploading' | 'extracting' | 'processing' | 'complete' | 'error';
  progress: number;
  message: string;
}

export interface ParsedFileMetadata {
  fileName: string;
  fileSize: number;
  fileType: string;
  pageCount?: number;
  wordCount: number;
  characterCount: number;
  extractionTime: number;
}

export interface ParsedFileResult {
  text: string;
  metadata: ParsedFileMetadata;
}

export interface FileParsingOptions {
  onProgress?: (progress: ResumeParsingProgress) => void;
  maxFileSize?: number;
  timeout?: number;
}

export type SupportedFileType = 'pdf' | 'docx' | 'doc';

export interface FileUploadEvent extends React.ChangeEvent<HTMLInputElement> {
  target: HTMLInputElement & {
    files: FileList;
  };
}

export interface FileDragEvent extends React.DragEvent<HTMLDivElement> {
  dataTransfer: DataTransfer;
}

// Enhanced template categories with more options
export const TEMPLATE_CATEGORIES = {
  tech: {
    label: 'Technology',
    color: 'badge-primary',
    icon: '💻',
  },
  business: {
    label: 'Business',
    color: 'badge-success',
    icon: '💼',
  },
  creative: {
    label: 'Creative',
    color: 'badge-warning',
    icon: '🎨',
  },
  healthcare: {
    label: 'Healthcare',
    color: 'badge-error',
    icon: '🏥',
  },
  education: {
    label: 'Education',
    color: 'badge-info',
    icon: '📚',
  },
  general: {
    label: 'General',
    color: 'badge-neutral',
    icon: '📄',
  },
} as const;

export type TemplateCategory = keyof typeof TEMPLATE_CATEGORIES;