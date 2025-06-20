/**
 * Test JSON parsing fixes for truncated AI responses
 */

// Test cases for the improved JSON parsing
const testCases = [
  // Complete JSON
  '{"candidateId": "123", "matchScore": 85}',
  
  // Truncated JSON (the actual issue)
  '{"candidateId": "68400027a438414c624',
  
  // JSON with extra text
  'Here is the analysis: {"candidateId": "123", "matchScore": 85} Hope this helps!',
  
  // Truncated JSON with missing braces
  '{"candidateId": "123", "matchScore": 85, "reasoning": "Good match"',
  
  // Truncated JSON with unclosed string
  '{"candidateId": "123", "matchScore": 85, "reasoning": "Good match but needs more',
  
  // Complex truncated JSON
  '{"candidateId": "123", "weightedScores": {"skillsMatchScore": 80, "experienceRelevanceScore": 75',
];

interface TestResult {
  candidateId?: string;
  matchScore?: number;
  reasoning?: string;
  weightedScores?: any;
}

function parseAIResponseTest<T>(response: string, fallback: T): T {
  try {
    // First, try to parse the response as-is
    return JSON.parse(response);
  } catch (firstError) {
    try {
      // Try to extract JSON from response if it's wrapped in text
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        return JSON.parse(jsonStr);
      }
    } catch (secondError) {
      // If JSON is truncated, try to fix common issues
      try {
        let fixedJson = response.trim();
        
        // Remove any leading/trailing non-JSON text
        const startBrace = fixedJson.indexOf('{');
        if (startBrace > 0) {
          fixedJson = fixedJson.substring(startBrace);
        }
        
        // Try to fix truncated JSON by adding missing closing braces
        if (fixedJson.startsWith('{') && !fixedJson.endsWith('}')) {
          // Count open braces vs close braces
          const openBraces = (fixedJson.match(/\{/g) || []).length;
          const closeBraces = (fixedJson.match(/\}/g) || []).length;
          const missingBraces = openBraces - closeBraces;
          
          // Add missing closing braces
          for (let i = 0; i < missingBraces; i++) {
            fixedJson += '}';
          }
          
          // Try to fix truncated strings by adding closing quotes
          const openQuotes = (fixedJson.match(/"/g) || []).length;
          if (openQuotes % 2 !== 0) {
            // Find the last quote and see if it needs closing
            const lastQuoteIndex = fixedJson.lastIndexOf('"');
            if (lastQuoteIndex > 0) {
              const afterLastQuote = fixedJson.substring(lastQuoteIndex + 1);
              if (!afterLastQuote.includes('"') && !afterLastQuote.includes('}')) {
                fixedJson = fixedJson.substring(0, lastQuoteIndex + 1) + '"' + afterLastQuote;
              }
            }
          }
        }
        
        return JSON.parse(fixedJson);
      } catch (thirdError) {
        console.error('Failed to parse AI response after all attempts:', {
          originalError: firstError,
          extractError: secondError,
          fixError: thirdError,
          response: response.substring(0, 200) + '...'
        });
        return fallback;
      }
    }
  }
  
  console.error('Failed to parse AI response:', response.substring(0, 200) + '...');
  return fallback;
}

export function testJSONParsing(): void {
  console.log('🧪 Testing JSON parsing fixes...\n');
  
  const fallback: TestResult = {
    candidateId: 'fallback-id',
    matchScore: 0,
    reasoning: 'Parsing failed'
  };
  
  testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}:`);
    console.log(`Input: ${testCase}`);
    
    try {
      const result = parseAIResponseTest(testCase, fallback);
      console.log(`✅ Parsed successfully:`, result);
    } catch (error) {
      console.log(`❌ Failed to parse:`, error);
    }
    
    console.log('---\n');
  });
  
  console.log('🎯 Test completed!');
}

// Run test if this file is executed directly
if (require.main === module) {
  testJSONParsing();
}