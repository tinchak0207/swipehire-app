'use client';

import { Node } from 'reactflow';
import { IAnalyzeResumeConfig, IConditionConfig, ISendInviteConfig } from '@/contracts/IWorkflow';

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onConfigChange: (nodeId: string, newConfig: any) => void;
}

export default function PropertiesPanel({ selectedNode, onConfigChange }: PropertiesPanelProps) {
  if (!selectedNode) {
    return (
        <aside className="p-4 bg-base-200 h-screen overflow-y-auto">
            <h2 className="text-lg font-bold">Properties</h2>
            <p>Select a node to see its properties.</p>
        </aside>
    );
  }

  const renderConfigForm = () => {
    switch (selectedNode.data.cardType) {
      case 'AnalyzeResume':
        const analyzeConfig = selectedNode.data as IAnalyzeResumeConfig;
        return (
          <form className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">Required Degree</span>
              </label>
              <select 
                className="select select-bordered w-full"
                value={analyzeConfig.requiredDegree}
                onChange={(e) => onConfigChange(selectedNode.id, { ...analyzeConfig, requiredDegree: e.target.value })}
              >
                <option>High School</option>
                <option>Bachelor</option>
                <option>Master</option>
                <option>PhD</option>
              </select>
            </div>
            {/* Add other form fields for IAnalyzeResumeConfig here */}
          </form>
        );
      case 'Condition':
        const conditionConfig = selectedNode.data as IConditionConfig;
        return (
            <form className="space-y-4">
                {/* Form fields for IConditionConfig */}
            </form>
        )
      case 'SendInvite':
        const sendInviteConfig = selectedNode.data as ISendInviteConfig;
        return (
            <form className="space-y-4">
                {/* Form fields for ISendInviteConfig */}
            </form>
        )
      default:
        return <p>Unknown card type.</p>;
    }
  };

  return (
    <aside className="p-4 bg-base-200 h-screen overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">{selectedNode.data.cardType} Properties</h2>
      {renderConfigForm()}
    </aside>
  );
}
