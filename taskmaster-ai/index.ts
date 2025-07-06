/**
 * Taskmaster AI - Main Entry Point
 *
 * AI-powered development assistant that ensures code quality,
 * consistency, and adherence to project guidelines.
 */

export { TaskmasterCLI } from './cli/taskmaster';
export type {
  BiomeRules,
  CairoRules,
  ComponentRules,
  DaisyUIRules,
  DevelopmentRules,
  NextJSRules,
  StarknetRules,
  TailwindRules,
  TaskmasterConfig,
  TypeScriptRules,
} from './config/taskmaster.config';
export { taskmasterConfig } from './config/taskmaster.config';
export type { ComponentRequirements } from './generators/PromptGenerator';
export { PromptGenerator, promptGenerator } from './generators/PromptGenerator';
export type {
  ValidationError,
  ValidationResult,
  ValidationWarning,
} from './validators/CodeValidator';
export { CodeValidator, codeValidator } from './validators/CodeValidator';

/**
 * Quick start functions for common use cases
 */

import { promptGenerator } from './generators/PromptGenerator';
import { codeValidator } from './validators/CodeValidator';

/**
 * Generate a prompt for creating a React component
 */
export function generateComponentPrompt(
  name: string,
  description: string,
  _features: string[] = []
) {
  return promptGenerator.generateSpecificPrompt('component', name, description);
}

/**
 * Generate a prompt for creating a Next.js page
 */
export function generatePagePrompt(name: string, description: string, _features: string[] = []) {
  return promptGenerator.generateSpecificPrompt('page', name, description);
}

/**
 * Generate a prompt for creating a custom hook
 */
export function generateHookPrompt(name: string, description: string, _features: string[] = []) {
  return promptGenerator.generateSpecificPrompt('hook', name, description);
}

/**
 * Generate a prompt for creating a service
 */
export function generateServicePrompt(name: string, description: string, _features: string[] = []) {
  return promptGenerator.generateSpecificPrompt('service', name, description);
}

/**
 * Validate code against project standards
 */
export function validateCode(code: string, filePath: string, componentName?: string) {
  return codeValidator.validateCode(code, filePath, componentName);
}

/**
 * Generate a validation report
 */
export function generateValidationReport(code: string, filePath: string, componentName?: string) {
  const result = validateCode(code, filePath, componentName);
  return codeValidator.generateReport(result);
}

import { taskmasterConfig } from './config/taskmaster.config';

// Default export
export default {
  generateComponentPrompt,
  generatePagePrompt,
  generateHookPrompt,
  generateServicePrompt,
  validateCode,
  generateValidationReport,
  promptGenerator,
  codeValidator,
  taskmasterConfig,
};
