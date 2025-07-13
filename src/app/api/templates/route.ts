import { NextResponse } from 'next/server';
import type { IWorkflowTemplate } from '@/contracts/IWorkflow';

// Mock database
const templates: IWorkflowTemplate[] = [];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const sortBy = searchParams.get('sortBy') || 'usageCount';
  const filterBy = searchParams.get('filterBy') || '';

  let filteredTemplates = templates;

  if (filterBy) {
    filteredTemplates = templates.filter(
      (t) => t.name.includes(filterBy) || t.description?.includes(filterBy)
    );
  }

  const sortedTemplates = filteredTemplates.sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return b.usageCount - a.usageCount;
  });

  const paginatedTemplates = sortedTemplates.slice((page - 1) * limit, page * limit);

  return NextResponse.json({ data: paginatedTemplates, total: filteredTemplates.length });
}
