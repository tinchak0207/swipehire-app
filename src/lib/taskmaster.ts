/**
 * Taskmaster AI Integration
 *
 * Easy access to Taskmaster AI functionality throughout the SwipeHire project
 */

import taskmaster from '../../taskmaster-ai';

// Re-export all taskmaster functionality
export default taskmaster;

export {
  codeValidator,
  generateComponentPrompt,
  generateHookPrompt,
  generatePagePrompt,
  generateServicePrompt,
  generateValidationReport,
  promptGenerator,
  taskmasterConfig,
  validateCode,
} from '../../taskmaster-ai';

// Convenience functions for common SwipeHire patterns
export const generateSwipeHireComponentPrompt = (
  name: string,
  description: string,
  features: string[] = []
) => {
  const swipeHireFeatures = [
    'DaisyUI styling',
    'Responsive design',
    'TypeScript strict mode',
    'Accessibility compliance',
    'Error handling',
    'Loading states',
    ...features,
  ];

  return taskmaster.generateComponentPrompt(name, description, swipeHireFeatures);
};

export const generateSwipeHirePagePrompt = (
  name: string,
  description: string,
  features: string[] = []
) => {
  const swipeHirePageFeatures = [
    'Next.js App Router',
    'SEO optimization',
    'Firebase integration',
    'User authentication',
    'Responsive layout',
    'Error boundaries',
    ...features,
  ];

  return taskmaster.generatePagePrompt(name, description, swipeHirePageFeatures);
};

export const validateSwipeHireCode = (code: string, filePath: string, componentName?: string) => {
  const result = taskmaster.validateCode(code, filePath, componentName);

  // Add SwipeHire-specific validation rules
  const swipeHireWarnings = [];

  // Check for Firebase usage patterns
  if (code.includes('firebase') && !code.includes('import')) {
    swipeHireWarnings.push({
      rule: 'swipehire.firebase',
      message: 'Ensure Firebase is properly imported and configured',
      suggestion: 'Use the centralized Firebase configuration from src/lib/firebase',
    });
  }

  // Check for proper error handling with user feedback
  if (code.includes('catch') && !code.includes('toast')) {
    swipeHireWarnings.push({
      rule: 'swipehire.userFeedback',
      message: 'Consider providing user feedback for errors',
      suggestion: 'Use toast notifications or error states to inform users',
    });
  }

  return {
    ...result,
    warnings: [...result.warnings, ...swipeHireWarnings],
  };
};
