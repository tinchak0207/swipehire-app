import { Handle, Position } from '@reactflow/core';
import type React from 'react';
import { memo, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiDownload } from 'react-icons/fi';
import type { NodeProps } from 'reactflow';

interface DataExportNodeData {
  format: 'CSV' | 'JSON' | 'XML';
  fileName: string;
  storageProvider: 's3' | 'google-drive' | 'local';
}

const DataExportNode: React.FC<NodeProps<DataExportNodeData>> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const [format, setFormat] = useState(data.format || 'CSV');
  const [fileName, setFileName] = useState(data.fileName || 'export-{{timestamp}}.csv');
  const [storageProvider, setStorageProvider] = useState(data.storageProvider || 'local');

  return (
    <div className="card w-96 border-2 border-green-500 bg-base-100 shadow-xl">
      <Handle type="target" position={Position.Left} id="input" className="!bg-green-500 h-4 w-4" />
      <div className="card-body p-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white">
                <FiDownload className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title font-bold text-lg">Data Export</h2>
              <p className="text-gray-500 text-sm">Save data to a file</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-gray-600 text-sm">
              Exports the current data payload to a file in the specified format and location.
            </p>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">File Format</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
              >
                <option>CSV</option>
                <option>JSON</option>
                <option>XML</option>
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">File Name</span>
              </label>
              <input
                type="text"
                placeholder="e.g., export-{{timestamp}}.csv"
                className="input input-bordered w-full"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Storage Provider</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={storageProvider}
                onChange={(e) => setStorageProvider(e.target.value as any)}
              >
                <option value="local">Local Storage</option>
                <option value="s3">Amazon S3</option>
                <option value="google-drive">Google Drive</option>
              </select>
            </div>

            <div className="alert alert-success mt-2 text-xs">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>The output will contain the URL or path to the exported file.</span>
            </div>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!bg-green-500 h-4 w-4"
      />
    </div>
  );
};

export default memo(DataExportNode);
