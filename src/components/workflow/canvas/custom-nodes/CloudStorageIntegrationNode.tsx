import { Handle, Position } from '@reactflow/core';
import type React from 'react';
import { memo, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiCloud, FiDownload, FiUpload } from 'react-icons/fi';
import type { NodeProps } from 'reactflow';

interface CloudStorageIntegrationNodeData {
  provider: 'aws-s3' | 'google-cloud-storage' | 'azure-blob';
  operation: 'upload' | 'download';
  bucketName: string;
  filePath: string;
  localVariableName: string;
}

const CloudStorageIntegrationNode: React.FC<NodeProps<CloudStorageIntegrationNodeData>> = ({
  data,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [provider, setProvider] = useState(data.provider || 'aws-s3');
  const [operation, setOperation] = useState(data.operation || 'upload');
  const [bucketName, setBucketName] = useState(data.bucketName || '');
  const [filePath, setFilePath] = useState(data.filePath || '');
  const [localVariableName, setLocalVariableName] = useState(data.localVariableName || '');

  return (
    <div className="card w-96 bg-base-100 shadow-xl border-2 border-blue-400">
      <Handle type="target" position={Position.Left} id="input" className="w-4 h-4 !bg-blue-400" />
      <div className="card-body p-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="bg-blue-400 text-white rounded-full w-12 h-12 flex items-center justify-center">
                <FiCloud className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title text-lg font-bold">Cloud Storage</h2>
              <p className="text-sm text-gray-500">Interact with S3, GCS, Azure</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">
              Upload or download files from a cloud storage provider.
            </p>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Provider</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={provider}
                onChange={(e) => setProvider(e.target.value as any)}
              >
                <option value="aws-s3">AWS S3</option>
                <option value="google-cloud-storage">Google Cloud Storage</option>
                <option value="azure-blob">Azure Blob Storage</option>
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Operation</span>
              </label>
              <div className="join">
                <button
                  className={`btn join-item w-1/2 ${operation === 'upload' ? 'btn-primary' : ''}`}
                  onClick={() => setOperation('upload')}
                >
                  <FiUpload className="mr-2" />
                  Upload
                </button>
                <button
                  className={`btn join-item w-1/2 ${operation === 'download' ? 'btn-primary' : ''}`}
                  onClick={() => setOperation('download')}
                >
                  <FiDownload className="mr-2" />
                  Download
                </button>
              </div>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Bucket/Container Name</span>
              </label>
              <input
                type="text"
                placeholder="e.g., my-resumes-bucket"
                className="input input-bordered w-full"
                value={bucketName}
                onChange={(e) => setBucketName(e.target.value)}
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Remote File Path</span>
              </label>
              <input
                type="text"
                placeholder="e.g., /resumes/{{candidate.id}}.pdf"
                className="input input-bordered w-full"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">
                  {operation === 'upload' ? 'Variable to Upload' : 'Save to Variable'}
                </span>
              </label>
              <input
                type="text"
                placeholder={
                  operation === 'upload' ? 'e.g., {{resumeFile}}' : 'e.g., downloadedResume'
                }
                className="input input-bordered w-full"
                value={localVariableName}
                onChange={(e) => setLocalVariableName(e.target.value)}
              />
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
                />
              </svg>
              <span>
                For uploads, the output contains the file URL. For downloads, the file content is
                added to the specified variable.
              </span>
            </div>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-4 h-4 !bg-blue-400"
      />
    </div>
  );
};

export default memo(CloudStorageIntegrationNode);
