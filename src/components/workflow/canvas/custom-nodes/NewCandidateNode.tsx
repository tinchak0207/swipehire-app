import React, { memo, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiUserPlus } from 'react-icons/fi';
import { Handle, NodeProps, Position } from 'reactflow';

interface NewCandidateNodeData {
  sourceType: string;
  jobId?: string;
}

const NewCandidateNode: React.FC<NodeProps<NewCandidateNodeData>> = ({ data, id }) => {
  const [expanded, setExpanded] = useState(false);
  const [sourceType, setSourceType] = useState(data?.sourceType || 'manual');

  const handleSourceTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSourceType(event.target.value);
    // Here you would typically update the node's data in the workflow state
    // For example: updateNodeData(id, { sourceType: event.target.value });
  };

  return (
    <div className="card w-80 bg-base-100 shadow-xl border-2 border-primary-focus">
      <div className="card-body p-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-12 h-12">
                <FiUserPlus className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title text-lg font-bold">New Candidate</h2>
              <p className="text-sm text-gray-500">Trigger: New candidate entry</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">
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
            <div className="alert alert-info text-xs mt-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
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
        className="w-4 h-4 !bg-primary-focus"
      />
    </div>
  );
};

export default memo(NewCandidateNode);
