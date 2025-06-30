import { Handle, Position } from '@reactflow/core';
import React, { memo, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiUserCheck } from 'react-icons/fi';
import { NodeProps } from 'reactflow';

interface TaskAllocationNodeData {
  taskType: string;
  assignee: string; // e.g., 'round-robin', 'specific-user', 'by-role'
  assigneeId?: string;
  taskDetails: string;
}

const TaskAllocationNode: React.FC<NodeProps<TaskAllocationNodeData>> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const [assignee, setAssignee] = useState(data.assignee || 'round-robin');
  const [taskDetails, setTaskDetails] = useState(data.taskDetails || '');

  return (
    <div className="card w-96 bg-base-100 shadow-xl border-2 border-indigo-500">
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="w-4 h-4 !bg-indigo-500"
      />
      <div className="card-body p-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="bg-indigo-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
                <FiUserCheck className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title text-lg font-bold">Task Allocation</h2>
              <p className="text-sm text-gray-500">Create and assign a task</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">
              Creates a task in your project management system and assigns it to a user or team.
            </p>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Assign To</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              >
                <option value="round-robin">Round Robin (Recruiters)</option>
                <option value="hiring-manager">Hiring Manager for Job</option>
                <option value="specific-user">Specific User</option>
                <option value="specific-team">Specific Team</option>
              </select>
            </div>

            {(assignee === 'specific-user' || assignee === 'specific-team') && (
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">
                    {assignee === 'specific-user' ? 'User ID' : 'Team ID'}
                  </span>
                </label>
                <input
                  type="text"
                  placeholder={
                    assignee === 'specific-user' ? 'e.g., user-abc-123' : 'e.g., team-reviewers'
                  }
                  className="input input-bordered w-full"
                />
              </div>
            )}

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Task Details</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                placeholder="e.g., Please review the attached resume for {{candidate.name}}."
                value={taskDetails}
                onChange={(e) => setTaskDetails(e.target.value)}
              ></textarea>
            </div>

            <div className="alert alert-indigo text-xs mt-2">
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
                ></path>
              </svg>
              <span>The output will contain the ID of the created task.</span>
            </div>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-4 h-4 !bg-indigo-500"
      />
    </div>
  );
};

export default memo(TaskAllocationNode);
