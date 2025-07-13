import type React from 'react';
import { memo, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiCpu } from 'react-icons/fi';
import { Handle, type NodeProps, Position } from 'reactflow';

interface InvokeAINodeData {
  prompt: string;
  outputVariable: string;
}

const InvokeAINode: React.FC<NodeProps<InvokeAINodeData>> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const [prompt, setPrompt] = useState(data?.prompt || '');
  const [outputVariable, setOutputVariable] = useState(data?.outputVariable || 'aiResponse');

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
                <FiCpu className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title font-bold text-lg">Invoke AI</h2>
              <p className="text-gray-500 text-sm">Use a custom AI prompt</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-gray-600 text-sm">
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
              />
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
        className="!bg-purple-500 h-4 w-4"
      />
    </div>
  );
};

export default memo(InvokeAINode);
