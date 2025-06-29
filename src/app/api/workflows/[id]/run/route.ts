import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { runWorkflow } from '@/services/workflowRunner';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const workflowId = parseInt(params.id, 10);
    const userId = 1; // Hardcoded for now

    const { rows: userRows } = await sql`SELECT tier FROM users WHERE id = ${userId}`;
    const user = userRows[0];

    const { rows: runRows } =
      await sql`SELECT COUNT(*) as count FROM workflow_runs WHERE user_id = ${userId} AND created_at > NOW() - INTERVAL '1 month'`;
    const runCount = parseInt(runRows[0]?.['count'] ?? '0', 10);

    if (user?.['tier'] === 'free' && runCount >= 50) {
      return NextResponse.json(
        { error: 'Free tier run limit reached. Upgrade for more runs.' },
        { status: 403 }
      );
    }

    const { rows } = await sql`SELECT * FROM workflows WHERE id = ${workflowId}`;
    const workflow = rows[0];

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    const payload = await request.json();
    await runWorkflow(workflow as any, payload);

    await sql`INSERT INTO workflow_runs (workflow_id, user_id) VALUES (${workflowId}, ${userId})`;

    return NextResponse.json({ message: 'Workflow run initiated' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to run workflow' }, { status: 500 });
  }
}
