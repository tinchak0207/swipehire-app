
import { NextResponse } from 'next/server';
import { IWorkflow } from '@/contracts/IWorkflow';

// Mock database
let workflows: IWorkflow[] = [];

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const workflow = workflows.find(w => w._id === params.id);
  if (workflow) {
    return NextResponse.json(workflow);
  } else {
    return new Response('Workflow not found', { status: 404 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const index = workflows.findIndex(w => w._id === params.id);
  if (index !== -1) {
    workflows[index] = { ...workflows[index], ...body, updatedAt: new Date() };
    return NextResponse.json(workflows[index]);
  } else {
    return new Response('Workflow not found', { status: 404 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const index = workflows.findIndex(w => w._id === params.id);
  if (index !== -1) {
    workflows.splice(index, 1);
    return new Response(null, { status: 204 });
  } else {
    return new Response('Workflow not found', { status: 404 });
  }
}
