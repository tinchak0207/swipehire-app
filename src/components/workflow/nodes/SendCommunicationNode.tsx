import React, { memo } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';

const SendCommunicationNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div className="card w-72 bg-info text-info-content shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Send Communication</h2>
        <p>Sends a message to the candidate.</p>
        <div className="card-actions justify-end">
          <button className="btn btn-primary btn-sm" onClick={() => data.openModal(data)}>
            Open
          </button>
        </div>
      </div>
      <Handle type="target" position={Position.Left} className="w-4 h-4" />
      <Handle type="source" position={Position.Right} className="w-4 h-4" />
    </div>
  );
};

export default memo(SendCommunicationNode);
