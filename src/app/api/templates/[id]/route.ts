import { NextResponse } from 'next/server';
import { IWorkflow, IWorkflowTemplate } from '@/contracts/IWorkflow';

// Mock databases
let templates: IWorkflowTemplate[] = [];
let workflows: IWorkflow[] = [];

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const template = templates.find((t) => t._id === params.id);
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
  } else {
    return new Response('Template not found', { status: 404 });
  }
}
