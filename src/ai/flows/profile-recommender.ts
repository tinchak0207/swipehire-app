
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
import type { Candidate, CompanyJobOpening, PersonalityTraitAssessment } from '@/lib/types';
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
  personalityAssessment: z.array(z.object({ // Include this for context if available
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


const ProfileRecommenderInputSchema = z.object({
  candidateProfile: CandidateProfileSchema,
  jobCriteria: JobCriteriaSchema,
});
export type ProfileRecommenderInput = z.infer<typeof ProfileRecommenderInputSchema>;

const PersonalityTraitAssessmentSchema = z.object({
  trait: z.string().describe("The personality trait identified, e.g., Social, Creative, Independent."),
  fit: z.enum(['positive', 'neutral', 'negative']).describe("Assessment of the trait's fit for the role/company: 'positive', 'neutral', or 'negative'."),
  reason: z.string().optional().describe("A brief explanation for the fit assessment.")
});

const CandidateJobFitAnalysisSchema = z.object({
  matchScoreForCandidate: z.number().min(0).max(100).describe("A score from 0 to 100 indicating how well the job opportunity fits the candidate's profile and preferences."),
  reasoningForCandidate: z.string().describe("A brief explanation of the job-to-candidate fit score, highlighting key alignment factors and potential mismatches from the candidate's perspective."),
  weightedScoresForCandidate: z.object({
    cultureFitScore: z.number().min(0).max(100),
    jobRelevanceScore: z.number().min(0).max(100),
    growthOpportunityScore: z.number().min(0).max(100),
    jobConditionFitScore: z.number().min(0).max(100),
  }).describe("Breakdown of scores for the job-to-candidate fit assessment based on the specified weights."),
}).describe("Analysis of how well the job fits the candidate.");

const ProfileRecommenderOutputSchema = z.object({
  candidateId: z.string(),
  matchScore: z.number().min(0).max(100).describe("A score from 0 to 100 indicating how well the candidate matches the job criteria (Recruiter's Perspective)."),
  reasoning: z.string().describe("A brief explanation of the match score from the recruiter's perspective, highlighting key matching factors and potential gaps."),
  weightedScores: z.object({
    skillsMatchScore: z.number().min(0).max(100),
    experienceRelevanceScore: z.number().min(0).max(100),
    cultureFitScore: z.number().min(0).max(100), // This is recruiter's view of candidate to company culture
    growthPotentialScore: z.number().min(0).max(100),
  }).describe("Breakdown of scores for each weighted category (Recruiter's Perspective)."),
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
  input: {schema: ProfileRecommenderInputSchema},
  output: {schema: ProfileRecommenderOutputSchema},
  prompt: `You are an AI HR expert. Your task is twofold:
1.  **Recruiter's Perspective**: Evaluate the provided Candidate Profile against the Job Criteria. Provide a \`matchScore\`, \`reasoning\`, \`weightedScores\` (Skills: 40%, Experience: 30%, Culture Fit: 20%, Growth Potential: 10%), an "underestimated talent" assessment, a personality fit assessment (for coworker fit), and optimal work style suggestions for the candidate in the context of the role.
2.  **Job Seeker's Perspective**: Separately, assess how well this Job Opportunity fits the Candidate's profile and preferences. Provide this analysis in the \`candidateJobFitAnalysis\` field, including a \`matchScoreForCandidate\`, \`reasoningForCandidate\`, and \`weightedScoresForCandidate\` based on the following criteria:
    *   Culture Fit Matching (35%): Candidate's desired work style ({{{candidateProfile.desiredWorkStyle}}}), personality insights ({{{candidateProfile.personalityAssessment}}}) vs. Company culture keywords ({{{jobCriteria.companyCultureKeywords}}}), company industry ({{{jobCriteria.companyIndustry}}}), job's work location type ({{{jobCriteria.workLocationType}}}).
    *   Job Relevance (30%): Candidate's skills ({{{candidateProfile.skills}}}), experience summary ({{{candidateProfile.experienceSummary}}}), past projects ({{{candidateProfile.pastProjects}}}), education level ({{{candidateProfile.educationLevel}}}) vs. Job title ({{{jobCriteria.title}}}), description ({{{jobCriteria.description}}}), required skills ({{{jobCriteria.requiredSkills}}}), required experience level ({{{jobCriteria.requiredExperienceLevel}}}).
    *   Growth Opportunity Evaluation (20%): Potential for learning and career development in this role and company, inferred from job description ({{{jobCriteria.description}}}) and company industry ({{{jobCriteria.companyIndustry}}}).
    *   Job Condition Fitting (15%): Candidate's salary expectations ({{{candidateProfile.salaryExpectationMin}}} - {{{candidateProfile.salaryExpectationMax}}}), location preferences ({{{candidateProfile.locationPreference}}}, {{{candidateProfile.location}}}), job type preferences ({{{candidateProfile.jobTypePreference}}}) vs. Job's salary range ({{{jobCriteria.salaryMin}}} - {{{jobCriteria.salaryMax}}}), job location ({{{jobCriteria.jobLocation}}}, {{{jobCriteria.workLocationType}}}), and job type ({{{jobCriteria.jobType}}}).

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

**Part 1: Recruiter's Perspective Assessment (Candidate to Job)**
Evaluation Criteria and Weights for \`weightedScores\`:
1.  **Skills Match (40%):** How well do the candidate's skills ({{{candidateProfile.skills}}}) match the required skills ({{{jobCriteria.requiredSkills}}})? Consider direct and related skills.
2.  **Experience Relevance (30%):** Assess relevance of candidate's past experience ({{{candidateProfile.experienceSummary}}}, {{{candidateProfile.pastProjects}}}), and work experience level ({{{candidateProfile.workExperienceLevel}}}) against job's requirements ({{{jobCriteria.description}}}, {{{jobCriteria.requiredExperienceLevel}}}).
3.  **Culture Fit (20%):** Based on candidate's desired work style ({{{candidateProfile.desiredWorkStyle}}}), and implicit cues, how well might they fit the company culture ({{{jobCriteria.companyCultureKeywords}}}) and industry ({{{jobCriteria.companyIndustry}}})?
4.  **Growth Potential (10%):** Based on inferred learning ability (skill diversity, project variety, education {{{candidateProfile.educationLevel}}}), how likely are they to grow?

Provide scores (0-100) for these four categories in \`weightedScores\`.
Calculate overall \`matchScore\` using these weights.
\`reasoning\` should summarize the overall score.

**Underestimated Talent Assessment:**
Assess if this candidate is an "underestimated talent". Consider:
-   Skill Potential vs. Formal Experience.
-   Cross-Domain Capabilities.
-   Learning Agility & Drive.
Set \`isUnderestimatedTalent\` and \`underestimatedReasoning\` accordingly.

**Personality Fit & Work Style Assessment (for Recruiter's View of Coworker Fit):**
Based on candidate's profile and company culture keywords:
-   **Personality Assessment (\`personalityAssessment\` output):** Identify 2-3 key personality traits. For each: \`trait\`, \`fit\` ('positive', 'neutral', 'negative'), \`reason\`.
-   **Optimal Work Styles (\`optimalWorkStyles\` output):** List 2-4 work style characteristics where candidate would thrive.

**Part 2: Job Seeker's Perspective Assessment (Job to Candidate)**
Evaluate the Job Opportunity for the Candidate using these criteria and weights for \`candidateJobFitAnalysis.weightedScoresForCandidate\`:
1.  **Culture Fit Matching (35%):** How well does the company culture ({{{jobCriteria.companyCultureKeywords}}}, {{{jobCriteria.companyIndustry}}}), and job's work style ({{{jobCriteria.workLocationType}}}) align with the candidate's stated preferences ({{{candidateProfile.desiredWorkStyle}}}, {{{candidateProfile.locationPreference}}}) and inferred personality (from {{{candidateProfile.personalityAssessment}}})?
2.  **Job Relevance (30%):** How well do the job's requirements ({{{jobCriteria.title}}}, {{{jobCriteria.description}}}, {{{jobCriteria.requiredSkills}}}, {{{jobCriteria.requiredExperienceLevel}}}) align with the candidate's skills ({{{candidateProfile.skills}}}), experience ({{{candidateProfile.experienceSummary}}}, {{{candidateProfile.pastProjects}}}), and career aspirations (inferred from {{{candidateProfile.role}}}, {{{candidateProfile.educationLevel}}})?
3.  **Growth Opportunity Evaluation (20%):** Assess the potential for the candidate to learn and grow in this role and company, based on the job description, company industry, and nature of tasks.
4.  **Job Condition Fitting (15%):** How well do the job's practical conditions – salary ({{{jobCriteria.salaryMin}}} - {{{jobCriteria.salaryMax}}}), location ({{{jobCriteria.jobLocation}}}, {{{jobCriteria.workLocationType}}}), and type ({{{jobCriteria.jobType}}}) – match the candidate's expectations and preferences ({{{candidateProfile.salaryExpectationMin}}} - {{{candidateProfile.salaryExpectationMax}}}, {{{candidateProfile.locationPreference}}}, {{{candidateProfile.location}}}, {{{candidateProfile.jobTypePreference}}})?

Provide scores (0-100) for these four categories in \`candidateJobFitAnalysis.weightedScoresForCandidate\`.
Calculate overall \`candidateJobFitAnalysis.matchScoreForCandidate\` using these weights.
\`candidateJobFitAnalysis.reasoningForCandidate\` should summarize this job-to-candidate fit.

Return the candidateId ("{{{candidateProfile.id}}}") along with all assessments.
`,
});

const profileRecommenderFlow = ai.defineFlow(
  {
    name: 'profileRecommenderFlow',
    inputSchema: ProfileRecommenderInputSchema,
    outputSchema: ProfileRecommenderOutputSchema,
  },
  async (input) => {
    // Fallback for candidateProfile if it's sparse (e.g., from a job seeker's initial localStorage profile)
    const candidateProfileWithDefaults = {
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
      salaryExpectationMin: input.candidateProfile.salaryExpectationMin, // Keep as undefined if not set
      salaryExpectationMax: input.candidateProfile.salaryExpectationMax, // Keep as undefined if not set
      availability: input.candidateProfile.availability || Availability.UNSPECIFIED,
      jobTypePreference: input.candidateProfile.jobTypePreference || [],
      personalityAssessment: input.candidateProfile.personalityAssessment || [],
    };

    const {output} = await profileRecommenderPrompt({
        candidateProfile: candidateProfileWithDefaults,
        jobCriteria: input.jobCriteria
    });

    if (!output) {
      // Fallback if AI fails to generate structured output
      return {
        candidateId: input.candidateProfile.id || 'unknown-candidate',
        matchScore: 0,
        reasoning: "AI analysis failed to generate a structured response. Please review manually.",
        weightedScores: {
          skillsMatchScore: 0,
          experienceRelevanceScore: 0,
          cultureFitScore: 0,
          growthPotentialScore: 0,
        },
        isUnderestimatedTalent: false,
        underestimatedReasoning: "AI analysis failed.",
        personalityAssessment: [],
        optimalWorkStyles: [],
        candidateJobFitAnalysis: {
            matchScoreForCandidate: 0,
            reasoningForCandidate: "AI analysis failed.",
            weightedScoresForCandidate: {
                cultureFitScore: 0,
                jobRelevanceScore: 0,
                growthOpportunityScore: 0,
                jobConditionFitScore: 0,
            }
        }
      };
    }
    // Ensure candidateId is correctly passed through.
    // Also ensure candidateJobFitAnalysis has a fallback if AI doesn't provide it fully structured (though schema should enforce it)
    return {
        ...output,
        candidateId: input.candidateProfile.id || 'unknown-candidate',
        candidateJobFitAnalysis: output.candidateJobFitAnalysis || {
            matchScoreForCandidate: 0,
            reasoningForCandidate: "AI analysis did not provide job-to-candidate fit details.",
            weightedScoresForCandidate: {
                cultureFitScore: 0,
                jobRelevanceScore: 0,
                growthOpportunityScore: 0,
                jobConditionFitScore: 0,
            }
        }
    };
  }
);

