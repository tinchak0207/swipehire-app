import { NextResponse } from 'next/server';

// In a real app, this would be more dynamic
const variableDefinitions = [
    { name: '{match_score}', type: 'number', description: 'The resume match score.' },
    { name: '{extracted_skills}', type: 'string[]', description: 'Skills extracted from the resume.' },
    { name: '{candidate_name}', type: 'string', description: 'The candidate\'s name.' },
    { name: '{candidate_email}', type: 'string', description: 'The candidate\'s email.' },
];

export async function GET() {
    return NextResponse.json(variableDefinitions);
}
