import { useMemo } from 'react';
import { WORKFLOW_NODE_DEFINITIONS } from '@/lib/workflow-node-definitions';

export default function NodePalette() {
  const categorizedNodes = useMemo(() => {
    return WORKFLOW_NODE_DEFINITIONS.reduce(
      (acc, node) => {
        if (!acc[node.category]) {
          acc[node.category] = [];
        }
        acc[node.category]!.push(node);
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
    <aside className="w-72 bg-base-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Nodes</h2>
      {Object.entries(categorizedNodes).map(([category, nodes]) => (
        <div key={category} className="mb-4">
          <h3 className="font-bold capitalize mb-2">{category}</h3>
          <div className="space-y-2">
            {nodes.map((node) => (
              <div
                key={node.type}
                className="p-2 border rounded-md bg-base-100 cursor-grab"
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
