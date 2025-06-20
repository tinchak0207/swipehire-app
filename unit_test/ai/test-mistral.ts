/**
 * Test file for Mistral AI integration
 * Run this to verify that the AI service is working correctly
 */

import { ai } from './genkit';
import aiService from '../services/aiService';

async function testMistralConnection() {
  console.log('🧪 Testing Mistral AI Connection...');
  
  try {
    // Test basic AI availability
    const isAvailable = ai.isAvailable();
    console.log('✅ AI Service Available:', isAvailable);
    
    if (!isAvailable) {
      console.log('❌ MISTRAL_API_KEY not found in environment variables');
      console.log('Please add MISTRAL_API_KEY to your .env.local file');
      return;
    }
    
    // Test available models
    const models = ai.getAvailableModels();
    console.log('📋 Available Models:', models);
    
    // Test basic text generation
    console.log('\n🔄 Testing basic text generation...');
    const response = await ai.generate({
      prompt: 'Hello! Please respond with a brief professional greeting.',
      model: 'mistral-small',
      temperature: 0.3,
      maxTokens: 100,
    });
    
    console.log('✅ Basic Generation Response:', response.text);
    console.log('📊 Usage:', response.usage);
    
    // Test profile recommendation
    console.log('\n🔄 Testing profile recommendation...');
    const profileInput = {
      candidateProfile: {
        id: 'test-candidate',
        role: 'Software Developer',
        experienceSummary: 'Full-stack developer with 3 years of experience in React and Node.js',
        skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
        location: 'San Francisco, CA',
        desiredWorkStyle: 'Collaborative and innovative environment',
      },
      jobCriteria: {
        title: 'Frontend Developer',
        description: 'Looking for a React developer to join our team',
        requiredSkills: ['React', 'JavaScript', 'CSS'],
        companyIndustry: 'Technology',
        companyCultureKeywords: ['innovative', 'collaborative'],
      },
    };
    
    const recommendation = await aiService.recommendProfile(profileInput);
    console.log('✅ Profile Recommendation:', {
      candidateId: recommendation.candidateId,
      matchScore: recommendation.matchScore,
      reasoning: recommendation.reasoning.substring(0, 100) + '...',
    });
    
    // Test company Q&A
    console.log('\n🔄 Testing company Q&A...');
    const qaInput = {
      companyName: 'TechCorp',
      companyDescription: 'A leading technology company focused on innovation',
      companyIndustry: 'Technology',
      companyCultureKeywords: ['innovative', 'collaborative', 'fast-paced'],
      question: 'What is the company culture like?',
    };
    
    const qaResponse = await aiService.answerCompanyQuestion(qaInput);
    console.log('✅ Company Q&A Response:', qaResponse.answer?.substring(0, 100) + '...');
    
    console.log('\n🎉 All tests passed! Mistral AI integration is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('MISTRAL_API_KEY')) {
        console.log('\n💡 Solution: Add your Mistral API key to .env.local:');
        console.log('MISTRAL_API_KEY=your_actual_api_key_here');
      } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
        console.log('\n💡 Solution: Check that your Mistral API key is valid');
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        console.log('\n💡 Solution: Check your internet connection');
      }
    }
  }
}

// Export for use in other files
export { testMistralConnection };

// Run test if this file is executed directly
if (require.main === module) {
  testMistralConnection();
}