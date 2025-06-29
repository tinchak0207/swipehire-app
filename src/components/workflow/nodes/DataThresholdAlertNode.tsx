import React, { memo } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';

const DataThresholdAlertNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div className="card w-72 bg-warning text-warning-content shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Data Threshold Alert</h2>
        <p>{data.condition || 'When...'}</p>
      </div>
      <Handle type="source" position={Position.Right} className="w-4 h-4" />
    </div>
  );
};

export default memo(DataThresholdAlertNode);
