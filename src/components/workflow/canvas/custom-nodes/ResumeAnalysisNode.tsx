
import React, { memo } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';

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
      <Handle type="target" position={Position.Left} className="w-4 h-4" />
      <Handle
        type="source"
        id="pass"
        position={Position.Right}
        style={{ top: '30%' }}
        className="w-4 h-4"
      />
      <Handle
        type="source"
        id="fail"
        position={Position.Right}
        style={{ top: '70%' }}
        className="w-4 h-4"
      />
    </div>
  );
};

export default memo(ResumeAnalysisNode);
