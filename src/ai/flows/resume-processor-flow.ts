
'use server';
/**
 * @fileOverview An AI flow to process resume text, suggest skills, and generate a video script.
 *
 * - processResumeAndGenerateScript - Function to process resume text and generate script ideas.
 * - ResumeProcessorInput - Input type for the function.
 * - ResumeProcessorOutput - Output type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { generateVideoScript, type GenerateVideoScriptInput } from './video-script-generator'; // Assuming it exports this

// Define Zod enums matching those in video-script-generator.ts for validation
const ToneAndStyleEnum = z.enum(["professional", "friendly", "technical", "sales"]);
const IndustryTemplateEnum = z.enum(["technology", "creative", "finance", "education", "general"]);


const ResumeProcessorInputSchema = z.object({
  resumeText: z.string().min(50, "Resume text should be at least 50 characters.").describe("The full text pasted by the user from their resume or their core experience highlights."),
  desiredWorkStyle: z.string().min(5, "Desired work style should be at least 5 characters.").describe("User's desired work style (e.g., remote, collaborative)."),
  toneAndStyle: ToneAndStyleEnum.describe("The desired tone and style for the video script."),
  industryTemplate: IndustryTemplateEnum.describe("The industry to tailor the script for."),
});
export type ResumeProcessorInput = z.infer<typeof ResumeProcessorInputSchema>;

const ResumeProcessorOutputSchema = z.object({
  suggestedSkills: z.array(z.string()).describe("A list of skills suggested by the AI based on the resume text."),
  experienceSummaryForScript: z.string().describe("A concise summary of the experience, potentially used as input for script generation if different from raw resumeText."),
  generatedScript: z.string().describe("The AI-generated video script."),
});
export type ResumeProcessorOutput = z.infer<typeof ResumeProcessorOutputSchema>;

export async function processResumeAndGenerateScript(input: ResumeProcessorInput): Promise<ResumeProcessorOutput> {
  return resumeProcessorFlow(input);
}

// Placeholder simple prompt for skill suggestion and summary
// In a real scenario, this might be more sophisticated or use multiple prompts.
const resumeAnalysisPrompt = ai.definePrompt({
    name: 'resumeAnalysisPrompt',
    input: { schema: z.object({ resumeText: z.string() }) },
    output: { schema: z.object({
        suggestedSkills: z.array(z.string()).describe("List 3-5 key skills or technologies apparent from the text."),
        experienceSummaryForScript: z.string().describe("Summarize the core experience in 2-3 concise bullet points suitable for a video script introduction."),
    })},
    prompt: `Analyze the following resume text.
Based on this text:
1. Identify and list 3-5 key skills, technologies, or core competencies mentioned.
2. Provide a very concise summary of the candidate's core experience in 2-3 bullet points. This summary will be used to help generate a video script.

Resume Text:
{{{resumeText}}}
`,
});


const resumeProcessorFlow = ai.defineFlow(
  {
    name: 'resumeProcessorFlow',
    inputSchema: ResumeProcessorInputSchema,
    outputSchema: ResumeProcessorOutputSchema,
  },
  async (input: ResumeProcessorInput) => {
    // 1. Analyze resume text for skills and summary (simulated for now)
    // In a real implementation, this would involve a more complex NLP/AI step.
    // For now, we'll use a simple Genkit prompt.
    
    let analysisOutput;
    try {
        const { output } = await resumeAnalysisPrompt({ resumeText: input.resumeText });
        if (!output) throw new Error("AI analysis of resume text failed.");
        analysisOutput = output;
    } catch (error) {
        console.error("Error during resumeAnalysisPrompt:", error);
        // Fallback if analysis fails
        analysisOutput = {
            suggestedSkills: ["Problem Solving", "Teamwork", "Communication"], // Generic fallback
            experienceSummaryForScript: input.resumeText.substring(0, 200) + (input.resumeText.length > 200 ? "..." : "") // Simple truncation
        };
    }

    // 2. Generate video script using the (potentially summarized) experience
    const videoScriptInput: GenerateVideoScriptInput = {
      experience: analysisOutput.experienceSummaryForScript, // Use summarized experience
      desiredWorkStyle: input.desiredWorkStyle,
      toneAndStyle: input.toneAndStyle,
      industryTemplate: input.industryTemplate,
    };
    
    const scriptResult = await generateVideoScript(videoScriptInput);

    return {
      suggestedSkills: analysisOutput.suggestedSkills,
      experienceSummaryForScript: analysisOutput.experienceSummaryForScript,
      generatedScript: scriptResult.script,
    };
  }
);

    