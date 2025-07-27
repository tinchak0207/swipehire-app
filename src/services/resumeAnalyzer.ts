import { Mistral } from '@mistralai/mistralai';

const apiKey = process.env.MISTRAL_API_KEY;
if (!apiKey) {
  throw new Error('MISTRAL_API_KEY is not defined in the environment variables');
}
const client = new Mistral({ apiKey });

interface ResumePayload {
  resume_text: string;
}

interface ResumeConfig {
  skills: string;
  experience: number;
}

export const analyzeResume = async (payload: ResumePayload, config: ResumeConfig) => {
  const { resume_text } = payload;
  const { skills, experience } = config;

  const response = await client.chat.complete({
    model: 'mistral-large-latest',
    messages: [
      {
        role: 'system',
        content: `You are a resume screening assistant. Score the following resume on a scale of 1-100 based on the following criteria:\n- Skills: ${skills}\n- Experience: ${experience} years`,
      },
      {
        role: 'user',
        content: resume_text,
      },
    ],
  });

  const content = response.choices?.[0]?.message?.content;
  const score = typeof content === 'string' ? parseInt(content, 10) || 0 : 0;

  return { ...payload, match_score: score };
};
