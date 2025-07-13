import type React from 'react';
import { memo, useState } from 'react';
import { FiAward, FiChevronDown, FiChevronUp, FiPlus, FiTrash2 } from 'react-icons/fi';
import { Handle, type NodeProps, Position } from 'reactflow';

interface PriorityRule {
  condition: string; // e.g., 'resume.score > 90'
  priority: 'High' | 'Medium' | 'Low';
}

interface PriorityJudgmentNodeData {
  rules: PriorityRule[];
  defaultPriority: 'High' | 'Medium' | 'Low';
}

const PriorityJudgmentNode: React.FC<NodeProps<PriorityJudgmentNodeData>> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const [rules, setRules] = useState<PriorityRule[]>(
    data?.rules || [{ condition: '', priority: 'Medium' }]
  );
  const [defaultPriority, setDefaultPriority] = useState(data?.defaultPriority || 'Low');

  const updateRule = (index: number, field: keyof PriorityRule, value: string) => {
    const newRules = [...rules];
    const ruleToUpdate = newRules[index];
    if (ruleToUpdate) {
      ruleToUpdate[field] = value as any;
      setRules(newRules);
    }
  };

  const addRule = () => {
    setRules([...rules, { condition: '', priority: 'Medium' }]);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  return (
    <div className="card w-96 bg-base-100 shadow-xl border-2 border-red-500">
      <Handle type="target" position={Position.Left} id="input" className="w-4 h-4 !bg-red-500" />
      <div className="card-body p-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
                <FiAward className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title text-lg font-bold">Priority Judgment</h2>
              <p className="text-sm text-gray-500">Assign priority level</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">
              Assigns a priority level based on a set of rules. The first rule that evaluates to
              true determines the priority.
            </p>

            {rules.map((rule, index) => (
              <div key={index} className="p-2 border border-base-300 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">Rule {index + 1}</span>
                  <button onClick={() => removeRule(index)} className="btn btn-xs btn-ghost">
                    <FiTrash2 className="text-error" />
                  </button>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Condition (e.g., data.score &gt; 80)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="data.field === 'value'"
                    className="input input-sm input-bordered font-mono text-xs"
                    value={rule.condition}
                    onChange={(e) => updateRule(index, 'condition', e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Set Priority to</span>
                  </label>
                  <select
                    className="select select-sm select-bordered"
                    value={rule.priority}
                    onChange={(e) => updateRule(index, 'priority', e.target.value)}
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>
            ))}

            <button onClick={addRule} className="btn btn-sm btn-outline btn-primary">
              <FiPlus /> Add Rule
            </button>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Default Priority</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={defaultPriority}
                onChange={(e) => setDefaultPriority(e.target.value as any)}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>The output data will be enhanced with a `priority` field.</span>
            </div>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} id="output" className="w-4 h-4 !bg-red-500" />
    </div>
  );
};

export default memo(PriorityJudgmentNode);
