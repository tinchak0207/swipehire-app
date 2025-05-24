'use server';

/**
 * @fileOverview An AI agent that edits video resumes to improve their quality.
 *
 * - editVideo - A function that handles the video editing process.
 * - EditVideoInput - The input type for the editVideo function.
 * - EditVideoOutput - The return type for the editVideo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EditVideoInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      'A video resume, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Per Genkit guidance.
    ),
});
export type EditVideoInput = z.infer<typeof EditVideoInputSchema>;

const EditVideoOutputSchema = z.object({
  editedVideoDataUri: z
    .string()
    .describe(
      'The edited video resume, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Per Genkit guidance.
    ),
  analysis: z.string().describe('An analysis of the original video and the edits made.'),
});
export type EditVideoOutput = z.infer<typeof EditVideoOutputSchema>;

export async function editVideo(input: EditVideoInput): Promise<EditVideoOutput> {
  return editVideoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'editVideoPrompt',
  input: {schema: EditVideoInputSchema},
  output: {schema: EditVideoOutputSchema},
  prompt: `You are an AI video editor specializing in improving the quality of video resumes.

You will analyze the job seeker's video resume and automatically adjust the pace, intonation, and expressions to ensure the final video is engaging and professional.

Return the edited video as a data URI, and include an analysis of the original video and the edits made.

Video Resume: {{media url=videoDataUri}}`,
});

const editVideoFlow = ai.defineFlow(
  {
    name: 'editVideoFlow',
    inputSchema: EditVideoInputSchema,
    outputSchema: EditVideoOutputSchema,
  },
  async input => {
    //const {editedVideoDataUri, analysis} = await videoEditorService.editVideo(input.videoDataUri);
    const {output} = await prompt(input);
    return output!;
  }
);
