
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

const ToneAndStyleEnum = z.enum([
  "professional", 
  "friendly", 
  "technical", 
  "sales"
]);
const IndustryTemplateEnum = z.enum([
  "technology", 
  "creative", 
  "finance", 
  "education",
  "general"
]);

const GenerateVideoScriptInputSchema = z.object({
  experience: z
    .string()
    .describe('Description of the job seeker\'s experience.'),
  desiredWorkStyle: z
    .string()
    .describe('Description of the job seeker\'s desired work style.'),
  toneAndStyle: ToneAndStyleEnum.describe("The desired tone and style of the video script."),
  industryTemplate: IndustryTemplateEnum.describe("The industry to tailor the script for."),
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
Please use the provided experience, desired work style, selected tone ({{{toneAndStyle}}}), and industry template ({{{industryTemplate}}}) to inform the content.
For other specific details like name, position, specific achievements, hobbies, please use placeholders like "[Your Name]", "[Your Position]", "[Your Core Achievement]", "[Your Hobby]", etc., or generate plausible examples if appropriate.

**General Guidance based on Tone and Style ('{{{toneAndStyle}}}'):**
- If 'professional': Use formal language, maintain a serious and respectful demeanor. Focus on accomplishments and qualifications.
- If 'friendly': Use conversational, warm, and approachable language. Let personality shine through.
- If 'technical': Be precise, use industry-specific jargon appropriately if the target audience is technical. Clearly explain technical contributions.
- If 'sales': Be persuasive, confident, and benefit-oriented. Focus on what you can bring to the company.

**Industry-Specific Focus ('{{{industryTemplate}}}'):**
- If 'technology': Emphasize technology stack, specific project experience with technical challenges and solutions, innovative thinking, and problem-solving skills.
- If 'creative': Highlight portfolio (use placeholder like "[Your Portfolio Link]"), aesthetics, creative process, unique ideas, and impact of creative work.
- If 'finance': Focus on analytical abilities, quantitative achievements, understanding of financial principles, risk management, stability, and compliance awareness.
- If 'education': Showcase teaching philosophy, student engagement strategies, patience, communication skills, and impact on learning outcomes.
- If 'general': Maintain a broadly applicable professional tone, focusing on transferable skills and general achievements.

---

**Video Script for [Your Name] - [Your Position]**

**I. Opening Statement (10-15 seconds)**
   *   **Build Affinity:** (Adapt greeting based on '{{{toneAndStyle}}}'. E.g., Professional: "Good day, I am [Your Name]. It's a pleasure to connect." Friendly: "Hi, I'm [Your Name], thanks for watching!")
   *   **Position Positioning:** "I am a [Your Position] specializing in [Your Field/Industry, potentially influenced by '{{{industryTemplate}}}']."
   *   **Attract Attention:** "Over the past [Number] years, I've had the opportunity to [mention a key experience or core achievement from {{{experience}}}, tailored to '{{{industryTemplate}}}' if applicable. For example, with my background in {{{experience}}}...]."

**II. Core Strengths Display (20-30 seconds)**
   *   **Skill Highlights:** (Based on {{{experience}}} and tailored by '{{{industryTemplate}}}')
       *   (Example for 'technology' if '{{{industryTemplate}}}' is 'technology'): "My key skills include [Skill 1 from {{{experience}}}], [Skill 2 from {{{experience}}}], and expertise in [Specific Tech from {{{experience}}}]. A notable project was [Project Example from {{{experience}}}], where I [Your Role/Contribution focusing on tech implementation/innovation] and achieved [Specific Result, e.g., 'improved performance by X%' or 'delivered Y feature']."
       *   (Example for 'creative' if '{{{industryTemplate}}}' is 'creative'): "I excel in [Creative Skill 1] and [Creative Skill 2 from {{{experience}}}]. My portfolio at [Your Portfolio Link] showcases projects like [Project Example], where I [Your Role/Contribution focusing on creative input] resulting in [Specific Impact, e.g., 'increased engagement by Y%']."
       *   (General fallback or adapt for other industries): "One project I'm particularly proud of is [Specific Project Example from {{{experience}}}], where I [Your Role/Contribution] and achieved [Specific Result/Achievement from {{{experience}}}]."
   *   **Work Style:** "In terms of work style, {{{desiredWorkStyle}}}. I thrive in environments where [elaborate slightly, considering '{{{toneAndStyle}}}' and '{{{industryTemplate}}}' expectations, e.g., for 'technology' and 'professional' style: 'rigorous analysis and collaborative problem-solving lead to innovative solutions']."
   *   **Learning Ability:** "I'm a firm believer in continuous growth. For instance, I recently [mention a new skill learned or area of self-development relevant to '{{{industryTemplate}}}', or placeholder like 'completed a certification in Z']. This demonstrates my commitment to staying updated in [Your Field/Industry]."

**III. Cultural Fit Demonstration (15-20 seconds)**
   *   **Values Expression:** (Adapt based on '{{{toneAndStyle}}}' and '{{{industryTemplate}}}')
       *   (Example for 'finance' if '{{{industryTemplate}}}' is 'finance'): "My work philosophy centers around integrity, precision, and delivering value through sound financial practices. I approach my work with a meticulous and analytical attitude."
       *   (General): "My work philosophy centers around [Your Core Work Value, e.g., 'innovation and problem-solving' or 'delivering quality and exceeding expectations']. I approach my work with [Your Key Attitude, e.g., 'a proactive and enthusiastic attitude']."
   *   **Hobbies (Optional, for personal charm):** "Outside of work, I enjoy [Your Hobby 1] and [Your Hobby 2], which helps me [mention a positive trait, e.g., 'stay creative' or 'maintain a balanced perspective']." (If no specific hobby is inferable, suggest a placeholder or omit this part if '{{{toneAndStyle}}}' is very formal).
   *   **Future Expectations:** "Ideally, I'm looking for a work environment that [Describe Ideal Work Environment, drawing from {{{desiredWorkStyle}}} and '{{{industryTemplate}}}' characteristics, e.g., for 'creative' industry: 'is dynamic, fosters creative freedom, and values collaborative brainstorming']."

**IV. Call to Action (5-10 seconds)**
   *   **Positive Attitude:** (Adapt based on '{{{toneAndStyle}}}'. E.g., Sales: "I am confident my skills can significantly benefit your team and I'm eager to discuss how.") "I am very enthusiastic about the possibility of contributing to a forward-thinking team and I look forward to discussing how my skills and experiences can benefit your organization."
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

