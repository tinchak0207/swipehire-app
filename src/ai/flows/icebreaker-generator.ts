// use server'
'use server';

/**
 * @fileOverview AI-powered icebreaker question generator for recruiters.
 *
 * - generateIcebreakerQuestion - A function that generates personalized ice-breaking questions.
 * - GenerateIcebreakerQuestionInput - The input type for the generateIcebreakerQuestion function.
 * - GenerateIcebreakerQuestionOutput - The return type for the generateIcebreakerQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateIcebreakerQuestionInputSchema = z.object({
  candidateName: z.string().describe('The name of the candidate.'),
  jobDescription: z.string().describe('The job description for the role the candidate is being considered for.'),
  candidateSkills: z.string().describe('A list of the candidate\u2019s skills.'),
  companyNeeds: z.string().describe('The needs of the company for the role.'),
  pastProjects: z.string().describe('The previous project the candidate has worked on.'),
});

export type GenerateIcebreakerQuestionInput = z.infer<typeof GenerateIcebreakerQuestionInputSchema>;

const GenerateIcebreakerQuestionOutputSchema = z.object({
  icebreakerQuestion: z.string().describe('A personalized icebreaker question for the candidate.'),
});

export type GenerateIcebreakerQuestionOutput = z.infer<typeof GenerateIcebreakerQuestionOutputSchema>;

export async function generateIcebreakerQuestion(input: GenerateIcebreakerQuestionInput): Promise<GenerateIcebreakerQuestionOutput> {
  return generateIcebreakerQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'icebreakerPrompt',
  input: {schema: GenerateIcebreakerQuestionInputSchema},
  output: {schema: GenerateIcebreakerQuestionOutputSchema},
  prompt: `You are an AI assistant designed to generate personalized icebreaker questions for recruiters to use when contacting candidates.\n\n  Consider the following information about the candidate, the job, and the company's needs to create a relevant and engaging question that will spark a meaningful conversation.\n\n  Candidate Name: {{{candidateName}}}\n  Job Description: {{{jobDescription}}}\n  Candidate Skills: {{{candidateSkills}}}\n  Company Needs: {{{companyNeeds}}}\n Past Projects: {{{pastProjects}}}\n\n  Generate one icebreaker question that is specific to the candidate's background and the company's needs. The goal is to make the candidate feel valued and understood, and to start a conversation that explores their potential fit for the role and the company.\n\n  Icebreaker Question:`,
});

const generateIcebreakerQuestionFlow = ai.defineFlow(
  {
    name: 'generateIcebreakerQuestionFlow',
    inputSchema: GenerateIcebreakerQuestionInputSchema,
    outputSchema: GenerateIcebreakerQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
