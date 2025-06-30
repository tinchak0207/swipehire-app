import React, { memo, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiCpu } from 'react-icons/fi';
import { Handle, NodeProps, Position } from 'reactflow';

interface InvokeAINodeData {
  prompt: string;
  outputVariable: string;
}

const InvokeAINode: React.FC<NodeProps<InvokeAINodeData>> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const [prompt, setPrompt] = useState(data?.prompt || '');
  const [outputVariable, setOutputVariable] = useState(data?.outputVariable || 'aiResponse');

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
                <FiCpu className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title text-lg font-bold">Invoke AI</h2>
              <p className="text-sm text-gray-500">Use a custom AI prompt</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">
              Sends a prompt to a large language model (LLM) and adds the response to the data
              payload.
            </p>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">AI Prompt</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-32"
                placeholder="e.g., Based on the following resume, please summarize the candidate\'s experience with React: {{resume.text}}"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              ></textarea>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Output Variable Name</span>
              </label>
              <input
                type="text"
                placeholder="e.g., summary"
                className="input input-bordered w-full"
                value={outputVariable}
                onChange={(e) => setOutputVariable(e.target.value)}
              />
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
              <span>
                The AI's response will be available in the output data under the specified variable
                name.
              </span>
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

export default memo(InvokeAINode);
