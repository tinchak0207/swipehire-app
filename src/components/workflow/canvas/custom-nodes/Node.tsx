import { memo, useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { Handle, type NodeProps, Position } from 'reactflow';
import type { NodeDefinition } from '@/lib/workflow-node-definitions';

const Node = ({ data, id }: NodeProps<{ definition: NodeDefinition; [key: string]: any }>) => {
  const { definition, ...config } = data;
  const [expanded, setExpanded] = useState(false);

  // A simple function to render an appropriate input based on type
  const renderInput = (
    key: string,
    type: string,
    value: any,
    onChange: (key: string, value: any) => void
  ) => {
    switch (type) {
      case 'string':
        return (
          <input
            type="text"
            className="input input-bordered input-sm w-full"
            value={value || ''}
            onChange={(e) => onChange(key, e.target.value)}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            className="input input-bordered input-sm w-full"
            value={value || 0}
            onChange={(e) => onChange(key, parseInt(e.target.value, 10))}
          />
        );
      case 'boolean':
        return (
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={value || false}
            onChange={(e) => onChange(key, e.target.checked)}
          />
        );
      case 'select':
        return (
          <select
            className="select select-bordered select-sm w-full"
            value={value || ''}
            onChange={(e) => onChange(key, e.target.value)}
          >
            {/* Assuming definition provides options for select */}
            <option value="">Select...</option>
          </select>
        );
      default:
        return (
          <textarea
            className="textarea textarea-bordered textarea-sm w-full"
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value || ''}
            onChange={(e) => onChange(key, e.target.value)}
          />
        );
    }
  };

  const handleConfigChange = (key: string, value: any) => {
    // In a real app, you'd call a function passed via props to update the global workflow state.
    // e.g., props.onNodeDataChange(id, { ...data, [key]: value });
    console.log(`Updating node ${id}:`, { [key]: value });
  };

  return (
    <div className={`card w-96 bg-base-100 shadow-xl border-2 border-gray-300`}>
      {definition.inputs?.map((input, index) => (
        <Handle
          key={`${id}-target-${input.name}`}
          type="target"
          position={Position.Left}
          id={input.name}
          style={{ top: `${(index + 1) * 25}%` }}
          className="!bg-blue-500 h-3 w-3"
        />
      ))}
      <div className="card-body p-4">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-3">
            {definition.icon && (
              <div className={`avatar placeholder`}>
                <div className={`bg-neutral-focus text-neutral-content rounded-full w-10 h-10`}>
                  <i className={`${definition.icon} text-xl`}></i>
                </div>
              </div>
            )}
            <div>
              <h2 className="card-title font-bold text-base">{definition.label}</h2>
              <p className="text-gray-500 text-xs">{definition.description}</p>
            </div>
          </div>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {expanded && (
          <div className="mt-4 space-y-3 border-base-300 border-t pt-4">
            <h3 className="font-semibold text-sm">Configuration</h3>
            {Object.entries(config).map(([key, value]) => (
              <div key={key} className="form-control w-full">
                <label className="label pb-1">
                  <span className="label-text font-medium text-xs">{key}</span>
                </label>
                {renderInput(key, typeof value, value, handleConfigChange)}
              </div>
            ))}
          </div>
        )}
      </div>
      {definition.outputs?.map((output, index) => (
        <Handle
          key={`${id}-source-${output.name}`}
          type="source"
          position={Position.Right}
          id={output.name}
          style={{ top: `${(index + 1) * 25}%` }}
          className="!bg-green-500 h-3 w-3"
        />
      ))}
    </div>
  );
};

export default memo(Node);
