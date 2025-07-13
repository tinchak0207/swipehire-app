import type React from 'react';
import type React from 'react';
import { WORKFLOW_NODE_DEFINITIONS } from '@/lib/workflow-node-definitions';

const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
  event.dataTransfer.setData('application/reactflow', nodeType);
  event.dataTransfer.effectAllowed = 'move';
};

const NodeConnections = () => {
  return (
    <aside className="w-80 bg-gray-50 p-4">
      <h2 className="mb-4 font-semibold text-lg">Nodes</h2>
      <div className="grid grid-cols-2 gap-4">
        {WORKFLOW_NODE_DEFINITIONS.map((def) => (
          <div
            key={def.type}
            className="flex cursor-grab flex-col items-center justify-center rounded-md border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            onDragStart={(event) => onDragStart(event, def.type)}
            draggable
          >
            <i className={`${def.icon} mb-2 h-8 w-8 text-gray-600`} />
            <span className="text-center text-gray-700 text-sm">{def.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default NodeConnections;
