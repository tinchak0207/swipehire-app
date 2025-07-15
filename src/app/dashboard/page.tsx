import Link from 'next/link';
import clientPromise from '@/lib/mongodb';
import type { Workflow } from '@/lib/types';

async function getWorkflows(): Promise<Workflow[]> {
  const client = await clientPromise;
  const db = client.db('swipehire');
  const workflows = await db.collection('workflows').find({}).toArray();
  // Convert _id to string for serialization
  return workflows.map((workflow) => ({
    ...(workflow as unknown as Workflow),
    id: workflow._id.toString(),
  }));
}

const DashboardHomePage = async () => {
  const workflows = await getWorkflows();

  return (
    <div className="p-4">
      <h1 className="mb-4 font-bold text-2xl">Workflows</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {workflows.map((workflow) => (
          <Link key={workflow.id} href={`/dashboard/workflows?id=${workflow.id}`}>
            <div className="card bg-base-200 shadow-xl hover:bg-base-300">
              <div className="card-body">
                <h2 className="card-title">{workflow.name}</h2>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-4">
        <Link href="/dashboard/workflows" className="btn btn-primary">
          New Workflow
        </Link>
      </div>
    </div>
  );
};

export default DashboardHomePage;
