
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { NodeProps } from 'reactflow';

const InvokeAINode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div className="card w-72 bg-secondary text-secondary-content shadow-xl">
        <div className="card-body">
            <h2 className="card-title">Invoke AI</h2>
            <p>Invokes a custom AI prompt.</p>
            <div className="card-actions justify-end">
                <button className="btn btn-primary btn-sm" onClick={() => data.openModal(data)}>Open</button>
            </div>
        </div>
      <Handle type="target" position={Position.Left} className="w-4 h-4" />
      <Handle type="source" position={Position.Right} className="w-4 h-4" />
    </div>
  );
};

export default memo(InvokeAINode);
