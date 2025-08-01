import { Handle, Position } from '@reactflow/core';
import type React from 'react';
import { memo, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiFileText } from 'react-icons/fi';
import type { NodeProps } from 'reactflow';

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

const AnalyzeResumeNode: React.FC<NodeProps<AnalyzeResumeNodeData>> = ({ data }) => {
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
    <div className="card w-80 border-2 border-secondary-focus bg-base-100 shadow-xl">
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="!bg-secondary-focus h-4 w-4"
      />
      <div className="card-body p-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="h-12 w-12 rounded-full bg-secondary text-secondary-content">
                <FiFileText className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title font-bold text-lg">Analyze Resume</h2>
              <p className="text-gray-500 text-sm">AI-powered resume parsing</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-gray-600 text-sm">
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
              <span>The output will be a JSON object with the extracted fields.</span>
            </div>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!bg-secondary-focus h-4 w-4"
      />
    </div>
  );
};

export default memo(AnalyzeResumeNode);
