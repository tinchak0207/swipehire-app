import { Edge, Node } from 'reactflow';

// Using a discriminated union for type-safe config handling
export type CardNodeConfig = IAnalyzeResumeConfig | IConditionConfig | ISendInviteConfig;

export interface IBaseCardConfig {
  cardType: 'AnalyzeResume' | 'Condition' | 'SendInvite';
}

export interface IAnalyzeResumeConfig extends IBaseCardConfig {
  cardType: 'AnalyzeResume';
  requiredDegree: 'High School' | 'Bachelor' | 'Master' | 'PhD';
  requiredExperienceYears: number;
  skillKeywords: string[];
  enableVideoAnalysis: boolean;
  matchThreshold: number; // 0-100
}

export interface IConditionConfig extends IBaseCardConfig {
  cardType: 'Condition';
  variable: string; // e.g., '{match_score}'
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte';
  value: string | number;
}

export interface ISendInviteConfig extends IBaseCardConfig {
  cardType: 'SendInvite';
  template: string; // Markdown template with variables
}

// Extend ReactFlow's Node type with our custom data
export type WorkflowNode = Node<IBaseCardConfig>;

export interface IWorkflow {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
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

export interface IWorkflowTemplate extends IWorkflow {
  official: boolean;
  efficiencyScore: number;
  usageCount: number;
  authorId: string;
}
