
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
  analysis: z.string().describe('A detailed analysis of the original video and suggested edits based on voice, visual, and content optimization criteria.'),
});
export type EditVideoOutput = z.infer<typeof EditVideoOutputSchema>;

export async function editVideo(input: EditVideoInput): Promise<EditVideoOutput> {
  return editVideoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'editVideoPrompt',
  input: {schema: EditVideoInputSchema},
  output: {schema: EditVideoOutputSchema},
  prompt: `You are an expert AI video analysis and editing suggestion assistant, tasked with providing feedback to improve video resumes.
You will receive a video resume. Your goal is to analyze it based on the following multi-dimensional criteria and provide a detailed textual analysis with actionable suggestions.
You should return the original video data URI as the 'editedVideoDataUri' field, as you are providing analysis and not performing direct video editing.

**I. Voice Analysis:**
   *   **Speech Speed:** Is the pace appropriate (not too fast or slow)? Suggest adjustments if needed.
   *   **Pause Analysis:** Are there any awkward or unnatural pauses? Suggest how to improve the rhythm by potentially cutting or shortening specific pauses (e.g., "Consider shortening the pause at 0:15").
   *   **Pitch Change:** Is the tone varied and engaging, or monotonous? Suggest improvements for vivid expression.
   *   **Clarity Assessment:** Is the pronunciation clear? Note any parts that might be hard to understand and suggest re-recording or clearer enunciation.

**II. Visual Analysis:**
   *   **Expression Recognition:** How natural and approachable are the facial expressions? Are they congruent with the message? Suggest ways to enhance affinity.
   *   **Posture Assessment:** Is the body posture professional and confident? Note any slouching or distracting movements.
   *   **Eye Contact:** How consistently does the speaker maintain eye contact with the camera? Suggest improvements if needed.
   *   **Gestures:** Are hand gestures used effectively and appropriately to emphasize points, or are they distracting?

**III. Editing Optimization Suggestions:**
   *   **Rhythm & Pacing Adjustment (Suggestions):**
       *   **Automatic Pause Cutting:** Beyond identifying awkward pauses, specifically mention if any *long* pauses could be automatically cut to improve flow.
       *   **Clip Speed Adjustment:** If segments are too fast or slow, suggest if specific clips could be slightly sped up or slowed down for better comprehension and engagement.
       *   **Overall Duration Optimization:** Comment if the video's length is significantly outside an ideal 60-90 second range for a video resume. If so, suggest general areas or types of content that could be trimmed or if key points need brief expansion to meet this target.
   *   **Visual Enhancement (Suggestions):**
       *   **Light & Color Adjustment:** If lighting seems poor (too dark/bright) or colors appear unnatural, suggest general automatic adjustments (e.g., "consider auto-adjusting brightness and contrast," "enhance color saturation slightly").
       *   **Stabilization:** If handheld shots appear shaky, suggest applying video stabilization.
       *   **Composition & Background Blur:** Comment on framing. If the background is distracting, suggest if a subtle background blur could enhance focus on the speaker.
   *   **Content Arrangement & Augmentation (Suggestions):**
       *   **Subtitles & Keyword Highlights:** Strongly suggest adding subtitles for accessibility and clarity. Identify 2-3 key phrases or skills mentioned that could be highlighted as on-screen text overlays at appropriate times.
       *   **Skill Tags & Achievement Display:** If specific skills are demonstrated or achievements mentioned, suggest how these could be visually represented (e.g., "a brief overlay of 'Project Management' when discussing the X project," "a small graphic denoting the 'Top Performer' award").
       *   **Attractive Openings & Endings:** Suggest how to make the opening more engaging (e.g., "a dynamic title card with your name and role") and the ending more impactful (e.g., "a clear call to action with contact information displayed on screen").

**Output Requirements:**
1.  **editedVideoDataUri**: Return the original 'videoDataUri' provided in the input.
2.  **analysis**: Provide a comprehensive textual analysis covering all the points above (Voice, Visuals, and Editing Optimization Suggestions). Structure your analysis clearly (e.g., using headings for each section). Be specific in your feedback and suggestions. For example, instead of saying "improve pauses," suggest "Consider shortening the pause at 0:15 for a more fluid transition," or for content "Suggest highlighting 'Python' and 'Data Analysis' as on-screen keywords when mentioned."

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
    const {output} = await prompt(input);
    
    if (output) {
        return {
            editedVideoDataUri: output.editedVideoDataUri || input.videoDataUri,
            analysis: output.analysis || "Analysis could not be generated.",
        };
    } else {
        return {
            editedVideoDataUri: input.videoDataUri,
            analysis: "The AI failed to produce an output. Please try again.",
        };
    }
  }
);
