import { type NextRequest, NextResponse } from 'next/server';
import type {
  ExperienceLevel,
  IndustryTemplate,
  IndustryType,
  SmartTemplateRecommendations,
  TemplateAPIResponse,
  UserProfile,
} from '@/lib/types/templates';
import { aiTemplateService } from '@/services/aiTemplateService';

// Mock templates (same as in main route - in production, this would be from database)
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
];

/**
 * POST /api/resume-optimizer/templates/recommendations
 * Generate AI-powered template recommendations based on user profile and job requirements
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<TemplateAPIResponse<SmartTemplateRecommendations>>> {
  try {
    const body = await request.json();

    // Validate required fields
    const { userProfile, targetRole, targetIndustry, experienceLevel } = body;

    if (!userProfile || !targetRole || !targetIndustry || !experienceLevel) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing required fields: userProfile, targetRole, targetIndustry, experienceLevel',
        },
        { status: 400 }
      );
    }

    // Validate user profile structure
    if (!userProfile.id || !userProfile.name || !userProfile.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid user profile: missing id, name, or email',
        },
        { status: 400 }
      );
    }

    // Validate experience level
    const validExperienceLevels: ExperienceLevel[] = ['entry', 'mid', 'senior', 'executive'];
    if (!validExperienceLevels.includes(experienceLevel)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid experience level. Must be one of: ${validExperienceLevels.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Generate AI recommendations
    const recommendations = await aiTemplateService.generateRecommendations(
      userProfile as UserProfile,
      targetRole,
      targetIndustry as IndustryType,
      experienceLevel as ExperienceLevel,
      mockTemplates
    );

    return NextResponse.json({
      success: true,
      data: recommendations,
      message: 'AI recommendations generated successfully',
    });
  } catch (error) {
    console.error('AI template recommendations error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate AI recommendations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/resume-optimizer/templates/recommendations
 * Get cached recommendations or generate new ones based on query parameters
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<TemplateAPIResponse<SmartTemplateRecommendations>>> {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const userProfileParam = searchParams.get('userProfile');
    const targetRole = searchParams.get('targetRole');
    const targetIndustry = searchParams.get('targetIndustry') as IndustryType;
    const experienceLevel = searchParams.get('experienceLevel') as ExperienceLevel;
    const jobDescription = searchParams.get('jobDescription');

    if (!userProfileParam || !targetRole || !targetIndustry || !experienceLevel) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing required query parameters: userProfile, targetRole, targetIndustry, experienceLevel',
        },
        { status: 400 }
      );
    }

    let userProfile: UserProfile;
    try {
      userProfile = JSON.parse(decodeURIComponent(userProfileParam));
    } catch (_error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid userProfile parameter: must be valid JSON',
        },
        { status: 400 }
      );
    }

    let recommendations: SmartTemplateRecommendations;

    // If job description is provided, analyze it for recommendations
    if (jobDescription) {
      const jobRecommendations = await aiTemplateService.analyzeJobDescriptionForTemplates(
        decodeURIComponent(jobDescription),
        mockTemplates
      );

      // Convert to SmartTemplateRecommendations format
      recommendations = {
        primary: jobRecommendations.slice(0, 3),
        alternatives: jobRecommendations.slice(3, 5),
        trending: [],
        personalized: [],
        industrySpecific: [],
      };
    } else {
      // Generate standard recommendations
      recommendations = await aiTemplateService.generateRecommendations(
        userProfile,
        targetRole,
        targetIndustry,
        experienceLevel,
        mockTemplates
      );
    }

    return NextResponse.json({
      success: true,
      data: recommendations,
      message: 'Recommendations retrieved successfully',
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get recommendations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/resume-optimizer/templates/recommendations
 * Update recommendation preferences and regenerate recommendations
 */
export async function PUT(
  request: NextRequest
): Promise<NextResponse<TemplateAPIResponse<SmartTemplateRecommendations>>> {
  try {
    const body = await request.json();
    const { userProfile, preferences, targetRole, targetIndustry, experienceLevel } = body;

    if (!userProfile || !targetRole || !targetIndustry || !experienceLevel) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // Update user preferences (in production, this would update the database)
    const updatedUserProfile: UserProfile = {
      ...userProfile,
      preferences: {
        ...userProfile.preferences,
        ...preferences,
      },
    };

    // Regenerate recommendations with updated preferences
    const recommendations = await aiTemplateService.generateRecommendations(
      updatedUserProfile,
      targetRole,
      targetIndustry as IndustryType,
      experienceLevel as ExperienceLevel,
      mockTemplates
    );

    return NextResponse.json({
      success: true,
      data: recommendations,
      message: 'Recommendations updated successfully',
    });
  } catch (error) {
    console.error('Update recommendations error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update recommendations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
