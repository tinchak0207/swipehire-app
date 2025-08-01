import type React from 'react';
import { memo } from 'react';
import { Handle, type NodeProps, Position } from 'reactflow';

const ResumeAnalysisNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div className="card w-72 bg-neutral text-neutral-content shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Resume Analysis</h2>
        <p>Analyzes a candidate's resume.</p>
        <div className="card-actions justify-end">
          <button className="btn btn-primary btn-sm" onClick={() => data.openModal(data)}>
            Open
          </button>
        </div>
      </div>
      <Handle type="target" position={Position.Left} className="h-4 w-4" />
      <Handle
        type="source"
        id="pass"
        position={Position.Right}
        style={{ top: '30%' }}
        className="h-4 w-4"
      />
      <Handle
        type="source"
        id="fail"
        position={Position.Right}
        style={{ top: '70%' }}
        className="h-4 w-4"
      />
    </div>
  );
};

export default memo(ResumeAnalysisNode);
