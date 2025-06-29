import { NextResponse } from 'next/server';

// Mock data
const metrics = {
  totalWorkflows: 100,
  totalCandidates: 500,
  averageTimeToHire: 30,
  topPerformingWorkflows: [
    { id: '1', name: 'Software Engineer', successRate: 0.8 },
    { id: '2', name: 'Product Manager', successRate: 0.7 },
  ],
};

export async function GET() {
  return NextResponse.json(metrics);
}
