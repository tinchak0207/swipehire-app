/**
 * Individual Portfolio API Routes - CRUD Operations for specific portfolios
 *
 * Implements GET, PUT, and DELETE operations for individual portfolios
 * with proper validation, authentication, and error handling.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { Comment, Portfolio, Project } from '@/lib/types/portfolio';

// --- Zod Schemas ---

const portfolioUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100).optional(),
  description: z.string().min(1, 'Description is required').max(1000).optional(),
  projects: z
    .array(
      z.object({
        id: z.string().optional(),
        title: z.string().min(1, 'Project title is required'),
        description: z.string().min(1, 'Project description is required'),
        media: z.array(
          z.object({
            type: z.enum(['image', 'video', 'audio']),
            url: z.string().url(),
          })
        ),
        links: z.array(
          z.object({
            type: z.enum(['github', 'demo', 'website']),
            url: z.string().url(),
            label: z.string().min(1),
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
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  visibility: z.enum(['public', 'private', 'unlisted']).optional(),
  url: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
});

// --- Mock Database ---

const portfolios: Portfolio[] = [];

// --- Helper Functions ---

async function getAuthenticatedUser(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  return authHeader?.startsWith('Bearer ') ? 'user-123' : null;
}

function findPortfolio(id: string, userId?: string): Portfolio | null {
  const portfolio = portfolios.find((p) => p.id === id);
  if (userId && portfolio?.userId !== userId) return null;
  return portfolio || null;
}

function updatePortfolioData(
  existing: Portfolio,
  update: z.infer<typeof portfolioUpdateSchema>
): Portfolio {
  const now = new Date().toISOString();
  const updated: Portfolio = {
    ...existing,
    ...update,
    title: update.title || existing.title,
    description: update.description || existing.description,
    tags: update.tags || existing.tags,
    isPublished: update.isPublished ?? existing.isPublished,
    layout: update.layout || existing.layout,
    updatedAt: now,
    stats: { ...existing.stats, updatedAt: now },
    projects: update.projects
      ? update.projects.map((project) => {
          const existingProject = project.id
            ? existing.projects.find((p) => p.id === project.id)
            : undefined;
          return {
            ...project,
            id: project.id || `project-${Date.now()}`,
            createdAt: existingProject?.createdAt || now,
            updatedAt: now,
            comments: (existingProject?.comments as Comment[]) || [],
            likes: existingProject?.likes || 0,
            isPublished: project.status === 'published',
            duration: '',
            role: 'Software Engineer',
          } as Project;
        })
      : existing.projects,
    visibility: update.visibility || existing.visibility,
    url: update.url || existing.url,
    theme: update.theme || existing.theme,
  };

  return updated;
}

// --- API Route Handlers ---

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUser(request);
    const portfolio = findPortfolio(id, userId || undefined);

    if (!portfolio || (portfolio.visibility !== 'public' && portfolio.userId !== userId)) {
      return NextResponse.json({ success: false, error: 'Portfolio not found' }, { status: 404 });
    }

    if (portfolio.userId !== userId) {
      portfolio.stats.views++;
      portfolio.stats.lastViewed = new Date().toISOString();
    }

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUser(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const existingPortfolio = findPortfolio(id, userId);
    if (!existingPortfolio) {
      return NextResponse.json({ success: false, error: 'Portfolio not found' }, { status: 404 });
    }

    const body = await request.json();
    const validation = portfolioUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', details: validation.error.errors },
        { status: 400 }
      );
    }

    if (validation.data.url && validation.data.url !== existingPortfolio.url) {
      if (portfolios.some((p) => p.userId === userId && p.url === validation.data.url)) {
        return NextResponse.json(
          { success: false, error: 'URL slug already exists' },
          { status: 409 }
        );
      }
    }

    const updatedPortfolio = updatePortfolioData(existingPortfolio, validation.data);
    const index = portfolios.findIndex((p) => p.id === id);
    if (index !== -1) {
      portfolios[index] = updatedPortfolio;
    }

    return NextResponse.json(updatedPortfolio);
  } catch (error) {
    console.error('Error updating portfolio:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUser(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const index = portfolios.findIndex((p) => p.id === id && p.userId === userId);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Portfolio not found' }, { status: 404 });
    }

    portfolios.splice(index, 1);
    return NextResponse.json({ success: true, message: 'Portfolio deleted' });
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
