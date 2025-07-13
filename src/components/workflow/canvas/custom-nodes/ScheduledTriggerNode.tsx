import { Handle, Position } from '@reactflow/core';
import type React from 'react';
import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiClock } from 'react-icons/fi';
import type { NodeProps } from 'reactflow';

interface ScheduledTriggerNodeData {
  cronExpression: string;
}

const ScheduledTriggerNode: React.FC<NodeProps<ScheduledTriggerNodeData>> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const [cronExpression, setCronExpression] = useState(data.cronExpression || '0 9 * * 1-5');

  return (
    <div className="card w-96 border-2 border-cyan-500 bg-base-100 shadow-xl">
      <div className="card-body p-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-white">
                <FiClock className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title font-bold text-lg">Scheduled Trigger</h2>
              <p className="text-gray-500 text-sm">Run on a schedule</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-gray-600 text-sm">
              Triggers the workflow automatically based on a CRON schedule.
            </p>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">CRON Expression</span>
              </label>
              <input
                type="text"
                placeholder="* * * * *"
                className="input input-bordered w-full font-mono text-sm"
                value={cronExpression}
                onChange={(e) => setCronExpression(e.target.value)}
              />
              <label className="label">
                <a
                  href="https://crontab.guru/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label-text-alt link link-hover"
                >
                  Need help with CRON syntax?
                </a>
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
                Example: `0 9 * * 1-5` means "at 9:00 AM every day from Monday to Friday". The
                output contains the trigger timestamp.
              </span>
            </div>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!bg-cyan-500 h-4 w-4"
      />
    </div>
  );
};

export default ScheduledTriggerNode;
