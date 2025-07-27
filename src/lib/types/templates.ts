/**
 * Advanced Industry-Specific Template System Types
 *
 * Comprehensive type definitions for the AI-powered template system
 * supporting industry-specific resume templates with intelligent recommendations
 */

export interface IndustryTemplate {
  id: string;
  name: string;
  industry: string;
  category: string;
  experienceLevel: ExperienceLevel[];
  description: string;
  features: string[];
  atsScore: number;
  popularity: number;
  usageCount: number;
  previewUrl: string;
  tags: string[];
  aiOptimized: boolean;
  customizable: boolean;
  sections: TemplateSectionType[];
  layout: LayoutType;
  colorScheme: ColorScheme;
  typography: TypographyStyle;
  metadata?: TemplateMetadata;
}

export interface TemplateMetadata {
  createdAt: string;
  updatedAt: string;
  version: string;
  author: string;
  license: string;
  compatibility: {
    atsVendors: string[];
    fileFormats: string[];
    languages: string[];
  };
  seoOptimized: boolean;
  accessibilityCompliant: boolean;
}

export interface TemplateCategory {
  id: string;
  name: string;
  count: number;
  description?: string;
  icon?: string;
}

export interface TemplateCustomization {
  colorScheme: ColorScheme;
  typography: TypographyStyle;
  layout: LayoutType;
  sections: TemplateSectionType[];
  personalBranding: PersonalBrandingOptions;
  spacing?: SpacingOptions;
  margins?: MarginOptions;
  fontSizes?: FontSizeOptions;
}

export interface PersonalBrandingOptions {
  includePhoto: boolean;
  includeSocialLinks: boolean;
  includePortfolio: boolean;
  includeQRCode?: boolean;
  brandColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  logoUrl?: string;
  personalWebsite?: string;
}

export interface SpacingOptions {
  lineHeight: number;
  sectionSpacing: number;
  itemSpacing: number;
  marginTop: number;
  marginBottom: number;
}

export interface MarginOptions {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface FontSizeOptions {
  heading1: number;
  heading2: number;
  heading3: number;
  body: number;
  caption: number;
}

export interface AITemplateRecommendation {
  templateId: string;
  confidence: number;
  reasoning: string;
  expectedImprovements: {
    atsScore: number;
    interviewRate: number;
    responseRate: number;
  };
  customizationSuggestions: string[];
  industryAlignment: number;
  roleAlignment: number;
  experienceAlignment: number;
  skillsAlignment?: SkillsAlignment;
}

export interface SkillsAlignment {
  technicalSkills: {
    matched: string[];
    missing: string[];
    recommended: string[];
  };
  softSkills: {
    matched: string[];
    missing: string[];
    recommended: string[];
  };
  industrySpecific: {
    matched: string[];
    missing: string[];
    recommended: string[];
  };
}

export interface TemplateAnalytics {
  templateId: string;
  usageStats: {
    totalDownloads: number;
    successRate: number;
    averageInterviewRate: number;
    industryRanking: number;
  };
  userFeedback: {
    averageRating: number;
    totalReviews: number;
    commonPraise: string[];
    improvementSuggestions: string[];
  };
  performanceMetrics: {
    atsPassRate: number;
    avgTimeToInterview: number;
    responseRate: number;
    conversionRate?: number;
  };
  demographicBreakdown?: {
    byIndustry: Record<string, number>;
    byExperience: Record<ExperienceLevel, number>;
    byLocation: Record<string, number>;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  industry?: string;
  experienceLevel?: ExperienceLevel;
  skills?: string[];
  preferences?: UserPreferences;
  resumeHistory?: ResumeHistoryEntry[];
}

export interface UserPreferences {
  preferredIndustries: string[];
  preferredRoles: string[];
  templatePreferences: {
    colorSchemes: ColorScheme[];
    layouts: LayoutType[];
    typography: TypographyStyle[];
  };
  aiAssistanceLevel: 'minimal' | 'moderate' | 'aggressive';
  privacySettings: {
    shareAnalytics: boolean;
    allowRecommendations: boolean;
    publicProfile: boolean;
  };
}

export interface ResumeHistoryEntry {
  id: string;
  templateId: string;
  createdAt: string;
  lastModified: string;
  version: number;
  performance?: {
    applications: number;
    interviews: number;
    offers: number;
  };
}

export interface TemplateFilter {
  industries: string[];
  experienceLevel: ExperienceLevel[];
  atsScore: {
    min: number;
    max: number;
  };
  popularity: {
    min: number;
    max: number;
  };
  features: string[];
  aiOptimized?: boolean;
  customizable?: boolean;
  layout?: LayoutType[];
  colorScheme?: ColorScheme[];
}

export interface TemplateSearchResult {
  templates: IndustryTemplate[];
  totalCount: number;
  facets: {
    industries: FacetCount[];
    experienceLevel: FacetCount[];
    features: FacetCount[];
    layouts: FacetCount[];
  };
  suggestions?: string[];
}

export interface FacetCount {
  value: string;
  count: number;
  selected: boolean;
}

export interface TemplatePreview {
  templateId: string;
  previewType: 'thumbnail' | 'full' | 'interactive';
  imageUrl?: string;
  htmlContent?: string;
  pdfUrl?: string;
  interactiveUrl?: string;
  sections: PreviewSection[];
}

export interface PreviewSection {
  id: string;
  name: string;
  type: TemplateSectionType;
  content: string;
  editable: boolean;
  required: boolean;
  order: number;
}

export interface TemplateExport {
  templateId: string;
  format: ExportFormat;
  customizations: TemplateCustomization;
  content: ResumeContent;
  metadata: ExportMetadata;
}

export interface ExportMetadata {
  exportedAt: string;
  exportedBy: string;
  version: string;
  watermark?: boolean;
  tracking?: {
    enabled: boolean;
    trackingId: string;
  };
}

export interface ResumeContent {
  personalInfo: PersonalInfo;
  sections: Record<TemplateSectionType, SectionContent>;
  customSections?: CustomSection[];
}

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  photo?: string;
}

export interface SectionContent {
  title: string;
  content: any; // Flexible content structure
  visible: boolean;
  order: number;
  customization?: SectionCustomization;
}

export interface CustomSection {
  id: string;
  title: string;
  content: any;
  type: 'text' | 'list' | 'table' | 'chart';
  order: number;
}

export interface SectionCustomization {
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  color?: string;
  backgroundColor?: string;
  spacing?: number;
  alignment?: 'left' | 'center' | 'right';
}

export interface TemplateValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
  atsCompatibility: ATSCompatibilityCheck;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  impact: 'high' | 'medium' | 'low';
  suggestion: string;
}

export interface ValidationSuggestion {
  type: 'content' | 'formatting' | 'structure' | 'ats';
  message: string;
  action: string;
  priority: number;
}

export interface ATSCompatibilityCheck {
  score: number;
  issues: ATSIssue[];
  recommendations: ATSRecommendation[];
  supportedSystems: string[];
}

export interface ATSIssue {
  type: 'formatting' | 'structure' | 'content' | 'technical';
  severity: 'critical' | 'major' | 'minor';
  description: string;
  solution: string;
  affectedSystems: string[];
}

export interface ATSRecommendation {
  category: 'keywords' | 'formatting' | 'structure' | 'content';
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'moderate' | 'complex';
}

// Enums and Union Types
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'executive';

export type TemplateSectionType =
  | 'contact'
  | 'summary'
  | 'objective'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'awards'
  | 'publications'
  | 'languages'
  | 'interests'
  | 'references'
  | 'portfolio'
  | 'volunteer'
  | 'executive-summary'
  | 'case-studies'
  | 'achievements'
  | 'campaigns'
  | 'research'
  | 'patents'
  | 'speaking'
  | 'leadership'
  | 'military'
  | 'custom';

export type LayoutType =
  | 'standard'
  | 'modern'
  | 'creative'
  | 'professional'
  | 'executive'
  | 'academic'
  | 'technical'
  | 'minimalist'
  | 'premium'
  | 'compact'
  | 'two-column'
  | 'three-column'
  | 'sidebar'
  | 'timeline'
  | 'infographic';

export type ColorScheme =
  | 'blue'
  | 'green'
  | 'purple'
  | 'navy'
  | 'gold'
  | 'red'
  | 'teal'
  | 'orange'
  | 'pink'
  | 'gray'
  | 'black'
  | 'custom';

export type TypographyStyle =
  | 'modern'
  | 'traditional'
  | 'elegant'
  | 'clean'
  | 'bold'
  | 'minimal'
  | 'serif'
  | 'sans-serif'
  | 'monospace'
  | 'custom';

export type ExportFormat = 'pdf' | 'docx' | 'html' | 'txt' | 'json' | 'latex' | 'markdown';

export type IndustryType =
  | 'technology'
  | 'healthcare'
  | 'finance'
  | 'marketing'
  | 'engineering'
  | 'education'
  | 'consulting'
  | 'design'
  | 'sales'
  | 'research'
  | 'legal'
  | 'nonprofit'
  | 'government'
  | 'manufacturing'
  | 'retail'
  | 'hospitality'
  | 'media'
  | 'real-estate'
  | 'construction'
  | 'transportation'
  | 'energy'
  | 'agriculture'
  | 'entertainment'
  | 'sports'
  | 'other';

// API Response Types
export interface TemplateAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface TemplateGenerationRequest {
  userProfile: UserProfile;
  targetRole: string;
  targetIndustry: IndustryType;
  experienceLevel: ExperienceLevel;
  preferences: TemplateCustomization;
  content: Partial<ResumeContent>;
  options?: {
    includeAIOptimizations: boolean;
    generateMultipleVariants: boolean;
    optimizeForATS: boolean;
    includeAnalytics: boolean;
  };
}

export interface TemplateGenerationResponse {
  templates: IndustryTemplate[];
  recommendations: AITemplateRecommendation[];
  analytics: TemplateAnalytics[];
  customizations: TemplateCustomization[];
  processingTime: number;
  confidence: number;
}

// Event Types for Template System
export interface TemplateEvent {
  type: TemplateEventType;
  templateId: string;
  userId: string;
  timestamp: string;
  data?: any;
}

export type TemplateEventType =
  | 'template_selected'
  | 'template_customized'
  | 'template_exported'
  | 'template_shared'
  | 'template_rated'
  | 'template_downloaded'
  | 'ai_recommendation_accepted'
  | 'ai_recommendation_rejected'
  | 'customization_applied'
  | 'preview_generated'
  | 'analytics_viewed';

// Utility Types
export type PartialTemplate = Partial<IndustryTemplate>;
export type RequiredTemplateFields = Pick<
  IndustryTemplate,
  'id' | 'name' | 'industry' | 'category'
>;
export type TemplateWithAnalytics = IndustryTemplate & { analytics: TemplateAnalytics };
export type TemplateWithRecommendations = IndustryTemplate & {
  recommendations: AITemplateRecommendation[];
};

// Template Builder Types
export interface TemplateBuilder {
  id: string;
  name: string;
  description: string;
  steps: BuilderStep[];
  currentStep: number;
  progress: number;
  data: Partial<IndustryTemplate>;
  validation: TemplateValidation;
}

export interface BuilderStep {
  id: string;
  title: string;
  description: string;
  component: string;
  required: boolean;
  completed: boolean;
  data?: any;
  validation?: StepValidation;
}

export interface StepValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  canProceed: boolean;
}

// Template Marketplace Types
export interface TemplateMarketplace {
  featured: IndustryTemplate[];
  trending: IndustryTemplate[];
  newReleases: IndustryTemplate[];
  topRated: IndustryTemplate[];
  categories: TemplateCategory[];
  totalTemplates: number;
}

export interface TemplateCollection {
  id: string;
  name: string;
  description: string;
  templates: IndustryTemplate[];
  curator: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// Advanced AI Features
export interface AITemplateGenerator {
  generateFromJobDescription(jobDescription: string): Promise<IndustryTemplate[]>;
  optimizeForIndustry(
    template: IndustryTemplate,
    industry: IndustryType
  ): Promise<IndustryTemplate>;
  personalizeForUser(
    template: IndustryTemplate,
    userProfile: UserProfile
  ): Promise<IndustryTemplate>;
  generateVariants(template: IndustryTemplate, count: number): Promise<IndustryTemplate[]>;
  analyzePerformance(templateId: string): Promise<TemplateAnalytics>;
}

export interface SmartTemplateRecommendations {
  primary: AITemplateRecommendation[];
  alternatives: AITemplateRecommendation[];
  trending: AITemplateRecommendation[];
  personalized: AITemplateRecommendation[];
  industrySpecific: AITemplateRecommendation[];
}

// Integration Types
export interface TemplateIntegration {
  platform: string;
  type: 'import' | 'export' | 'sync';
  config: IntegrationConfig;
  status: 'active' | 'inactive' | 'error';
  lastSync?: string;
}

export interface IntegrationConfig {
  apiKey?: string;
  webhookUrl?: string;
  syncFrequency?: 'realtime' | 'hourly' | 'daily' | 'weekly';
  fieldMapping?: Record<string, string>;
  filters?: TemplateFilter;
}

// Performance and Monitoring
export interface TemplatePerformanceMetrics {
  loadTime: number;
  renderTime: number;
  exportTime: number;
  userSatisfaction: number;
  errorRate: number;
  usageFrequency: number;
}

export interface TemplateMonitoring {
  health: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  errorCount: number;
  activeUsers: number;
  systemLoad: number;
}
