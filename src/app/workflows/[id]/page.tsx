'use client';

import React, { useEffect, useState } from 'react';
import { Node, ReactFlowInstance } from 'reactflow';
import WorkflowCanvas from '@/components/workflow/canvas/WorkflowCanvas';
import NodePalette from '@/components/workflow/palette/NodePalette';
import { IWorkflow } from '@/contracts/IWorkflow';
import { useWorkflowEngine } from '@/hooks/useWorkflowEngine';

function WorkflowEditor({ workflow: initialWorkflow }: { workflow: IWorkflow }) {
  const [workflow, setWorkflow] = useState(initialWorkflow);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDragOver, onDrop } =
    useWorkflowEngine(workflow, reactFlowInstance);
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
        body: JSON.stringify({ ...workflow, nodes, edges, isTemplate, isPublic }),
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
        <header className="p-4 bg-base-200 border-b border-base-300 flex items-center gap-4">
          <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-6 h-6 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
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
            <label tabIndex={0} className="btn btn-secondary">
              Save as Template
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
            >
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
          <WorkflowCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onNodeClickAction={handleNodeClickAction}
            setReactFlowInstance={setReactFlowInstance}
          />
        </main>
      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
        <NodePalette />
      </div>
    </div>
  );
}

export default function WorkflowEditorPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [workflow, setWorkflow] = useState<IWorkflow | null>(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/workflows/${id}`)
        .then((res) => res.json())
        .then((data: IWorkflow) => {
          setWorkflow(data);
        });
    }
  }, [id]);

  if (!workflow) {
    return <div>Loading...</div>;
  }

  return <WorkflowEditor workflow={workflow} />;
}
