export interface ICardDefinition {
  cardType: 'AnalyzeResume' | 'Condition' | 'SendInvite';
  name: string;
  description: string;
  inputs: { name: string; type: string; description: string; required?: boolean }[];
  outputs: { name: string; type: string; description: string }[];
}
