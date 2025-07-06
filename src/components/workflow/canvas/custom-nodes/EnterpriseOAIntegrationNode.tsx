import { Handle, Position } from '@reactflow/core';
import React, { memo, useState } from 'react';
import { FiBriefcase, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { NodeProps } from 'reactflow';

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
    <div className="card w-96 bg-base-100 shadow-xl border-2 border-gray-700">
      <Handle type="target" position={Position.Left} id="input" className="w-4 h-4 !bg-gray-700" />
      <div className="card-body p-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="bg-gray-700 text-white rounded-full w-12 h-12 flex items-center justify-center">
                <FiBriefcase className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title text-lg font-bold">Enterprise System</h2>
              <p className="text-sm text-gray-500">Integrate with Workday, SAP, etc.</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">
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
              ></textarea>
            </div>

            <div className="alert alert-neutral text-xs mt-2">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
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
        className="w-4 h-4 !bg-gray-700"
      />
    </div>
  );
};

export default memo(EnterpriseOAIntegrationNode);
