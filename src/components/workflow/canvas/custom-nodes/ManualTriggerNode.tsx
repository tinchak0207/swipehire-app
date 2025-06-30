import React, { memo, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiPlayCircle, FiUpload } from 'react-icons/fi';
import { Handle, NodeProps, Position } from 'reactflow';

interface ManualTriggerNodeData {
  jsonInput?: string;
}

const ManualTriggerNode: React.FC<NodeProps<ManualTriggerNodeData>> = ({ data, id }) => {
  const [expanded, setExpanded] = useState(false);
  const [jsonInput, setJsonInput] = useState(data?.jsonInput || '');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const text = await file.text();
      setJsonInput(text);
      // Update node data in workflow state
    }
  };

  return (
    <div className="card w-96 bg-base-100 shadow-xl border-2 border-success-focus">
      <div className="card-body p-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="bg-success text-success-content rounded-full w-12 h-12">
                <FiPlayCircle className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title text-lg font-bold">Manual Trigger</h2>
              <p className="text-sm text-gray-500">Start workflow with custom data</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">
              Manually initiates the workflow. You can provide a JSON object as the initial data
              payload.
            </p>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Initial JSON Data (Optional)</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-32 font-mono text-xs"
                placeholder='{ "candidateId": "123", "jobId": "456" }'
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
              ></textarea>
            </div>

            <div className="form-control w-full">
              <label htmlFor={`file-upload-${id}`} className="btn btn-sm btn-outline btn-primary">
                <FiUpload className="mr-2" /> Upload JSON File
              </label>
              <input
                id={`file-upload-${id}`}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="alert alert-success text-xs mt-2">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>The provided JSON will be the output of this node.</span>
            </div>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-4 h-4 !bg-success-focus"
      />
    </div>
  );
};

export default ManualTriggerNode;
