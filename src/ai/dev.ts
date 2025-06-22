import { config } from 'dotenv';

config();

import '@/ai/flows/video-script-generator.ts';
import '@/ai/flows/icebreaker-generator.ts';
import '@/ai/flows/avatar-generator.ts';
import '@/ai/flows/video-editor.ts';
import '@/ai/flows/profile-recommender.ts'; // Added new flow
import '@/ai/flows/generic-chat-reply-flow.ts'; // Added new chat reply flow
import '@/ai/flows/company-qa-flow.ts'; // Added new company Q&A flow
import '@/ai/flows/resume-processor-flow.ts'; // Added new resume processor flow
