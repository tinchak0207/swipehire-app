import React from 'react';
import { WORKFLOW_NODE_DEFINITIONS } from '@/lib/workflow-node-definitions';

const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
  event.dataTransfer.setData('application/reactflow', nodeType);
  event.dataTransfer.effectAllowed = 'move';
};

const NodeConnections = () => {
  return (
    <aside className="w-80 p-4 bg-gray-50">
      <h2 className="text-lg font-semibold mb-4">Nodes</h2>
      <div className="grid grid-cols-2 gap-4">
        {WORKFLOW_NODE_DEFINITIONS.map((def) => (
          <div
            key={def.type}
            className="flex flex-col items-center justify-center p-4 border rounded-md cursor-grab bg-white shadow-sm hover:shadow-md transition-shadow"
            onDragStart={(event) => onDragStart(event, def.type)}
            draggable
          >
            <i className={`${def.icon} w-8 h-8 mb-2 text-gray-600`}></i>
            <span className="text-sm text-center text-gray-700">{def.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default NodeConnections;
