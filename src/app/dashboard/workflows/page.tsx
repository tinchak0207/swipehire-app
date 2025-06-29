import Link from 'next/link';

export default function WorkflowsPage() {
  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">My Workflows</h1>
        <Link href="/dashboard/workflows/new" className="btn btn-primary">
          New Workflow
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {/* Placeholder for workflow rows */}
            <tr>
              <td>
                <Link href="/dashboard/workflows/123" className="link">
                  Software Engineer Screening
                </Link>
              </td>
              <td>
                <span className="badge badge-success">Active</span>
              </td>
              <td>2 hours ago</td>
              <td>
                <button className="btn btn-ghost btn-xs">details</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
