import { useCallback, useState } from 'react';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type NodeRemoveChange,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  type ReactFlowInstance,
} from 'reactflow';
import type { IWorkflow } from '../contracts/IWorkflow';
import { WORKFLOW_NODE_DEFINITIONS } from '../lib/workflow-node-definitions';

export function useWorkflowEngine(
  initialWorkflow: IWorkflow,
  reactFlowInstance: ReactFlowInstance | null
) {
  const initialNodes = initialWorkflow.nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      definition: WORKFLOW_NODE_DEFINITIONS.find((d) => d.type === node.type),
    },
  }));
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialWorkflow.edges);

  const onNodesChange: OnNodesChange = useCallback((changes: NodeChange[]) => {
    const nodeRemoveChanges = changes.filter(
      (change): change is NodeRemoveChange => change.type === 'remove'
    );

    if (nodeRemoveChanges.length > 0) {
      const removedNodeIds = nodeRemoveChanges.map((change) => change.id);
      setEdges((eds) =>
        eds.filter(
          (edge) => !removedNodeIds.includes(edge.source) && !removedNodeIds.includes(edge.target)
        )
      );
    }

    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const definition = WORKFLOW_NODE_DEFINITIONS.find((d) => d.type === type);
      if (!definition) {
        return;
      }

      if (!reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { definition },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDragOver,
    onDrop,
  };
}
