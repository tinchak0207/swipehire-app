'use client';

import { Handle, Position } from 'reactflow';
import { IAnalyzeResumeConfig } from '@/contracts/IWorkflow';

export default function AnalyzeResumeNode({ data }: { data: IAnalyzeResumeConfig }) {
  return (
    <div className="card card-compact bg-base-100 shadow-xl w-64">
        <Handle type="target" position={Position.Left} />
        <div className="card-body">
            <h2 className="card-title">Analyze Resume</h2>
            <p>Degree: {data.requiredDegree}</p>
            <p>Threshold: {data.matchThreshold}%</p>
        </div>
        <Handle type="source" position={Position.Right} />
    </div>
  );
}
