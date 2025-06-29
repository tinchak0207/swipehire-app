'use client';

import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { IWorkflow } from '@/contracts/IWorkflow';
import { useWorkflowEngine } from '@/hooks/useWorkflowEngine';
import AnalyzeResumeNode from './custom-nodes/AnalyzeResumeNode';
import ConditionNode from './custom-nodes/ConditionNode';

const nodeTypes = {
  AnalyzeResume: AnalyzeResumeNode,
  Condition: ConditionNode,
};

interface WorkflowCanvasProps {
  workflow: IWorkflow;
}

export default function WorkflowCanvas({ workflow }: WorkflowCanvasProps) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useWorkflowEngine(workflow);

  return (
    <div style={{ height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        connectionRadius={150}
      >
        <Controls />
        <MiniMap />
        <Background />
      </ReactFlow>
    </div>
  );
}
