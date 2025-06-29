import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { IWorkflow } from '@/contracts/IWorkflow';
import clientPromise from '@/services/db/mongodb';
import { workflowService } from '@/services/workflow.service';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db('swipehire');
    const workflow = await db
      .collection<IWorkflow>('workflows')
      .findOne({ _id: new ObjectId(params.id) });

    if (!workflow) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Do not await this, as it can be a long-running process
    workflowService.run(workflow);

    return NextResponse.json({ success: true, message: 'Workflow execution started.' });
  } catch (e) {
    console.error(e);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
