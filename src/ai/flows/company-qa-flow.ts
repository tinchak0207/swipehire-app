'use server';

/**
 * @fileOverview An AI flow to answer questions about a company based on provided details.
 *
 * - answerCompanyQuestion - A function that takes company details and a user question, and returns an AI-generated answer.
 * - CompanyQAInput - The input type for the answerCompanyQuestion function.
 * - CompanyQAOutput - The return type for the answerCompanyQuestion function.
 */

import type { CompanyQAInput, CompanyQAOutput } from '@/lib/types'; // Using types from lib

export async function answerCompanyQuestion(input: CompanyQAInput): Promise<CompanyQAOutput> {
  // Import the new AI service
  const { answerCompanyQuestion: mistralAnswerCompanyQuestion } = await import(
    '@/services/aiService'
  );

  // Convert the input format to match the new service
  const serviceInput: CompanyQAInput = {
    companyName: input.companyName,
    companyDescription: input.companyDescription,
    ...(input.companyIndustry && { companyIndustry: input.companyIndustry }),
    ...(input.companyCultureHighlights && {
      companyCultureHighlights: input.companyCultureHighlights,
    }),
    ...(input.jobOpeningsSummary && { jobOpeningsSummary: input.jobOpeningsSummary }),
    ...(input.userQuestion && { userQuestion: input.userQuestion }),
  };

  const result = await mistralAnswerCompanyQuestion(serviceInput);
  return { aiAnswer: result.answer || "I'm sorry, I couldn't generate an answer at this time." };
}
