import { Handle, Position } from '@reactflow/core';
import type React from 'react';
import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiFilePlus } from 'react-icons/fi';
import type { NodeProps } from 'reactflow';

interface NewResumeSubmissionTriggerNodeData {
  source: string; // e.g., 'email-inbox', 'api-endpoint', 'careers-page'
  jobIdFilter?: string;
}

const NewResumeSubmissionTriggerNode: React.FC<NodeProps<NewResumeSubmissionTriggerNodeData>> = ({
  data,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [source, setSource] = useState(data.source || 'careers-page');
  const [jobIdFilter, setJobIdFilter] = useState(data.jobIdFilter || '');

  return (
    <div className="card w-96 border-2 border-teal-500 bg-base-100 shadow-xl">
      <div className="card-body p-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-500 text-white">
                <FiFilePlus className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title font-bold text-lg">New Resume Submission</h2>
              <p className="text-gray-500 text-sm">Trigger on new application</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-gray-600 text-sm">
              Triggers the workflow when a new resume is submitted through a specific channel.
            </p>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Submission Source</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              >
                <option value="careers-page">Careers Page Form</option>
                <option value="email-inbox">Dedicated Email Inbox</option>
                <option value="api-endpoint">API Endpoint</option>
                <option value="linkedin">LinkedIn Easy Apply</option>
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Filter by Job ID (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g., SWE-001, PM-002"
                className="input input-bordered w-full"
                value={jobIdFilter}
                onChange={(e) => setJobIdFilter(e.target.value)}
              />
              <label className="label">
                <span className="label-text-alt">
                  Leave blank to trigger for any job. Use comma-separated values for multiple jobs.
                </span>
              </label>
            </div>

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
              <span>
                The output will be the submitted candidate data and the resume file object.
              </span>
            </div>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!bg-teal-500 h-4 w-4"
      />
    </div>
  );
};

export default NewResumeSubmissionTriggerNode;
