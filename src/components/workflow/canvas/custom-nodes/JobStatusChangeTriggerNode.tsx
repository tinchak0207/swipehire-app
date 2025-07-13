import type React from 'react';
import { useState } from 'react';
import { FiBriefcase, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { Handle, type NodeProps, Position } from 'reactflow';

interface JobStatusChangeTriggerNodeData {
  fromStatus: string;
  toStatus: string;
}

const JobStatusChangeTriggerNode: React.FC<NodeProps<JobStatusChangeTriggerNodeData>> = ({
  data,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [fromStatus, setFromStatus] = useState(data?.fromStatus || 'any');
  const [toStatus, setToStatus] = useState(data?.toStatus || 'any');

  const jobStatuses = ['any', 'draft', 'open', 'filled', 'on-hold', 'closed'];

  return (
    <div className="card w-96 border-2 border-indigo-500 bg-base-100 shadow-xl">
      <div className="card-body p-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 text-white">
                <FiBriefcase className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title font-bold text-lg">Job Status Change</h2>
              <p className="text-gray-500 text-sm">Trigger on job update</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-gray-600 text-sm">
              Triggers the workflow when a job's status changes from a specific state to another.
            </p>

            <div className="flex gap-4">
              <div className="form-control w-1/2">
                <label className="label">
                  <span className="label-text font-semibold">From Status</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={fromStatus}
                  onChange={(e) => setFromStatus(e.target.value)}
                >
                  {jobStatuses.map((s) => (
                    <option key={`from-${s}`} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control w-1/2">
                <label className="label">
                  <span className="label-text font-semibold">To Status</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={toStatus}
                  onChange={(e) => setToStatus(e.target.value)}
                >
                  {jobStatuses.map((s) => (
                    <option key={`to-${s}`} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
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
              <span>The output will be the job data object, including the old and new status.</span>
            </div>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!bg-indigo-500 h-4 w-4"
      />
    </div>
  );
};

export default JobStatusChangeTriggerNode;
