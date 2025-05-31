
'use server';
/**
 * @fileOverview An AI agent that recommends and scores candidate profiles against job criteria,
 * and also assesses how well a job fits a candidate.
 *
 * - recommendProfile - A function that analyzes candidate profiles against job requirements and provides a match score and reasoning.
 * - ProfileRecommenderInput - The input type for the recommendProfiles function.
 * - ProfileRecommenderOutput - The return type for the recommendProfiles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Candidate, CompanyJobOpening, PersonalityTraitAssessment, UserAIWeights, RecruiterPerspectiveWeights, JobSeekerPerspectiveWeights } from '@/lib/types';
import { WorkExperienceLevel, EducationLevel, LocationPreference, Availability, JobType } from '@/lib/types';

// Define Zod enums matching those in types.ts for validation within the flow
const ZodWorkExperienceLevel = z.nativeEnum(WorkExperienceLevel);
const ZodEducationLevel = z.nativeEnum(EducationLevel);
const ZodLocationPreference = z.nativeEnum(LocationPreference);
const ZodAvailability = z.nativeEnum(Availability);
const ZodJobType = z.nativeEnum(JobType);


const CandidateProfileSchema = z.object({
  id: z.string(),
  role: z.string().describe("Candidate's stated role or desired position.").optional(),
  experienceSummary: z.string().describe("Summary of the candidate's work experience.").optional(),
  skills: z.array(z.string()).describe("List of candidate's skills.").optional(),
  location: z.string().optional().describe("Candidate's current location or preferred city."),
  desiredWorkStyle: z.string().optional().describe("Candidate's preferred work style (e.g., remote, collaborative)."),
  pastProjects: z.string().optional().describe("Brief description of key past projects or achievements."),
  workExperienceLevel: ZodWorkExperienceLevel.optional().describe("Candidate's level of work experience."),
  educationLevel: ZodEducationLevel.optional().describe("Candidate's highest education level."),
  locationPreference: ZodLocationPreference.optional().describe("Candidate's location preference (remote, hybrid, specific city)."),
  languages: z.array(z.string()).optional().describe("Languages spoken by the candidate."),
  salaryExpectationMin: z.number().optional().describe("Candidate's minimum salary expectation."),
  salaryExpectationMax: z.number().optional().describe("Candidate's maximum salary expectation."),
  availability: ZodAvailability.optional().describe("Candidate's availability to start a new role."),
  jobTypePreference: z.array(ZodJobType).optional().describe("Candidate's preferred job types."),
  personalityAssessment: z.array(z.object({
    trait: z.string(),
    fit: z.enum(['positive', 'neutral', 'negative']),
    reason: z.string().optional(),
  })).optional().describe("Candidate's personality assessment (if previously generated).")
}).describe("A candidate's profile data.");
export type CandidateProfileForAI = z.infer<typeof CandidateProfileSchema>;


const JobCriteriaSchema = z.object({
  title: z.string().describe("The title of the job position."),
  description: z.string().describe("A detailed description of the job, including responsibilities and requirements."),
  requiredSkills: z.array(z.string()).optional().describe("Specific skills required for the job."),
  requiredExperienceLevel: ZodWorkExperienceLevel.optional().describe("Required level of work experience for the job."),
  requiredEducationLevel: ZodEducationLevel.optional().describe("Required education level for the job."),
  workLocationType: ZodLocationPreference.optional().describe("Location type for the job (on-site, remote, hybrid)."),
  jobLocation: z.string().optional().describe("Specific location of the job if not remote."),
  requiredLanguages: z.array(z.string()).optional().describe("Language proficiency required."),
  salaryMin: z.number().optional().describe("Minimum salary offered for the position."),
  salaryMax: z.number().optional().describe("Maximum salary offered for the position."),
  jobType: ZodJobType.optional().describe("Type of job (full-time, part-time, etc.)."),
  companyCultureKeywords: z.array(z.string()).optional().describe("Keywords describing the company culture (e.g., 'fast-paced', 'collaborative', 'innovative')."),
  companyIndustry: z.string().optional().describe("The industry of the company."),
}).describe("The criteria and requirements for a specific job opening.");
export type JobCriteriaForAI = z.infer<typeof JobCriteriaSchema>;

const RecruiterWeightsSchema = z.object({
    skillsMatchScore: z.number().min(0).max(100),
    experienceRelevanceScore: z.number().min(0).max(100),
    cultureFitScore: z.number().min(0).max(100),
    growthPotentialScore: z.number().min(0).max(100),
}).refine(data => {
    const sum = data.skillsMatchScore + data.experienceRelevanceScore + data.cultureFitScore + data.growthPotentialScore;
    return Math.abs(sum - 100) < 0.01; // Allow for floating point inaccuracies
}, { message: "Recruiter perspective weights must sum to 100." });

const JobSeekerWeightsSchema = z.object({
    cultureFitScore: z.number().min(0).max(100),
    jobRelevanceScore: z.number().min(0).max(100),
    growthOpportunityScore: z.number().min(0).max(100),
    jobConditionFitScore: z.number().min(0).max(100),
}).refine(data => {
    const sum = data.cultureFitScore + data.jobRelevanceScore + data.growthOpportunityScore + data.jobConditionFitScore;
    return Math.abs(sum - 100) < 0.01; // Allow for floating point inaccuracies
}, { message: "Job seeker perspective weights must sum to 100." });

const UserAIWeightsSchema = z.object({
  recruiterPerspective: RecruiterWeightsSchema.optional(),
  jobSeekerPerspective: JobSeekerWeightsSchema.optional()
}).optional().describe("Optional user-defined weights for AI scoring criteria. If provided and valid, these will be used to calculate the final match scores.");


const ProfileRecommenderInputSchema = z.object({
  candidateProfile: CandidateProfileSchema,
  jobCriteria: JobCriteriaSchema,
  userAIWeights: UserAIWeightsSchema,
});
export type ProfileRecommenderInput = z.infer<typeof ProfileRecommenderInputSchema>;

const PersonalityTraitAssessmentSchema = z.object({
  trait: z.string().describe("The personality trait identified, e.g., Social, Creative, Independent."),
  fit: z.enum(['positive', 'neutral', 'negative']).describe("Assessment of the trait's fit for the role/company: 'positive', 'neutral', or 'negative'."),
  reason: z.string().optional().describe("A brief explanation for the fit assessment.")
});

const CandidateJobFitAnalysisSchema = z.object({
  matchScoreForCandidate: z.number().min(0).max(100).describe("A score from 0 to 100 indicating how well the job opportunity fits the candidate's profile and preferences. This score is calculated based on user-defined or default weights."),
  reasoningForCandidate: z.string().describe("A brief explanation of the job-to-candidate fit score, highlighting key alignment factors and potential mismatches from the candidate's perspective."),
  weightedScoresForCandidate: z.object({ // Raw scores from LLM
    cultureFitScore: z.number().min(0).max(100),
    jobRelevanceScore: z.number().min(0).max(100),
    growthOpportunityScore: z.number().min(0).max(100),
    jobConditionFitScore: z.number().min(0).max(100),
  }).describe("Breakdown of raw scores (0-100) for the job-to-candidate fit assessment for each category."),
}).describe("Analysis of how well the job fits the candidate.");

const ProfileRecommenderOutputSchema = z.object({
  candidateId: z.string(),
  matchScore: z.number().min(0).max(100).describe("A score from 0 to 100 indicating how well the candidate matches the job criteria (Recruiter's Perspective). This score is calculated based on user-defined or default weights."),
  reasoning: z.string().describe("A brief explanation of the match score from the recruiter's perspective, highlighting key matching factors and potential gaps."),
  weightedScores: z.object({ // Raw scores from LLM
    skillsMatchScore: z.number().min(0).max(100),
    experienceRelevanceScore: z.number().min(0).max(100),
    cultureFitScore: z.number().min(0).max(100),
    growthPotentialScore: z.number().min(0).max(100),
  }).describe("Breakdown of raw scores (0-100) for each category from the Recruiter's Perspective."),
  isUnderestimatedTalent: z.boolean().describe("Indicates if this candidate might be an underestimated talent or hidden gem based on their profile relative to the job criteria."),
  underestimatedReasoning: z.string().optional().describe("Brief reasoning if the candidate is considered underestimated."),
  personalityAssessment: z.array(PersonalityTraitAssessmentSchema).optional().describe("An array of personality trait assessments based on the candidate's profile and the company culture (for recruiter's view)."),
  optimalWorkStyles: z.array(z.string()).optional().describe("A list of optimal work style characteristics suitable for the candidate in the context of the role/company (for recruiter's view)."),
  candidateJobFitAnalysis: CandidateJobFitAnalysisSchema.optional().describe("An analysis of how well the job opportunity fits the candidate (Job Seeker's Perspective)."),
});
export type ProfileRecommenderOutput = z.infer<typeof ProfileRecommenderOutputSchema>;


export async function recommendProfile(input: ProfileRecommenderInput): Promise<ProfileRecommenderOutput> {
  return profileRecommenderFlow(input);
}

const profileRecommenderPrompt = ai.definePrompt({
  name: 'profileRecommenderPrompt',
  input: {schema: z.object({ // Prompt input does not need userAIWeights directly, they are handled in TS
    candidateProfile: CandidateProfileSchema,
    jobCriteria: JobCriteriaSchema,
  })},
  output: {schema: ProfileRecommenderOutputSchema}, // LLM won't output final matchScore, but needs other fields.
  prompt: `You are an AI HR expert. Your task is twofold:

1.  **Recruiter's Perspective**: Evaluate the provided Candidate Profile against the Job Criteria.
    *   **Evaluation Criteria:**
        *   **Skills Match:** How well do the candidate's skills ({{{candidateProfile.skills}}}) match the required skills ({{{jobCriteria.requiredSkills}}})? Consider direct and related skills.
        *   **Experience Relevance:** Assess relevance of candidate's past experience ({{{candidateProfile.experienceSummary}}}, {{{candidateProfile.pastProjects}}}), and work experience level ({{{candidateProfile.workExperienceLevel}}}) against job's requirements ({{{jobCriteria.description}}}, {{{jobCriteria.requiredExperienceLevel}}}).
        *   **Culture Fit:** Based on candidate's desired work style ({{{candidateProfile.desiredWorkStyle}}}), and implicit cues, how well might they fit the company culture ({{{jobCriteria.companyCultureKeywords}}}) and industry ({{{jobCriteria.companyIndustry}}})?
        *   **Growth Potential:** Based on inferred learning ability (skill diversity, project variety, education {{{candidateProfile.educationLevel}}}), how likely are they to grow?
    *   **Output Requirements for Recruiter's Perspective:**
        *   Provide raw scores (0-100) for these four categories in the \`weightedScores\` object: \`skillsMatchScore\`, \`experienceRelevanceScore\`, \`cultureFitScore\`, \`growthPotentialScore\`.
        *   The overall \`matchScore\` will be calculated programmatically later.
        *   Provide a qualitative \`reasoning\` summarizing your assessment of the candidate's fit for the job.
    *   **Underestimated Talent Assessment:** Assess if this candidate is an "underestimated talent". Set \`isUnderestimatedTalent\` and \`underestimatedReasoning\`.
    *   **Personality Fit & Work Style Assessment:** Provide \`personalityAssessment\` (2-3 traits) and \`optimalWorkStyles\` (2-4 styles).

2.  **Job Seeker's Perspective**: Separately, assess how well this Job Opportunity fits the Candidate's profile and preferences.
    *   **Evaluation Criteria for Job Seeker's Fit:**
        *   **Culture Fit Matching:** Candidate's desired work style ({{{candidateProfile.desiredWorkStyle}}}), personality insights ({{{candidateProfile.personalityAssessment}}}) vs. Company culture ({{{jobCriteria.companyCultureKeywords}}}, {{{jobCriteria.companyIndustry}}}), job's work style ({{{jobCriteria.workLocationType}}}).
        *   **Job Relevance:** Candidate's skills ({{{candidateProfile.skills}}}), experience ({{{candidateProfile.experienceSummary}}}, {{{candidateProfile.pastProjects}}}), education ({{{candidateProfile.educationLevel}}}) vs. Job ({{{jobCriteria.title}}}, {{{jobCriteria.description}}}, {{{jobCriteria.requiredSkills}}}, {{{jobCriteria.requiredExperienceLevel}}}).
        *   **Growth Opportunity Evaluation:** Potential for learning and career development in this role/company.
        *   **Job Condition Fitting:** Candidate's salary expectations ({{{candidateProfile.salaryExpectationMin}}} - {{{candidateProfile.salaryExpectationMax}}}), location preferences ({{{candidateProfile.locationPreference}}}, {{{candidateProfile.location}}}), job type preferences ({{{candidateProfile.jobTypePreference}}}) vs. Job's conditions.
    *   **Output Requirements for Job Seeker's Perspective (within \`candidateJobFitAnalysis\`):**
        *   Provide raw scores (0-100) for these four categories in \`candidateJobFitAnalysis.weightedScoresForCandidate\`: \`cultureFitScore\`, \`jobRelevanceScore\`, \`growthOpportunityScore\`, \`jobConditionFitScore\`.
        *   The overall \`candidateJobFitAnalysis.matchScoreForCandidate\` will be calculated programmatically later.
        *   Provide a qualitative \`candidateJobFitAnalysis.reasoningForCandidate\` summarizing this job-to-candidate fit.

Candidate Profile:
ID: {{{candidateProfile.id}}}
Role: {{{candidateProfile.role}}}
Experience Summary: {{{candidateProfile.experienceSummary}}}
Skills: {{#if candidateProfile.skills}} {{#each candidateProfile.skills}} {{{this}}}{{#unless @last}}, {{/unless}}{{/each}} {{else}}Not specified{{/if}}
Location: {{{candidateProfile.location}}}
Desired Work Style: {{{candidateProfile.desiredWorkStyle}}}
Past Projects: {{{candidateProfile.pastProjects}}}
Work Experience Level: {{{candidateProfile.workExperienceLevel}}}
Education Level: {{{candidateProfile.educationLevel}}}
Location Preference: {{{candidateProfile.locationPreference}}}
Languages: {{#if candidateProfile.languages}} {{#each candidateProfile.languages}} {{{this}}}{{#unless @last}}, {{/unless}}{{/each}} {{else}}Not specified{{/if}}
Salary Expectation: {{{candidateProfile.salaryExpectationMin}}} - {{{candidateProfile.salaryExpectationMax}}}
Availability: {{{candidateProfile.availability}}}
Job Type Preference: {{#if candidateProfile.jobTypePreference}} {{#each candidateProfile.jobTypePreference}} {{{this}}}{{#unless @last}}, {{/unless}}{{/each}} {{else}}Not specified{{/if}}
{{#if candidateProfile.personalityAssessment}}
Personality Insights (for recruiter's context):
{{#each candidateProfile.personalityAssessment}}
- {{trait}}: {{fit}} ({{{reason}}})
{{/each}}
{{/if}}

Job Criteria:
Job Title: {{{jobCriteria.title}}}
Job Description: {{{jobCriteria.description}}}
Required Skills: {{#if jobCriteria.requiredSkills}} {{#each jobCriteria.requiredSkills}} {{{this}}}{{#unless @last}}, {{/unless}}{{/each}} {{else}}Not specified{{/if}}
Required Experience Level: {{{jobCriteria.requiredExperienceLevel}}}
Required Education Level: {{{jobCriteria.requiredEducationLevel}}}
Work Location Type: {{{jobCriteria.workLocationType}}}
Job Location: {{{jobCriteria.jobLocation}}}
Required Languages: {{#if jobCriteria.requiredLanguages}} {{#each jobCriteria.requiredLanguages}} {{{this}}}{{#unless @last}}, {{/unless}}{{/each}} {{else}}Not specified{{/if}}
Salary Range: {{{jobCriteria.salaryMin}}} - {{{jobCriteria.salaryMax}}}
Job Type: {{{jobCriteria.jobType}}}
Company Culture Keywords: {{#if jobCriteria.companyCultureKeywords}} {{#each jobCriteria.companyCultureKeywords}} {{{this}}}{{#unless @last}}, {{/unless}}{{/each}} {{else}}Not specified{{/if}}
Company Industry: {{{jobCriteria.companyIndustry}}}

Return the candidateId ("{{{candidateProfile.id}}}") along with all assessments.
Ensure all fields in the ProfileRecommenderOutputSchema are populated as described, except for the final matchScore and candidateJobFitAnalysis.matchScoreForCandidate which are calculated later.
Focus on providing accurate individual category scores and comprehensive reasoning.
`,
});

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

const isValidWeights = (weights: any, perspective: 'recruiter' | 'jobSeeker'): boolean => {
  if (!weights) return false;
  const sum = Object.values(weights).reduce((acc: number, weight: any) => acc + (Number(weight) || 0), 0);
  const numFields = perspective === 'recruiter' ? 4 : 4; // Could make this more dynamic if needed
  return Object.keys(weights).length === numFields && Math.abs(sum - 100) < 0.01;
};


const profileRecommenderFlow = ai.defineFlow(
  {
    name: 'profileRecommenderFlow',
    inputSchema: ProfileRecommenderInputSchema,
    outputSchema: ProfileRecommenderOutputSchema,
  },
  async (input: ProfileRecommenderInput): Promise<ProfileRecommenderOutput> => {
    // API Key Check within the flow
    const apiKeyFlowCheck = process.env.GOOGLE_API_KEY;
    if (!apiKeyFlowCheck) {
      console.error(
        "CRITICAL ERROR (from profileRecommenderFlow): GOOGLE_API_KEY environment variable is NOT SET or is EMPTY when flow is executed. Genkit Google AI plugin will FAIL."
      );
    } else {
      console.log(
        "SUCCESS (from profileRecommenderFlow): GOOGLE_API_KEY found. Key ending in: ..." + apiKeyFlowCheck.slice(-4)
      );
    }

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

    const { output: llmOutputPartial } = await profileRecommenderPrompt({
        candidateProfile: candidateProfileWithDefaults,
        jobCriteria: input.jobCriteria
    });

    if (!llmOutputPartial || !llmOutputPartial.weightedScores || !llmOutputPartial.candidateJobFitAnalysis?.weightedScoresForCandidate) {
      console.error("AI analysis failed to return complete structured output for profileRecommenderFlow. Input:", JSON.stringify(input).substring(0,500) + "...");
      console.error("LLM Output Partial:", JSON.stringify(llmOutputPartial).substring(0,500) + "...");
      return {
        candidateId: input.candidateProfile.id || 'unknown-candidate',
        matchScore: 0,
        reasoning: "AI analysis failed to generate a complete structured response. Please review manually.",
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
    }

    // Determine effective weights
    const effectiveRecruiterWeights = (input.userAIWeights?.recruiterPerspective && isValidWeights(input.userAIWeights.recruiterPerspective, 'recruiter'))
      ? input.userAIWeights.recruiterPerspective
      : defaultRecruiterWeights;

    const effectiveJobSeekerWeights = (input.userAIWeights?.jobSeekerPerspective && isValidWeights(input.userAIWeights.jobSeekerPerspective, 'jobSeeker'))
      ? input.userAIWeights.jobSeekerPerspective
      : defaultJobSeekerWeights;

    // Calculate final matchScore for recruiter perspective
    const recruiterMatchScore =
      (llmOutputPartial.weightedScores.skillsMatchScore * (effectiveRecruiterWeights.skillsMatchScore / 100)) +
      (llmOutputPartial.weightedScores.experienceRelevanceScore * (effectiveRecruiterWeights.experienceRelevanceScore / 100)) +
      (llmOutputPartial.weightedScores.cultureFitScore * (effectiveRecruiterWeights.cultureFitScore / 100)) +
      (llmOutputPartial.weightedScores.growthPotentialScore * (effectiveRecruiterWeights.growthPotentialScore / 100));

    // Calculate final matchScoreForCandidate for job seeker perspective
    let jobSeekerMatchScore = 0;
    if (llmOutputPartial.candidateJobFitAnalysis) {
        const seekerScores = llmOutputPartial.candidateJobFitAnalysis.weightedScoresForCandidate;
        jobSeekerMatchScore =
            (seekerScores.cultureFitScore * (effectiveJobSeekerWeights.cultureFitScore / 100)) +
            (seekerScores.jobRelevanceScore * (effectiveJobSeekerWeights.jobRelevanceScore / 100)) +
            (seekerScores.growthOpportunityScore * (effectiveJobSeekerWeights.growthOpportunityScore / 100)) +
            (seekerScores.jobConditionFitScore * (effectiveJobSeekerWeights.jobConditionFitScore / 100));
    }


    return {
      ...llmOutputPartial,
      candidateId: input.candidateProfile.id || 'unknown-candidate',
      matchScore: Math.round(recruiterMatchScore), // Round to nearest integer
      candidateJobFitAnalysis: llmOutputPartial.candidateJobFitAnalysis
        ? {
            ...llmOutputPartial.candidateJobFitAnalysis,
            matchScoreForCandidate: Math.round(jobSeekerMatchScore), // Round to nearest integer
          }
        : { // Fallback if somehow candidateJobFitAnalysis was missing from LLM
            matchScoreForCandidate: 0,
            reasoningForCandidate: "AI analysis did not provide job-to-candidate fit details.",
            weightedScoresForCandidate: { cultureFitScore: 0, jobRelevanceScore: 0, growthOpportunityScore: 0, jobConditionFitScore: 0 }
          }
    };
  }
);
