
'use server';
/**
 * @fileOverview A simple AI flow to generate generic chat replies.
 *
 * - generateChatReply - A function that generates a short, generic reply.
 * - GenerateChatReplyInput - The input type for the generateChatReply function.
 * - GenerateChatReplyOutput - The return type for the generateChatReply function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateChatReplyInputSchema = z.object({
  userMessage: z.string().describe("The user's last message in the chat."),
  contactName: z.string().describe("The name of the person the user is chatting with."),
  userName: z.string().optional().describe("The name of the user initiating the chat. (Optional)"),
});
export type GenerateChatReplyInput = z.infer<typeof GenerateChatReplyInputSchema>;

const GenerateChatReplyOutputSchema = z.object({
  aiReply: z.string().describe('A short, generic, and friendly AI-generated reply.'),
});
export type GenerateChatReplyOutput = z.infer<typeof GenerateChatReplyOutputSchema>;

export async function generateChatReply(input: GenerateChatReplyInput): Promise<GenerateChatReplyOutput> {
  return genericChatReplyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'genericChatReplyPrompt',
  input: {schema: GenerateChatReplyInputSchema},
  output: {schema: GenerateChatReplyOutputSchema},
  prompt: `You are an AI assistant simulating a chat partner. The user, {{#if userName}}'{{userName}}'{{else}}someone{{/if}}, is chatting with '{{contactName}}'.
The user just said: "{{userMessage}}"

Provide a very short, generic, and friendly acknowledgment or a simple follow-up question as if you were '{{contactName}}'.
Keep the reply under 15 words. Do not ask for personal information.
Examples: 'Thanks for reaching out!', 'That's interesting, tell me more.', 'Got it! What's on your mind next?', 'Interesting point!', 'I see. Anything else?'
Reply:
`,
});

const genericChatReplyFlow = ai.defineFlow(
  {
    name: 'genericChatReplyFlow',
    inputSchema: GenerateChatReplyInputSchema,
    outputSchema: GenerateChatReplyOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
