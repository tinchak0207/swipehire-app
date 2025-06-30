import React, { memo } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';

const VideoInterviewIntegrationNode: React.FC<NodeProps> = ({}) => {
  return (
    <div className="card w-72 bg-info text-info-content shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Video Interview Integration</h2>
        <p>Integrates with a video interview platform.</p>
      </div>
      <Handle type="target" position={Position.Left} className="w-4 h-4" />
      <Handle type="source" position={Position.Right} className="w-4 h-4" />
    </div>
  );
};

export default memo(VideoInterviewIntegrationNode);
