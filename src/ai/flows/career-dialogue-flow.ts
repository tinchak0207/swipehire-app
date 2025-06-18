'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import mongoose from 'mongoose'; // Needed for User model if not already globally available
import User from '../../../swipehire-backend/User'; // Adjust path as necessary
import type { BackendUser, UserGoal, AICareerPlan, CareerStage as CareerStageEnum } from '@/lib/types';
import { CareerStage } from '@/lib/types'; // Import the enum itself for use with z.nativeEnum

// --- Zod Schemas ---
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  parts: z.array(z.object({ text: z.string() })),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const CareerDialogueInputSchema = z.object({
  userId: z.string(),
  userMessage: z.string().min(1, "Message cannot be empty."),
  chatHistory: z.array(ChatMessageSchema).optional().describe("Previous messages in the conversation for context.")
});
export type CareerDialogueInput = z.infer<typeof CareerDialogueInputSchema>;

export const CareerDialogueOutputSchema = z.object({
  aiResponse: z.string().describe("The AI's response to the user's message.")
});
export type CareerDialogueOutput = z.infer<typeof CareerDialogueOutputSchema>;

// --- Helper Function for Profile Context ---
function summarizeUserProfileForChat(user: BackendUser): string {
  let context = `Assessed Career Stage: ${user.assessedCareerStage || CareerStage.UNSPECIFIED_EXPLORING}.
`;
  context += `Skills: ${user.profileSkills || 'Not specified'}.
`;
  context += `Experience Level: ${user.profileWorkExperienceLevel || 'Not specified'}.
`;

  if (user.userGoals && user.userGoals.length > 0) {
    context += `Current Goals: ${user.userGoals.slice(0, 2).map(g => g.text).join('; ')}.
`;
  } else if (user.careerGoals) { // Fallback to general career goals if specific userGoals array is empty
     context += `Overall Career Goal: ${user.careerGoals}.
`;
  } else {
    context += "Current Goals: Not specified.
";
  }

  if (user.aiCareerPlan?.suggestedPaths && user.aiCareerPlan.suggestedPaths.length > 0) {
    context += `AI Suggested Paths: ${user.aiCareerPlan.suggestedPaths.slice(0, 2).map(p => p.pathName).join('; ')}.
`;
  }
  // Max length for context to avoid overly large prompts
  return context.trim().substring(0, 1500); // Approx 200-300 words, but capping by length
}

// --- Genkit Prompt Definition ---
const careerDialoguePrompt = ai.definePrompt({
  name: 'careerDialoguePrompt',
  input: {
    schema: z.object({
      userId: z.string(), // Though not directly in prompt, useful for logging/tracing potentially
      userMessage: z.string(),
      chatHistory: z.array(ChatMessageSchema).optional(),
      profileContext: z.string()
    })
  },
  output: { schema: CareerDialogueOutputSchema },
  prompt: `You are a Helpful Career Advisor AI. The user is seeking advice.
Use their profile information and career plan (summarized below) and the conversation history to provide personalized and actionable answers.
Keep your responses concise and focused on their questions. If a question is outside your scope as a career advisor, politely say so.
Do not generate overly long responses. Aim for 1-3 paragraphs unless specifically asked for more detail.

User Profile & Plan Context:
{{{profileContext}}}

Conversation History:
{{#if chatHistory}}
  {{#each chatHistory}}
    {{#if this.parts.[0].text}}
      {{this.role}}: {{{this.parts.[0].text}}}
    {{/if}}
  {{/each}}
{{else}}
  No previous messages in this conversation.
{{/if}}

User's Current Message:
user: {{{userMessage}}}

Your (AI Career Advisor) Response:
model:`, // Added 'model:' to guide the AI to start its response
});

// --- Genkit Flow Definition ---
export const careerDialogueFlow = ai.defineFlow(
  {
    name: 'careerDialogueFlow',
    inputSchema: CareerDialogueInputSchema,
    outputSchema: CareerDialogueOutputSchema,
  },
  async (input: CareerDialogueInput): Promise<CareerDialogueOutput> => {
    const { userId, userMessage, chatHistory } = input;

    // API Key Check
    const apiKeyFlowCheck = process.env.GOOGLE_API_KEY;
    if (!apiKeyFlowCheck) {
      console.error("[careerDialogueFlow] GOOGLE_API_KEY is not set.");
      throw new Error("Server configuration error: Missing API key.");
    }
     console.log("[careerDialogueFlow] GOOGLE_API_KEY found, proceeding.");

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.error(`[careerDialogueFlow] Invalid userId format: ${userId}`);
        throw new Error("Invalid user ID format.");
    }

    const user = await User.findById(userId).lean() as BackendUser | null; // Use .lean() for performance
    if (!user) {
      console.error(`[careerDialogueFlow] User not found for ID: ${userId}`);
      throw new Error(`User not found for ID: ${userId}`);
    }

    const profileContext = summarizeUserProfileForChat(user);

    console.log(`[careerDialogueFlow] Profile context for ${userId}: ${profileContext.substring(0,100)}...`);
    if (chatHistory && chatHistory.length > 0) {
        console.log(`[careerDialogueFlow] Chat history length: ${chatHistory.length}`);
        console.log(`[careerDialogueFlow] Last user message in history: ${chatHistory[chatHistory.length-1]?.parts[0]?.text?.substring(0,100)}...`);
    }


    try {
      const { output } = await careerDialoguePrompt({
        userId, // For potential logging/tracing inside prompt if ever needed
        userMessage,
        chatHistory: chatHistory || [],
        profileContext,
      });

      if (!output || !output.aiResponse) {
        console.error(`[careerDialogueFlow] AI did not return a valid response structure for user ${userId}. Output:`, output);
        return { aiResponse: "I'm sorry, I couldn't generate a response at this moment. Please try again." };
      }

      console.log(`[careerDialogueFlow] AI response for ${userId}: ${output.aiResponse.substring(0,100)}...`);
      return { aiResponse: output.aiResponse };

    } catch (error: any) {
        console.error(`[careerDialogueFlow] Error calling AI prompt for user ${userId}:`, error);
        // Check if the error is from Genkit or a lower-level API call
        if (error.response && error.response.data) {
            console.error("[careerDialogueFlow] AI API Error Details:", error.response.data);
        }
        throw new Error(`AI service failed to respond: ${error.message}`);
    }
  }
);

// Example Usage (for testing within this file if needed, ensure DB connection)
/*
async function testDialogue() {
  // This requires a valid MONGODB_URI in .env for the User model to connect
  // and a valid GOOGLE_API_KEY
  if (!process.env.MONGODB_URI) {
    process.env.MONGODB_URI = 'mongodb+srv://USERNAME:PASSWORD@yourcluster.mongodb.net/yourdb?retryWrites=true&w=majority'; // Replace with your actual dev URI
  }
  if (!mongoose.connection.readyState) {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for testDialogue");
  }

  const testUserId = "EXISTING_USER_ID_IN_DB"; // Replace with an actual user ID from your database

  try {
    const userExists = await User.findById(testUserId);
    if (!userExists) {
        console.error(`Test user ${testUserId} not found. Please use an existing user ID.`);
        return;
    }
    console.log(`Testing with user: ${userExists.name}`);


    const input: CareerDialogueInput = {
      userId: testUserId,
      userMessage: "What are some good skills to learn for a project manager role?",
      chatHistory: [
        { role: 'user', parts: [{ text: "Hi there!" }] },
        { role: 'model', parts: [{ text: "Hello! How can I help you with your career today?" }] }
      ]
    };
    const result = await careerDialogueFlow(input);
    console.log("AI Response:", result.aiResponse);
  } catch (e) {
    console.error("Test dialogue error:", e);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB for testDialogue");
  }
}

// To run test:
// Ensure .env has GOOGLE_API_KEY and MONGODB_URI (or set above)
// Bun: bun run src/ai/flows/career-dialogue-flow.ts (if file is executable or via a script)
// Node: node -r ts-node/register src/ai/flows/career-dialogue-flow.ts (if ts-node is installed)
// Make sure to call testDialogue() e.g. testDialogue();
*/
