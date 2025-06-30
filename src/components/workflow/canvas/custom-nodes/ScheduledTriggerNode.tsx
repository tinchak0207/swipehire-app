import { Handle, Position } from '@reactflow/core';
import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiClock } from 'react-icons/fi';
import { NodeProps } from 'reactflow';

interface ScheduledTriggerNodeData {
  cronExpression: string;
}

const ScheduledTriggerNode: React.FC<NodeProps<ScheduledTriggerNodeData>> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const [cronExpression, setCronExpression] = useState(data.cronExpression || '0 9 * * 1-5');

  return (
    <div className="card w-96 bg-base-100 shadow-xl border-2 border-cyan-500">
      <div className="card-body p-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="bg-cyan-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
                <FiClock className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title text-lg font-bold">Scheduled Trigger</h2>
              <p className="text-sm text-gray-500">Run on a schedule</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">
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
        className="w-4 h-4 !bg-cyan-500"
      />
    </div>
  );
};

export default ScheduledTriggerNode;
