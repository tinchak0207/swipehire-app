'use client';

import { Handle, Position } from 'reactflow';
import { IConditionConfig } from '@/contracts/IWorkflow';

export default function ConditionNode({ data }: { data: IConditionConfig }) {
  return (
    <div className="card card-compact bg-warning text-warning-content shadow-xl w-64">
        <Handle type="target" position={Position.Left} />
        <div className="card-body">
            <h2 className="card-title">Condition</h2>
            <p>{`If ${data.variable} ${data.operator} ${data.value}`}</p>
        </div>
        <Handle type="source" position={Position.Right} id="true" style={{ top: '33%' }} />
        <Handle type="source" position={Position.Right} id="false" style={{ top: '66%' }} />
    </div>
  );
}
