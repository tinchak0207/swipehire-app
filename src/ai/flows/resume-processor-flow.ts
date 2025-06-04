
'use server';
/**
 * @fileOverview An AI flow to process resume text, suggest skills, and generate a video script.
 *
 * - processResumeAndGenerateScript - Function to process resume text and generate script ideas.
 * - ResumeProcessorInput - Input type for the function.
 * - ResumeProcessorOutput - Output type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { generateVideoScript, type GenerateVideoScriptInput } from './video-script-generator'; 

// Define Zod enums matching those in video-script-generator.ts for validation
const ToneAndStyleEnum = z.enum(["professional", "friendly", "technical", "sales", "general"]);
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

const resumeAnalysisPrompt = ai.definePrompt({
    name: 'resumeAnalysisPrompt',
    input: { schema: z.object({ resumeText: z.string(), desiredWorkStyle: z.string() }) }, // Added desiredWorkStyle
    output: { schema: z.object({
        suggestedSkills: z.array(z.string()).describe("List 3-5 key skills, technologies, or core competencies apparent from the resume text. If very little text is provided, list generic skills like 'Communication', 'Teamwork', 'Problem-solving'."),
        experienceSummaryForScript: z.string().describe("Summarize the core experience from the resume text in 2-3 concise bullet points or a short paragraph (max 100 words) suitable for a video script introduction. Consider the desired work style: {{{desiredWorkStyle}}} when framing the summary."),
    })},
    prompt: `Analyze the following resume text and desired work style.
Based on this text:
1. Identify and list 3-5 key skills, technologies, or core competencies mentioned. If the text is too short or uninformative, suggest general professional skills like "Communication", "Teamwork", "Problem-solving", "Adaptability".
2. Provide a concise summary of the candidate's core experience in 2-3 bullet points or a short paragraph (around 50-100 words). This summary will be used to help generate a video script. Tailor the summary slightly based on their desired work style: "{{desiredWorkStyle}}".

Resume Text:
{{{resumeText}}}

Desired Work Style: {{{desiredWorkStyle}}}
`,
});


const resumeProcessorFlow = ai.defineFlow(
  {
    name: 'resumeProcessorFlow',
    inputSchema: ResumeProcessorInputSchema,
    outputSchema: ResumeProcessorOutputSchema,
  },
  async (input: ResumeProcessorInput) => {
    let analysisOutput;
    try {
        console.log("resumeProcessorFlow: Calling resumeAnalysisPrompt with resumeText length:", input.resumeText.length, "and work style:", input.desiredWorkStyle);
        const { output } = await resumeAnalysisPrompt({ resumeText: input.resumeText, desiredWorkStyle: input.desiredWorkStyle });
        if (!output || !output.suggestedSkills || !output.experienceSummaryForScript) {
          console.warn("resumeProcessorFlow: AI analysis of resume text returned incomplete data. Using fallback.", output);
          throw new Error("AI analysis of resume text failed to return expected structure.");
        }
        analysisOutput = output;
        console.log("resumeProcessorFlow: resumeAnalysisPrompt success. Skills:", analysisOutput.suggestedSkills.length, "Summary length:", analysisOutput.experienceSummaryForScript.length);
    } catch (error) {
        console.error("Error during resumeAnalysisPrompt in resumeProcessorFlow:", error);
        analysisOutput = {
            suggestedSkills: ["Communication", "Teamwork", "Problem Solving", "Adaptability"], // Generic fallback
            experienceSummaryForScript: input.resumeText.length > 20 ? input.resumeText.substring(0, 200) + (input.resumeText.length > 200 ? "..." : "") : "Experienced professional seeking new opportunities." // Simple truncation or generic summary
        };
        console.log("resumeProcessorFlow: Using fallback analysisOutput.");
    }

    const videoScriptInput: GenerateVideoScriptInput = {
      experience: analysisOutput.experienceSummaryForScript,
      desiredWorkStyle: input.desiredWorkStyle,
      toneAndStyle: input.toneAndStyle,
      industryTemplate: input.industryTemplate,
    };
    
    console.log("resumeProcessorFlow: Calling generateVideoScript with summary:", videoScriptInput.experience.substring(0, 50) + "...");
    const scriptResult = await generateVideoScript(videoScriptInput);
    console.log("resumeProcessorFlow: generateVideoScript success. Script length:", scriptResult.script.length);

    return {
      suggestedSkills: analysisOutput.suggestedSkills,
      experienceSummaryForScript: analysisOutput.experienceSummaryForScript,
      generatedScript: scriptResult.script,
    };
  }
);

    
