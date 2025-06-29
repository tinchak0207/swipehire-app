export interface IVariable {
  _id: string;
  workflowId: string;
  name: string; // e.g., '{match_score}'
  value: any;
  scope: 'workflow' | 'card';
  cardId?: string;
  createdAt: Date;
  updatedAt: Date;
}
