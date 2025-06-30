
import React, { memo } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';

const DataVisualizationNode: React.FC<NodeProps> = ({ }) => {
  return (
    <div className="card w-72 bg-secondary text-secondary-content shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Data Visualization</h2>
        <p>Visualizes data.</p>
      </div>
      <Handle type="target" position={Position.Left} className="w-4 h-4" />
    </div>
  );
};

export default memo(DataVisualizationNode);
