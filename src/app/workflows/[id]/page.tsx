'use client';

import { useEffect, useState } from 'react';
import type { Node, ReactFlowInstance } from 'reactflow';
import WorkflowCanvas from '@/components/workflow/canvas/WorkflowCanvas';
import NodePalette from '@/components/workflow/palette/NodePalette';
import type { IWorkflow } from '@/contracts/IWorkflow';
import { useWorkflowEngine } from '@/hooks/useWorkflowEngine';

function WorkflowEditor({ workflow: initialWorkflow }: { workflow: IWorkflow }) {
  const [workflow, setWorkflow] = useState(initialWorkflow);
  const [reactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const workflowEngine = useWorkflowEngine(workflow, reactFlowInstance);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const handleNodeClickAction = (node: Node) => {
    setSelectedNode(node);
  };

  const handleSave = async (isTemplate = false, isPublic = false) => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...workflow,
          nodes: workflowEngine.nodes,
          edges: workflowEngine.edges,
          isTemplate,
          isPublic,
        }),
      });

      if (response.ok) {
        alert('Workflow saved successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to save workflow: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Failed to save workflow', error);
      alert('An unexpected error occurred while saving the workflow.');
    }
  };

  const handleRun = () => {
    // TODO: Implement workflow execution
    console.log('Running workflow with selected node:', selectedNode);
  };

  return (
    <div className="drawer lg:drawer-open h-screen">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <header className="flex items-center gap-4 border-base-300 border-b bg-base-200 p-4">
          <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block h-6 w-6 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </label>
          <input
            type="text"
            placeholder="Workflow Name"
            className="input input-bordered w-full max-w-xs"
            value={workflow.name}
            onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
          />
          <button className="btn btn-primary" onClick={() => handleSave()}>
            Save
          </button>
          <div className="dropdown dropdown-end">
            <label className="btn btn-secondary">Save as Template</label>
            <ul className="dropdown-content menu w-52 rounded-box bg-base-100 p-2 shadow">
              <li>
                <a onClick={() => handleSave(true, false)}>Save as Private Template</a>
              </li>
              <li>
                <a onClick={() => handleSave(true, true)}>Save as Public Template</a>
              </li>
            </ul>
          </div>
          <button className="btn btn-accent" onClick={handleRun}>
            Run
          </button>
        </header>
        <main className="flex-1 bg-base-300">
          <WorkflowCanvas workflow={workflow} onNodeClickAction={handleNodeClickAction} />
        </main>
      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay" />
        <NodePalette />
      </div>
    </div>
  );
}

export default function WorkflowEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const [workflow, setWorkflow] = useState<IWorkflow | null>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      if (resolvedParams.id) {
        fetch(`/api/workflows/${resolvedParams.id}`)
          .then((res) => res.json())
          .then((data: IWorkflow) => {
            setWorkflow(data);
          });
      }
    });
  }, [params]);

  if (!workflow) {
    return <div>Loading...</div>;
  }

  return <WorkflowEditor workflow={workflow} />;
}
