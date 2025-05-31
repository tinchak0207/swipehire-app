
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Explicitly load .env variables. Next.js also does this for its server environment,
// but this ensures it's loaded if this module is imported in other contexts too.
import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.error( // Changed to console.error for more visibility
    "CRITICAL ERROR: GOOGLE_API_KEY environment variable is NOT SET or is EMPTY. " +
    "Genkit Google AI plugin will FAIL. " +
    "1. Check your .env file for GOOGLE_API_KEY=YOUR_ACTUAL_KEY. " +
    "2. Ensure the .env file is in the root of your Next.js project. " +
    "3. FULLY RESTART your Next.js development server after changes to .env."
  );
  // Log the value if it's undefined or empty to help diagnose
  console.log("Current value of GOOGLE_API_KEY (should not be undefined/empty):", apiKey);
} else {
  // Log success and a part of the key for verification (be careful not to log the whole key in production logs)
  console.log(
    "SUCCESS: GOOGLE_API_KEY found by src/ai/genkit.ts. Initializing Google AI plugin with key ending in: ..." + apiKey.slice(-4)
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

