import { useMemo } from 'react';
import { WORKFLOW_NODE_DEFINITIONS } from '@/lib/workflow-node-definitions';

export default function NodePalette() {
  const categorizedNodes = useMemo(() => {
    return WORKFLOW_NODE_DEFINITIONS.reduce(
      (acc, node) => {
        if (!acc[node.category]) {
          acc[node.category] = [];
        }
        acc[node.category]?.push(node);
        return acc;
      },
      {} as Record<string, typeof WORKFLOW_NODE_DEFINITIONS>
    );
  }, []);

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-72 overflow-y-auto bg-base-200 p-4">
      <h2 className="mb-4 font-bold text-lg">Nodes</h2>
      {Object.entries(categorizedNodes).map(([category, nodes]) => (
        <div key={category} className="mb-4">
          <h3 className="mb-2 font-bold capitalize">{category}</h3>
          <div className="space-y-2">
            {nodes.map((node) => (
              <div
                key={node.type}
                className="cursor-grab rounded-md border bg-base-100 p-2"
                onDragStart={(event) => onDragStart(event, node.type)}
                draggable
              >
                {node.label}
              </div>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}
