export type TemplateCategory =
  | 'all'
  | 'tech'
  | 'design'
  | 'marketing'
  | 'sales'
  | 'finance'
  | 'healthcare'
  | 'education'
  | 'legal'
  | 'consulting'
  | 'startup'
  | 'remote';

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  'all',
  'tech',
  'design',
  'marketing',
  'sales',
  'finance',
  'healthcare',
  'education',
  'legal',
  'consulting',
  'startup',
  'remote',
];

export const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  all: 'All Templates',
  tech: 'Technology',
  design: 'Design',
  marketing: 'Marketing',
  sales: 'Sales',
  finance: 'Finance',
  healthcare: 'Healthcare',
  education: 'Education',
  legal: 'Legal',
  consulting: 'Consulting',
  startup: 'Startup',
  remote: 'Remote Work',
};

export interface ApplicationTemplate {
  id: string;
  title: string;
  description: string;
  category: TemplateCategory;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  popularity: number;
  rating: number;
  reviewCount: number;
  thumbnail: string;
  preview: string;
  content: {
    sections: TemplateSection[];
    styling: TemplateStyle;
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    author: string;
    version: string;
  };
}

export interface TemplateSection {
  id: string;
  type: 'header' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'custom';
  title: string;
  content: string;
  order: number;
  required: boolean;
  customizable: boolean;
}

export interface TemplateStyle {
  layout: 'single-column' | 'two-column' | 'modern' | 'classic';
  colorScheme: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'neutral';
  fontFamily: 'sans-serif' | 'serif' | 'modern';
  spacing: 'compact' | 'normal' | 'spacious';
}

export interface TemplateFilters {
  category?: TemplateCategory;
  tags: string[];
  search: string;
  difficulty?: ApplicationTemplate['difficulty'] | undefined;
  minRating?: number | undefined;
}

export interface TemplateSearchParams {
  page?: number;
  limit?: number;
  sortBy?: 'popularity' | 'rating' | 'recent' | 'alphabetical';
  sortOrder?: 'asc' | 'desc';
  filters?: TemplateFilters;
}

export interface TemplateSearchResult {
  templates: ApplicationTemplate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: {
    availableTags: string[];
    categories: TemplateCategory[];
  };
}

export interface UseApplicationTemplatesOptions extends TemplateSearchParams {
  enabled?: boolean;
}

export interface UseApplicationTemplatesResult {
  data: TemplateSearchResult | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
