
import React, { memo, useState } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { FiChevronDown, FiChevronUp, FiGitMerge, FiPlus, FiTrash2 } from 'react-icons/fi';

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
  const [conditions, setConditions] = useState<Condition[]>(data?.conditions ?? [{ inputVariable: '', operator: '==', comparisonValue: '' }]);
  const [logicalOperator, setLogicalOperator] = useState<'AND' | 'OR'>(data?.logicalOperator ?? 'AND');

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
    <div className="card w-96 bg-base-100 shadow-xl border-2 border-warning-focus">
      <Handle type="target" position={Position.Left} id="input" className="w-4 h-4 !bg-warning-focus" />
      <div className="card-body p-4">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="bg-warning text-warning-content rounded-full w-12 h-12">
                <FiGitMerge className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title text-lg font-bold">Conditional Branch</h2>
              <p className="text-sm text-gray-500">Route based on logic</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">Directs the workflow down different paths based on one or more conditions.</p>
            
            {conditions.map((cond, index) => (
              <div key={index} className="p-2 border border-base-300 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">Condition {index + 1}</span>
                  <button onClick={() => removeCondition(index)} className="btn btn-xs btn-ghost">
                    <FiTrash2 className="text-error"/>
                  </button>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Input Variable</span></label>
                  <input type="text" placeholder="e.g., {{resume.sentiment}}" className="input input-sm input-bordered" value={cond.inputVariable} onChange={(e) => updateCondition(index, 'inputVariable', e.target.value)} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Operator</span></label>
                  <select className="select select-sm select-bordered" value={cond.operator} onChange={(e) => updateCondition(index, 'operator', e.target.value as Condition['operator'])}>
                    <option value="==">Equals</option>
                    <option value="!=">Not Equals</option>
                    <option value=">">Greater Than</option>
                    <option value="<">Less Than</option>
                    <option value="contains">Contains</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Comparison Value</span></label>
                  <input type="text" placeholder="e.g., 'Positive'" className="input input-sm input-bordered" value={cond.comparisonValue} onChange={(e) => updateCondition(index, 'comparisonValue', e.target.value)} />
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between">
              <button onClick={addCondition} className="btn btn-sm btn-outline btn-primary">
                <FiPlus /> Add Condition
              </button>
              {conditions.length > 1 && (
                <div className="form-control">
                   <label className="label"><span className="label-text">Logic</span></label>
                  <div className="join">
                    <button className={`btn btn-sm join-item ${logicalOperator === 'AND' ? 'btn-warning' : ''}`} onClick={() => setLogicalOperator('AND')}>AND</button>
                    <button className={`btn btn-sm join-item ${logicalOperator === 'OR' ? 'btn-warning' : ''}`} onClick={() => setLogicalOperator('OR')}>OR</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Handle type="source" id="true" position={Position.Right} style={{ top: '35%' }} className="w-4 h-4 !bg-success-focus">
        <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-xs bg-success text-success-content px-1 rounded">TRUE</div>
      </Handle>
      <Handle type="source" id="false" position={Position.Right} style={{ top: '65%' }} className="w-4 h-4 !bg-error-focus">
        <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-xs bg-error text-error-content px-1 rounded">FALSE</div>
      </Handle>
    </div>
  );
};

export default memo(ConditionalBranchNode);
