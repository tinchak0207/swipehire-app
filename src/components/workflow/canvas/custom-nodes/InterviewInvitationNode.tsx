import { Handle, Position } from '@reactflow/core';
import type React from 'react';
import { memo } from 'react';
import type { NodeProps } from 'reactflow';

const InterviewInvitationNode: React.FC<NodeProps> = ({}) => {
  return (
    <div className="card w-72 border border-gray-200 bg-base-100 shadow-md">
      <div className="card-body p-4">
        <div className="flex items-center space-x-4">
          <div className="avatar">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-success-content"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="card-title font-semibold text-base">Interview Invitation</h2>
            <p className="text-gray-500 text-xs">Sends an interview invitation.</p>
          </div>
        </div>
      </div>
      <Handle type="target" position={Position.Left} className="!bg-success h-4 w-4" />
      <Handle type="source" position={Position.Right} className="!bg-success h-4 w-4" />
    </div>
  );
};

export default memo(InterviewInvitationNode);
