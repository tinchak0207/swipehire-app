/**
 * Portfolio Showcase Feature - TypeScript Types & Interfaces
 *
 * This file defines all the core types and interfaces for the Portfolio feature,
 * following strict TypeScript practices with comprehensive JSDoc documentation.
 */

/**
 * Represents different types of media that can be included in a portfolio project.
 * Uses discriminated union pattern for type safety.
 */
export type Media = ImageMedia | VideoMedia | AudioMedia;

/**
 * Image media type with required alt text for accessibility.
 */
export interface ImageMedia {
  type: 'image';
  url: string;
  alt: string;
  width?: number;
  height?: number;
  size?: number; // File size in bytes
}

/**
 * Video media type with optional poster image.
 */
export interface VideoMedia {
  type: 'video';
  url: string;
  poster?: string;
  duration?: number; // Duration in seconds
  size?: number; // File size in bytes
}

/**
 * Audio media type for audio files.
 */
export interface AudioMedia {
  type: 'audio';
  url: string;
  duration?: number; // Duration in seconds
  size?: number; // File size in bytes
}

/**
 * External link types for portfolio projects.
 * Supports common platforms and a generic 'other' type.
 */
export interface ExternalLink {
  type: 'github' | 'demo' | 'behance' | 'dribbble' | 'linkedin' | 'website' | 'other';
  url: string;
  label: string;
}

/**
 * Portfolio layout options for different display styles.
 */
export type PortfolioLayout = 'grid' | 'list' | 'carousel' | 'masonry';

/**
 * Statistics tracking for portfolio engagement.
 */
export interface PortfolioStats {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  lastViewed: string; // ISO date string
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
}

/**
 * Comment on a portfolio or project.
 */
export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  likes: number;
  replies?: Comment[];
}

/**
 * Individual project within a portfolio.
 */
export interface Project {
  id: string;
  title: string;
  description: string;
  media: Media[];
  links: ExternalLink[];
  tags: string[];
  order: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  comments: Comment[];
  likes: number;
  isPublished: boolean;
  technologies?: string[]; // Technologies used in the project
  duration: string; // Project duration (e.g., "3 months")
  role: string; // User's role in the project
}

/**
 * Main portfolio interface containing all portfolio data.
 */
export interface Portfolio {
  id: string;
  userId: string;
  title: string;
  description: string;
  projects: Project[];
  layout: PortfolioLayout;
  tags: string[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  stats: PortfolioStats;
  isPublished: boolean;
  visibility: 'public' | 'private' | 'unlisted';
  url: string; // Public URL slug
  theme: string; // Theme/color scheme
  customCss: string; // Custom CSS for advanced users
  seoTitle: string; // SEO optimized title
  seoDescription: string; // SEO optimized description
  socialImage: string; // Social sharing image URL
}

/**
 * Portfolio creation/update request payload.
 * Omits server-generated fields like id, createdAt, etc.
 */
export interface CreatePortfolioRequest {
  title: string;
  description: string;
  projects: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'likes'>[];
  layout: PortfolioLayout;
  tags: string[];
  isPublished: boolean;
  url: string;
  theme?: string;
  customCss?: string;
  seoTitle?: string;
  seoDescription?: string;
  socialImage?: string;
}

/**
 * Portfolio update request payload.
 * All fields are optional for partial updates.
 */
export interface UpdatePortfolioRequest {
  title?: string;
  description?: string;
  projects?: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'likes'>[];
  layout?: PortfolioLayout;
  tags?: string[];
  isPublished?: boolean;
  visibility?: 'public' | 'private' | 'unlisted';
  url?: string;
  theme?: string;
  customCss?: string;
  seoTitle?: string;
  seoDescription?: string;
  socialImage?: string;
}

/**
 * Project creation/update request payload.
 */
export interface CreateProjectRequest {
  title: string;
  description: string;
  media: Media[];
  links: ExternalLink[];
  tags: string[];
  order: number;
  isPublished: boolean;
  technologies?: string[];
  duration: string;
  role: string;
}

/**
 * Media upload response from the server.
 */
export interface MediaUploadResponse {
  url: string;
  type: Media['type'];
  size: number;
  width?: number;
  height?: number;
  duration?: number;
}

/**
 * Portfolio search/filter parameters.
 */
export interface PortfolioSearchParams {
  query?: string;
  tags?: string[];
  layout?: PortfolioLayout;
  isPublished?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'views' | 'likes' | 'title';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Portfolio list response with pagination.
 */
export type PortfolioListResponse = Portfolio[];

/**
 * Error response structure for API endpoints.
 */
export interface PortfolioError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Portfolio analytics data for dashboard.
 */
export interface PortfolioAnalytics {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  viewsThisMonth: number;
  likesThisMonth: number;
  topPerformingPortfolio: Portfolio | null;
  recentActivity: {
    type: 'view' | 'like' | 'comment' | 'share';
    portfolioId: string;
    portfolioTitle: string;
    timestamp: string;
    userId?: string;
    userName?: string;
  }[];
}

/**
 * Portfolio theme configuration.
 */
export interface PortfolioTheme {
  id: string;
  name: string;
  description: string;
  preview: string; // Preview image URL
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
    base: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  customCss?: string;
}

/**
 * Portfolio sharing options.
 */
export interface PortfolioShareOptions {
  platform: 'twitter' | 'linkedin' | 'facebook' | 'email' | 'copy';
  url: string;
  title: string;
  description: string;
  image?: string;
}

/**
 * Type guards for media types.
 */
export const isImageMedia = (media: Media): media is ImageMedia => {
  return media.type === 'image';
};

export const isVideoMedia = (media: Media): media is VideoMedia => {
  return media.type === 'video';
};

export const isAudioMedia = (media: Media): media is AudioMedia => {
  return media.type === 'audio';
};

/**
 * Utility type for portfolio draft state in the editor.
 */
export interface PortfolioDraft
  extends Omit<
    Portfolio,
    | 'id'
    | 'userId'
    | 'createdAt'
    | 'updatedAt'
    | 'stats'
    | 'theme'
    | 'customCss'
    | 'seoTitle'
    | 'seoDescription'
    | 'socialImage'
  > {
  id?: string; // Optional for new portfolios
  theme?: string; // Make theme optional in draft
  customCss?: string; // Make customCss optional in draft
  seoTitle?: string; // Make seoTitle optional in draft
  seoDescription?: string; // Make seoDescription optional in draft
  socialImage?: string; // Make socialImage optional in draft
  isDirty: boolean; // Tracks if there are unsaved changes
  lastSaved?: string; // ISO date string of last save
}

/**
 * Project draft state for the project editor.
 */
export interface ProjectDraft
  extends Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'likes' | 'duration'> {
  id?: string; // Optional for new projects
  duration?: string; // Make duration optional in draft
  isDirty: boolean;
}

/**
 * Portfolio validation errors.
 */
export interface PortfolioValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Portfolio export formats.
 */
export type PortfolioExportFormat = 'pdf' | 'html' | 'json';

/**
 * Portfolio import data structure.
 */
export interface PortfolioImportData {
  format: 'json' | 'behance' | 'dribbble';
  data: unknown;
}

/**
 * Portfolio template for quick creation.
 */
export interface PortfolioTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: 'design' | 'development' | 'photography' | 'writing' | 'general';
  layout: PortfolioLayout;
  theme: string;
  sampleProjects: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'likes'>[];
}

/**
 * Additional type exports for API compatibility
 */

// Request/Response types for API endpoints
export interface PortfolioRequest extends CreatePortfolioRequest {}

export interface PortfolioResponse {
  success: boolean;
  data?: Portfolio;
  message?: string;
  error?: string;
}

export interface PartialPortfolioUpdate extends UpdatePortfolioRequest {}

export interface PortfolioFilters extends PortfolioSearchParams {}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
