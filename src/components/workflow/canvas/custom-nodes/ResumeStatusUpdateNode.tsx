
import { Handle, Position } from 'reactflow';
import React, { memo, useState } from 'react';
import { NodeProps } from 'reactflow';
import { FiCheckSquare, FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface ResumeStatusUpdateNodeData {
  newStatus: string;
  stage: string;
}

const ResumeStatusUpdateNode: React.FC<NodeProps<ResumeStatusUpdateNodeData>> = ({ data, id }) => {
  const [expanded, setExpanded] = useState(false);
  const [newStatus, setNewStatus] = useState(data?.newStatus || '');
  const [stage, setStage] = useState(data?.stage || '');

  return (
    <div className="card w-96 bg-base-100 shadow-xl border-2 border-emerald-500">
      <Handle type="target" position={Position.Left} id="input" className="w-4 h-4 !bg-emerald-500" />
      <div className="card-body p-4">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="bg-emerald-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
                <FiCheckSquare className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title text-lg font-bold">Update Candidate Status</h2>
              <p className="text-sm text-gray-500">Change candidate stage</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">Updates the candidate's status in your Applicant Tracking System (ATS).</p>
            
            <div className="form-control w-full">
              <label className="label"><span className="label-text font-semibold">New Status</span></label>
              <select className="select select-bordered w-full" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                <option disabled value="">Select new status</option>
                <option value="new-applicant">New Applicant</option>
                <option value="screening">Screening</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label"><span className="label-text font-semibold">Hiring Stage</span></label>
              <input type="text" placeholder="e.g., Technical Interview" className="input input-bordered w-full" value={stage} onChange={(e) => setStage(e.target.value)} />
            </div>

            <div className="alert alert-success text-xs mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>The candidate data, with the updated status, is passed to the next node.</span>
            </div>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} id="output" className="w-4 h-4 !bg-emerald-500" />
    </div>
  );
};

export default memo(ResumeStatusUpdateNode);
