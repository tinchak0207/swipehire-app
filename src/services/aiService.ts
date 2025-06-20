/**
 * AI Service - Mistral AI Integration
 * 
 * This service provides AI functionality using Mistral AI instead of Genkit.
 * It maintains compatibility with existing flow interfaces while using the new AI provider.
 */

import { ai, aiUtils, type AIGenerateParams, type AIGenerateResponse, AIError } from '@/ai/genkit';
import type { 
  ProfileRecommenderInput, 
  ProfileRecommenderOutput,
  CandidateProfileForAI,
  JobCriteriaForAI,
  PersonalityTraitAssessment,
  RecruiterPerspectiveWeights,
  JobSeekerPerspectiveWeights,
  CompanyQAInput,
  CompanyQAOutput,
  AIScriptTone
} from '@/lib/types';
import { WorkExperienceLevel, EducationLevel, LocationPreference, Availability, JobType } from '@/lib/types';

/**
 * Default weights for AI scoring
 */
const defaultRecruiterWeights: RecruiterPerspectiveWeights = {
  skillsMatchScore: 40,
  experienceRelevanceScore: 30,
  cultureFitScore: 20,
  growthPotentialScore: 10,
};

const defaultJobSeekerWeights: JobSeekerPerspectiveWeights = {
  cultureFitScore: 35,
  jobRelevanceScore: 30,
  growthOpportunityScore: 20,
  jobConditionFitScore: 15,
};

/**
 * Utility function to validate weights
 */
function isValidWeights(weights: any, perspective: 'recruiter' | 'jobSeeker'): boolean {
  if (!weights) return false;
  const sum = Object.values(weights).reduce((acc: number, weight: any) => acc + (Number(weight) || 0), 0);
  const numFields = 4; // Both perspectives have 4 fields
  return Object.keys(weights).length === numFields && Math.abs(sum - 100) < 0.01;
}

/**
 * Parse JSON response from AI with robust error handling
 */
function parseAIResponse<T>(response: string, fallback: T): T {
  try {
    // First, try to parse the response as-is
    return JSON.parse(response);
  } catch (firstError) {
    try {
      // Try to extract JSON from response if it's wrapped in text
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        return JSON.parse(jsonStr);
      }
    } catch (secondError) {
      // If JSON is truncated, try to fix common issues
      try {
        let fixedJson = response.trim();
        
        // Remove any leading/trailing non-JSON text
        const startBrace = fixedJson.indexOf('{');
        if (startBrace > 0) {
          fixedJson = fixedJson.substring(startBrace);
        }
        
        // Try to fix truncated JSON by adding missing closing braces
        if (fixedJson.startsWith('{') && !fixedJson.endsWith('}')) {
          // Count open braces vs close braces
          const openBraces = (fixedJson.match(/\{/g) || []).length;
          const closeBraces = (fixedJson.match(/\}/g) || []).length;
          const missingBraces = openBraces - closeBraces;
          
          // Add missing closing braces
          for (let i = 0; i < missingBraces; i++) {
            fixedJson += '}';
          }
          
          // Try to fix truncated strings by adding closing quotes
          const openQuotes = (fixedJson.match(/"/g) || []).length;
          if (openQuotes % 2 !== 0) {
            // Find the last quote and see if it needs closing
            const lastQuoteIndex = fixedJson.lastIndexOf('"');
            if (lastQuoteIndex > 0) {
              const afterLastQuote = fixedJson.substring(lastQuoteIndex + 1);
              if (!afterLastQuote.includes('"') && !afterLastQuote.includes('}')) {
                fixedJson = fixedJson.substring(0, lastQuoteIndex + 1) + '"' + afterLastQuote;
              }
            }
          }
        }
        
        return JSON.parse(fixedJson);
      } catch (thirdError) {
        console.error('Failed to parse AI response after all attempts:', {
          originalError: firstError,
          extractError: secondError,
          fixError: thirdError,
          response: response.substring(0, 200) + '...'
        });
        return fallback;
      }
    }
  }
  
  console.error('Failed to parse AI response:', response.substring(0, 200) + '...');
  return fallback;
}

/**
 * Improved AI generation with retry logic for incomplete responses
 */
async function generateWithRetry(params: AIGenerateParams, maxRetries: number = 2): Promise<AIGenerateResponse> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Increase max tokens for retries to avoid truncation
      const adjustedParams = {
        ...params,
        maxTokens: params.maxTokens ? params.maxTokens + (attempt * 500) : 2500 + (attempt * 500),
        temperature: Math.max(0.1, (params.temperature || 0.3) - (attempt * 0.1)) // Reduce temperature for more consistent output
      };
      
      const response = await ai.generate(adjustedParams);
      
      // Check if response seems complete (ends with } or has reasonable length)
      if (response.text.trim().endsWith('}') || response.text.length > 100) {
        return response;
      }
      
      // If response seems incomplete, try again
      if (attempt < maxRetries) {
        console.warn(`Attempt ${attempt + 1} returned incomplete response, retrying...`);
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      if (attempt < maxRetries) {
        console.warn(`Attempt ${attempt + 1} failed, retrying...`, error);
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}

/**
 * Profile Recommender Service
 * Analyzes candidate profiles against job criteria using Mistral AI
 */
export async function recommendProfile(input: ProfileRecommenderInput): Promise<ProfileRecommenderOutput> {
  try {
    // Prepare candidate profile with defaults
    const candidateProfileWithDefaults: CandidateProfileForAI = {
      id: input.candidateProfile.id || 'unknown-candidate',
      role: input.candidateProfile.role || 'Not specified',
      experienceSummary: input.candidateProfile.experienceSummary || 'Not specified',
      skills: input.candidateProfile.skills || [],
      location: input.candidateProfile.location || 'Not specified',
      desiredWorkStyle: input.candidateProfile.desiredWorkStyle || 'Not specified',
      pastProjects: input.candidateProfile.pastProjects || 'Not specified',
      workExperienceLevel: input.candidateProfile.workExperienceLevel || WorkExperienceLevel.UNSPECIFIED,
      educationLevel: input.candidateProfile.educationLevel || EducationLevel.UNSPECIFIED,
      locationPreference: input.candidateProfile.locationPreference || LocationPreference.UNSPECIFIED,
      languages: input.candidateProfile.languages || [],
      salaryExpectationMin: input.candidateProfile.salaryExpectationMin,
      salaryExpectationMax: input.candidateProfile.salaryExpectationMax,
      availability: input.candidateProfile.availability || Availability.UNSPECIFIED,
      jobTypePreference: input.candidateProfile.jobTypePreference || [],
      personalityAssessment: input.candidateProfile.personalityAssessment || [],
    };

    // Create a more structured prompt that encourages complete JSON responses
    const systemPrompt = `You are an AI HR expert. Analyze the candidate profile against job criteria and return a complete JSON response.

CRITICAL: You must return a complete, valid JSON object. Do not truncate your response.

Required JSON structure:
{
  "candidateId": "string",
  "reasoning": "brief explanation (max 200 chars)",
  "weightedScores": {
    "skillsMatchScore": number,
    "experienceRelevanceScore": number,
    "cultureFitScore": number,
    "growthPotentialScore": number
  },
  "isUnderestimatedTalent": boolean,
  "underestimatedReasoning": "string or null",
  "personalityAssessment": [{"trait": "string", "fit": "positive|neutral|negative", "reason": "string"}],
  "optimalWorkStyles": ["string"],
  "candidateJobFitAnalysis": {
    "reasoningForCandidate": "brief explanation (max 200 chars)",
    "weightedScoresForCandidate": {
      "cultureFitScore": number,
      "jobRelevanceScore": number,
      "growthOpportunityScore": number,
      "jobConditionFitScore": number
    }
  }
}

Keep all text fields concise to ensure complete response.`;

    const userPrompt = `Analyze this candidate for the job:

CANDIDATE:
- ID: ${candidateProfileWithDefaults.id}
- Role: ${candidateProfileWithDefaults.role}
- Skills: ${candidateProfileWithDefaults.skills?.slice(0, 5).join(', ') || 'Not specified'}
- Experience: ${candidateProfileWithDefaults.experienceSummary?.substring(0, 100) || 'Not specified'}

JOB:
- Title: ${input.jobCriteria.title}
- Required Skills: ${input.jobCriteria.requiredSkills?.slice(0, 5).join(', ') || 'Not specified'}
- Industry: ${input.jobCriteria.companyIndustry || 'Not specified'}

Provide scores (0-100) and brief analysis. Keep responses concise.`;

    const response = await generateWithRetry({
      prompt: userPrompt,
      systemPrompt,
      model: 'mistral-small',
      temperature: 0.2,
      maxTokens: 2500,
    });

    // Parse the AI response with fallback
    const fallbackOutput: ProfileRecommenderOutput = {
      candidateId: candidateProfileWithDefaults.id,
      matchScore: 50,
      reasoning: "AI analysis completed with default scoring.",
      weightedScores: { skillsMatchScore: 50, experienceRelevanceScore: 50, cultureFitScore: 50, growthPotentialScore: 50 },
      isUnderestimatedTalent: false,
      personalityAssessment: [{ trait: "Professional", fit: "positive", reason: "Standard assessment" }],
      optimalWorkStyles: ["Collaborative", "Goal-oriented"],
      candidateJobFitAnalysis: {
        matchScoreForCandidate: 50,
        reasoningForCandidate: "Standard job-candidate fit analysis.",
        weightedScoresForCandidate: { cultureFitScore: 50, jobRelevanceScore: 50, growthOpportunityScore: 50, jobConditionFitScore: 50 }
      }
    };

    const parsedResponse = parseAIResponse(response.text, fallbackOutput);

    // Determine effective weights
    const effectiveRecruiterWeights = (input.userAIWeights?.recruiterPerspective && isValidWeights(input.userAIWeights.recruiterPerspective, 'recruiter'))
      ? input.userAIWeights.recruiterPerspective
      : defaultRecruiterWeights;

    const effectiveJobSeekerWeights = (input.userAIWeights?.jobSeekerPerspective && isValidWeights(input.userAIWeights.jobSeekerPerspective, 'jobSeeker'))
      ? input.userAIWeights.jobSeekerPerspective
      : defaultJobSeekerWeights;

    // Calculate final match scores using weights
    const recruiterMatchScore = parsedResponse.weightedScores ? 
      (parsedResponse.weightedScores.skillsMatchScore * (effectiveRecruiterWeights.skillsMatchScore / 100)) +
      (parsedResponse.weightedScores.experienceRelevanceScore * (effectiveRecruiterWeights.experienceRelevanceScore / 100)) +
      (parsedResponse.weightedScores.cultureFitScore * (effectiveRecruiterWeights.cultureFitScore / 100)) +
      (parsedResponse.weightedScores.growthPotentialScore * (effectiveRecruiterWeights.growthPotentialScore / 100))
      : 50;

    const jobSeekerMatchScore = parsedResponse.candidateJobFitAnalysis?.weightedScoresForCandidate ?
      (parsedResponse.candidateJobFitAnalysis.weightedScoresForCandidate.cultureFitScore * (effectiveJobSeekerWeights.cultureFitScore / 100)) +
      (parsedResponse.candidateJobFitAnalysis.weightedScoresForCandidate.jobRelevanceScore * (effectiveJobSeekerWeights.jobRelevanceScore / 100)) +
      (parsedResponse.candidateJobFitAnalysis.weightedScoresForCandidate.growthOpportunityScore * (effectiveJobSeekerWeights.growthOpportunityScore / 100)) +
      (parsedResponse.candidateJobFitAnalysis.weightedScoresForCandidate.jobConditionFitScore * (effectiveJobSeekerWeights.jobConditionFitScore / 100))
      : 50;

    return {
      ...parsedResponse,
      candidateId: candidateProfileWithDefaults.id,
      matchScore: Math.round(recruiterMatchScore),
      candidateJobFitAnalysis: parsedResponse.candidateJobFitAnalysis ? {
        ...parsedResponse.candidateJobFitAnalysis,
        matchScoreForCandidate: Math.round(jobSeekerMatchScore),
      } : fallbackOutput.candidateJobFitAnalysis
    };

  } catch (error) {
    console.error('Profile recommendation failed:', error);
    throw new AIError(
      error instanceof Error ? error.message : 'Profile recommendation failed',
      'PROFILE_RECOMMENDATION_ERROR'
    );
  }
}

/**
 * Company Q&A Service
 * Answers questions about companies using AI
 */
export async function answerCompanyQuestion(input: CompanyQAInput): Promise<CompanyQAOutput> {
  try {
    const systemPrompt = `You are an expert HR assistant. Answer questions about companies based on the provided information.
    
    Return a complete JSON object:
    {
      "answer": "your detailed answer here",
      "confidence": number (0-100),
      "sources": ["list of information sources used"]
    }`;

    const userPrompt = `Company: ${input.companyName}
Industry: ${input.companyIndustry || 'Not specified'}
Description: ${input.companyDescription || 'Not specified'}
Culture: ${input.companyCultureKeywords?.join(', ') || 'Not specified'}

Question: ${input.question}`;

    const response = await generateWithRetry({
      prompt: userPrompt,
      systemPrompt,
      model: 'mistral-small',
      temperature: 0.2,
      maxTokens: 1000,
    });

    const fallbackOutput: CompanyQAOutput = {
      answer: "I don't have enough information to answer that question accurately.",
      confidence: 0,
      sources: []
    };

    return parseAIResponse(response.text, fallbackOutput);

  } catch (error) {
    console.error('Company Q&A failed:', error);
    throw new AIError(
      error instanceof Error ? error.message : 'Company Q&A failed',
      'COMPANY_QA_ERROR'
    );
  }
}

/**
 * Video Script Generator Service
 * Generates video scripts for candidates
 */
export async function generateVideoScript(params: {
  candidateProfile: string;
  jobDescription?: string;
  tone?: AIScriptTone;
  duration?: number;
}): Promise<{ script: string; tips: string[] }> {
  try {
    const tone = params.tone || 'professional';
    const duration = params.duration || 60;

    const systemPrompt = `You are a professional video script writer. Create engaging scripts for job applications.
    
    Return a complete JSON object:
    {
      "script": "the complete video script with timing cues",
      "tips": ["array of helpful tips for recording"]
    }`;

    const userPrompt = `Create a ${duration}-second ${tone} video script.

Profile: ${params.candidateProfile.substring(0, 300)}
${params.jobDescription ? `Job: ${params.jobDescription.substring(0, 200)}` : ''}

Make it authentic and engaging.`;

    const response = await generateWithRetry({
      prompt: userPrompt,
      systemPrompt,
      model: 'mistral-small',
      temperature: 0.7,
      maxTokens: 1500,
    });

    const fallbackOutput = {
      script: "Hello, I'm excited to introduce myself and share why I'd be a great fit for this opportunity...",
      tips: ["Practice your script multiple times", "Maintain eye contact with the camera", "Speak clearly and at a moderate pace"]
    };

    return parseAIResponse(response.text, fallbackOutput);

  } catch (error) {
    console.error('Video script generation failed:', error);
    throw new AIError(
      error instanceof Error ? error.message : 'Video script generation failed',
      'SCRIPT_GENERATION_ERROR'
    );
  }
}

/**
 * Icebreaker Generator Service
 * Generates conversation starters for matches
 */
export async function generateIcebreaker(params: {
  candidateProfile: CandidateProfileForAI;
  jobCriteria: JobCriteriaForAI;
  tone?: AIScriptTone;
}): Promise<{ icebreaker: string; alternatives: string[] }> {
  try {
    const tone = params.tone || 'friendly';

    const systemPrompt = `You are an expert at creating engaging conversation starters for professional networking.
    
    Return a complete JSON object:
    {
      "icebreaker": "the main icebreaker message",
      "alternatives": ["array of 2-3 alternative icebreakers"]
    }`;

    const userPrompt = `Generate a ${tone} icebreaker for:

Candidate: ${params.candidateProfile.role} with skills in ${params.candidateProfile.skills?.slice(0, 3).join(', ')}
Job: ${params.jobCriteria.title} at a ${params.jobCriteria.companyIndustry} company

Make it personalized and professional (1-2 sentences).`;

    const response = await generateWithRetry({
      prompt: userPrompt,
      systemPrompt,
      model: 'mistral-small',
      temperature: 0.8,
      maxTokens: 500,
    });

    const fallbackOutput = {
      icebreaker: "I noticed your background aligns well with what we're looking for. I'd love to learn more about your experience!",
      alternatives: [
        "Your skills in this area caught my attention. Would you be interested in discussing this opportunity?",
        "I think there could be a great match here. Would you like to connect and chat about the role?"
      ]
    };

    return parseAIResponse(response.text, fallbackOutput);

  } catch (error) {
    console.error('Icebreaker generation failed:', error);
    throw new AIError(
      error instanceof Error ? error.message : 'Icebreaker generation failed',
      'ICEBREAKER_GENERATION_ERROR'
    );
  }
}

/**
 * Resume Analysis Service
 * Analyzes resumes and provides feedback
 */
export async function analyzeResume(resumeText: string): Promise<{
  score: number;
  feedback: string[];
  strengths: string[];
  improvements: string[];
}> {
  try {
    const systemPrompt = `You are an expert resume reviewer. Analyze resumes and provide constructive feedback.
    
    Return a complete JSON object:
    {
      "score": number (0-100),
      "feedback": ["array of general feedback points"],
      "strengths": ["array of resume strengths"],
      "improvements": ["array of improvement suggestions"]
    }`;

    const userPrompt = `Analyze this resume (first 500 chars):
${resumeText.substring(0, 500)}

Provide constructive feedback on structure, content, and presentation.`;

    const response = await generateWithRetry({
      prompt: userPrompt,
      systemPrompt,
      model: 'mistral-small',
      temperature: 0.3,
      maxTokens: 1500,
    });

    const fallbackOutput = {
      score: 50,
      feedback: ["Unable to analyze resume at this time"],
      strengths: ["Resume submitted for review"],
      improvements: ["Please try again later"]
    };

    return parseAIResponse(response.text, fallbackOutput);

  } catch (error) {
    console.error('Resume analysis failed:', error);
    throw new AIError(
      error instanceof Error ? error.message : 'Resume analysis failed',
      'RESUME_ANALYSIS_ERROR'
    );
  }
}

/**
 * Generic Chat Reply Service
 * Generates contextual chat responses
 */
export async function generateChatReply(params: {
  message: string;
  context?: string;
  tone?: AIScriptTone;
  senderRole?: 'recruiter' | 'candidate';
}): Promise<{ reply: string; suggestions: string[] }> {
  try {
    const tone = params.tone || 'professional';
    const role = params.senderRole || 'recruiter';

    const systemPrompt = `You are an AI assistant helping with professional communication.
    
    Return a complete JSON object:
    {
      "reply": "the main suggested reply",
      "suggestions": ["array of 2-3 alternative responses"]
    }`;

    const userPrompt = `Generate a ${tone} reply as a ${role} to: "${params.message.substring(0, 200)}"
${params.context ? `Context: ${params.context.substring(0, 100)}` : ''}

Keep it professional, helpful, and concise.`;

    const response = await generateWithRetry({
      prompt: userPrompt,
      systemPrompt,
      model: 'mistral-small',
      temperature: 0.7,
      maxTokens: 800,
    });

    const fallbackOutput = {
      reply: "Thank you for your message. I'll get back to you soon with more details.",
      suggestions: [
        "I appreciate you reaching out. Let me review this and respond shortly.",
        "Thanks for your interest. I'll follow up with you soon."
      ]
    };

    return parseAIResponse(response.text, fallbackOutput);

  } catch (error) {
    console.error('Chat reply generation failed:', error);
    throw new AIError(
      error instanceof Error ? error.message : 'Chat reply generation failed',
      'CHAT_REPLY_ERROR'
    );
  }
}

/**
 * Check if AI service is available
 */
export function isAIServiceAvailable(): boolean {
  return ai.isAvailable();
}

/**
 * Get available AI models
 */
export function getAvailableModels() {
  return ai.getAvailableModels();
}

export default {
  recommendProfile,
  answerCompanyQuestion,
  generateVideoScript,
  generateIcebreaker,
  analyzeResume,
  generateChatReply,
  isAIServiceAvailable,
  getAvailableModels,
};