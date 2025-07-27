import { useCallback, useEffect, useState } from 'react';
import type {
  ApplicationTemplate,
  TemplateSearchResult,
  UseApplicationTemplatesOptions,
  UseApplicationTemplatesResult,
} from '@/lib/types/application-templates';

// Mock data for templates
const mockTemplates: ApplicationTemplate[] = [
  {
    id: '1',
    title: 'Modern Software Engineer Resume',
    description: 'A clean, modern template perfect for software engineers and developers.',
    category: 'tech',
    tags: ['software', 'engineering', 'modern', 'clean'],
    difficulty: 'intermediate',
    estimatedTime: '30 minutes',
    popularity: 95,
    rating: 4.8,
    reviewCount: 234,
    thumbnail: '/templates/tech-modern.jpg',
    preview: '/templates/tech-modern-preview.jpg',
    content: {
      sections: [
        {
          id: 'header',
          type: 'header',
          title: 'Header',
          content: 'Name, contact information, and professional title',
          order: 1,
          required: true,
          customizable: true,
        },
        {
          id: 'summary',
          type: 'summary',
          title: 'Professional Summary',
          content: 'Brief overview of your experience and skills',
          order: 2,
          required: true,
          customizable: true,
        },
      ],
      styling: {
        layout: 'two-column',
        colorScheme: 'blue',
        fontFamily: 'sans-serif',
        spacing: 'normal',
      },
    },
    metadata: {
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z',
      author: 'SwipeHire Team',
      version: '1.2',
    },
  },
  {
    id: '2',
    title: 'Creative Designer Portfolio',
    description: 'Showcase your creative work with this visually stunning template.',
    category: 'design',
    tags: ['creative', 'portfolio', 'visual', 'artistic'],
    difficulty: 'advanced',
    estimatedTime: '45 minutes',
    popularity: 87,
    rating: 4.6,
    reviewCount: 156,
    thumbnail: '/templates/design-creative.jpg',
    preview: '/templates/design-creative-preview.jpg',
    content: {
      sections: [
        {
          id: 'header',
          type: 'header',
          title: 'Header',
          content: 'Name, contact information, and creative title',
          order: 1,
          required: true,
          customizable: true,
        },
      ],
      styling: {
        layout: 'modern',
        colorScheme: 'purple',
        fontFamily: 'modern',
        spacing: 'spacious',
      },
    },
    metadata: {
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-18T00:00:00Z',
      author: 'Design Team',
      version: '1.0',
    },
  },
  {
    id: '3',
    title: 'Marketing Professional Resume',
    description: 'Perfect for marketing professionals looking to showcase their campaigns.',
    category: 'marketing',
    tags: ['marketing', 'campaigns', 'professional', 'results'],
    difficulty: 'beginner',
    estimatedTime: '25 minutes',
    popularity: 78,
    rating: 4.4,
    reviewCount: 89,
    thumbnail: '/templates/marketing-pro.jpg',
    preview: '/templates/marketing-pro-preview.jpg',
    content: {
      sections: [
        {
          id: 'header',
          type: 'header',
          title: 'Header',
          content: 'Name, contact information, and marketing title',
          order: 1,
          required: true,
          customizable: true,
        },
      ],
      styling: {
        layout: 'single-column',
        colorScheme: 'orange',
        fontFamily: 'sans-serif',
        spacing: 'normal',
      },
    },
    metadata: {
      createdAt: '2024-01-12T00:00:00Z',
      updatedAt: '2024-01-16T00:00:00Z',
      author: 'Marketing Team',
      version: '1.1',
    },
  },
  {
    id: '4',
    title: 'Sales Executive Template',
    description: 'Highlight your sales achievements and track record.',
    category: 'sales',
    tags: ['sales', 'executive', 'achievements', 'results'],
    difficulty: 'intermediate',
    estimatedTime: '35 minutes',
    popularity: 82,
    rating: 4.5,
    reviewCount: 127,
    thumbnail: '/templates/sales-exec.jpg',
    preview: '/templates/sales-exec-preview.jpg',
    content: {
      sections: [
        {
          id: 'header',
          type: 'header',
          title: 'Header',
          content: 'Name, contact information, and sales title',
          order: 1,
          required: true,
          customizable: true,
        },
      ],
      styling: {
        layout: 'two-column',
        colorScheme: 'green',
        fontFamily: 'sans-serif',
        spacing: 'compact',
      },
    },
    metadata: {
      createdAt: '2024-01-08T00:00:00Z',
      updatedAt: '2024-01-14T00:00:00Z',
      author: 'Sales Team',
      version: '1.0',
    },
  },
  {
    id: '5',
    title: 'Remote Work Specialist',
    description: 'Optimized for remote work positions and digital nomads.',
    category: 'remote',
    tags: ['remote', 'digital', 'nomad', 'flexible'],
    difficulty: 'beginner',
    estimatedTime: '20 minutes',
    popularity: 91,
    rating: 4.7,
    reviewCount: 203,
    thumbnail: '/templates/remote-work.jpg',
    preview: '/templates/remote-work-preview.jpg',
    content: {
      sections: [
        {
          id: 'header',
          type: 'header',
          title: 'Header',
          content: 'Name, contact information, and remote work title',
          order: 1,
          required: true,
          customizable: true,
        },
      ],
      styling: {
        layout: 'modern',
        colorScheme: 'blue',
        fontFamily: 'modern',
        spacing: 'normal',
      },
    },
    metadata: {
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-22T00:00:00Z',
      author: 'Remote Team',
      version: '1.3',
    },
  },
  {
    id: '6',
    title: 'Startup Founder Resume',
    description: 'Perfect for entrepreneurs and startup founders.',
    category: 'startup',
    tags: ['startup', 'founder', 'entrepreneur', 'innovation'],
    difficulty: 'advanced',
    estimatedTime: '40 minutes',
    popularity: 73,
    rating: 4.3,
    reviewCount: 67,
    thumbnail: '/templates/startup-founder.jpg',
    preview: '/templates/startup-founder-preview.jpg',
    content: {
      sections: [
        {
          id: 'header',
          type: 'header',
          title: 'Header',
          content: 'Name, contact information, and founder title',
          order: 1,
          required: true,
          customizable: true,
        },
      ],
      styling: {
        layout: 'modern',
        colorScheme: 'red',
        fontFamily: 'modern',
        spacing: 'spacious',
      },
    },
    metadata: {
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-19T00:00:00Z',
      author: 'Startup Team',
      version: '1.1',
    },
  },
];

const filterTemplates = (
  templates: ApplicationTemplate[],
  options: UseApplicationTemplatesOptions
): ApplicationTemplate[] => {
  let filtered = [...templates];

  // Apply filters
  if (options.filters) {
    const { category, tags, search, difficulty, minRating } = options.filters;

    if (category && category !== 'all') {
      filtered = filtered.filter((template) => template.category === category);
    }

    if (tags.length > 0) {
      filtered = filtered.filter((template) => tags.some((tag) => template.tags.includes(tag)));
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (template) =>
          template.title.toLowerCase().includes(searchLower) ||
          template.description.toLowerCase().includes(searchLower) ||
          template.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    if (difficulty) {
      filtered = filtered.filter((template) => template.difficulty === difficulty);
    }

    if (minRating) {
      filtered = filtered.filter((template) => template.rating >= minRating);
    }
  }

  // Apply sorting
  const sortBy = options.sortBy || 'popularity';
  const sortOrder = options.sortOrder || 'desc';

  filtered.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'popularity':
        comparison = a.popularity - b.popularity;
        break;
      case 'rating':
        comparison = a.rating - b.rating;
        break;
      case 'recent':
        comparison =
          new Date(a.metadata.updatedAt).getTime() - new Date(b.metadata.updatedAt).getTime();
        break;
      case 'alphabetical':
        comparison = a.title.localeCompare(b.title);
        break;
      default:
        comparison = 0;
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });

  return filtered;
};

const paginateResults = (
  templates: ApplicationTemplate[],
  page: number,
  limit: number
): { templates: ApplicationTemplate[]; pagination: TemplateSearchResult['pagination'] } => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedTemplates = templates.slice(startIndex, endIndex);

  return {
    templates: paginatedTemplates,
    pagination: {
      page,
      limit,
      total: templates.length,
      pages: Math.ceil(templates.length / limit),
    },
  };
};

export function useApplicationTemplates(
  options: UseApplicationTemplatesOptions = {}
): UseApplicationTemplatesResult {
  const [data, setData] = useState<TemplateSearchResult | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTemplates = useCallback(async () => {
    if (options.enabled === false) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      const page = options.page || 1;
      const limit = options.limit || 12;

      // Filter templates based on options
      const filteredTemplates = filterTemplates(mockTemplates, options);

      // Paginate results
      const { templates, pagination } = paginateResults(filteredTemplates, page, limit);

      // Get available tags and categories for filters
      const availableTags = Array.from(
        new Set(mockTemplates.flatMap((template) => template.tags))
      ).sort();

      const result: TemplateSearchResult = {
        templates,
        pagination,
        filters: {
          availableTags,
          categories: [
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
          ],
        },
      };

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch templates'));
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const refetch = useCallback(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
