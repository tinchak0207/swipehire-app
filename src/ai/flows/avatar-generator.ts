// src/ai/flows/avatar-generator.ts

'use server';

/**
 * @fileOverview AI-powered avatar generator for video resumes.
 *
 * - generateAvatar - A function that generates a virtual avatar.
 * - AvatarGeneratorInput - The input type for the generateAvatar function.
 * - AvatarGeneratorOutput - The return type for the generateAvatar function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AvatarGeneratorInputSchema = z.object({
  description: z
    .string()
    .describe(
      'Description of the desired avatar, including details like gender, age, style, and profession.'
    ),
});
export type AvatarGeneratorInput = z.infer<typeof AvatarGeneratorInputSchema>;

const AvatarGeneratorOutputSchema = z.object({
  avatarDataUri: z
    .string()
    .describe(
      'The data URI of the generated avatar image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
});
export type AvatarGeneratorOutput = z.infer<typeof AvatarGeneratorOutputSchema>;

export async function generateAvatar(input: AvatarGeneratorInput): Promise<AvatarGeneratorOutput> {
  return avatarGeneratorFlow(input);
}

const avatarGeneratorPrompt = ai.definePrompt({
  name: 'avatarGeneratorPrompt',
  input: {schema: AvatarGeneratorInputSchema},
  output: {schema: AvatarGeneratorOutputSchema},
  prompt: `Generate a professional virtual avatar based on the following description:

Description: {{{description}}}

Please provide the image as a data URI.
`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const avatarGeneratorFlow = ai.defineFlow(
  {
    name: 'avatarGeneratorFlow',
    inputSchema: AvatarGeneratorInputSchema,
    outputSchema: AvatarGeneratorOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: [
        {text: `Generate a professional virtual avatar based on the following description: ${input.description}`}],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return {avatarDataUri: media.url!};
  }
);
