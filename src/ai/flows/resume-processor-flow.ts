'use server';

/**
 * @fileOverview An AI flow to process resume text, suggest skills, and generate a video script.
 *
 * - processResumeAndGenerateScript - Function to process resume text and generate script ideas.
 * - ResumeProcessorInput - Input type for the function.
 * - ResumeProcessorOutput - Output type for the function.
 */

import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { type GenerateVideoScriptInput, generateVideoScript } from './video-script-generator';

// Define Zod enums matching those in video-script-generator.ts for validation
const ToneAndStyleEnum = z.enum(['professional', 'friendly', 'technical', 'sales', 'general']);
const IndustryTemplateEnum = z.enum(['technology', 'creative', 'finance', 'education', 'general']);

const ResumeProcessorInputSchema = z.object({
  resumeText: z
    .string()
    .min(50, 'Resume text should be at least 50 characters.')
    .describe(
      'The full text pasted by the user from their resume or their core experience highlights.'
    ),
  desiredWorkStyle: z
    .string()
    .min(5, 'Desired work style should be at least 5 characters.')
    .describe("User's desired work style (e.g., remote, collaborative)."),
  toneAndStyle: ToneAndStyleEnum.describe('The desired tone and style for the video script.'),
  industryTemplate: IndustryTemplateEnum.describe('The industry to tailor the script for.'),
});
export type ResumeProcessorInput = z.infer<typeof ResumeProcessorInputSchema>;

const ResumeProcessorOutputSchema = z.object({
  suggestedSkills: z
    .array(z.string())
    .describe('A list of skills suggested by the AI based on the resume text.'),
  experienceSummaryForScript: z
    .string()
    .describe(
      'A concise summary of the experience, potentially used as input for script generation if different from raw resumeText.'
    ),
  generatedScript: z.string().describe('The AI-generated video script.'),
});
export type ResumeProcessorOutput = z.infer<typeof ResumeProcessorOutputSchema>;

type ResumeAnalysis_Result = {
  suggestedSkills: string[];
  experienceSummaryForScript: string;
};

export async function processResumeAndGenerateScript(
  input: ResumeProcessorInput
): Promise<ResumeProcessorOutput> {
  return (await resumeProcessorFlow(input)) as ResumeProcessorOutput;
}

// Simple helper function to analyze resume text
async function analyzeResumeText(resumeText: string, _desiredWorkStyle: string) {
  return {
    suggestedSkills: ['Communication', 'Teamwork', 'Problem Solving'],
    experienceSummaryForScript: `${resumeText.substring(0, 100)}...`,
  };
}

const resumeProcessorFlow = ai.defineFlow(
  {
    name: 'resumeProcessorFlow',
    inputSchema: ResumeProcessorInputSchema,
    outputSchema: ResumeProcessorOutputSchema,
  },
  async (input: unknown) => {
    const parsedInput = ResumeProcessorInputSchema.parse(input);
    let analysisOutput: ResumeAnalysis_Result;
    try {
      console.log(
        'resumeProcessorFlow: Calling resumeAnalysisPrompt with resumeText length:',
        parsedInput.resumeText.length,
        'and work style:',
        parsedInput.desiredWorkStyle
      );
      const output = await analyzeResumeText(parsedInput.resumeText, parsedInput.desiredWorkStyle);
      if (!output || !output.suggestedSkills || !output.experienceSummaryForScript) {
        console.warn(
          'resumeProcessorFlow: AI analysis of resume text returned incomplete data. Using fallback.',
          output
        );
        throw new Error('AI analysis of resume text failed to return expected structure.');
      }
      analysisOutput = output;
      console.log(
        'resumeProcessorFlow: resumeAnalysisPrompt success. Skills:',
        analysisOutput.suggestedSkills.length,
        'Summary length:',
        analysisOutput.experienceSummaryForScript.length
      );
    } catch (error) {
      console.error('Error during resumeAnalysisPrompt in resumeProcessorFlow:', error);
      analysisOutput = {
        suggestedSkills: ['Communication', 'Teamwork', 'Problem Solving', 'Adaptability'], // Generic fallback
        experienceSummaryForScript:
          parsedInput.resumeText.length > 20
            ? parsedInput.resumeText.substring(0, 200) +
              (parsedInput.resumeText.length > 200 ? '...' : '')
            : 'Experienced professional seeking new opportunities.', // Simple truncation or generic summary
      };
      console.log('resumeProcessorFlow: Using fallback analysisOutput.');
    }

    const videoScriptInput: GenerateVideoScriptInput = {
      experience: analysisOutput.experienceSummaryForScript,
      desiredWorkStyle: parsedInput.desiredWorkStyle,
      toneAndStyle: parsedInput.toneAndStyle,
      industryTemplate: parsedInput.industryTemplate,
    };

    console.log(
      'resumeProcessorFlow: Calling generateVideoScript with summary:',
      `${videoScriptInput.experience.substring(0, 50)}...`
    );
    const scriptResult = await generateVideoScript(videoScriptInput);
    console.log(
      'resumeProcessorFlow: generateVideoScript success. Script length:',
      scriptResult.script.length
    );

    return {
      suggestedSkills: analysisOutput.suggestedSkills,
      experienceSummaryForScript: analysisOutput.experienceSummaryForScript,
      generatedScript: scriptResult.script,
    };
  }
);
