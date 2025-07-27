import { type NextRequest, NextResponse } from 'next/server';
import type {
  ExperienceLevel,
  IndustryTemplate,
  IndustryType,
  TemplateAPIResponse,
  TemplateSearchResult,
  UserProfile,
} from '@/lib/types/templates';
import { aiTemplateService } from '@/services/aiTemplateService';

// Mock template data - in production, this would come from a database
const mockTemplates: IndustryTemplate[] = [
  {
    id: 'tech-swe-modern',
    name: 'Modern Software Engineer',
    industry: 'technology',
    category: 'engineering',
    experienceLevel: ['mid', 'senior'],
    description:
      'Clean, technical resume optimized for software engineering roles at top tech companies',
    features: [
      'ATS-optimized',
      'Technical skills showcase',
      'Project highlights',
      'GitHub integration',
    ],
    atsScore: 95,
    popularity: 4.8,
    usageCount: 15420,
    previewUrl: '/templates/previews/tech-swe-modern.png',
    tags: ['react', 'python', 'aws', 'agile', 'microservices'],
    aiOptimized: true,
    customizable: true,
    sections: ['contact', 'summary', 'experience', 'projects', 'skills', 'education'],
    layout: 'modern',
    colorScheme: 'blue',
    typography: 'clean',
  },
  {
    id: 'healthcare-nurse-professional',
    name: 'Professional Healthcare',
    industry: 'healthcare',
    category: 'clinical',
    experienceLevel: ['entry', 'mid', 'senior'],
    description:
      'Professional template for healthcare professionals emphasizing certifications and patient care',
    features: [
      'Certification highlights',
      'Clinical experience focus',
      'Patient care metrics',
      'Compliance ready',
    ],
    atsScore: 92,
    popularity: 4.7,
    usageCount: 8930,
    previewUrl: '/templates/previews/healthcare-nurse-professional.png',
    tags: ['nursing', 'patient-care', 'certifications', 'clinical-skills'],
    aiOptimized: true,
    customizable: true,
    sections: ['contact', 'summary', 'experience', 'certifications', 'education', 'skills'],
    layout: 'professional',
    colorScheme: 'green',
    typography: 'traditional',
  },
  {
    id: 'finance-analyst-executive',
    name: 'Executive Finance',
    industry: 'finance',
    category: 'analysis',
    experienceLevel: ['senior', 'executive'],
    description: 'Sophisticated template for finance executives and senior analysts',
    features: [
      'Financial metrics focus',
      'Leadership highlights',
      'ROI achievements',
      'Executive summary',
    ],
    atsScore: 94,
    popularity: 4.9,
    usageCount: 6750,
    previewUrl: '/templates/previews/finance-analyst-executive.png',
    tags: ['financial-analysis', 'leadership', 'roi', 'strategic-planning'],
    aiOptimized: true,
    customizable: true,
    sections: ['contact', 'executive-summary', 'experience', 'achievements', 'education', 'skills'],
    layout: 'executive',
    colorScheme: 'navy',
    typography: 'elegant',
  },
  {
    id: 'marketing-creative-modern',
    name: 'Creative Marketing',
    industry: 'marketing',
    category: 'creative',
    experienceLevel: ['entry', 'mid'],
    description: 'Eye-catching template for marketing professionals with creative flair',
    features: [
      'Campaign showcases',
      'Creative portfolio',
      'Metrics dashboard',
      'Brand storytelling',
    ],
    atsScore: 88,
    popularity: 4.6,
    usageCount: 12340,
    previewUrl: '/templates/previews/marketing-creative-modern.png',
    tags: ['digital-marketing', 'campaigns', 'analytics', 'creative'],
    aiOptimized: true,
    customizable: true,
    sections: ['contact', 'summary', 'experience', 'campaigns', 'skills', 'portfolio'],
    layout: 'creative',
    colorScheme: 'purple',
    typography: 'modern',
  },
  {
    id: 'consulting-strategy-premium',
    name: 'Strategy Consultant',
    industry: 'consulting',
    category: 'strategy',
    experienceLevel: ['mid', 'senior', 'executive'],
    description: 'Premium template for management consultants and strategy professionals',
    features: [
      'Case study highlights',
      'Client impact metrics',
      'Problem-solving focus',
      'Global experience',
    ],
    atsScore: 96,
    popularity: 4.9,
    usageCount: 4560,
    previewUrl: '/templates/previews/consulting-strategy-premium.png',
    tags: ['strategy', 'consulting', 'case-studies', 'client-impact'],
    aiOptimized: true,
    customizable: true,
    sections: ['contact', 'summary', 'experience', 'case-studies', 'education', 'skills'],
    layout: 'premium',
    colorScheme: 'gold',
    typography: 'elegant',
  },
  {
    id: 'design-ux-creative',
    name: 'UX Designer Portfolio',
    industry: 'design',
    category: 'creative',
    experienceLevel: ['entry', 'mid', 'senior'],
    description: 'Creative template showcasing design thinking and user experience expertise',
    features: [
      'Portfolio integration',
      'Design process showcase',
      'User research highlights',
      'Visual storytelling',
    ],
    atsScore: 85,
    popularity: 4.5,
    usageCount: 9870,
    previewUrl: '/templates/previews/design-ux-creative.png',
    tags: ['ux-design', 'portfolio', 'user-research', 'prototyping', 'figma'],
    aiOptimized: true,
    customizable: true,
    sections: ['contact', 'summary', 'experience', 'portfolio', 'skills', 'education'],
    layout: 'creative',
    colorScheme: 'purple',
    typography: 'modern',
  },
  {
    id: 'sales-executive-results',
    name: 'Results-Driven Sales',
    industry: 'sales',
    category: 'business',
    experienceLevel: ['mid', 'senior', 'executive'],
    description:
      'High-impact template for sales professionals emphasizing achievements and metrics',
    features: [
      'Revenue highlights',
      'Achievement metrics',
      'Client testimonials',
      'Territory management',
    ],
    atsScore: 91,
    popularity: 4.7,
    usageCount: 7650,
    previewUrl: '/templates/previews/sales-executive-results.png',
    tags: ['sales', 'revenue', 'b2b', 'client-management', 'territory'],
    aiOptimized: true,
    customizable: true,
    sections: ['contact', 'summary', 'experience', 'achievements', 'skills', 'education'],
    layout: 'professional',
    colorScheme: 'green',
    typography: 'bold',
  },
  {
    id: 'education-teacher-academic',
    name: 'Academic Educator',
    industry: 'education',
    category: 'academic',
    experienceLevel: ['entry', 'mid', 'senior'],
    description:
      'Professional template for educators highlighting teaching philosophy and student outcomes',
    features: [
      'Teaching philosophy',
      'Student outcomes',
      'Curriculum development',
      'Research highlights',
    ],
    atsScore: 89,
    popularity: 4.4,
    usageCount: 5430,
    previewUrl: '/templates/previews/education-teacher-academic.png',
    tags: ['teaching', 'curriculum', 'student-outcomes', 'research', 'education'],
    aiOptimized: true,
    customizable: true,
    sections: ['contact', 'summary', 'experience', 'education', 'research', 'skills'],
    layout: 'academic',
    colorScheme: 'blue',
    typography: 'traditional',
  },
];

/**
 * GET /api/resume-optimizer/templates
 * Returns available resume templates with optional filtering and AI recommendations
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<TemplateAPIResponse<TemplateSearchResult>>> {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const search = searchParams.get('search') || '';
    const industry = searchParams.get('industry') as IndustryType | null;
    const experienceLevel = searchParams.get('experienceLevel') as ExperienceLevel | null;
    const category = searchParams.get('category') || '';
    const minAtsScore = parseInt(searchParams.get('minAtsScore') || '0');
    const aiOptimized = searchParams.get('aiOptimized') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const includeRecommendations = searchParams.get('includeRecommendations') === 'true';

    // User profile for AI recommendations (would come from auth in production)
    const userProfileParam = searchParams.get('userProfile');
    let userProfile: UserProfile | null = null;
    if (userProfileParam) {
      try {
        userProfile = JSON.parse(decodeURIComponent(userProfileParam));
      } catch (error) {
        console.warn('Invalid user profile parameter:', error);
      }
    }

    // Filter templates
    let filteredTemplates = mockTemplates;

    if (search) {
      const searchLower = search.toLowerCase();
      filteredTemplates = filteredTemplates.filter(
        (template) =>
          template.name.toLowerCase().includes(searchLower) ||
          template.description.toLowerCase().includes(searchLower) ||
          template.industry.toLowerCase().includes(searchLower) ||
          template.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    if (industry) {
      filteredTemplates = filteredTemplates.filter((t) => t.industry === industry);
    }

    if (experienceLevel) {
      filteredTemplates = filteredTemplates.filter((t) =>
        t.experienceLevel.includes(experienceLevel)
      );
    }

    if (category) {
      filteredTemplates = filteredTemplates.filter((t) => t.category === category);
    }

    if (minAtsScore > 0) {
      filteredTemplates = filteredTemplates.filter((t) => t.atsScore >= minAtsScore);
    }

    if (aiOptimized) {
      filteredTemplates = filteredTemplates.filter((t) => t.aiOptimized);
    }

    // Sort by popularity and ATS score
    filteredTemplates.sort((a, b) => {
      const scoreA = a.popularity * 0.6 + a.atsScore * 0.004;
      const scoreB = b.popularity * 0.6 + b.atsScore * 0.004;
      return scoreB - scoreA;
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTemplates = filteredTemplates.slice(startIndex, endIndex);

    // Generate facets for filtering
    const facets = {
      industries: generateFacets(mockTemplates, 'industry'),
      experienceLevel: generateFacets(mockTemplates, 'experienceLevel', true),
      features: generateFacets(mockTemplates, 'features', true),
      layouts: generateFacets(mockTemplates, 'layout'),
    };

    const result: TemplateSearchResult = {
      templates: paginatedTemplates,
      totalCount: filteredTemplates.length,
      facets,
      suggestions: generateSearchSuggestions(search, mockTemplates),
    };

    // Generate AI recommendations if requested and user profile is provided
    if (includeRecommendations && userProfile && industry && experienceLevel) {
      try {
        const targetRole = searchParams.get('targetRole') || 'Professional';
        const recommendations = await aiTemplateService.generateRecommendations(
          userProfile,
          targetRole,
          industry,
          experienceLevel,
          mockTemplates
        );

        // Add AI recommendations to the response
        (result as any).aiRecommendations = recommendations;
      } catch (error) {
        console.error('Failed to generate AI recommendations:', error);
        // Continue without recommendations
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        total: filteredTemplates.length,
        page,
        limit,
        hasMore: endIndex < filteredTemplates.length,
      },
    });
  } catch (error) {
    console.error('Template search error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search templates',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/resume-optimizer/templates
 * Creates a new resume template (admin functionality)
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<TemplateAPIResponse<IndustryTemplate>>> {
  try {
    const templateData: Partial<IndustryTemplate> = await request.json();

    // Validate required fields
    if (!templateData.name || !templateData.industry || !templateData.category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, industry, category',
        },
        { status: 400 }
      );
    }

    // Generate new template
    const newTemplate: IndustryTemplate = {
      id: `template_${Date.now()}`,
      name: templateData.name,
      industry: templateData.industry,
      category: templateData.category,
      experienceLevel: templateData.experienceLevel || ['entry', 'mid'],
      description: templateData.description || '',
      features: templateData.features || [],
      atsScore: templateData.atsScore || 85,
      popularity: 0,
      usageCount: 0,
      previewUrl: templateData.previewUrl || '/templates/previews/default.png',
      tags: templateData.tags || [],
      aiOptimized: templateData.aiOptimized || false,
      customizable: templateData.customizable || true,
      sections: templateData.sections || [
        'contact',
        'summary',
        'experience',
        'education',
        'skills',
      ],
      layout: templateData.layout || 'standard',
      colorScheme: templateData.colorScheme || 'blue',
      typography: templateData.typography || 'modern',
    };

    // In production, save to database
    mockTemplates.push(newTemplate);

    return NextResponse.json({
      success: true,
      data: newTemplate,
      message: 'Template created successfully',
    });
  } catch (error) {
    console.error('Template creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create template',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Helper functions
function generateFacets(
  templates: IndustryTemplate[],
  field: keyof IndustryTemplate,
  isArray = false
): any[] {
  const counts = new Map<string, number>();

  templates.forEach((template) => {
    const value = template[field];
    if (isArray && Array.isArray(value)) {
      value.forEach((item) => {
        counts.set(item, (counts.get(item) || 0) + 1);
      });
    } else if (typeof value === 'string') {
      counts.set(value, (counts.get(value) || 0) + 1);
    }
  });

  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count, selected: false }))
    .sort((a, b) => b.count - a.count);
}

function generateSearchSuggestions(query: string, templates: IndustryTemplate[]): string[] {
  if (!query || query.length < 2) return [];

  const suggestions = new Set<string>();
  const queryLower = query.toLowerCase();

  templates.forEach((template) => {
    // Add industry suggestions
    if (template.industry.toLowerCase().includes(queryLower)) {
      suggestions.add(template.industry);
    }

    // Add tag suggestions
    template.tags.forEach((tag) => {
      if (tag.toLowerCase().includes(queryLower)) {
        suggestions.add(tag);
      }
    });

    // Add name suggestions
    if (template.name.toLowerCase().includes(queryLower)) {
      suggestions.add(template.name);
    }
  });

  return Array.from(suggestions).slice(0, 5);
}
