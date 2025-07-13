import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import type { Edge, Node } from 'reactflow';
import { runWorkflow } from '@/services/workflowRunner';

interface DatabaseWorkflow {
  id: number;
  name: string;
  user_id: number;
  definition: {
    nodes: Node[];
    edges: Edge[];
  };
  resume_count: number;
  is_template: boolean;
  is_public: boolean;
  editing_user_id: number | null;
  created_at: string;
  updated_at: string;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const workflowId = parseInt(resolvedParams.id, 10);
    const userId = 1; // Hardcoded for now

    const { rows: userRows } = await sql`SELECT tier FROM users WHERE id = ${userId}`;
    const user = userRows[0];

    const { rows: runRows } =
      await sql`SELECT COUNT(*) as count FROM workflow_runs WHERE user_id = ${userId} AND created_at > NOW() - INTERVAL '1 month'`;
    const runCount = parseInt(runRows[0]?.count ?? '0', 10);

    if (user?.tier === 'free' && runCount >= 50) {
      return NextResponse.json(
        { error: 'Free tier run limit reached. Upgrade for more runs.' },
        { status: 403 }
      );
    }

    const { rows } = await sql`SELECT * FROM workflows WHERE id = ${workflowId}`;
    const dbWorkflow = rows[0] as DatabaseWorkflow;

    if (!dbWorkflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // Convert database workflow to the format expected by runWorkflow
    const workflow = {
      id: dbWorkflow.id.toString(),
      definition: dbWorkflow.definition,
    };

    const payload = await request.json();
    await runWorkflow(workflow, payload);

    await sql`INSERT INTO workflow_runs (workflow_id, user_id) VALUES (${workflowId}, ${userId})`;

    return NextResponse.json({ message: 'Workflow run initiated' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to run workflow' }, { status: 500 });
  }
}
