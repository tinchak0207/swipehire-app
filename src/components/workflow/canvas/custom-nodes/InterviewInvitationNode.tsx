
import { Handle, Position } from '@reactflow/core';
import React, { memo } from 'react';
import { NodeProps } from 'reactflow';

const InterviewInvitationNode: React.FC<NodeProps> = ({ }) => {
  return (
    <div className="card w-72 bg-base-100 shadow-md border border-gray-200">
      <div className="card-body p-4">
        <div className="flex items-center space-x-4">
          <div className="avatar">
            <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success-content" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="card-title text-base font-semibold">Interview Invitation</h2>
            <p className="text-xs text-gray-500">Sends an interview invitation.</p>
          </div>
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        className="w-4 h-4 !bg-success"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-4 h-4 !bg-success"
      />
    </div>
  );
};

export default memo(InterviewInvitationNode);
