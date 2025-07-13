import { Handle, Position } from '@reactflow/core';
import type React from 'react';
import { memo, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiFileText } from 'react-icons/fi';
import type { NodeProps } from 'reactflow';

interface WorkflowLogNodeData {
  message: string;
  logLevel: 'info' | 'warn' | 'error';
}

const WorkflowLogNode: React.FC<NodeProps<WorkflowLogNodeData>> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState(data.message || '');
  const [logLevel, setLogLevel] = useState(data.logLevel || 'info');

  const levelClasses = {
    info: 'border-gray-500 bg-gray-500',
    warn: 'border-yellow-500 bg-yellow-500',
    error: 'border-red-500 bg-red-500',
  };

  return (
    <div
      className={`card w-96 bg-base-100 shadow-xl border-2 ${levelClasses[logLevel].split(' ')[0]}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className={`w-4 h-4 !${levelClasses[logLevel].split(' ')[1]}`}
      />
      <div className="card-body p-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div
                className={`${levelClasses[logLevel].split(' ')[1]} text-white rounded-full w-12 h-12 flex items-center justify-center`}
              >
                <FiFileText className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title text-lg font-bold">Workflow Log</h2>
              <p className="text-sm text-gray-500">Record a log entry</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">
              Logs a message to the workflow's execution history. Useful for debugging and tracking.
            </p>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Log Level</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={logLevel}
                onChange={(e) => setLogLevel(e.target.value as any)}
              >
                <option value="info">Info</option>
                <option value="warn">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Log Message</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                placeholder="e.g., Candidate {{candidate.name}} passed initial screening."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className={`alert alert-${logLevel} text-xs mt-2`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>The input data is passed through to the next node without modification.</span>
            </div>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className={`w-4 h-4 !${levelClasses[logLevel].split(' ')[1]}`}
      />
    </div>
  );
};

export default memo(WorkflowLogNode);
