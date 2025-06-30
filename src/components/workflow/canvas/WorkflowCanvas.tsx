'use client';

import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { IWorkflow } from '@/contracts/IWorkflow';
import { useWorkflowEngine } from '@/hooks/useWorkflowEngine';
import { useState } from 'react';
import { ReactFlowInstance } from 'reactflow';
import { WORKFLOW_NODE_DEFINITIONS } from '@/lib/workflow-node-definitions';

const nodeTypes = Object.fromEntries(
  WORKFLOW_NODE_DEFINITIONS.filter((def) => def.component).map((def) => [
    def.type,
    def.component,
  ])
);

import { Node } from 'reactflow';

interface WorkflowCanvasProps {
  workflow: IWorkflow;
  onNodeClickAction: (node: Node) => void;
}

export default function WorkflowCanvas({ workflow, onNodeClickAction }: WorkflowCanvasProps) {
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDragOver, onDrop } = useWorkflowEngine(
    workflow,
    reactFlowInstance
  );

  return (
    <div style={{ height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeClick={(_, node) => onNodeClickAction(node)}
        nodeTypes={nodeTypes}
        fitView
        onlyRenderVisibleElements
        connectionRadius={150}
        onInit={setReactFlowInstance}
      >
        <Controls />
        <MiniMap />
        <Background />
      </ReactFlow>
    </div>
  );
}
