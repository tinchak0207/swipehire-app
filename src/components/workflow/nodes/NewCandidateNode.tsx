
import React from 'react';
import { Handle, Position } from '@reactflow/core';

const NewCandidateNode = () => {
  return (
    <div className="card w-72 bg-primary text-primary-content shadow-xl">
        <div className="card-body">
            <h2 className="card-title">New Candidate</h2>
            <p>Triggers when a new candidate is received.</p>
        </div>
      <Handle type="source" position={Position.Right} className="w-4 h-4" />
    </div>
  );
};

export default NewCandidateNode;
