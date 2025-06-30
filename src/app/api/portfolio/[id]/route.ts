/**
 * Individual Portfolio API Routes - CRUD Operations for specific portfolios
 *
 * Implements GET, PUT, and DELETE operations for individual portfolios
 * with proper validation, authentication, and error handling.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Portfolio, Project } from '@/lib/types/portfolio';

// Validation schema for portfolio updates
const portfolioUpdateSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters')
    .optional(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  projects: z
    .array(
      z.object({
        id: z.string().optional(),
        title: z.string().min(1, 'Project title is required'),
        description: z.string().min(1, 'Project description is required'),
        media: z.array(
          z.object({
            type: z.enum(['image', 'video', 'audio']),
            url: z.string().url('Invalid media URL'),
            alt: z.string().optional(),
            poster: z.string().url().optional(),
            duration: z.number().optional(),
            size: z.number().optional(),
            width: z.number().optional(),
            height: z.number().optional(),
          })
        ),
        links: z.array(
          z.object({
            type: z.enum(['github', 'demo', 'behance', 'dribbble', 'linkedin', 'website', 'other']),
            url: z.string().url('Invalid link URL'),
            label: z.string().min(1, 'Link label is required'),
            icon: z.string().optional(),
          })
        ),
        tags: z.array(z.string()),
        order: z.number().int().min(0),
        featured: z.boolean(),
        status: z.enum(['draft', 'published', 'archived']),
      })
    )
    .optional(),
  layout: z.enum(['grid', 'list', 'carousel', 'masonry']).optional(),
  theme: z.enum(['light', 'dark', 'auto', 'colorful', 'minimal']).optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  visibility: z.enum(['public', 'private', 'unlisted']).optional(),
  url: z
    .string()
    .min(1, 'URL slug is required')
    .regex(/^[a-z0-9-]+$/, 'URL must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  customCss: z.string().optional(),
  customDomain: z.string().url().optional(),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  socialImage: z.string().url().optional(),
});

// Mock database - In production, replace with actual database operations
// This should be shared with the main route.ts file
let portfolios: Portfolio[] = [];

/**
 * Authentication middleware - checks for valid user session
 */
async function authenticateUser(request: NextRequest): Promise<string | null> {
  // TODO: Implement actual authentication logic
  // For now, return a mock user ID
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  // Mock user ID - replace with actual JWT validation
  return 'user-123';
}

/**
 * Find portfolio by ID and verify ownership
 */
function findPortfolioByIdAndUser(portfolioId: string, userId: string): Portfolio | null {
  return portfolios.find((p) => p.id === portfolioId && p.userId === userId) || null;
}

/**
 * Find portfolio by ID (for public access)
 */
function findPortfolioById(portfolioId: string): Portfolio | null {
  return portfolios.find((p) => p.id === portfolioId) || null;
}

/**
 * GET /api/portfolio/[id] - Get specific portfolio
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: portfolioId } = await params;

    // Check if this is a public request (no auth header) or authenticated request
    const userId = await authenticateUser(request);

    let portfolio: Portfolio | null;

    if (userId) {
      // Authenticated request - user can see their own portfolios regardless of visibility
      portfolio = findPortfolioByIdAndUser(portfolioId, userId);
      if (!portfolio) {
        // Check if portfolio exists but belongs to another user
        const publicPortfolio = findPortfolioById(portfolioId);
        if (publicPortfolio && publicPortfolio.visibility === 'public') {
          portfolio = publicPortfolio;
        }
      }
    } else {
      // Public request - only show public portfolios
      portfolio = findPortfolioById(portfolioId);
      if (portfolio && portfolio.visibility !== 'public') {
        portfolio = null;
      }
    }

    if (!portfolio) {
      return NextResponse.json({ success: false, error: 'Portfolio not found' }, { status: 404 });
    }

    // Increment view count for public access (not for owner)
    if (!userId || portfolio.userId !== userId) {
      portfolio.stats.views++;
      portfolio.stats.lastViewed = new Date().toISOString();
    }

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/portfolio/[id] - Update a portfolio
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: portfolioId } = await params;

    // Authenticate user
    const userId = await authenticateUser(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Find portfolio and verify ownership
    const existingPortfolio = findPortfolioByIdAndUser(portfolioId, userId);
    if (!existingPortfolio) {
      return NextResponse.json({ success: false, error: 'Portfolio not found' }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();

    // Validate request data
    const validationResult = portfolioUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Check if URL is being changed and if it conflicts with existing URLs
    if (updateData.url && updateData.url !== existingPortfolio.url) {
      const conflictingPortfolio = portfolios.find(
        (p) => p.userId === userId && p.url === updateData.url && p.id !== portfolioId
      );

      if (conflictingPortfolio) {
        return NextResponse.json(
          { success: false, error: 'URL slug already exists' },
          { status: 409 }
        );
      }
    }

    // Update portfolio
    const now = new Date().toISOString();
    const updatedPortfolio: Portfolio = {
      ...existingPortfolio,
      title: updateData.title ?? existingPortfolio.title,
      description: updateData.description ?? existingPortfolio.description,
      layout: updateData.layout ?? existingPortfolio.layout,
      tags: updateData.tags ?? existingPortfolio.tags,
      isPublished: updateData.isPublished ?? existingPortfolio.isPublished,
      visibility: updateData.visibility ?? existingPortfolio.visibility,
      url: updateData.url ?? existingPortfolio.url,
      theme: updateData.theme ?? existingPortfolio.theme ?? '',
      customCss: updateData.customCss ?? existingPortfolio.customCss ?? '',
      seoTitle: updateData.seoTitle ?? existingPortfolio.seoTitle ?? '',
      seoDescription: updateData.seoDescription ?? existingPortfolio.seoDescription ?? '',
      socialImage: updateData.socialImage ?? existingPortfolio.socialImage ?? '',
      updatedAt: now,
      stats: {
        ...existingPortfolio.stats,
        updatedAt: now,
      },
    };

    // Update projects if provided
    if (updateData.projects) {
      updatedPortfolio.projects = updateData.projects.map((project) => {
        const existingProject = project.id
          ? existingPortfolio.projects.find((p) => p.id === project.id)
          : undefined;

        const { status, ...rest } = project;
        const newProject: Project = {
          ...(rest as unknown as Project),
          id: project.id || `project-${Date.now()}-${Math.random()}`,
          createdAt: existingProject?.createdAt || now,
          updatedAt: now,
          comments: existingProject?.comments || [],
          likes: existingProject?.likes || 0,
          isPublished: status === 'published',
          technologies: existingProject?.technologies || [],
          duration: existingProject?.duration || '',
          role: existingProject?.role || '',
        };

        return newProject;
      });
    }

    // Update in mock database
    const portfolioIndex = portfolios.findIndex((p) => p.id === portfolioId);
    if (portfolioIndex !== -1) {
      portfolios[portfolioIndex] = updatedPortfolio;
    }

    return NextResponse.json(updatedPortfolio);
  } catch (error) {
    console.error('Error updating portfolio:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/portfolio/[id] - Delete a portfolio
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: portfolioId } = await params;

    // Authenticate user
    const userId = await authenticateUser(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Find portfolio and verify ownership
    const existingPortfolio = findPortfolioByIdAndUser(portfolioId, userId);
    if (!existingPortfolio) {
      return NextResponse.json({ success: false, error: 'Portfolio not found' }, { status: 404 });
    }

    // Remove from mock database
    const portfolioIndex = portfolios.findIndex((p) => p.id === portfolioId);
    if (portfolioIndex !== -1) {
      portfolios.splice(portfolioIndex, 1);
    }

    return NextResponse.json({ success: true, message: 'Portfolio deleted successfully' });
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
