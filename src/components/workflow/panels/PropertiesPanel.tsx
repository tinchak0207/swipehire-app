'use client';

import type { Node } from 'reactflow';

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onConfigChange: (nodeId: string, newConfig: any) => void;
}

export default function PropertiesPanel({ selectedNode, onConfigChange }: PropertiesPanelProps) {
  if (!selectedNode) {
    return (
      <aside className="h-screen overflow-y-auto bg-base-200 p-4">
        <h2 className="font-bold text-lg">Properties</h2>
        <p>Select a node to see its properties.</p>
      </aside>
    );
  }

  const renderConfigForm = () => {
    const { definition, ...config } = selectedNode.data;

    if (!definition.inputs) {
      return <p>No properties to edit for this node.</p>;
    }

    return (
      <form className="space-y-4">
        {definition.inputs.map((input: any) => (
          <div key={input.name}>
            <label className="label">
              <span className="label-text">{input.label}</span>
            </label>
            {input.type === 'select' ? (
              <select
                className="select select-bordered w-full"
                value={config[input.name]}
                onChange={(e) =>
                  onConfigChange(selectedNode.id, {
                    ...config,
                    [input.name]: e.target.value,
                  })
                }
              >
                {input.options.map((option: string) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            ) : (
              <input
                type={input.type}
                className="input input-bordered w-full"
                value={config[input.name]}
                onChange={(e) =>
                  onConfigChange(selectedNode.id, {
                    ...config,
                    [input.name]: e.target.value,
                  })
                }
              />
            )}
          </div>
        ))}
      </form>
    );
  };

  return (
    <aside className="h-screen w-96 overflow-y-auto bg-base-200 p-4">
      <h2 className="mb-4 font-bold text-lg">{selectedNode.data.definition.label} Properties</h2>
      {renderConfigForm()}
    </aside>
  );
}
