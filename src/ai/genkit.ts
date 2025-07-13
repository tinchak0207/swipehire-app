import { Mistral } from '@mistralai/mistralai';
import type { z } from 'zod';

/**
 * Available Mistral AI models
 */
export type MistralModel =
  | 'mistral-tiny'
  | 'mistral-small'
  | 'mistral-medium'
  | 'mistral-large-latest'
  | 'open-mistral-7b'
  | 'open-mixtral-8x7b'
  | 'open-mixtral-8x22b';

/**
 * Chat message role types
 */
export type ChatRole = 'system' | 'user' | 'assistant';

/**
 * Chat message interface
 */
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

/**
 * AI generation parameters
 */
export interface AIGenerateParams {
  prompt: string;
  model?: MistralModel;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  messages?: ChatMessage[];
}

/**
 * AI generation response
 */
export interface AIGenerateResponse {
  text: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  media?: {
    url: string;
    mimeType: string;
    width?: number;
    height?: number;
  };
}

/**
 * AI streaming response
 */
export interface AIStreamResponse {
  stream: ReadableStream<string>;
  model: string;
}

/**
 * Error types for AI operations
 */
export class AIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AIError';
  }
}

/**
 * Initialize Mistral AI client
 */
function createMistralClient(): Mistral {
  const apiKey = process.env.MISTRAL_API_KEY || process.env.NEXT_PUBLIC_MISTRAL_API_KEY;

  if (!apiKey) {
    console.error('MISTRAL_API_KEY environment variable is required');
    throw new AIError('MISTRAL_API_KEY is not set', 'MISSING_API_KEY');
  }

  return new Mistral({ apiKey });
}

/**
 * Validate model name
 */
function validateModel(model: string): model is MistralModel {
  const validModels: MistralModel[] = [
    'mistral-tiny',
    'mistral-small',
    'mistral-medium',
    'mistral-large-latest',
    'open-mistral-7b',
    'open-mixtral-8x7b',
    'open-mixtral-8x22b',
  ];

  return validModels.includes(model as MistralModel);
}

/**
 * Build messages array for chat completion
 */
function buildMessages(
  params: AIGenerateParams
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

  // Add system prompt if provided
  if (params.systemPrompt) {
    messages.push({
      role: 'system',
      content: params.systemPrompt,
    });
  }

  // Add existing messages if provided
  if (params.messages && params.messages.length > 0) {
    messages.push(
      ...params.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))
    );
  }

  // Add user prompt
  messages.push({
    role: 'user',
    content: params.prompt,
  });

  return messages;
}

/**
 * Main AI interface for the application
 */
export const ai = {
  /**
   * Generate text using Mistral AI
   */
  generate: async (params: AIGenerateParams): Promise<AIGenerateResponse> => {
    try {
      const client = createMistralClient();
      const model = params.model || 'mistral-small';

      if (!validateModel(model)) {
        throw new AIError(`Invalid model: ${model}`, 'INVALID_MODEL');
      }

      const messages = buildMessages(params);

      const response = await client.chat.complete({
        model,
        messages,
        temperature: params.temperature ?? 0.7,
        maxTokens: params.maxTokens ?? 1000,
        topP: params.topP ?? 1.0,
      });

      if (!response.choices || response.choices.length === 0) {
        throw new AIError('No response generated', 'NO_RESPONSE');
      }

      const choice = response.choices?.[0];
      if (!choice?.message?.content) {
        throw new AIError('Empty response content', 'EMPTY_RESPONSE');
      }

      // Handle case where content might be ContentChunk[]
      const content =
        typeof choice.message.content === 'string'
          ? choice.message.content
          : choice.message.content.join('');

      const result: AIGenerateResponse = {
        text: content,
        model,
      };

      if (response.usage) {
        result.usage = {
          promptTokens: response.usage.promptTokens || 0,
          completionTokens: response.usage.completionTokens || 0,
          totalTokens: response.usage.totalTokens || 0,
        };
      }

      return result;
    } catch (error) {
      if (error instanceof AIError) {
        throw error;
      }

      // Handle Mistral API errors
      if (error && typeof error === 'object' && 'status' in error) {
        const statusCode = error instanceof Error && 'status' in error ? error.status : 500;
        const message =
          error instanceof Error ? error.message || 'Mistral API error' : 'Mistral API error';
        throw new AIError(message, 'API_ERROR', statusCode);
      }

      // Handle network and other errors
      throw new AIError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        'UNKNOWN_ERROR'
      );
    }
  },

  /**
   * Generate text with streaming response
   */
  generateStream: async (params: AIGenerateParams): Promise<AIStreamResponse> => {
    try {
      const client = createMistralClient();
      const model = params.model || 'mistral-small';

      if (!validateModel(model)) {
        throw new AIError(`Invalid model: ${model}`, 'INVALID_MODEL');
      }

      const messages = buildMessages(params);

      const response = await client.chat.stream({
        model,
        messages,
        temperature: params.temperature ?? 0.7,
        maxTokens: params.maxTokens ?? 1000,
        topP: params.topP ?? 1.0,
      });

      // Create a readable stream from the async iterator
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of response) {
              const content = chunk.data?.choices?.[0]?.delta?.content;
              if (content) {
                controller.enqueue(content);
              }
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return {
        stream,
        model,
      };
    } catch (error) {
      if (error instanceof AIError) {
        throw error;
      }

      throw new AIError(
        error instanceof Error ? error.message : 'Streaming error occurred',
        'STREAM_ERROR'
      );
    }
  },

  /**
   * Check if AI service is available
   */
  isAvailable: (): boolean => {
    try {
      const apiKey = process.env.MISTRAL_API_KEY || process.env.NEXT_PUBLIC_MISTRAL_API_KEY;
      return !!apiKey;
    } catch {
      return false;
    }
  },

  /**
   * Get available models
   */
  getAvailableModels: (): MistralModel[] => {
    return [
      'mistral-tiny',
      'mistral-small',
      'mistral-medium',
      'mistral-large-latest',
      'open-mistral-7b',
      'open-mixtral-8x7b',
      'open-mixtral-8x22b',
    ];
  },

  /**
   * Estimate token count (rough approximation)
   */
  estimateTokens: (text: string): number => {
    // Rough estimation: ~4 characters per token for English text
    return Math.ceil(text.length / 4);
  },

  /**
   * Legacy Genkit compatibility - definePrompt
   * This maintains compatibility with existing flows that use Genkit syntax
   */
  definePrompt: (options: {
    name: string;
    input: { schema: z.ZodTypeAny };
    output: { schema: z.ZodTypeAny };
    input: { schema: z.ZodTypeAny };
    output: { schema: z.ZodTypeAny };
    prompt: string;
  }) => {
    return {
      name: options.name,
      input: options.input,
      output: options.output,
      prompt: options.prompt,
      generate: async (_input: unknown): Promise<unknown> => {
        // This is a simplified implementation for compatibility
        // In a real scenario, you'd want to parse the prompt template
        const response = await ai.generate({
          prompt: options.prompt,
          model: 'mistral-small',
          temperature: 0.7,
          maxTokens: 1500,
        });

        try {
          // Try to parse as JSON if the output schema expects structured data
          return JSON.parse(response.text);
        } catch {
          // Fallback to text response
          return { output: response.text };
        }
      },
    };
  },

  /**
   * Legacy Genkit compatibility - defineFlow
   * This maintains compatibility with existing flows that use Genkit syntax
   */
  defineFlow: (
    _options: {
      name: string;
      inputSchema: unknown;
      outputSchema: unknown;
    },
    handler: (input: unknown) => Promise<unknown>
  ) => {
    return handler;
  },
};

/**
 * Utility functions for common AI tasks
 */
export const aiUtils = {
  /**
   * Create a system prompt for job matching
   */
  createJobMatchingPrompt: (jobDescription: string, candidateProfile: string): string => {
    return `You are an expert HR assistant. Analyze the compatibility between this job and candidate.

Job Description:
${jobDescription}

Candidate Profile:
${candidateProfile}

Provide a compatibility score (0-100) and explain the reasoning.`;
  },

  /**
   * Create a system prompt for resume analysis
   */
  createResumeAnalysisPrompt: (resume: string): string => {
    return `You are an expert resume reviewer. Analyze this resume and provide constructive feedback.

Resume:
${resume}

Provide feedback on:
1. Overall structure and formatting
2. Content quality and relevance
3. Skills and experience presentation
4. Areas for improvement
5. Strengths to highlight`;
  },

  /**
   * Create a system prompt for interview questions
   */
  createInterviewQuestionsPrompt: (jobRole: string, experience: string): string => {
    return `You are an experienced interviewer. Generate relevant interview questions for this role.

Job Role: ${jobRole}
Experience Level: ${experience}

Generate 5-7 thoughtful interview questions that assess:
1. Technical skills
2. Problem-solving ability
3. Cultural fit
4. Experience relevance`;
  },

  /**
   * Create a system prompt for cover letter generation
   */
  createCoverLetterPrompt: (jobDescription: string, candidateBackground: string): string => {
    return `You are a professional career counselor. Write a compelling cover letter.

Job Description:
${jobDescription}

Candidate Background:
${candidateBackground}

Write a professional cover letter that:
1. Addresses the specific role
2. Highlights relevant experience
3. Shows enthusiasm for the position
4. Maintains a professional tone`;
  },
};

// Legacy exports for backward compatibility
export const { definePrompt, defineFlow } = ai;

export default ai;
