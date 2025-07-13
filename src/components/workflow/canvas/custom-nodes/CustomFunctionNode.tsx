import { Handle, Position } from '@reactflow/core';
import type React from 'react';
import { memo, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiCode } from 'react-icons/fi';
import type { NodeProps } from 'reactflow';

interface CustomFunctionNodeData {
  code: string;
}

const CustomFunctionNode: React.FC<NodeProps<CustomFunctionNodeData>> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const [code, setCode] = useState(
    data.code ||
      `// Write your JavaScript code here\n// The 'data' variable is available from the previous node\nreturn { ...data, customOutput: true };`
  );

  return (
    <div className="card w-96 border-2 border-purple-500 bg-base-100 shadow-xl">
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="!bg-purple-500 h-4 w-4"
      />
      <div className="card-body p-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500 text-white">
                <FiCode className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title font-bold text-lg">Custom Function</h2>
              <p className="text-gray-500 text-sm">Execute custom JavaScript</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-gray-600 text-sm">
              Write custom JavaScript code to process the data payload. The function has access to a
              `data` variable containing the output from the previous node.
            </p>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">JavaScript Code</span>
              </label>
              <div className="mockup-code h-64 text-sm">
                <textarea
                  className="h-full w-full bg-gray-800 p-4 font-mono text-white"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
            </div>

            <div className="alert alert-purple mt-2 text-xs">
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>The value returned by your script will be the output of this node.</span>
            </div>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!bg-purple-500 h-4 w-4"
      />
    </div>
  );
};

export default memo(CustomFunctionNode);
