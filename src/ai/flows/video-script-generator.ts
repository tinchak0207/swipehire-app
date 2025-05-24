// 'use server'
'use server';
/**
 * @fileOverview AI-powered video script generator for job seekers.
 *
 * - generateVideoScript - A function that generates a video script based on user input.
 * - GenerateVideoScriptInput - The input type for the generateVideoScript function.
 * - GenerateVideoScriptOutput - The return type for the generateVideoScript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVideoScriptInputSchema = z.object({
  experience: z
    .string()
    .describe('Description of the job seeker\'s experience.'),
  desiredWorkStyle: z
    .string()
    .describe('Description of the job seeker\'s desired work style.'),
});
export type GenerateVideoScriptInput = z.infer<typeof GenerateVideoScriptInputSchema>;

const GenerateVideoScriptOutputSchema = z.object({
  script: z
    .string()
    .describe('The generated video script for the job seeker.'),
});
export type GenerateVideoScriptOutput = z.infer<typeof GenerateVideoScriptOutputSchema>;

export async function generateVideoScript(
  input: GenerateVideoScriptInput
): Promise<GenerateVideoScriptOutput> {
  return generateVideoScriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateVideoScriptPrompt',
  input: {schema: GenerateVideoScriptInputSchema},
  output: {schema: GenerateVideoScriptOutputSchema},
  prompt: `You are an AI assistant designed to generate video scripts for job seekers.

  Based on the job seeker's experience and desired work style, generate a compelling video script for their video resume.

  Experience: {{{experience}}}
  Desired Work Style: {{{desiredWorkStyle}}}

  Script:`,
});

const generateVideoScriptFlow = ai.defineFlow(
  {
    name: 'generateVideoScriptFlow',
    inputSchema: GenerateVideoScriptInputSchema,
    outputSchema: GenerateVideoScriptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
