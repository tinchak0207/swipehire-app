import { NextResponse } from 'next/server';
import type { ICardDefinition } from '@/contracts/ICard';

const cardDefinitions: ICardDefinition[] = [
  {
    cardType: 'AnalyzeResume',
    name: 'Analyze Resume',
    description: 'Analyzes a resume for specific keywords, experience, and education.',
    inputs: [
      { name: 'requiredDegree', type: 'string', description: 'The minimum required degree.' },
      {
        name: 'requiredExperienceYears',
        type: 'number',
        description: 'The minimum years of experience.',
      },
      {
        name: 'skillKeywords',
        type: 'string[]',
        description: 'Keywords to search for in the resume.',
      },
      {
        name: 'enableVideoAnalysis',
        type: 'boolean',
        description: 'Whether to enable video analysis.',
      },
      { name: 'matchThreshold', type: 'number', description: 'The match threshold.' },
    ],
    outputs: [
      { name: 'match_score', type: 'number', description: 'The resume match score.' },
      {
        name: 'extracted_skills',
        type: 'string[]',
        description: 'Skills extracted from the resume.',
      },
    ],
  },
  {
    cardType: 'Condition',
    name: 'Condition',
    description: 'Checks if a condition is met.',
    inputs: [
      { name: 'variable', type: 'string', description: 'The variable to check.' },
      { name: 'operator', type: 'string', description: 'The operator to use.' },
      { name: 'value', type: 'string | number', description: 'The value to compare against.' },
    ],
    outputs: [{ name: 'result', type: 'boolean', description: 'The result of the condition.' }],
  },
  {
    cardType: 'SendInvite',
    name: 'Send Invite',
    description: 'Sends an invitation to the candidate.',
    inputs: [{ name: 'template', type: 'string', description: 'The invitation template.' }],
    outputs: [],
  },
];

export async function GET() {
  return NextResponse.json(cardDefinitions);
}
