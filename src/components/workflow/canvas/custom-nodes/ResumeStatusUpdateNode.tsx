import type React from 'react';
import { memo, useState } from 'react';
import { FiCheckSquare, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { Handle, type NodeProps, Position } from 'reactflow';

interface ResumeStatusUpdateNodeData {
  newStatus: string;
  stage: string;
}

const ResumeStatusUpdateNode: React.FC<NodeProps<ResumeStatusUpdateNodeData>> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const [newStatus, setNewStatus] = useState(data?.newStatus || '');
  const [stage, setStage] = useState(data?.stage || '');

  return (
    <div className="card w-96 border-2 border-emerald-500 bg-base-100 shadow-xl">
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="!bg-emerald-500 h-4 w-4"
      />
      <div className="card-body p-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">
                <FiCheckSquare className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title font-bold text-lg">Update Candidate Status</h2>
              <p className="text-gray-500 text-sm">Change candidate stage</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-gray-600 text-sm">
              Updates the candidate's status in your Applicant Tracking System (ATS).
            </p>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">New Status</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option disabled value="">
                  Select new status
                </option>
                <option value="new-applicant">New Applicant</option>
                <option value="screening">Screening</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Hiring Stage</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Technical Interview"
                className="input input-bordered w-full"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
              />
            </div>

            <div className="alert alert-success mt-2 text-xs">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>The candidate data, with the updated status, is passed to the next node.</span>
            </div>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!bg-emerald-500 h-4 w-4"
      />
    </div>
  );
};

export default memo(ResumeStatusUpdateNode);
