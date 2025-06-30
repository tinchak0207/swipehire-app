import { Handle, Position } from '@reactflow/core';
import React, { memo, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiFilePlus } from 'react-icons/fi';
import { NodeProps } from 'reactflow';

interface NewResumeSubmissionTriggerNodeData {
  source: string; // e.g., 'email-inbox', 'api-endpoint', 'careers-page'
  jobIdFilter?: string;
}

const NewResumeSubmissionTriggerNode: React.FC<NodeProps<NewResumeSubmissionTriggerNodeData>> = ({
  data,
  id,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [source, setSource] = useState(data.source || 'careers-page');
  const [jobIdFilter, setJobIdFilter] = useState(data.jobIdFilter || '');

  return (
    <div className="card w-96 bg-base-100 shadow-xl border-2 border-teal-500">
      <div className="card-body p-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="bg-teal-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
                <FiFilePlus className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title text-lg font-bold">New Resume Submission</h2>
              <p className="text-sm text-gray-500">Trigger on new application</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">
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
        className="w-4 h-4 !bg-teal-500"
      />
    </div>
  );
};

export default NewResumeSubmissionTriggerNode;
