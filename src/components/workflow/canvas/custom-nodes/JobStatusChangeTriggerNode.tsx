

import { Handle, Position } from 'reactflow';
import React, { memo, useState } from 'react';
import { NodeProps } from 'reactflow';
import { FiBriefcase, FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface JobStatusChangeTriggerNodeData {
  fromStatus: string;
  toStatus: string;
}

const JobStatusChangeTriggerNode: React.FC<NodeProps<JobStatusChangeTriggerNodeData>> = ({ data, id }) => {
  const [expanded, setExpanded] = useState(false);
  const [fromStatus, setFromStatus] = useState(data?.fromStatus || 'any');
  const [toStatus, setToStatus] = useState(data?.toStatus || 'any');

  const jobStatuses = ['any', 'draft', 'open', 'filled', 'on-hold', 'closed'];

  return (
    <div className="card w-96 bg-base-100 shadow-xl border-2 border-indigo-500">
      <div className="card-body p-4">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="bg-indigo-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
                <FiBriefcase className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title text-lg font-bold">Job Status Change</h2>
              <p className="text-sm text-gray-500">Trigger on job update</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">Triggers the workflow when a job's status changes from a specific state to another.</p>
            
            <div className="flex gap-4">
              <div className="form-control w-1/2">
                <label className="label"><span className="label-text font-semibold">From Status</span></label>
                <select className="select select-bordered w-full" value={fromStatus} onChange={(e) => setFromStatus(e.target.value)}>
                  {jobStatuses.map(s => <option key={'from-'+s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>

              <div className="form-control w-1/2">
                <label className="label"><span className="label-text font-semibold">To Status</span></label>
                <select className="select select-bordered w-full" value={toStatus} onChange={(e) => setToStatus(e.target.value)}>
                  {jobStatuses.map(s => <option key={'to-'+s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div className="alert alert-info text-xs mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>The output will be the job data object, including the old and new status.</span>
            </div>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} id="output" className="w-4 h-4 !bg-indigo-500" />
    </div>
  );
};

export default JobStatusChangeTriggerNode;
