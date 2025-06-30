import { Handle, Position } from '@reactflow/core';
import React, { memo, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiFilter, FiPlus, FiTrash2 } from 'react-icons/fi';
import { NodeProps } from 'reactflow';

interface FilterCondition {
  field: string;
  operator: '==' | '!=' | '>' | '<' | 'contains' | 'in';
  value: string;
}

interface DataFilterNodeData {
  conditions: FilterCondition[];
  logicalOperator: 'AND' | 'OR';
}

const DataFilterNode: React.FC<NodeProps<DataFilterNodeData>> = ({ data, id }) => {
  const [expanded, setExpanded] = useState(false);
  const [conditions, setConditions] = useState<FilterCondition[]>(
    data.conditions || [{ field: '', operator: '==', value: '' }]
  );
  const [logicalOperator, setLogicalOperator] = useState<'AND' | 'OR'>(
    data.logicalOperator || 'AND'
  );

  const updateCondition = (index: number, field: keyof FilterCondition, value: string) => {
    const newConditions = [...conditions];
    newConditions[index][field] = value;
    setConditions(newConditions);
  };

  const addCondition = () => {
    setConditions([...conditions, { field: '', operator: '==', value: '' }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  return (
    <div className="card w-96 bg-base-100 shadow-xl border-2 border-orange-500">
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="w-4 h-4 !bg-orange-500"
      />
      <div className="card-body p-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="bg-orange-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
                <FiFilter className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title text-lg font-bold">Data Filter</h2>
              <p className="text-sm text-gray-500">Filter items from a list</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">
              Filters an array of items based on specified conditions. Expects an array as input.
            </p>

            {conditions.map((cond, index) => (
              <div key={index} className="p-2 border border-base-300 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">Condition {index + 1}</span>
                  <button onClick={() => removeCondition(index)} className="btn btn-xs btn-ghost">
                    <FiTrash2 className="text-error" />
                  </button>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Field Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., item.score"
                    className="input input-sm input-bordered"
                    value={cond.field}
                    onChange={(e) => updateCondition(index, 'field', e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Operator</span>
                  </label>
                  <select
                    className="select select-sm select-bordered"
                    value={cond.operator}
                    onChange={(e) => updateCondition(index, 'operator', e.target.value as any)}
                  >
                    <option value="==">Equals</option>
                    <option value="!=">Not Equals</option>
                    <option value=">">Greater Than</option>
                    <option value="<">Less Than</option>
                    <option value="contains">Contains</option>
                    <option value="in">Is one of (comma-sep)</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Value</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 95"
                    className="input input-sm input-bordered"
                    value={cond.value}
                    onChange={(e) => updateCondition(index, 'value', e.target.value)}
                  />
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between">
              <button onClick={addCondition} className="btn btn-sm btn-outline btn-primary">
                <FiPlus /> Add Condition
              </button>
              {conditions.length > 1 && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Logic</span>
                  </label>
                  <div className="join">
                    <button
                      className={`btn btn-sm join-item ${logicalOperator === 'AND' ? 'btn-warning' : ''}`}
                      onClick={() => setLogicalOperator('AND')}
                    >
                      AND
                    </button>
                    <button
                      className={`btn btn-sm join-item ${logicalOperator === 'OR' ? 'btn-warning' : ''}`}
                      onClick={() => setLogicalOperator('OR')}
                    >
                      OR
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="alert alert-warning text-xs mt-2">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>
                The output will be a new array containing only the items that match the conditions.
              </span>
            </div>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-4 h-4 !bg-orange-500"
      />
    </div>
  );
};

export default memo(DataFilterNode);
