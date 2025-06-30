import { Handle, Position } from '@reactflow/core';
import React, { memo, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiFileText, FiPlus } from 'react-icons/fi';
import { NodeProps } from 'reactflow';

interface AnalyzeResumeNodeData {
  analysisFields: string[];
  customInstructions?: string;
}

const availableFields = [
  'Contact Information',
  'Work Experience',
  'Education',
  'Skills',
  'Certifications',
  'Projects',
  'Keywords',
  'Overall Sentiment',
];

const AnalyzeResumeNode: React.FC<NodeProps<AnalyzeResumeNodeData>> = ({ data, id }) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>(
    data.analysisFields || ['Skills', 'Work Experience']
  );

  const toggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
    // Update node data in workflow state
  };

  return (
    <div className="card w-80 bg-base-100 shadow-xl border-2 border-secondary-focus">
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="w-4 h-4 !bg-secondary-focus"
      />
      <div className="card-body p-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="bg-secondary text-secondary-content rounded-full w-12 h-12">
                <FiFileText className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title text-lg font-bold">Analyze Resume</h2>
              <p className="text-sm text-gray-500">AI-powered resume parsing</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">
              Extracts structured data from a resume file. The resume should be provided as input to
              this node.
            </p>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Fields to Extract</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {availableFields.map((field) => (
                  <button
                    key={field}
                    onClick={() => toggleField(field)}
                    className={`btn btn-xs ${selectedFields.includes(field) ? 'btn-secondary' : 'btn-outline'}`}
                  >
                    {field}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Custom Instructions (Optional)</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                placeholder="e.g., 'Extract the candidate\'s years of experience with Python.'"
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
              <span>The output will be a JSON object with the extracted fields.</span>
            </div>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-4 h-4 !bg-secondary-focus"
      />
    </div>
  );
};

export default memo(AnalyzeResumeNode);
