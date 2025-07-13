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
    <div className="card w-96 bg-base-100 shadow-xl border-2 border-purple-500">
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="w-4 h-4 !bg-purple-500"
      />
      <div className="card-body p-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
                <FiCode className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title text-lg font-bold">Custom Function</h2>
              <p className="text-sm text-gray-500">Execute custom JavaScript</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">
              Write custom JavaScript code to process the data payload. The function has access to a
              `data` variable containing the output from the previous node.
            </p>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">JavaScript Code</span>
              </label>
              <div className="mockup-code h-64 text-sm">
                <textarea
                  className="bg-gray-800 text-white w-full h-full p-4 font-mono"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
            </div>

            <div className="alert alert-purple text-xs mt-2">
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
        className="w-4 h-4 !bg-purple-500"
      />
    </div>
  );
};

export default memo(CustomFunctionNode);
