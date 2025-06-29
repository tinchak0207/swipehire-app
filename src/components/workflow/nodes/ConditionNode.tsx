import React, { memo } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';

const ConditionNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div className="card w-72 bg-accent text-accent-content shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Condition</h2>
        <p>{data.condition || 'If...'}</p>
      </div>
      <Handle type="target" position={Position.Left} className="w-4 h-4" />
      <Handle
        type="source"
        id="true"
        position={Position.Right}
        style={{ top: '30%' }}
        className="w-4 h-4"
      />
      <Handle
        type="source"
        id="false"
        position={Position.Right}
        style={{ top: '70%' }}
        className="w-4 h-4"
      />
    </div>
  );
};

export default memo(ConditionNode);
