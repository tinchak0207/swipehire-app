import { Handle, Position } from '@reactflow/core';
import type React from 'react';
import { memo, useState } from 'react';
import { FiBriefcase, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import type { NodeProps } from 'reactflow';

interface EnterpriseOAIntegrationNodeData {
  system: 'workday' | 'sap-successfactors' | 'oracle-hcm';
  action: string;
  payload: string;
}

const EnterpriseOAIntegrationNode: React.FC<NodeProps<EnterpriseOAIntegrationNodeData>> = ({
  data,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [system, setSystem] = useState(data.system || 'workday');
  const [action, setAction] = useState(data.action || '');
  const [payload, setPayload] = useState(data.payload || '{}');

  return (
    <div className="card w-96 border-2 border-gray-700 bg-base-100 shadow-xl">
      <Handle type="target" position={Position.Left} id="input" className="!bg-gray-700 h-4 w-4" />
      <div className="card-body p-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 text-white">
                <FiBriefcase className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title font-bold text-lg">Enterprise System</h2>
              <p className="text-gray-500 text-sm">Integrate with Workday, SAP, etc.</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-gray-600 text-sm">
              Performs an action in a connected enterprise system like an HRIS or ERP.
            </p>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">System</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={system}
                onChange={(e) => setSystem(e.target.value as any)}
              >
                <option value="workday">Workday</option>
                <option value="sap-successfactors">SAP SuccessFactors</option>
                <option value="oracle-hcm">Oracle HCM Cloud</option>
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Action / API Endpoint</span>
              </label>
              <input
                type="text"
                placeholder="e.g., /v1/employees or CreateNewHire"
                className="input input-bordered w-full"
                value={action}
                onChange={(e) => setAction(e.target.value)}
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Payload (JSON)</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24 font-mono text-xs"
                placeholder='{ "employeeId": "{{candidate.id}}", "firstName": "{{candidate.firstName}}" }'
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
              />
            </div>

            <div className="alert alert-neutral mt-2 text-xs">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>The response from the enterprise system will be the output of this node.</span>
            </div>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!bg-gray-700 h-4 w-4"
      />
    </div>
  );
};

export default memo(EnterpriseOAIntegrationNode);
