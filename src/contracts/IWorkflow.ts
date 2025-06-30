import { Edge, Node } from 'reactflow';

export interface IWorkflow {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  status: 'draft' | 'active' | 'paused';
  isTemplate: boolean;
  templateId?: string;
  visibility: 'private' | 'public';
  tags: string[];
  // For collaboration
  lockedBy?: string;
  lockExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAnalyzeResumeConfig {
  requiredDegree: string;
  matchThreshold: number;
}

export interface IConditionConfig {
  source: string;
  property: string;
  operator: '==' | '!=' | '>' | '<' | 'contains';
  value: string;
}

export interface IWorkflowTemplate extends IWorkflow {
  official: boolean;
  efficiencyScore: number;
  usageCount: number;
  authorId: string;
}
