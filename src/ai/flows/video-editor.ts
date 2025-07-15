'use server';

/**
 * @fileOverview An AI agent that analyzes video resumes and suggests edits to improve their quality, including a quality rating.
 *
 * - editVideo - A function that handles the video analysis, rating, and suggestion process.
 * - EditVideoInput - The input type for the editVideo function.
 * - EditVideoOutput - The return type for the editVideo function.
 */

import { z } from 'genkit';
import { ai } from '@/ai/genkit';

const EditVideoInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video resume, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type EditVideoInput = z.infer<typeof EditVideoInputSchema>;

const EditVideoOutputSchema = z.object({
  editedVideoDataUri: z
    .string()
    .describe(
      "The conceptually edited video resume (or original if no direct editing is performed by the model), as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  analysis: z
    .string()
    .describe(
      'A detailed analysis of the original video, suggested edits, and a quality rating based on voice, visual, content optimization, and overall quality criteria.'
    ),
});
export type EditVideoOutput = z.infer<typeof EditVideoOutputSchema>;

export async function editVideo(input: EditVideoInput): Promise<EditVideoOutput> {
  return (await editVideoFlow(input)) as EditVideoOutput;
}

const prompt = ai.definePrompt({
  name: 'editVideoPrompt',
  input: { schema: EditVideoInputSchema },
  output: { schema: EditVideoOutputSchema },
  prompt: `You are an expert AI video analysis, editing suggestion, and quality rating assistant, tasked with providing feedback to improve video resumes.
You will receive a video resume. Your goal is to analyze it based on the following multi-dimensional criteria and provide a detailed textual analysis with actionable suggestions and a quality rating.
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

**IV. Quality Rating System & Improvement Guidance:**
    *   **Overall Assessment:** Briefly state your overall impression of the video's effectiveness.
    *   **Rating Breakdown (Conceptual - provide qualitative assessment for each):**
        *   **Professionalism (approx. 30% weight):** Assess clothing, background setting, and the professionalism of language and expression.
        *   **Attractiveness (approx. 25% weight):** Evaluate the opening remarks, overall expression style, and personal charm conveyed. Is it engaging?
        *   **Clarity (approx. 25% weight):** Consider picture quality (lighting, focus), sound clarity (audio levels, background noise), and the logical flow of the content.
        *   **Completeness (approx. 20% weight):** Judge the completeness of information presented, appropriateness of the video duration (ideally 60-90s), and the rationality of the overall structure.
    *   **Improvement Suggestions for Low-Scoring Items:** For any areas identified as needing improvement in the rating, provide specific, actionable suggestions.
    *   **Reference Successful Cases (Conceptual):** Where appropriate, offer conceptual examples. (e.g., "For clearer articulation, listen to how professional speakers enunciate key terms." or "Many successful video resumes start with a direct and confident introduction of their value proposition within the first 10 seconds.")
    *   **Re-recording Optimization Guidance:** If the video has significant issues, provide guidance on what to focus on if re-recording (e.g., "If re-recording, pay special attention to your lighting and ensure your main points are delivered clearly within the first minute.")

**Output Requirements:**
1.  **editedVideoDataUri**: Return the original 'videoDataUri' provided in the input.
2.  **analysis**: Provide a comprehensive textual analysis covering all the points above (Voice, Visuals, Editing Optimization Suggestions, and the Quality Rating System & Improvement Guidance). Structure your analysis clearly (e.g., using headings for each section). Be specific in your feedback and suggestions.

**Video Resume to Analyze:** {{media url=videoDataUri}}
`,
});

const editVideoFlow = ai.defineFlow(
  {
    name: 'editVideoFlow',
    inputSchema: EditVideoInputSchema,
    outputSchema: EditVideoOutputSchema,
  },
  async (input: unknown) => {
    const parsedInput = EditVideoInputSchema.parse(input);
    const result = await prompt.generate(parsedInput);
    const output = (result as { output: EditVideoOutput }).output;

    // Ensure the output structure always includes editedVideoDataUri using the input videoDataUri
    // and provides a fallback for analysis if the AI output is problematic.
    if (output?.analysis) {
      return {
        editedVideoDataUri: parsedInput.videoDataUri, // Always return the original video URI as per prompt instructions
        analysis: output.analysis,
      };
    }
    // Handle cases where the AI output might be missing the analysis or the entire output object
    return {
      editedVideoDataUri: parsedInput.videoDataUri,
      analysis:
        output?.analysis ||
        'The AI analysis could not be generated or was incomplete. Please try again.',
    };
  }
);
