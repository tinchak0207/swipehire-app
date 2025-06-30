'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Node } from 'reactflow';
import WorkflowCanvas from '@/components/workflow/canvas/WorkflowCanvas';
import ComponentLibrary from '@/components/workflow/panels/ComponentLibrary';
import PropertiesPanel from '@/components/workflow/panels/PropertiesPanel';
import { useWorkflow } from '@/hooks/useWorkflow';

export default function WorkflowEditorPage() {
  const params = useParams();
  const id = params ? (params['id'] as string) : null;
  const { workflow, isLoading, isError } = useWorkflow(id);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  if (isLoading) return <div>Loading...</div>;
  if (isError || !workflow) return <div>Error loading workflow.</div>;

  const onConfigChange = () => {
    // This would be passed down to the properties panel to update the node
  };

  return (
    <div className="flex h-screen">
      <ComponentLibrary />
      <main className="flex-1">
        <WorkflowCanvas workflow={workflow} onNodeClick={setSelectedNode} />
      </main>
      <PropertiesPanel selectedNode={selectedNode} onConfigChange={onConfigChange} />
    </div>
  );
}
