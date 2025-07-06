import { Handle, Position } from '@reactflow/core';
import React, { memo, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiCpu, FiPlus, FiTrash2 } from 'react-icons/fi';
import { NodeProps } from 'reactflow';

interface CalculationStep {
  outputVariable: string;
  expression: string;
}

interface DataCalculationNodeData {
  steps: CalculationStep[];
}

const DataCalculationNode: React.FC<NodeProps<DataCalculationNodeData>> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const [steps, setSteps] = useState<CalculationStep[]>(
    data.steps || [{ outputVariable: '', expression: '' }]
  );

  const updateStep = (index: number, field: keyof CalculationStep, value: string) => {
    const newSteps = [...steps];
    if (newSteps[index]) {
      newSteps[index][field] = value;
      setSteps(newSteps);
      // Update node data in workflow state
    }
  };

  const addStep = () => {
    setSteps([...steps, { outputVariable: '', expression: '' }]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  return (
    <div className="card w-96 bg-base-100 shadow-xl border-2 border-secondary-focus">
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="w-4 h-4 !bg-secondary-focus"
      />
      <div className="card-body p-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="bg-secondary text-secondary-content rounded-full w-12 h-12">
                <FiCpu className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title text-lg font-bold">Data Calculation</h2>
              <p className="text-sm text-gray-500">Perform custom logic</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">
              Define one or more calculations to transform data. Use variables from previous nodes,
              e.g., `input.score * 100`.
            </p>

            {steps.map((step, index) => (
              <div key={index} className="p-2 border border-base-300 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">Step {index + 1}</span>
                  <button onClick={() => removeStep(index)} className="btn btn-xs btn-ghost">
                    <FiTrash2 className="text-error" />
                  </button>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Output Variable Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., eligibilityScore"
                    className="input input-sm input-bordered"
                    value={step.outputVariable}
                    onChange={(e) => updateStep(index, 'outputVariable', e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Expression</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., (scores.technical + scores.cultureFit) / 2"
                    className="input input-sm input-bordered"
                    value={step.expression}
                    onChange={(e) => updateStep(index, 'expression', e.target.value)}
                  />
                </div>
              </div>
            ))}

            <button onClick={addStep} className="btn btn-sm btn-outline btn-primary">
              <FiPlus /> Add Calculation Step
            </button>

            <div className="alert alert-secondary text-xs mt-2">
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
                ></path>
              </svg>
              <span>The results of these calculations will be added to the data payload.</span>
            </div>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-4 h-4 !bg-secondary-focus"
      />
    </div>
  );
};

export default memo(DataCalculationNode);
