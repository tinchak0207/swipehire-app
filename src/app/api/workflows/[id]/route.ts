import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const workflowId = parseInt(resolvedParams.id, 10);
    const userId = 1; // Hardcoded for now

    const { rows } = await sql`SELECT * FROM workflows WHERE id = ${workflowId}`;
    const workflow = rows[0];

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    if (workflow['editing_user_id'] && workflow['editing_user_id'] !== userId) {
      return NextResponse.json(
        { error: 'This workflow is currently being edited by another user.' },
        { status: 409 }
      );
    }

    await sql`UPDATE workflows SET editing_user_id = ${userId} WHERE id = ${workflowId}`;

    return NextResponse.json(workflow);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch workflow' }, { status: 500 });
  }
}
