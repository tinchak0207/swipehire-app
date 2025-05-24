
'use server';
/**
 * @fileOverview An AI agent that recommends and scores candidate profiles against job criteria.
 *
 * - recommendProfiles - A function that analyzes candidate profiles against job requirements and provides a match score and reasoning.
 * - ProfileRecommenderInput - The input type for the recommendProfiles function.
 * - ProfileRecommenderOutput - The return type for the recommendProfiles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Candidate, CompanyJobOpening } from '@/lib/types';
import { WorkExperienceLevel, EducationLevel, LocationPreference, Availability, JobType } from '@/lib/types';

// Define Zod enums matching those in types.ts for validation within the flow
const ZodWorkExperienceLevel = z.nativeEnum(WorkExperienceLevel);
const ZodEducationLevel = z.nativeEnum(EducationLevel);
const ZodLocationPreference = z.nativeEnum(LocationPreference);
const ZodAvailability = z.nativeEnum(Availability);
const ZodJobType = z.nativeEnum(JobType);


const CandidateProfileSchema = z.object({
  id: z.string(),
  role: z.string().describe("Candidate's stated role or desired position."),
  experienceSummary: z.string().describe("Summary of the candidate's work experience."),
  skills: z.array(z.string()).describe("List of candidate's skills."),
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

const ProfileRecommenderOutputSchema = z.object({
  candidateId: z.string(),
  matchScore: z.number().min(0).max(100).describe("A score from 0 to 100 indicating how well the candidate matches the job criteria."),
  reasoning: z.string().describe("A brief explanation of the match score, highlighting key matching factors and potential gaps."),
  weightedScores: z.object({
    skillsMatchScore: z.number().min(0).max(100),
    experienceRelevanceScore: z.number().min(0).max(100),
    cultureFitScore: z.number().min(0).max(100),
    growthPotentialScore: z.number().min(0).max(100),
  }).describe("Breakdown of scores for each weighted category."),
  isUnderestimatedTalent: z.boolean().describe("Indicates if this candidate might be an underestimated talent or hidden gem based on their profile relative to the job criteria."),
  underestimatedReasoning: z.string().optional().describe("Brief reasoning if the candidate is considered underestimated (e.g., strong transferable skills, high growth potential despite lacking specific years of experience for the role, unique project experience that shows adaptability)."),
});
export type ProfileRecommenderOutput = z.infer<typeof ProfileRecommenderOutputSchema>;


export async function recommendProfile(input: ProfileRecommenderInput): Promise<ProfileRecommenderOutput> {
  return profileRecommenderFlow(input);
}

const profileRecommenderPrompt = ai.definePrompt({
  name: 'profileRecommenderPrompt',
  input: {schema: ProfileRecommenderInputSchema},
  output: {schema: ProfileRecommenderOutputSchema},
  prompt: `You are an AI HR expert specializing in evaluating candidate profiles against job requirements and company culture.
Your task is to assess the provided Candidate Profile based on the Job Criteria and return a match score, a reasoning statement, weighted scores, and an assessment of whether the candidate is an "underestimated talent".

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

Evaluation Criteria and Weights:
1.  **Skills Match (40%):** How well do the candidate's skills ({{{candidateProfile.skills}}}) match the required skills ({{{jobCriteria.requiredSkills}}}) for the position? Consider direct matches and related skills.
2.  **Experience Relevance (30%):** Assess the relevance of the candidate's past experience (summarized in {{{candidateProfile.experienceSummary}}} and {{{candidateProfile.pastProjects}}}), and their overall work experience level ({{{candidateProfile.workExperienceLevel}}}) against the job's requirements ({{{jobCriteria.description}}}, {{{jobCriteria.requiredExperienceLevel}}}).
3.  **Culture Fit (20%):** Based on the candidate's desired work style ({{{candidateProfile.desiredWorkStyle}}}), and any implicit cues from their experience, how well might they fit with the company culture (described by {{{jobCriteria.companyCultureKeywords}}}) and industry ({{{jobCriteria.companyIndustry}}})? Also consider location preferences ({{{candidateProfile.locationPreference}}} vs {{{jobCriteria.workLocationType}}}, {{{candidateProfile.location}}} vs {{{jobCriteria.jobLocation}}}) and job type alignment ({{{candidateProfile.jobTypePreference}}} vs {{{jobCriteria.jobType}}}).
4.  **Growth Potential (10%):** Based on the candidate's learning ability (inferred from skill diversity, project variety, education level {{{candidateProfile.educationLevel}}}), how likely are they to grow and develop in this role and company? Consider also their salary expectations ({{{candidateProfile.salaryExpectationMin}}} - {{{candidateProfile.salaryExpectationMax}}} vs {{{jobCriteria.salaryMin}}} - {{{jobCriteria.salaryMax}}}) and availability ({{{candidateProfile.availability}}}).

Provide a score from 0 to 100 for each of these four categories.
Then, calculate the overall \`matchScore\` using the specified weights.
The \`reasoning\` should be a concise summary explaining the overall score, highlighting strong matches and any notable concerns or gaps.

**Underestimated Talent Assessment:**
After the primary scoring, specifically assess if this candidate might be an "underestimated talent" or a "hidden gem".
Consider these factors:
-   **Skill Potential vs. Formal Experience:** Does the candidate demonstrate strong skills ({{{candidateProfile.skills}}}) or impressive outcomes in {{{candidateProfile.pastProjects}}} that suggest high potential, even if their formal work experience level ({{{candidateProfile.workExperienceLevel}}}) is slightly below the job's required level ({{{jobCriteria.requiredExperienceLevel}}})?
-   **Cross-Domain Capabilities:** Do their {{{candidateProfile.skills}}} or {{{candidateProfile.pastProjects}}} suggest valuable experience in an adjacent domain that, while not a direct match, could bring innovative perspectives to the role?
-   **Learning Agility & Drive:** Can you infer strong learning ability, adaptability, or a proactive attitude from their {{{candidateProfile.experienceSummary}}} or {{{candidateProfile.desiredWorkStyle}}}?
-   **Alignment with Growth Potential:** Does the Growth Potential score further support this?

If you identify such potential, set \`isUnderestimatedTalent\` to true and provide a brief \`underestimatedReasoning\` explaining why (e.g., "Strong transferable skills in X make them a high-potential candidate despite lacking Y years in the specific role," or "Unique project Z demonstrates adaptability and quick learning relevant to this position."). Otherwise, set \`isUnderestimatedTalent\` to false.

Return the candidateId ("{{{candidateProfile.id}}}") along with all scores, reasoning, and the underestimated talent assessment.
`,
});

const profileRecommenderFlow = ai.defineFlow(
  {
    name: 'profileRecommenderFlow',
    inputSchema: ProfileRecommenderInputSchema,
    outputSchema: ProfileRecommenderOutputSchema,
  },
  async (input) => {
    const {output} = await profileRecommenderPrompt(input);

    if (!output) {
      // Fallback if AI fails to generate structured output
      return {
        candidateId: input.candidateProfile.id,
        matchScore: 0,
        reasoning: "AI analysis failed to generate a structured response. Please review manually.",
        weightedScores: {
          skillsMatchScore: 0,
          experienceRelevanceScore: 0,
          cultureFitScore: 0,
          growthPotentialScore: 0,
        },
        isUnderestimatedTalent: false,
        underestimatedReasoning: "AI analysis failed."
      };
    }
    // Ensure candidateId is correctly passed through.
    return { ...output, candidateId: input.candidateProfile.id };
  }
);

