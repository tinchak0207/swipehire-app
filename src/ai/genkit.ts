
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Explicitly load .env variables. Next.js also does this for its server environment,
// but this ensures it's loaded if this module is imported in other contexts too.
import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  // This warning will appear in your Next.js server console if the key isn't found
  console.warn(
    "CRITICAL: GOOGLE_API_KEY is not set in the environment. " +
    "Genkit Google AI plugin will likely fail. " +
    "Ensure it's in your .env file and the server was restarted."
  );
}

export const ai = genkit({
  plugins: [
    googleAI({ apiKey: apiKey }) // Explicitly pass the API key
  ],
  // You can still set a default model here if desired,
  // but individual generate calls can also specify models.
  // model: 'googleai/gemini-2.0-flash', // Example, can be overridden
});
