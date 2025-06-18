'use server';
/**
 * @fileOverview An AI agent that provides career planning advice.
 *
 * - careerPlannerFlow - A function that generates personalized career plans.
 * - CareerPlannerInput - The input type for the careerPlannerFlow.
 * - CareerPlannerOutput - The return type for the careerPlannerFlow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type {
  WorkExperienceLevel,
  EducationLevel,
  LocationPreference,
  Availability,
  JobType,
  AICareerPlan // Assuming AICareerPlan is already defined in types.ts based on previous step
} from '@/lib/types';
import {
  WorkExperienceLevel as ZodWorkExperienceLevelEnum,
  EducationLevel as ZodEducationLevelEnum,
  LocationPreference as ZodLocationPreferenceEnum,
  Availability as ZodAvailabilityEnum,
  JobType as ZodJobTypeEnum,
} from '@/lib/types'; // Assuming these enums are exported from types.ts

// Define Zod enums matching those in types.ts for validation
const ZodWorkExperienceLevel = z.nativeEnum(ZodWorkExperienceLevelEnum);
const ZodEducationLevel = z.nativeEnum(ZodEducationLevelEnum);
const ZodLocationPreference = z.nativeEnum(ZodLocationPreferenceEnum);
const ZodAvailability = z.nativeEnum(ZodAvailabilityEnum);
const ZodJobType = z.nativeEnum(ZodJobTypeEnum);

// Input schema for the career planner
export const CareerPlannerInputSchema = z.object({
  userId: z.string().describe("User's unique identifier."),
  // Existing profile data
  currentRole: z.string().optional().describe("User's current or most recent job title."),
  profileSkills: z.array(z.string()).optional().describe("List of user's current skills."),
  profileExperienceSummary: z.string().optional().describe("Summary of user's work experience."),
  profileWorkExperienceLevel: ZodWorkExperienceLevel.optional().describe("User's level of work experience."),
  profileEducationLevel: ZodEducationLevel.optional().describe("User's highest education level."),
  profileDesiredWorkStyle: z.string().optional().describe("User's preferred work style (e.g., remote, collaborative)."),
  profileJobTypePreference: z.array(ZodJobType).optional().describe("User's preferred job types."),
  profileSalaryExpectationMin: z.number().optional().describe("User's minimum salary expectation."),
  profileSalaryExpectationMax: z.number().optional().describe("User's maximum salary expectation."),
  // New career planning specific fields
  careerGoals: z.string().describe("User's long-term career goals and aspirations."),
  careerInterests: z.array(z.string()).optional().describe("User's specific career-related interests and passions."),
  careerValues: z.array(z.string()).optional().describe("User's important work-related values (e.g., work-life balance, innovation, stability).")
}).describe("Input data for the Career Planning AI Assistant.");
export type CareerPlannerInput = z.infer<typeof CareerPlannerInputSchema>;

// Output schema for the career planner - mirrors AICareerPlan from types.ts
export const CareerPlannerOutputSchema = z.object({
  suggestedPaths: z.array(
    z.object({
      pathName: z.string().describe("Name of the suggested career path."),
      description: z.string().describe("Brief description of this career path."),
      pros: z.array(z.string()).describe("Potential benefits or advantages of this path for the user."),
      cons: z.array(z.string()).describe("Potential challenges or disadvantages of this path for the user.")
    })
  ).describe("Up to 3 suggested career paths tailored to the user."),
  shortTermGoals: z.array(
    z.object({
      goal: z.string().describe("A specific, measurable, achievable, relevant, time-bound (SMART) goal for the next 3-12 months."),
      suggestedActions: z.array(z.string()).optional().describe("Specific actions the user can take to achieve this short-term goal.")
    })
  ).describe("SMART goals for the user to achieve in the short term (3-12 months)."),
  midTermGoals: z.array(
    z.object({
      goal: z.string().describe("A specific, measurable, achievable, relevant, time-bound (SMART) goal for the next 1-3 years."),
      suggestedActions: z.array(z.string()).optional().describe("Specific actions the user can take to achieve this mid-term goal.")
    })
  ).describe("SMART goals for the user to achieve in the mid term (1-3 years)."),
  actionableAdvice: z.string().optional().describe("General actionable advice on skill development, networking, or other career-enhancing activities."),
  resourceSuggestions: z.array(
    z.object({
      name: z.string().describe("Name of the suggested resource (e.g., course, website, book)."),
      url: z.string().url().optional().describe("URL of the suggested resource, if available."),
      description: z.string().optional().describe("Brief description of why this resource is relevant.")
    })
  ).optional().describe("Suggestions for courses, learning platforms, or other resources.")
}).describe("The AI-generated career plan, including paths, goals, advice, and resources.");
export type CareerPlannerOutput = z.infer<typeof CareerPlannerOutputSchema>;


// Define the Genkit prompt
const careerPlannerPrompt = ai.definePrompt({
  name: 'careerPlannerPrompt',
  input: { schema: CareerPlannerInputSchema },
  output: { schema: CareerPlannerOutputSchema },
  prompt: `You are a Career Planning AI Assistant. Your goal is to provide personalized, insightful, and actionable career guidance to job seekers.
Based on the following user profile and their stated career aspirations, generate a comprehensive career plan.
Use your knowledge of current market trends, popular career paths, and skill requirements to inform your suggestions.

User Profile:
- User ID: {{{userId}}}
{{#if currentRole}}- Current/Recent Role: {{{currentRole}}}{{/if}}
{{#if profileSkills}}- Skills: {{#each profileSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
{{#if profileExperienceSummary}}- Experience Summary: {{{profileExperienceSummary}}}{{/if}}
{{#if profileWorkExperienceLevel}}- Work Experience Level: {{{profileWorkExperienceLevel}}}{{/if}}
{{#if profileEducationLevel}}- Education Level: {{{profileEducationLevel}}}{{/if}}
{{#if profileDesiredWorkStyle}}- Desired Work Style: {{{profileDesiredWorkStyle}}}{{/if}}
{{#if profileJobTypePreference}}- Preferred Job Types: {{#each profileJobTypePreference}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
{{#if profileSalaryExpectationMin}}- Salary Expectation (Min): {{{profileSalaryExpectationMin}}}{{/if}}
{{#if profileSalaryExpectationMax}}- Salary Expectation (Max): {{{profileSalaryExpectationMax}}}{{/if}}

User's Career Aspirations:
- Long-term Career Goals: {{{careerGoals}}}
{{#if careerInterests}}- Career Interests/Passions: {{#each careerInterests}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
{{#if careerValues}}- Work Values: {{#each careerValues}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}

Instructions for AI:
1.  **Suggested Career Paths (suggestedPaths):**
    *   Identify 2-3 potential career paths that align with the user's profile, goals, interests, and values.
    *   For each path, provide:
        *   \`pathName\`: A clear name for the career path.
        *   \`description\`: A brief overview of what this path entails.
        *   \`pros\`: 2-3 potential benefits for the user.
        *   \`cons\`: 2-3 potential challenges for the user.
2.  **Short-Term Goals (shortTermGoals):**
    *   Define 3-5 SMART (Specific, Measurable, Achievable, Relevant, Time-bound) goals for the next 3-12 months.
    *   These goals should be stepping stones towards one or more of the suggested paths.
    *   For each goal, provide:
        *   \`goal\`: The goal itself.
        *   \`suggestedActions\` (optional): 1-3 concrete actions to achieve it.
3.  **Mid-Term Goals (midTermGoals):**
    *   Define 2-3 SMART goals for the next 1-3 years.
    *   These should build upon the short-term goals and further progress the user along their chosen path(s).
    *   For each goal, provide:
        *   \`goal\`: The goal itself.
        *   \`suggestedActions\` (optional): 1-3 concrete actions to achieve it.
4.  **Actionable Advice (actionableAdvice):**
    *   Provide general advice on skill development, networking strategies, resume tailoring, or other relevant career-enhancing activities. Tailor this advice to the user's overall profile and suggested paths.
5.  **Resource Suggestions (resourceSuggestions) (Optional but Recommended):**
    *   Suggest 1-3 relevant resources like online courses, industry reports, professional communities, or helpful websites.
    *   For each resource, provide:
        *   \`name\`: Name of the resource.
        *   \`url\` (optional): Link to the resource.
        *   \`description\` (optional): Why it's useful.

Ensure your response strictly adheres to the JSON output schema defined.
Focus on providing practical, encouraging, and personalized advice.
If the user's goals seem very ambitious given their current profile, gently guide them with realistic intermediate steps.
If information is missing, make reasonable inferences or state that more specific advice could be given with more details.
`,
});

// Define the Genkit flow
export const careerPlannerFlow = ai.defineFlow(
  {
    name: 'careerPlannerFlow',
    inputSchema: CareerPlannerInputSchema,
    outputSchema: CareerPlannerOutputSchema,
  },
  async (input: CareerPlannerInput): Promise<CareerPlannerOutput> => {
    // API Key Check (as seen in profile-recommender)
    const apiKeyFlowCheck = process.env.GOOGLE_API_KEY;
    if (!apiKeyFlowCheck) {
      console.error(
        "CRITICAL ERROR (from careerPlannerFlow): GOOGLE_API_KEY environment variable is NOT SET or is EMPTY. Genkit Google AI plugin will FAIL."
      );
      // Consider throwing an error or returning a specific error structure
      // For now, logging and attempting to proceed (though it will likely fail at the prompt call)
    } else {
      console.log(
        "INFO (from careerPlannerFlow): GOOGLE_API_KEY found. Key ending in: ..." + apiKeyFlowCheck.slice(-4)
      );
    }

    // You might want to add default values for optional fields in 'input' here if the prompt requires them
    // or if the AI behaves better with explicit "Not specified" values.
    // For example:
    const processedInput = {
      ...input,
      currentRole: input.currentRole || undefined, // Explicitly undefined if not provided
      profileSkills: input.profileSkills || [],
      profileExperienceSummary: input.profileExperienceSummary || undefined,
      profileDesiredWorkStyle: input.profileDesiredWorkStyle || undefined,
      profileJobTypePreference: input.profileJobTypePreference || [],
      careerInterests: input.careerInterests || [],
      careerValues: input.careerValues || [],
    };


    const { output } = await careerPlannerPrompt(processedInput);

    if (!output) {
      console.error("AI analysis failed to return structured output for careerPlannerFlow. Input:", JSON.stringify(processedInput).substring(0,500) + "...");
      // Return a default/error structure that matches CareerPlannerOutputSchema
      return {
        suggestedPaths: [],
        shortTermGoals: [{ goal: "Error: AI failed to generate a plan. Please try again later.", suggestedActions: [] }],
        midTermGoals: [],
        actionableAdvice: "Could not retrieve advice at this time.",
      };
    }

    // Potentially further process 'output' if needed, e.g., ensuring array lengths, etc.
    return output;
  }
);

// Example of how to potentially call this flow (for testing or from another server-side module)
/*
async function testCareerPlanner(userId: string) {
  try {
    const testInput: CareerPlannerInput = {
      userId: userId,
      currentRole: 'Software Engineer',
      profileSkills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
      profileExperienceSummary: '5 years of experience in web development, building scalable applications.',
      profileWorkExperienceLevel: ZodWorkExperienceLevelEnum.SENIOR,
      profileEducationLevel: ZodEducationLevelEnum.UNIVERSITY,
      profileDesiredWorkStyle: 'Remote, flexible hours, collaborative team',
      profileJobTypePreference: [ZodJobTypeEnum.FULL_TIME],
      profileSalaryExpectationMin: 80000,
      profileSalaryExpectationMax: 120000,
      careerGoals: 'Become a Principal Engineer or Engineering Manager in the next 5 years. Interested in AI and Machine Learning applications.',
      careerInterests: ['Artificial Intelligence', 'Team Leadership', 'Product Development'],
      careerValues: ['Continuous Learning', 'Impact', 'Work-Life Balance']
    };
    console.log("Sending input to careerPlannerFlow:", JSON.stringify(testInput, null, 2));
    const plan = await careerPlannerFlow(testInput);
    console.log("Received plan from careerPlannerFlow:", JSON.stringify(plan, null, 2));
    return plan;
  } catch (error) {
    console.error("Error testing careerPlannerFlow:", error);
  }
}
// Example usage:
// testCareerPlanner("test-user-123");
*/
