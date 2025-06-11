
// src/app/api/ai/generate-icebreaker/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { generateIcebreakerQuestion, type GenerateIcebreakerQuestionInput, type GenerateIcebreakerQuestionOutput } from '@/ai/flows/icebreaker-generator';
import { z } from 'zod';

// Define the input schema again for validation at the API route level
// This mirrors the schema in the flow file.
const ApiInputSchema = z.object({
  candidateName: z.string().describe('The name of the candidate.'),
  jobDescription: z.string().describe('The job description for the role the candidate is being considered for.'),
  candidateSkills: z.string().describe('A list of the candidate’s skills.'),
  companyNeeds: z.string().describe('The needs of the company for the role.'),
  pastProjects: z.string().describe('The previous project the candidate has worked on.'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the input against the schema
    const parsedInput = ApiInputSchema.safeParse(body);

    if (!parsedInput.success) {
      return NextResponse.json({ error: "Invalid input parameters.", details: parsedInput.error.format() }, { status: 400 });
    }

    const flowInput: GenerateIcebreakerQuestionInput = parsedInput.data;
    const output: GenerateIcebreakerQuestionOutput = await generateIcebreakerQuestion(flowInput);

    return NextResponse.json(output, { status: 200 });

  } catch (error: any) {
    console.error("[API Route /api/ai/generate-icebreaker] Error:", error);
    let errorMessage = "Failed to generate icebreaker question.";
    if (error.message) {
        errorMessage = error.message;
    }
    // Consider more specific error handling based on error types if needed
    return NextResponse.json({ error: errorMessage, details: error.toString() }, { status: 500 });
  }
}

// Optional: Add a GET handler for testing or to prevent errors if someone tries to access it via GET
export async function GET() {
  return NextResponse.json({ message: "This endpoint is for POST requests to generate icebreakers." }, { status: 405 });
}
