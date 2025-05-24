
'use server';

/**
 * @fileOverview An AI agent that analyzes video resumes and suggests edits to improve their quality.
 *
 * - editVideo - A function that handles the video analysis and suggestion process.
 * - EditVideoInput - The input type for the editVideo function.
 * - EditVideoOutput - The return type for the editVideo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EditVideoInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      'A video resume, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type EditVideoInput = z.infer<typeof EditVideoInputSchema>;

const EditVideoOutputSchema = z.object({
  editedVideoDataUri: z
    .string()
    .describe(
      'The conceptually edited video resume (or original if no direct editing is performed by the model), as a data URI. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  analysis: z.string().describe('A detailed analysis of the original video and suggested edits based on voice and visual criteria.'),
});
export type EditVideoOutput = z.infer<typeof EditVideoOutputSchema>;

export async function editVideo(input: EditVideoInput): Promise<EditVideoOutput> {
  return editVideoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'editVideoPrompt',
  input: {schema: EditVideoInputSchema},
  output: {schema: EditVideoOutputSchema},
  prompt: `You are an expert AI video analysis assistant, tasked with providing feedback to improve video resumes.
You will receive a video resume. Your goal is to analyze it based on the following multi-dimensional criteria and provide a detailed textual analysis with actionable suggestions.
You should also return the original video data URI as the 'editedVideoDataUri' field, as you are providing analysis and not performing direct video editing.

**I. Voice Analysis:**
   *   **Speech Speed:** Is the pace appropriate (not too fast or slow)? Suggest adjustments if needed.
   *   **Pause Analysis:** Are there any awkward or unnatural pauses? Suggest how to improve the rhythm.
   *   **Pitch Change:** Is the tone varied and engaging, or monotonous? Suggest improvements for vivid expression.
   *   **Clarity Assessment:** Is the pronunciation clear? Note any parts that might be hard to understand and suggest re-recording or clearer enunciation.

**II. Visual Analysis:**
   *   **Expression Recognition:** How natural and approachable are the facial expressions? Are they congruent with the message? Suggest ways to enhance affinity.
   *   **Posture Assessment:** Is the body posture professional and confident? Note any slouching or distracting movements.
   *   **Eye Contact:** How consistently does the speaker maintain eye contact with the camera? Suggest improvements if needed.
   *   **Gestures:** Are hand gestures used effectively and appropriately to emphasize points, or are they distracting?

**Output Requirements:**
1.  **editedVideoDataUri**: Return the original 'videoDataUri' provided in the input.
2.  **analysis**: Provide a comprehensive textual analysis covering all the points above. Structure your analysis clearly (e.g., using headings for Voice and Visuals). Be specific in your feedback and suggestions. For example, instead of saying "improve pauses," suggest "Consider shortening the pause after the introduction for a more fluid transition."

**Video Resume to Analyze:** {{media url=videoDataUri}}
`,
});

const editVideoFlow = ai.defineFlow(
  {
    name: 'editVideoFlow',
    inputSchema: EditVideoInputSchema,
    outputSchema: EditVideoOutputSchema,
  },
  async input => {
    // In a real video editing scenario, you might call a specialized service here.
    // For this LLM-based analysis, the prompt guides the AI to produce the analysis text.
    // The AI cannot directly edit the video, so we will instruct it to return the original URI.
    const {output} = await prompt(input);
    
    // Ensure the output is not null and contains the expected fields.
    // If the AI doesn't explicitly set editedVideoDataUri from the prompt,
    // we ensure the original is passed through.
    if (output) {
        return {
            editedVideoDataUri: output.editedVideoDataUri || input.videoDataUri,
            analysis: output.analysis || "Analysis could not be generated.",
        };
    } else {
        // Fallback if the AI returns a null output
        return {
            editedVideoDataUri: input.videoDataUri,
            analysis: "The AI failed to produce an output. Please try again.",
        };
    }
  }
);
