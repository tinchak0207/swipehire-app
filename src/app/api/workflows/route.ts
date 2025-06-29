import { NextResponse } from 'next/server';
import { IWorkflow } from '@/contracts/IWorkflow';

// Mock database
const workflows: IWorkflow[] = [];

export async function POST(request: Request) {
  const body = await request.json();
  const newWorkflow: IWorkflow = {
    ...body,
    _id: Math.random().toString(36).substring(7),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  workflows.push(newWorkflow);
  return NextResponse.json(newWorkflow);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const filterBy = searchParams.get('filterBy') || '';

  let filteredWorkflows = workflows;

  if (filterBy) {
    filteredWorkflows = workflows.filter(
      (w) => w.name.includes(filterBy) || w.description?.includes(filterBy)
    );
  }

  const sortedWorkflows = filteredWorkflows.sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const paginatedWorkflows = sortedWorkflows.slice((page - 1) * limit, page * limit);

  return NextResponse.json({ data: paginatedWorkflows, total: filteredWorkflows.length });
}
