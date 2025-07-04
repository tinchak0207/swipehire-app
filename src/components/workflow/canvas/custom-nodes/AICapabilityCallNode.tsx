import { Handle, Position } from '@reactflow/core';
import React, { memo, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiCpu } from 'react-icons/fi';
import { NodeProps } from 'reactflow';

interface AICapabilityCallNodeData {
  capability: string;
  inputData: string;
}

const AICapabilityCallNode: React.FC<NodeProps<AICapabilityCallNodeData>> = ({ data, id }) => {
  const [expanded, setExpanded] = useState(false);
  const [capability, setCapability] = useState(data.capability || '');
  const [inputData, setInputData] = useState(data.inputData || '');

  return (
    <div className="card w-96 bg-base-100 shadow-xl border-2 border-cyan-500">
      <Handle type="target" position={Position.Left} id="input" className="w-4 h-4 !bg-cyan-500" />
      <div className="card-body p-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="bg-cyan-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
                <FiCpu className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title text-lg font-bold">AI Capability Call</h2>
              <p className="text-sm text-gray-500">Leverage a specific AI model</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">
              Invokes a specialized AI capability, such as sentiment analysis, keyword extraction,
              or summarization.
            </p>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">AI Capability</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={capability}
                onChange={(e) => setCapability(e.target.value)}
              >
                <option disabled value="">
                  Select a capability
                </option>
                <option value="sentiment-analysis">Sentiment Analysis</option>
                <option value="keyword-extraction">Keyword Extraction</option>
                <option value="resume-summarization">Resume Summarization</option>
                <option value="job-description-generation">Job Description Generation</option>
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Input Data</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                placeholder="e.g., {{resume.text}}"
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
              ></textarea>
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
                The output will be the result of the AI capability call, added to the data payload.
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

export default memo(AICapabilityCallNode);
