'use server';

/**
 * @fileOverview Profile recommendation flow
 */
import { z } from 'genkit';
import type { PersonalityTraitAssessment, UserAIWeights } from '@/lib/types';
import {
  Availability,
  EducationLevel,
  JobType,
  LocationPreference,
  WorkExperienceLevel,
} from '@/lib/types';

// Zod schemas (same as before)
const ZodWorkExperienceLevel = z.nativeEnum(WorkExperienceLevel);
const ZodEducationLevel = z.nativeEnum(EducationLevel);
const ZodLocationPreference = z.nativeEnum(LocationPreference);
const ZodAvailability = z.nativeEnum(Availability);
const ZodJobType = z.nativeEnum(JobType);

const CandidateProfileSchema = z.object({
  id: z.string(),
  role: z.string().describe("Candidate's stated role"),
  experienceSummary: z.string().describe("Candidate's work experience"),
  skills: z.array(z.string()).describe("Candidate's skills"),
  location: z.string().describe("Candidate's location"),
  desiredWorkStyle: z.string().describe('Preferred work style'),
  pastProjects: z.string().describe('Past projects'),
  workExperienceLevel: ZodWorkExperienceLevel.describe('Experience level'),
  educationLevel: ZodEducationLevel.describe('Education level'),
  locationPreference: ZodLocationPreference.describe('Location preference'),
  languages: z.array(z.string()).describe('Languages spoken'),
  salaryExpectationMin: z.number().describe('Min salary expectation'),
  salaryExpectationMax: z.number().describe('Max salary expectation'),
  availability: ZodAvailability.describe('Availability'),
  jobTypePreference: z.array(ZodJobType).describe('Job type preferences'),
  personalityAssessment: z
    .array(
      z.object({
        trait: z.string(),
        fit: z.enum(['positive', 'neutral', 'negative']),
        reason: z.string().optional(),
      })
    )
    .default([])
    .describe('Personality assessment'),
});

const JobCriteriaSchema = z.object({
  title: z.string().describe('Job title'),
  description: z.string().describe('Job description'),
  requiredSkills: z.array(z.string()).optional().describe('Required skills'),
  requiredExperienceLevel: ZodWorkExperienceLevel.optional().describe('Required experience level'),
  requiredEducationLevel: ZodEducationLevel.optional().describe('Required education level'),
  workLocationType: ZodLocationPreference.optional().describe('Work location type'),
  jobLocation: z.string().optional().describe('Job location'),
  requiredLanguages: z.array(z.string()).optional().describe('Required languages'),
  salaryMin: z.number().optional().describe('Min salary'),
  salaryMax: z.number().optional().describe('Max salary'),
  jobType: ZodJobType.optional().describe('Job type'),
  companyCultureKeywords: z.array(z.string()).optional().describe('Company culture keywords'),
  companyIndustry: z.string().optional().describe('Company industry'),
});

export type ProfileRecommenderInput = {
  candidateProfile: z.infer<typeof CandidateProfileSchema>;
  jobCriteria: z.infer<typeof JobCriteriaSchema>;
  userAIWeights?: UserAIWeights;
};

export type ProfileRecommenderOutput = {
  candidateId: string;
  matchScore: number;
  reasoning: string;
  weightedScores: {
    skillsMatchScore: number;
    experienceRelevanceScore: number;
    cultureFitScore: number;
    growthPotentialScore: number;
  };
  isUnderestimatedTalent: boolean;
  underestimatedReasoning?: string;
  personalityAssessment?: PersonalityTraitAssessment[];
  optimalWorkStyles?: string[];
  candidateJobFitAnalysis?: {
    matchScoreForCandidate: number;
    reasoningForCandidate: string;
    weightedScoresForCandidate: {
      cultureFitScore: number;
      jobRelevanceScore: number;
      growthOpportunityScore: number;
      jobConditionFitScore: number;
    };
  };
};

export async function recommendProfile(
  input: ProfileRecommenderInput
): Promise<ProfileRecommenderOutput> {
  const { recommendProfile: mistralRecommendProfile } = await import('@/services/aiService');

  // Ensure personalityAssessment matches expected type
  // Ensure proper initialization of required fields
  // Initialize all optional fields with defaults
  // Create properly typed normalized input
  const normalizedInput = {
    ...input,
    candidateProfile: {
      ...input.candidateProfile,
      personalityAssessment: input.candidateProfile.personalityAssessment.map((assessment) => ({
        trait: assessment.trait,
        fit: assessment.fit,
        reason: assessment.reason ?? '',
      })) as PersonalityTraitAssessment[],
    },
    jobCriteria: {
      ...input.jobCriteria,
      requiredSkills: input.jobCriteria.requiredSkills ?? [],
      requiredExperienceLevel:
        input.jobCriteria.requiredExperienceLevel ?? WorkExperienceLevel.UNSPECIFIED,
      requiredEducationLevel:
        input.jobCriteria.requiredEducationLevel ?? EducationLevel.UNSPECIFIED,
      workLocationType: input.jobCriteria.workLocationType ?? LocationPreference.UNSPECIFIED,
      jobLocation: input.jobCriteria.jobLocation ?? '',
      requiredLanguages: input.jobCriteria.requiredLanguages ?? [],
      salaryMin: input.jobCriteria.salaryMin ?? 0,
      salaryMax: input.jobCriteria.salaryMax ?? 0,
      jobType: input.jobCriteria.jobType ?? JobType.UNSPECIFIED,
      companyCultureKeywords: input.jobCriteria.companyCultureKeywords ?? [],
      companyIndustry: input.jobCriteria.companyIndustry ?? '',
    },
  } satisfies ProfileRecommenderInput;

  return mistralRecommendProfile(normalizedInput);
}
