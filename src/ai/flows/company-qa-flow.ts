
'use server';
/**
 * @fileOverview An AI flow to answer questions about a company based on provided details.
 *
 * - answerCompanyQuestion - A function that takes company details and a user question, and returns an AI-generated answer.
 * - CompanyQAInput - The input type for the answerCompanyQuestion function.
 * - CompanyQAOutput - The return type for the answerCompanyQuestion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { CompanyQAInput, CompanyQAOutput } from '@/lib/types'; // Using types from lib

const CompanyQAInputSchema = z.object({
  companyName: z.string().describe('The name of the company.'),
  companyDescription: z.string().describe('A general description of the company.'),
  companyIndustry: z.string().optional().describe('The industry the company operates in.'),
  companyCultureHighlights: z.array(z.string()).optional().describe('Key highlights of the company culture.'),
  jobOpeningsSummary: z.string().optional().describe('A brief summary of current job openings or types of roles available.'),
  userQuestion: z.string().min(5, "Question must be at least 5 characters.").describe('The user\'s question about the company.'),
});

const CompanyQAOutputSchema = z.object({
  aiAnswer: z.string().describe('The AI-generated answer to the user\'s question.'),
});

export async function answerCompanyQuestion(input: CompanyQAInput): Promise<CompanyQAOutput> {
  // Import the new AI service
  const { answerCompanyQuestion: mistralAnswerCompanyQuestion } = await import('@/services/aiService');
  
  // Convert the input format to match the new service
  const serviceInput = {
    companyName: input.companyName,
    companyDescription: input.companyDescription,
    companyIndustry: input.companyIndustry,
    companyCultureKeywords: input.companyCultureHighlights,
    companyWebsite: undefined,
    question: input.userQuestion,
  };
  
  const result = await mistralAnswerCompanyQuestion(serviceInput);
  return { aiAnswer: result.answer };
}

const companyQAPrompt = ai.definePrompt({
  name: 'companyQAPrompt',
  input: { schema: CompanyQAInputSchema },
  output: { schema: CompanyQAOutputSchema },
  prompt: `You are a helpful AI assistant for the company "{{companyName}}".
Your goal is to answer user questions based *only* on the information provided below about the company.
If the question cannot be answered from the given information, politely state that you don't have that specific information.
Do not make up information. Be concise and helpful.

Company Information:
- Name: {{companyName}}
- Description: {{companyDescription}}
{{#if companyIndustry}}- Industry: {{companyIndustry}}{{/if}}
{{#if companyCultureHighlights}}
- Culture Highlights:
  {{#each companyCultureHighlights}}
  - {{{this}}}
  {{/each}}
{{/if}}
{{#if jobOpeningsSummary}}- Current Job Openings (Summary): {{jobOpeningsSummary}}{{/if}}

User's Question: "{{userQuestion}}"

Answer:
`,
});

const companyQAFlow = ai.defineFlow(
  {
    name: 'companyQAFlow',
    inputSchema: CompanyQAInputSchema,
    outputSchema: CompanyQAOutputSchema,
  },
  async (input) => {
    const { output } = await companyQAPrompt(input);
    if (!output) {
      return { aiAnswer: "I'm sorry, I couldn't generate an answer at this time. Please try again." };
    }
    return output;
  }
);
