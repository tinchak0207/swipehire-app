'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import type { Node } from 'reactflow';
import WorkflowCanvas from '@/components/workflow/canvas/WorkflowCanvas';
import ComponentLibrary from '@/components/workflow/panels/ComponentLibrary';
import PropertiesPanel from '@/components/workflow/panels/PropertiesPanel';
import { useWorkflow } from '@/hooks/useWorkflow';

export default function WorkflowEditorPage() {
  const params = useParams();
  const id = params ? (params['id'] as string) : null;
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Early return if no ID is available
  if (!id) {
    return <div>Invalid workflow ID.</div>;
  }

  const { workflow, isLoading, isError } = useWorkflow(id);

  if (isLoading) return <div>Loading...</div>;
  if (isError || !workflow) return <div>Error loading workflow.</div>;

  const onConfigChange = () => {
    // This would be passed down to the properties panel to update the node
  };

  return (
    <div className="flex h-screen">
      <ComponentLibrary />
      <main className="flex-1">
        <WorkflowCanvas workflow={workflow} onNodeClickAction={setSelectedNode} />
      </main>
      <PropertiesPanel selectedNode={selectedNode} onConfigChange={onConfigChange} />
    </div>
  );
}
