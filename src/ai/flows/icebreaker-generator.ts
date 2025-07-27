'use server';

/**
 * @fileOverview AI-powered icebreaker question generator for recruiters.
 *
 * - generateIcebreakerQuestion - A function that generates icebreaker questions based on candidate and job info.
 * - GenerateIcebreakerQuestionInput - The input type for the generateIcebreakerQuestion function.
 * - GenerateIcebreakerQuestionOutput - The return type for the generateIcebreakerQuestion function.
 */

import { z } from 'zod';
import { ai } from '@/ai/genkit';

const GenerateIcebreakerQuestionInputSchema = z.object({
  candidateName: z.string().describe('The name of the candidate.'),
  jobDescription: z
    .string()
    .describe('The job description for the role the candidate is being considered for.'),
  candidateSkills: z.string().describe("A list of the candidate's skills."),
  companyNeeds: z.string().describe('The needs of the company for the role.'),
  pastProjects: z.string().describe('The previous project the candidate has worked on.'),
});
export type GenerateIcebreakerQuestionInput = z.infer<typeof GenerateIcebreakerQuestionInputSchema>;

const GenerateIcebreakerQuestionOutputSchema = z.object({
  question: z.string().describe('The generated icebreaker question for the candidate.'),
  reasoning: z.string().describe('The reasoning behind why this question was chosen.'),
});
export type GenerateIcebreakerQuestionOutput = z.infer<
  typeof GenerateIcebreakerQuestionOutputSchema
>;

export async function generateIcebreakerQuestion(
  input: GenerateIcebreakerQuestionInput
): Promise<GenerateIcebreakerQuestionOutput> {
  // Import the new AI service
  const { generateIcebreakerQuestion: mistralGenerateIcebreaker } = await import(
    '@/services/enhancedAIService'
  );

  const result = await mistralGenerateIcebreaker({
    candidateName: input.candidateName,
    jobDescription: input.jobDescription,
    candidateSkills: input.candidateSkills,
    companyNeeds: input.companyNeeds,
    pastProjects: input.pastProjects,
  });

  return {
    question: result.question,
    reasoning: result.reasoning,
  };
}

const prompt = ai.definePrompt({
  name: 'generateIcebreakerQuestionPrompt',
  input: { schema: GenerateIcebreakerQuestionInputSchema },
  output: { schema: GenerateIcebreakerQuestionOutputSchema },
  prompt: `You are an expert recruiter and conversation facilitator. Your task is to generate a thoughtful, engaging icebreaker question for a candidate interview.

Based on the following information:
- Candidate Name: {{{candidateName}}}
- Job Description: {{{jobDescription}}}
- Candidate Skills: {{{candidateSkills}}}
- Company Needs: {{{companyNeeds}}}
- Past Projects: {{{pastProjects}}}

Generate an icebreaker question that:
1. Is personalized to the candidate's background and experience
2. Relates to the role they're applying for
3. Is engaging and conversation-starting
4. Shows you've done your research on their background
5. Is professional yet approachable

The question should help break the ice while also providing insight into the candidate's personality, motivation, or approach to work.

Provide both the question and a brief reasoning for why this question was chosen.`,
});

function generateFallbackIcebreaker(
  input: GenerateIcebreakerQuestionInput
): GenerateIcebreakerQuestionOutput {
  return {
    question: `Hi ${input.candidateName}, I noticed your experience with ${input.candidateSkills}. What initially drew you to this field, and how do you see it evolving in the context of ${input.jobDescription}?`,
    reasoning:
      'Generated a fallback question based on candidate skills and job description when AI output was unavailable.',
  };
}

export const generateIcebreakerQuestionFlow = ai.defineFlow(
  {
    name: 'generateIcebreakerQuestionFlow',
    inputSchema: GenerateIcebreakerQuestionInputSchema,
    outputSchema: GenerateIcebreakerQuestionOutputSchema,
  },
  async (input: unknown) => {
    const validatedInput = GenerateIcebreakerQuestionInputSchema.parse(input);
    const response = (await prompt.generate(validatedInput)) as {
      output: () => Promise<GenerateIcebreakerQuestionOutput>;
    };

    if (!response || typeof response.output !== 'function') {
      console.warn('Prompt generation returned invalid response for input:', validatedInput);
      return generateFallbackIcebreaker(validatedInput);
    }

    const output = await response.output();

    if (!output || !output.question || output.question.trim() === '') {
      console.warn('Icebreaker generator returned empty question for input:', validatedInput);
      return generateFallbackIcebreaker(validatedInput);
    }

    return {
      question: output.question,
      reasoning: output.reasoning,
    };
  }
);
