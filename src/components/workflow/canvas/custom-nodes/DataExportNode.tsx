

import { Handle, Position } from '@reactflow/core';
import React, { memo, useState } from 'react';
import { NodeProps } from 'reactflow';
import { FiDownload, FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface DataExportNodeData {
  format: 'CSV' | 'JSON' | 'XML';
  fileName: string;
  storageProvider: 's3' | 'google-drive' | 'local';
}

const DataExportNode: React.FC<NodeProps<DataExportNodeData>> = ({ data, id }) => {
  const [expanded, setExpanded] = useState(false);
  const [format, setFormat] = useState(data.format || 'CSV');
  const [fileName, setFileName] = useState(data.fileName || 'export-{{timestamp}}.csv');
  const [storageProvider, setStorageProvider] = useState(data.storageProvider || 'local');

  return (
    <div className="card w-96 bg-base-100 shadow-xl border-2 border-green-500">
      <Handle type="target" position={Position.Left} id="input" className="w-4 h-4 !bg-green-500" />
      <div className="card-body p-4">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
                <FiDownload className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title text-lg font-bold">Data Export</h2>
              <p className="text-sm text-gray-500">Save data to a file</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">Exports the current data payload to a file in the specified format and location.</p>
            
            <div className="form-control w-full">
              <label className="label"><span className="label-text font-semibold">File Format</span></label>
              <select className="select select-bordered w-full" value={format} onChange={(e) => setFormat(e.target.value as any)}>
                <option>CSV</option>
                <option>JSON</option>
                <option>XML</option>
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label"><span className="label-text font-semibold">File Name</span></label>
              <input type="text" placeholder="e.g., export-{{timestamp}}.csv" className="input input-bordered w-full" value={fileName} onChange={(e) => setFileName(e.target.value)} />
            </div>

            <div className="form-control w-full">
              <label className="label"><span className="label-text font-semibold">Storage Provider</span></label>
              <select className="select select-bordered w-full" value={storageProvider} onChange={(e) => setStorageProvider(e.target.value as any)}>
                <option value="local">Local Storage</option>
                <option value="s3">Amazon S3</option>
                <option value="google-drive">Google Drive</option>
              </select>
            </div>

            <div className="alert alert-success text-xs mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>The output will contain the URL or path to the exported file.</span>
            </div>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} id="output" className="w-4 h-4 !bg-green-500" />
    </div>
  );
};

export default memo(DataExportNode);
