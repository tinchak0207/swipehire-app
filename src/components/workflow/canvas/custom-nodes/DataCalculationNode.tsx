import { Handle, Position } from '@reactflow/core';
import type React from 'react';
import { memo, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiCpu, FiPlus, FiTrash2 } from 'react-icons/fi';
import type { NodeProps } from 'reactflow';

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
    <div className="card w-96 border-2 border-secondary-focus bg-base-100 shadow-xl">
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="!bg-secondary-focus h-4 w-4"
      />
      <div className="card-body p-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="h-12 w-12 rounded-full bg-secondary text-secondary-content">
                <FiCpu className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h2 className="card-title font-bold text-lg">Data Calculation</h2>
              <p className="text-gray-500 text-sm">Perform custom logic</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            <p className="text-gray-600 text-sm">
              Define one or more calculations to transform data. Use variables from previous nodes,
              e.g., `input.score * 100`.
            </p>

            {steps.map((step, index) => (
              <div key={index} className="space-y-2 rounded-lg border border-base-300 p-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs">Step {index + 1}</span>
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

            <div className="alert alert-secondary mt-2 text-xs">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="h-6 w-6 shrink-0 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
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
        className="!bg-secondary-focus h-4 w-4"
      />
    </div>
  );
};

export default memo(DataCalculationNode);
