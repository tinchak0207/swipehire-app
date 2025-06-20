# Mistral AI Integration Setup Guide

This guide explains how to set up and use Mistral AI in your SwipeHire application.

## 🚀 Quick Setup

### 1. Get Your Mistral API Key

1. Visit [Mistral AI Console](https://console.mistral.ai/)
2. Sign up or log in to your account
3. Navigate to the API Keys section
4. Create a new API key
5. Copy the API key (it starts with something like `sk-...`)

### 2. Configure Environment Variables

Add your Mistral API key to your `.env.local` file:

```bash
# Mistral AI Configuration
MISTRAL_API_KEY=your_mistral_api_key_here
```

**Important:** Never commit your API key to version control. The `.env.local` file should be in your `.gitignore`.

### 3. Restart Your Development Server

After adding the API key, restart your Next.js development server:

```powershell
# Stop the current server (Ctrl+C) then restart
npm run dev
```

### 4. Test the Integration

Visit the test page to verify everything is working:

```
http://localhost:3000/test-ai
```

Or test via API endpoint:

```
http://localhost:3000/api/test-ai
```

## 🧠 Available AI Features

The Mistral AI integration provides the following features:

### 1. Profile Recommendation
- Analyzes candidate profiles against job criteria
- Provides match scores and reasoning
- Supports both recruiter and job seeker perspectives

### 2. Company Q&A
- Answers questions about companies based on their information
- Provides confidence scores and sources

### 3. Video Script Generation
- Creates personalized video scripts for candidates
- Supports different tones (professional, friendly, technical, sales)
- Includes helpful recording tips

### 4. Icebreaker Generation
- Creates conversation starters for matches
- Personalized based on candidate and job information
- Multiple alternatives provided

### 5. Resume Analysis
- Analyzes resumes and provides feedback
- Identifies strengths and areas for improvement
- Provides actionable suggestions

### 6. Chat Reply Generation
- Generates contextual responses for conversations
- Supports different tones and sender roles
- Provides multiple response options

## 🔧 Technical Details

### Available Models

The integration supports these Mistral AI models:

- `mistral-tiny` - Fastest, most cost-effective
- `mistral-small` - Balanced performance and cost (default)
- `mistral-medium` - Higher quality responses
- `mistral-large-latest` - Best performance
- `open-mistral-7b` - Open source model
- `open-mixtral-8x7b` - Open source mixture of experts
- `open-mixtral-8x22b` - Largest open source model

### Configuration Options

You can customize AI behavior by adjusting these parameters:

```typescript
const response = await ai.generate({
  prompt: "Your prompt here",
  model: 'mistral-small',        // Model to use
  temperature: 0.7,              // Creativity (0-1)
  maxTokens: 1000,              // Maximum response length
  topP: 1.0,                    // Nucleus sampling
  systemPrompt: "System context" // System instructions
});
```

### Error Handling

The integration includes comprehensive error handling:

- **Missing API Key**: Clear instructions to add the key
- **Invalid API Key**: Prompts to check key validity
- **Rate Limits**: Handles API rate limiting gracefully
- **Network Issues**: Provides fallback responses

## 🔄 Migration from Genkit

The new Mistral AI integration maintains compatibility with existing Genkit flows:

### Before (Genkit)
```typescript
import { ai } from '@/ai/genkit';
const result = await profileRecommenderFlow(input);
```

### After (Mistral AI)
```typescript
import { recommendProfile } from '@/services/aiService';
const result = await recommendProfile(input);
```

All existing function signatures and return types remain the same, ensuring seamless migration.

## 🧪 Testing

### Automated Tests

Run the comprehensive AI test suite:

```powershell
# Test via web interface
# Visit: http://localhost:3000/test-ai

# Test via API
curl http://localhost:3000/api/test-ai
```

### Manual Testing

Test individual features:

```typescript
import aiService from '@/services/aiService';

// Test profile recommendation
const recommendation = await aiService.recommendProfile({
  candidateProfile: { /* candidate data */ },
  jobCriteria: { /* job data */ }
});

// Test company Q&A
const answer = await aiService.answerCompanyQuestion({
  companyName: "TechCorp",
  question: "What is the company culture like?"
});
```

## 📊 Usage Monitoring

Monitor your AI usage through:

1. **Mistral AI Console**: View API usage and billing
2. **Application Logs**: Check console for usage statistics
3. **Test Page**: Real-time usage information during testing

## 🔒 Security Best Practices

1. **API Key Security**:
   - Never expose API keys in client-side code
   - Use server-side API routes for AI calls
   - Rotate API keys regularly

2. **Input Validation**:
   - Validate all user inputs before sending to AI
   - Implement rate limiting for AI endpoints
   - Sanitize responses before displaying

3. **Error Handling**:
   - Don't expose internal errors to users
   - Log errors for debugging
   - Provide meaningful fallback responses

## 🚨 Troubleshooting

### Common Issues

1. **"MISTRAL_API_KEY is not set"**
   - Solution: Add the API key to `.env.local` and restart the server

2. **"Invalid API key"**
   - Solution: Check that your API key is correct and active

3. **"Rate limit exceeded"**
   - Solution: Implement request throttling or upgrade your plan

4. **"Network error"**
   - Solution: Check internet connection and Mistral AI service status

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG=mistral:*
```

This will show detailed information about API calls and responses.

## 📈 Performance Optimization

### Model Selection
- Use `mistral-tiny` for simple tasks
- Use `mistral-small` for balanced performance (recommended)
- Use `mistral-large-latest` for complex reasoning

### Caching
Consider implementing response caching for:
- Frequently asked company questions
- Common profile recommendations
- Standard icebreaker templates

### Batch Processing
For multiple AI calls, consider batching requests to reduce latency.

## 🆘 Support

If you encounter issues:

1. Check the [Mistral AI Documentation](https://docs.mistral.ai/)
2. Review the test page at `/test-ai` for diagnostic information
3. Check the browser console and server logs for error details
4. Ensure your API key has sufficient credits and permissions

## 📝 License

This integration uses the Mistral AI API, which has its own terms of service and pricing. Please review [Mistral AI's pricing](https://mistral.ai/pricing/) and terms before production use.