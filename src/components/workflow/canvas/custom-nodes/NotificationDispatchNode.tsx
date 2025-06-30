
import { Handle, Position } from '@reactflow/core';
import React, { memo, useState } from 'react';
import { NodeProps } from 'reactflow';
import { FiBell, FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface NotificationDispatchNodeData {
  recipient: string; // e.g., 'recruiter', 'hiring-manager', 'custom-user'
  recipientId?: string; // for custom-user
  message: string;
}

const NotificationDispatchNode: React.FC<NodeProps<NotificationDispatchNodeData>> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const [recipient, setRecipient] = useState(data.recipient || 'recruiter');
  const [message, setMessage] = useState(data.message || '');

  return (
    <div className="card w-96 bg-base-100 shadow-xl border-2 border-pink-500">
      <Handle type="target" position={Position.Left} id="input" className="w-4 h-4 !bg-pink-500" />
      <div className="card-body p-4">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="bg-pink-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
                <FiBell className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title text-lg font-bold">Send Notification</h2>
              <p className="text-sm text-gray-500">Alert internal stakeholders</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">Sends an in-app or email notification to an internal user or team.</p>
            
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Recipient</span>
              </label>
              <select 
                className="select select-bordered w-full"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              >
                <option value="recruiter">Assigned Recruiter</option>
                <option value="hiring-manager">Hiring Manager</option>
                <option value="team">Specific Team</option>
                <option value="custom-user">Specific User</option>
              </select>
            </div>

            {(recipient === 'custom-user' || recipient === 'team') && (
                <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text font-semibold">{recipient === 'team' ? 'Team ID' : 'User ID'}</span>
                    </label>
                    <input 
                        type="text" 
                        placeholder={recipient === 'team' ? 'e.g., engineering-leads' : 'e.g., user-12345'} 
                        className="input input-bordered w-full" 
                    />
                </div>
            )}

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Message</span>
              </label>
              <textarea 
                className="textarea textarea-bordered h-24"
                placeholder="e.g., New high-priority candidate {{candidate.name}} has applied for {{job.title}}."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
            </div>

            <div className="alert alert-pink text-xs mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>This node does not have an output. It simply fires off the notification.</span>
            </div>
          </div>
        )}
      </div>
      {/* No source handle as this is a terminal node for notifications */}
    </div>
  );
};

export default memo(NotificationDispatchNode);
