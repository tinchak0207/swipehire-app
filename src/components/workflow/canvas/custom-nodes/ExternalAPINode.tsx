import { Handle, Position } from '@reactflow/core';
import React, { memo, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiCloud, FiPlus, FiTrash2 } from 'react-icons/fi';
import { NodeProps } from 'reactflow';

interface KeyValuePair {
  key: string;
  value: string;
}

interface ExternalAPINodeData {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: KeyValuePair[];
  body?: string;
}

const ExternalAPINode: React.FC<NodeProps<ExternalAPINodeData>> = ({ data, id }) => {
  const [expanded, setExpanded] = useState(false);
  const [url, setUrl] = useState(data?.url || '');
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>(data?.method || 'GET');
  const [headers, setHeaders] = useState<KeyValuePair[]>(data?.headers || [{ key: '', value: '' }]);

  const updateHeader = (index: number, field: keyof KeyValuePair, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  return (
    <div className="card w-96 bg-base-100 shadow-xl border-2 border-error-focus">
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="w-4 h-4 !bg-error-focus"
      />
      <div className="card-body p-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="bg-error text-error-content rounded-full w-12 h-12">
                <FiCloud className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title text-lg font-bold">External API Call</h2>
              <p className="text-sm text-gray-500">Integrate with any service</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">
              Sends an HTTP request to a specified URL. Use data from previous nodes with template
              values like {'{{variableName}}'}
            </p>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">URL</span>
              </label>
              <input
                type="text"
                placeholder="https://api.example.com/data"
                className="input input-bordered w-full"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Method</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={method}
                onChange={(e) => setMethod(e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE')}
              >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Headers</span>
              </label>
              <div className="space-y-2">
                {headers.map((header, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Key"
                      className="input input-sm input-bordered w-1/2"
                      value={header.key}
                      onChange={(e) => updateHeader(index, 'key', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      className="input input-sm input-bordered w-1/2"
                      value={header.value}
                      onChange={(e) => updateHeader(index, 'value', e.target.value)}
                    />
                    <button onClick={() => removeHeader(index)} className="btn btn-xs btn-ghost">
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
                <button onClick={addHeader} className="btn btn-xs btn-outline btn-primary">
                  <FiPlus /> Add Header
                </button>
              </div>
            </div>

            {(method === 'POST' || method === 'PUT') && (
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Request Body (JSON)</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24 font-mono text-xs"
                  placeholder='{ "key": "value", "itemId": "{{input.id}}" }'
                ></textarea>
              </div>
            )}

            <div className="alert alert-error text-xs mt-2">
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
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>The API response (status, headers, body) will be the output of this node.</span>
            </div>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-4 h-4 !bg-error-focus"
      />
    </div>
  );
};

export default memo(ExternalAPINode);
