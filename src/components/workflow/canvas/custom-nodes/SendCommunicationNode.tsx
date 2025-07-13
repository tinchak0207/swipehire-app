import { Handle, Position } from '@reactflow/core';
import type React from 'react';
import { memo, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiMail, FiMessageSquare } from 'react-icons/fi';
import type { NodeProps } from 'reactflow';

interface SendCommunicationNodeData {
  channel: 'email' | 'sms';
  templateId: string;
  subject?: string; // for email
}

const SendCommunicationNode: React.FC<NodeProps<SendCommunicationNodeData>> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const [channel, setChannel] = useState<'email' | 'sms'>(data.channel || 'email');
  const [templateId, setTemplateId] = useState(data.templateId || '');

  return (
    <div className="card w-96 border-2 border-accent-focus bg-base-100 shadow-xl">
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="!bg-accent-focus h-4 w-4"
      />
      <div className="card-body p-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="h-12 w-12 rounded-full bg-accent text-accent-content">
                {channel === 'email' ? (
                  <FiMail className="h-6 w-6" />
                ) : (
                  <FiMessageSquare className="h-6 w-6" />
                )}
              </div>
            </div>
            <div>
              <h2 className="card-title font-bold text-lg">Send Communication</h2>
              <p className="text-gray-500 text-sm">Contact candidate via {channel}</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-gray-600 text-sm">
              Sends a message to the candidate using a pre-defined template. Candidate data must be
              provided as input.
            </p>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Communication Channel</span>
              </label>
              <div className="join">
                <button
                  className={`btn join-item ${channel === 'email' ? 'btn-accent' : ''}`}
                  onClick={() => setChannel('email')}
                >
                  <FiMail className="mr-2" /> Email
                </button>
                <button
                  className={`btn join-item ${channel === 'sms' ? 'btn-accent' : ''}`}
                  onClick={() => setChannel('sms')}
                >
                  <FiMessageSquare className="mr-2" /> SMS
                </button>
              </div>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Message Template</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
              >
                <option disabled value="">
                  Select a template
                </option>
                <option value="TPL-001">Initial Contact</option>
                <option value="TPL-002">Interview Invitation</option>
                <option value="TPL-003">Rejection Notice</option>
                <option value="TPL-004">Offer Letter</option>
              </select>
            </div>

            {channel === 'email' && (
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Email Subject</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Your Application for Software Engineer at [Company]"
                  className="input input-bordered w-full"
                />
              </div>
            )}

            <div className="alert alert-warning mt-2 text-xs">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>The output will confirm if the communication was sent successfully.</span>
            </div>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!bg-accent-focus h-4 w-4"
      />
    </div>
  );
};

export default memo(SendCommunicationNode);
