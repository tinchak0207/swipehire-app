import type React from 'react';
import { memo, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiGitMerge, FiPlus, FiTrash2 } from 'react-icons/fi';
import { Handle, type NodeProps, Position } from 'reactflow';

interface Condition {
  inputVariable: string;
  operator: '==' | '!=' | '>' | '<' | 'contains';
  comparisonValue: string;
}

interface ConditionalBranchNodeData {
  conditions: Condition[];
  logicalOperator: 'AND' | 'OR';
}

const ConditionalBranchNode: React.FC<NodeProps<ConditionalBranchNodeData>> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const [conditions, setConditions] = useState<Condition[]>(
    data?.conditions ?? [{ inputVariable: '', operator: '==', comparisonValue: '' }]
  );
  const [logicalOperator, setLogicalOperator] = useState<'AND' | 'OR'>(
    data?.logicalOperator ?? 'AND'
  );

  const updateCondition = (index: number, field: keyof Condition, value: string) => {
    const newConditions = [...(conditions ?? [])];
    const conditionToUpdate = newConditions[index];

    if (!conditionToUpdate || !newConditions) return;

    if (field === 'operator') {
      conditionToUpdate[field] = value as Condition['operator'];
    } else {
      conditionToUpdate[field] = value;
    }

    setConditions(newConditions);
    // Here you would also call a function passed via props to update the global workflow state
    // For example: onUpdateNodeData(id, { ...data, conditions: newConditions });
  };

  const addCondition = () => {
    setConditions([...conditions, { inputVariable: '', operator: '==', comparisonValue: '' }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  return (
    <div className="card w-96 border-2 border-warning-focus bg-base-100 shadow-xl">
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="!bg-warning-focus h-4 w-4"
      />
      <div className="card-body p-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="h-12 w-12 rounded-full bg-warning text-warning-content">
                <FiGitMerge className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title font-bold text-lg">Conditional Branch</h2>
              <p className="text-gray-500 text-sm">Route based on logic</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-gray-600 text-sm">
              Directs the workflow down different paths based on one or more conditions.
            </p>

            {conditions.map((cond, index) => (
              <div key={index} className="space-y-2 rounded-lg border border-base-300 p-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs">Condition {index + 1}</span>
                  <button onClick={() => removeCondition(index)} className="btn btn-xs btn-ghost">
                    <FiTrash2 className="text-error" />
                  </button>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Input Variable</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., {{resume.sentiment}}"
                    className="input input-sm input-bordered"
                    value={cond.inputVariable}
                    onChange={(e) => updateCondition(index, 'inputVariable', e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Operator</span>
                  </label>
                  <select
                    className="select select-sm select-bordered"
                    value={cond.operator}
                    onChange={(e) =>
                      updateCondition(index, 'operator', e.target.value as Condition['operator'])
                    }
                  >
                    <option value="==">Equals</option>
                    <option value="!=">Not Equals</option>
                    <option value=">">Greater Than</option>
                    <option value="<">Less Than</option>
                    <option value="contains">Contains</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Comparison Value</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 'Positive'"
                    className="input input-sm input-bordered"
                    value={cond.comparisonValue}
                    onChange={(e) => updateCondition(index, 'comparisonValue', e.target.value)}
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
          </div>
        )}
      </div>
      <Handle
        type="source"
        id="true"
        position={Position.Right}
        style={{ top: '35%' }}
        className="!bg-success-focus h-4 w-4"
      >
        <div className="-left-8 -translate-y-1/2 absolute top-1/2 rounded bg-success px-1 text-success-content text-xs">
          TRUE
        </div>
      </Handle>
      <Handle
        type="source"
        id="false"
        position={Position.Right}
        style={{ top: '65%' }}
        className="!bg-error-focus h-4 w-4"
      >
        <div className="-left-8 -translate-y-1/2 absolute top-1/2 rounded bg-error px-1 text-error-content text-xs">
          FALSE
        </div>
      </Handle>
    </div>
  );
};

export default memo(ConditionalBranchNode);
