import { type NextRequest, NextResponse } from 'next/server';
import type { IWorkflow, IWorkflowTemplate } from '@/contracts/IWorkflow';

// Mock databases
const templates: IWorkflowTemplate[] = [];
const workflows: IWorkflow[] = [];

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const template = templates.find((t) => t._id === resolvedParams.id);
  if (template) {
    const newWorkflow: IWorkflow = {
      ...template,
      _id: Math.random().toString(36).substring(7),
      isTemplate: false,
      templateId: template._id,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    workflows.push(newWorkflow);
    return NextResponse.json(newWorkflow);
  }
  return new Response('Template not found', { status: 404 });
}
