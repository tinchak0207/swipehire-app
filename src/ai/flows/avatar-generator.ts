
// src/ai/flows/avatar-generator.ts

'use server';

/**
 * @fileOverview AI-powered avatar generator for video resumes.
 *
 * - generateAvatar - A function that generates a virtual avatar based on detailed user specifications.
 * - AvatarGeneratorInput - The input type for the generateAvatar function.
 * - AvatarGeneratorOutput - The return type for the generateAvatar function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenderEnum = z.enum(["male", "female", "non-binary", "unspecified"]).describe("The gender of the avatar.");
const AgeRangeEnum = z.enum(["young_adult", "adult", "middle_aged", "unspecified"]).describe("The approximate age range of the avatar (e.g., young_adult for 20s, adult for 30s-40s).");
const ProfessionalImageStyleEnum = z.enum(["business_formal", "casual_business", "creative_trend", "tech_geek", "general_professional"]).describe("The overall professional image and clothing style.");
const AnimationExpressionEnum = z.enum(["neutral", "friendly_smile", "thoughtful_gaze", "confident_look", "subtle_gesture"]).describe("The avatar's facial expression or subtle pose/animation.");
const BackgroundEnvironmentEnum = z.enum(["office", "cafe", "modern_workspace", "home_office", "neutral_studio", "abstract_gradient", "outdoor_urban", "outdoor_nature"]).describe("The background environment for the avatar.");

const AvatarGeneratorInputSchema = z.object({
  gender: GenderEnum.optional(),
  ageRange: AgeRangeEnum.optional(),
  professionalImageStyle: ProfessionalImageStyleEnum.optional(),
  animationExpression: AnimationExpressionEnum.optional(),
  backgroundEnvironment: BackgroundEnvironmentEnum.optional(),
  appearanceDetails: z
    .string()
    .min(10, "Please provide some appearance details (e.g., hairstyle, skin color, specific clothing items).")
    .max(300, "Appearance details should not exceed 300 characters.")
    .describe(
      'Specific details about the desired avatar\'s appearance like hairstyle (e.g., "short black hair"), skin color (e.g., "fair skin"), and specific clothing items or accessories not covered by the professional style (e.g., "wearing glasses, blue tie").'
    ),
  jobTypeHint: z
    .string()
    .optional()
    .describe(
      'Optional: A job type (e.g., "Software Engineer", "Artist", "CEO") to help the AI tailor the avatar\'s style.'
    ),
});
export type AvatarGeneratorInput = z.infer<typeof AvatarGeneratorInputSchema>;

const AvatarGeneratorOutputSchema = z.object({
  avatarDataUri: z
    .string()
    .describe(
      'The data URI of the generated avatar image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type AvatarGeneratorOutput = z.infer<typeof AvatarGeneratorOutputSchema>;

export async function generateAvatar(input: AvatarGeneratorInput): Promise<AvatarGeneratorOutput> {
  return avatarGeneratorFlow(input);
}

const avatarGeneratorFlow = ai.defineFlow(
  {
    name: 'avatarGeneratorFlow',
    inputSchema: AvatarGeneratorInputSchema,
    outputSchema: AvatarGeneratorOutputSchema,
  },
  async (input: AvatarGeneratorInput) => {
    let constructedPrompt = "Generate a photorealistic, professional virtual avatar suitable for a resume or online profile. ";

    if (input.gender && input.gender !== "unspecified") {
      constructedPrompt += `The avatar should appear ${input.gender}. `;
    }
    if (input.ageRange && input.ageRange !== "unspecified") {
      const ageMapping = {
        young_adult: "in their 20s (young adult)",
        adult: "in their 30s or 40s (adult)",
        middle_aged: "in their 50s or older (middle-aged)",
      };
      constructedPrompt += `The avatar's age should be approximately ${ageMapping[input.ageRange as keyof typeof ageMapping] || input.ageRange}. `;
    }
    if (input.professionalImageStyle) {
      constructedPrompt += `Their clothing and overall style should be '${input.professionalImageStyle.replace(/_/g, ' ')}'. `;
    }
    if (input.animationExpression) {
      constructedPrompt += `Their expression or pose should convey a '${input.animationExpression.replace(/_/g, ' ')}' demeanor. `;
    }
    if (input.backgroundEnvironment) {
      constructedPrompt += `The background should be a '${input.backgroundEnvironment.replace(/_/g, ' ')}' setting. `;
    }
    
    constructedPrompt += `Specific appearance details: "${input.appearanceDetails}". `;

    if (input.jobTypeHint) {
      constructedPrompt += `The avatar's overall look should be appropriate for a '${input.jobTypeHint}' role. `;
    }
    
    constructedPrompt += "The image should be high-resolution, well-lit, with the subject clearly visible and centered. Avoid overly stylized or cartoonish looks unless explicitly requested by the 'creative_trend' style. Focus on a realistic human representation."

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', // Ensure this is the correct model for image generation
      prompt: [{text: constructedPrompt}],
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // Requesting an image response
        safetySettings: [
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }, // Changed from BLOCK_LOW_AND_ABOVE
        ],
      },
    });

    if (!media || !media.url) {
        throw new Error("AI did not return an image. Please try adjusting your description.");
    }

    return {avatarDataUri: media.url};
  }
);

