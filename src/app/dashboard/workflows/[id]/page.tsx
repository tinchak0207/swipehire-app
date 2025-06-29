'use client';

import WorkflowCanvas from '@/components/workflow/canvas/WorkflowCanvas';
import ComponentLibrary from '@/components/workflow/panels/ComponentLibrary';
import PropertiesPanel from '@/components/workflow/panels/PropertiesPanel';
import { useWorkflow } from '@/hooks/useWorkflow';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Node } from 'reactflow';

export default function WorkflowEditorPage() {
  const params = useParams();
  const { workflow, isLoading, isError } = useWorkflow(params.id as string);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  if (isLoading) return <div>Loading...</div>;
  if (isError || !workflow) return <div>Error loading workflow.</div>;

  const onConfigChange = (nodeId: string, newConfig: any) => {
    // This would be passed down to the properties panel to update the node
  };

  return (
    <div className="flex h-screen">
      <ComponentLibrary />
      <main className="flex-1">
        <WorkflowCanvas workflow={workflow} />
      </main>
      <PropertiesPanel selectedNode={selectedNode} onConfigChange={onConfigChange} />
    </div>
  );
}
