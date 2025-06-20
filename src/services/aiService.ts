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
 * Parse JSON response from AI with error handling
 */
function parseAIResponse<T>(response: string, fallback: T): T {
  try {
    // Try to extract JSON from response if it's wrapped in text
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : response;
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    console.error('Response was:', response);
    return fallback;
  }
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

    // Create the prompt
    const systemPrompt = `You are an AI HR expert. Your task is to evaluate a candidate profile against job criteria from both recruiter and job seeker perspectives.

Return your response as a valid JSON object with the following structure:
{
  "candidateId": "string",
  "reasoning": "string",
  "weightedScores": {
    "skillsMatchScore": number (0-100),
    "experienceRelevanceScore": number (0-100),
    "cultureFitScore": number (0-100),
    "growthPotentialScore": number (0-100)
  },
  "isUnderestimatedTalent": boolean,
  "underestimatedReasoning": "string or null",
  "personalityAssessment": [
    {
      "trait": "string",
      "fit": "positive|neutral|negative",
      "reason": "string"
    }
  ],
  "optimalWorkStyles": ["string"],
  "candidateJobFitAnalysis": {
    "reasoningForCandidate": "string",
    "weightedScoresForCandidate": {
      "cultureFitScore": number (0-100),
      "jobRelevanceScore": number (0-100),
      "growthOpportunityScore": number (0-100),
      "jobConditionFitScore": number (0-100)
    }
  }
}

Evaluation Criteria:
1. Skills Match: How well candidate skills match required skills
2. Experience Relevance: Relevance of past experience and work level
3. Culture Fit: Alignment with company culture and work style
4. Growth Potential: Learning ability and potential for development

Assess both perspectives:
- Recruiter's Perspective: How well does the candidate fit the job?
- Job Seeker's Perspective: How well does the job fit the candidate?`;

    const userPrompt = `Candidate Profile:
ID: ${candidateProfileWithDefaults.id}
Role: ${candidateProfileWithDefaults.role}
Experience: ${candidateProfileWithDefaults.experienceSummary}
Skills: ${candidateProfileWithDefaults.skills?.join(', ') || 'Not specified'}
Location: ${candidateProfileWithDefaults.location}
Work Style: ${candidateProfileWithDefaults.desiredWorkStyle}
Projects: ${candidateProfileWithDefaults.pastProjects}
Experience Level: ${candidateProfileWithDefaults.workExperienceLevel}
Education: ${candidateProfileWithDefaults.educationLevel}
Location Preference: ${candidateProfileWithDefaults.locationPreference}
Languages: ${candidateProfileWithDefaults.languages?.join(', ') || 'Not specified'}
Salary Range: ${candidateProfileWithDefaults.salaryExpectationMin || 'Not specified'} - ${candidateProfileWithDefaults.salaryExpectationMax || 'Not specified'}
Availability: ${candidateProfileWithDefaults.availability}
Job Type Preference: ${candidateProfileWithDefaults.jobTypePreference?.join(', ') || 'Not specified'}

Job Criteria:
Title: ${input.jobCriteria.title}
Description: ${input.jobCriteria.description}
Required Skills: ${input.jobCriteria.requiredSkills?.join(', ') || 'Not specified'}
Experience Level: ${input.jobCriteria.requiredExperienceLevel || 'Not specified'}
Education Level: ${input.jobCriteria.requiredEducationLevel || 'Not specified'}
Location Type: ${input.jobCriteria.workLocationType || 'Not specified'}
Job Location: ${input.jobCriteria.jobLocation || 'Not specified'}
Languages: ${input.jobCriteria.requiredLanguages?.join(', ') || 'Not specified'}
Salary Range: ${input.jobCriteria.salaryMin || 'Not specified'} - ${input.jobCriteria.salaryMax || 'Not specified'}
Job Type: ${input.jobCriteria.jobType || 'Not specified'}
Company Culture: ${input.jobCriteria.companyCultureKeywords?.join(', ') || 'Not specified'}
Industry: ${input.jobCriteria.companyIndustry || 'Not specified'}`;

    const response = await ai.generate({
      prompt: userPrompt,
      systemPrompt,
      model: 'mistral-small',
      temperature: 0.3,
      maxTokens: 2000,
    });

    // Parse the AI response
    const fallbackOutput: ProfileRecommenderOutput = {
      candidateId: candidateProfileWithDefaults.id,
      matchScore: 0,
      reasoning: "AI analysis failed to generate a complete response. Please review manually.",
      weightedScores: { skillsMatchScore: 0, experienceRelevanceScore: 0, cultureFitScore: 0, growthPotentialScore: 0 },
      isUnderestimatedTalent: false,
      personalityAssessment: [],
      optimalWorkStyles: [],
      candidateJobFitAnalysis: {
        matchScoreForCandidate: 0,
        reasoningForCandidate: "AI analysis failed for job-to-candidate fit.",
        weightedScoresForCandidate: { cultureFitScore: 0, jobRelevanceScore: 0, growthOpportunityScore: 0, jobConditionFitScore: 0 }
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
      : 0;

    const jobSeekerMatchScore = parsedResponse.candidateJobFitAnalysis?.weightedScoresForCandidate ?
      (parsedResponse.candidateJobFitAnalysis.weightedScoresForCandidate.cultureFitScore * (effectiveJobSeekerWeights.cultureFitScore / 100)) +
      (parsedResponse.candidateJobFitAnalysis.weightedScoresForCandidate.jobRelevanceScore * (effectiveJobSeekerWeights.jobRelevanceScore / 100)) +
      (parsedResponse.candidateJobFitAnalysis.weightedScoresForCandidate.growthOpportunityScore * (effectiveJobSeekerWeights.growthOpportunityScore / 100)) +
      (parsedResponse.candidateJobFitAnalysis.weightedScoresForCandidate.jobConditionFitScore * (effectiveJobSeekerWeights.jobConditionFitScore / 100))
      : 0;

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
    const systemPrompt = `You are an expert HR assistant. Answer questions about companies based on the provided company information. 
    Be helpful, accurate, and professional. If you don't have enough information, say so clearly.
    
    Return your response as a JSON object with this structure:
    {
      "answer": "your detailed answer here",
      "confidence": number (0-100),
      "sources": ["list of information sources used"]
    }`;

    const userPrompt = `Company Information:
Name: ${input.companyName}
Industry: ${input.companyIndustry || 'Not specified'}
Description: ${input.companyDescription || 'Not specified'}
Culture Keywords: ${input.companyCultureKeywords?.join(', ') || 'Not specified'}
Website: ${input.companyWebsite || 'Not specified'}

Question: ${input.question}`;

    const response = await ai.generate({
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

    const systemPrompt = `You are a professional video script writer specializing in job application videos. 
    Create engaging, authentic scripts that help candidates showcase their best qualities.
    
    Return your response as a JSON object:
    {
      "script": "the complete video script with timing cues",
      "tips": ["array of helpful tips for recording"]
    }`;

    const userPrompt = `Create a ${duration}-second video script with a ${tone} tone.

Candidate Profile: ${params.candidateProfile}
${params.jobDescription ? `Job Description: ${params.jobDescription}` : ''}

The script should:
- Be authentic and engaging
- Highlight key strengths
- Include natural pauses and timing
- Be appropriate for the specified tone
- Fit within the time limit`;

    const response = await ai.generate({
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
    Generate icebreakers that are relevant, personalized, and appropriate for job-related conversations.
    
    Return your response as a JSON object:
    {
      "icebreaker": "the main icebreaker message",
      "alternatives": ["array of 2-3 alternative icebreakers"]
    }`;

    const userPrompt = `Generate a ${tone} icebreaker message based on:

Candidate: ${params.candidateProfile.role} with skills in ${params.candidateProfile.skills?.join(', ')}
Job: ${params.jobCriteria.title} at a ${params.jobCriteria.companyIndustry} company

The icebreaker should:
- Be personalized and relevant
- Show genuine interest
- Be professional yet approachable
- Reference specific skills or experiences
- Be concise (1-2 sentences)`;

    const response = await ai.generate({
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
    
    Return your response as a JSON object:
    {
      "score": number (0-100),
      "feedback": ["array of general feedback points"],
      "strengths": ["array of resume strengths"],
      "improvements": ["array of improvement suggestions"]
    }`;

    const userPrompt = aiUtils.createResumeAnalysisPrompt(resumeText);

    const response = await ai.generate({
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
    Generate appropriate responses for job-related conversations.
    
    Return your response as a JSON object:
    {
      "reply": "the main suggested reply",
      "suggestions": ["array of 2-3 alternative responses"]
    }`;

    const userPrompt = `Generate a ${tone} reply as a ${role} to this message:

Message: "${params.message}"
${params.context ? `Context: ${params.context}` : ''}

The reply should:
- Be professional and appropriate
- Match the specified tone
- Be helpful and engaging
- Be concise but complete`;

    const response = await ai.generate({
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