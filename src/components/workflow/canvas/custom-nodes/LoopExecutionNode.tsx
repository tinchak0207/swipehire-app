import type React from 'react';
import { memo, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiRepeat } from 'react-icons/fi';
import { Handle, type NodeProps, Position } from 'reactflow';

interface LoopExecutionNodeData {
  loopOver: string;
}

const LoopExecutionNode: React.FC<NodeProps<LoopExecutionNodeData>> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const [loopOver, setLoopOver] = useState(data?.loopOver || '');

  return (
    <div className="card w-96 border-2 border-blue-500 bg-base-100 shadow-xl">
      <Handle type="target" position={Position.Left} id="input" className="!bg-blue-500 h-4 w-4" />
      <div className="card-body p-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white">
                <FiRepeat className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title font-bold text-lg">Loop</h2>
              <p className="text-gray-500 text-sm">Iterate over a list</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-gray-600 text-sm">
              Iterates over an array from the data payload. The connected nodes will execute for
              each item in the array.
            </p>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Array to Loop Over</span>
              </label>
              <input
                type="text"
                placeholder="e.g., {{candidates}}"
                className="input input-bordered w-full"
                value={loopOver}
                onChange={(e) => setLoopOver(e.target.value)}
              />
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
                The 'Loop Body' output will run for each item. The current item is available as
                `currentItem`. The 'Loop End' output runs after all iterations are complete.
              </span>
            </div>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="loop-body"
        style={{ top: '35%' }}
        className="!bg-blue-500 h-4 w-4"
      >
        <div className="-left-12 -translate-y-1/2 absolute top-1/2 rounded bg-blue-500 px-1 text-white text-xs">
          Loop Body
        </div>
      </Handle>
      <Handle
        type="source"
        position={Position.Right}
        id="loop-end"
        style={{ top: '65%' }}
        className="!bg-gray-400 h-4 w-4"
      >
        <div className="-left-12 -translate-y-1/2 absolute top-1/2 rounded bg-gray-500 px-1 text-white text-xs">
          Loop End
        </div>
      </Handle>
    </div>
  );
};

export default memo(LoopExecutionNode);
