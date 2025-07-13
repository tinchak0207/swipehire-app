import type React from 'react';
import { memo, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiUserPlus } from 'react-icons/fi';
import { Handle, type NodeProps, Position } from 'reactflow';

interface NewCandidateNodeData {
  sourceType: string;
  jobId?: string;
}

const NewCandidateNode: React.FC<NodeProps<NewCandidateNodeData>> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const [sourceType, setSourceType] = useState(data?.sourceType || 'manual');

  const handleSourceTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSourceType(event.target.value);
    // Here you would typically update the node's data in the workflow state
    // For example: updateNodeData(id, { sourceType: event.target.value });
  };

  return (
    <div className="card w-80 border-2 border-primary-focus bg-base-100 shadow-xl">
      <div className="card-body p-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-content">
                <FiUserPlus className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title font-bold text-lg">New Candidate</h2>
              <p className="text-gray-500 text-sm">Trigger: New candidate entry</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-gray-600 text-sm">
              This node triggers the workflow when a new candidate is added from a specified source.
            </p>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Candidate Source</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={sourceType}
                onChange={handleSourceTypeChange}
              >
                <option value="manual">Manual Entry</option>
                <option value="api">API Endpoint</option>
                <option value="job_board">Job Board Integration</option>
                <option value="email_parser">Email Parser</option>
              </select>
            </div>
            {sourceType === 'job_board' && (
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Job ID</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., 'REQ-12345'"
                  className="input input-bordered w-full"
                />
              </div>
            )}
            <div className="alert alert-info mt-2 text-xs">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="h-6 w-6 shrink-0 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>The output of this node will be the new candidate's data object.</span>
            </div>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!bg-primary-focus h-4 w-4"
      />
    </div>
  );
};

export default memo(NewCandidateNode);
