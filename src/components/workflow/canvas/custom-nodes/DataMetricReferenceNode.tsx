import React, { memo } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';

const DataMetricReferenceNode: React.FC<NodeProps> = ({}) => {
  return (
    <div className="card w-72 bg-secondary text-secondary-content shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Data Metric Reference</h2>
        <p>References a data metric.</p>
      </div>
      <Handle type="source" position={Position.Right} className="w-4 h-4" />
    </div>
  );
};

export default memo(DataMetricReferenceNode);
