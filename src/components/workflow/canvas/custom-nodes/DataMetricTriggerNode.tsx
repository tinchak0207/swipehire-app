
import { Handle, Position } from 'reactflow';
import React from 'react';

const DataMetricTriggerNode = () => {
  return (
    <div className="card w-72 bg-primary text-primary-content shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Data Metric Trigger</h2>
        <p>Triggers based on data metrics.</p>
      </div>
      <Handle type="source" position={Position.Right} className="w-4 h-4" />
    </div>
  );
};

export default DataMetricTriggerNode;
