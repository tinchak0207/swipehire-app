
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
  prompt: `You are an AI assistant designed to generate a structured video script for a job seeker's video resume.
The script should follow a multi-layer content structure with approximate timings for each section.
Please use the provided experience and desired work style to inform the content, especially for the "Core strengths display" and "Cultural fit demonstration" sections. For other specific details like name, position, specific achievements, hobbies, please use placeholders like "[Your Name]", "[Your Position]", "[Your Core Achievement]", "[Your Hobby]", etc., or generate plausible examples if appropriate.

The script should be structured as follows:

**Video Script for [Your Name] - [Your Position]**

**I. Opening Statement (10-15 seconds)**
   *   **Build Affinity:** "Hi, I'm [Your Name], it's truly a pleasure to meet you." (Or similar friendly greeting)
   *   **Position Positioning:** "I am a [Your Position] specializing in [Your Field/Industry]."
   *   **Attract Attention:** "Over the past [Number] years, I've had the opportunity to [mention a key experience or core achievement from the provided experience details, or use a placeholder like 'drive significant growth in X area' / 'successfully deliver Y projects']. For example, {{{experience}}}."

**II. Core Strengths Display (20-30 seconds)**
   *   **Skill Highlights:** (Based on {{{experience}}})
       *   "One project I'm particularly proud of is [Specific Project Example from {{{experience}}} or placeholder like 'the X project'], where I [Your Role/Contribution] and achieved [Specific Result/Achievement from {{{experience}}} or placeholder]."
       *   "My key skills include [Skill 1], [Skill 2], and [Skill 3 relevant to {{{experience}}} or placeholders], which I've applied effectively in situations like [brief example or draw from {{{experience}}}]."
   *   **Work Style:** "In terms of work style, {{{desiredWorkStyle}}}. I thrive in environments where [elaborate slightly on {{{desiredWorkStyle}}}, e.g., 'collaboration is key and I can take initiative' or 'I can focus and work independently to deliver results']."
   *   **Learning Ability:** "I'm a firm believer in continuous growth and I'm always eager to learn. For instance, I recently [mention a new skill learned, a course taken, or an area of self-development, or placeholder like 'completed a certification in Z technology']. This demonstrates my commitment to staying updated in [Your Field/Industry]."

**III. Cultural Fit Demonstration (15-20 seconds)**
   *   **Values Expression:** "My work philosophy centers around [Your Core Work Value, e.g., 'innovation and problem-solving' or 'delivering quality and exceeding expectations']. I approach my work with [Your Key Attitude, e.g., 'a proactive and enthusiastic attitude']."
   *   **Hobbies (Optional, for personal charm):** "Outside of work, I enjoy [Your Hobby 1] and [Your Hobby 2], which helps me [mention a positive trait, e.g., 'stay creative' or 'maintain a balanced perspective']." (If no specific hobby is inferable, suggest a placeholder or omit this part).
   *   **Future Expectations:** "Ideally, I'm looking for a work environment that [Describe Ideal Work Environment, drawing from {{{desiredWorkStyle}}} or general positive attributes like 'is dynamic, supports professional growth, and values teamwork']."

**IV. Call to Action (5-10 seconds)**
   *   **Positive Attitude:** "I am very enthusiastic about the possibility of contributing to a forward-thinking team and I look forward to discussing how my skills and experiences can benefit your organization."
   *   **Specific Invitation:** "Thank you for your time. You're welcome to view my portfolio at [Your Portfolio Link/Placeholder] or connect with me on [LinkedIn Profile Link/Placeholder]."

Please generate the script based on this structure. Ensure the final output is just the script content itself.
Script:
`,
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
