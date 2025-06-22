/**
 * Taskmaster AI Code Validator
 *
 * This module provides validation utilities to ensure generated code
 * follows the established rules and guidelines.
 */

import { taskmasterConfig } from '../config/taskmaster.config';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number;
}

export interface ValidationError {
  rule: string;
  message: string;
  line?: number;
  column?: number;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  rule: string;
  message: string;
  line?: number;
  column?: number;
  suggestion: string;
}

export class CodeValidator {
  private config = taskmasterConfig;

  /**
   * Validates TypeScript code against project rules
   */
  validateTypeScript(code: string, _filePath: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check for 'any' usage
    if (this.config.typescript.avoidAny) {
      const anyMatches = code.match(/:\s*any\b/g);
      if (anyMatches) {
        errors.push({
          rule: 'typescript.avoidAny',
          message: "Avoid using 'any' type. Use 'unknown' with runtime checks instead.",
          severity: 'error',
        });
      }
    }

    // Check for explicit return types
    if (this.config.typescript.explicitTypes) {
      const functionMatches = code.match(/function\s+\w+\([^)]*\)\s*{/g);
      const arrowFunctionMatches = code.match(/=\s*\([^)]*\)\s*=>/g);

      if (functionMatches || arrowFunctionMatches) {
        warnings.push({
          rule: 'typescript.explicitTypes',
          message: 'Consider adding explicit return types to functions.',
          suggestion: 'Add return type annotations: function name(): ReturnType',
        });
      }
    }

    // Check for proper interface usage
    const interfaceMatches = code.match(/interface\s+\w+/g);
    const typeMatches = code.match(/type\s+\w+/g);

    if (!interfaceMatches && !typeMatches && code.includes('props')) {
      warnings.push({
        rule: 'typescript.propValidation',
        message: 'Consider defining interfaces for component props.',
        suggestion: 'Create interfaces for better type safety and documentation.',
      });
    }

    return this.calculateValidationResult(errors, warnings);
  }

  /**
   * Validates React component structure
   */
  validateReactComponent(code: string, componentName: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check for proper component naming
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(componentName)) {
      errors.push({
        rule: 'components.namingConventions',
        message: 'Component names should use PascalCase.',
        severity: 'error',
      });
    }

    // Check for prop validation
    if (
      this.config.components.propValidation &&
      !code.includes('interface') &&
      !code.includes('type')
    ) {
      warnings.push({
        rule: 'components.propValidation',
        message: 'Consider adding prop type definitions.',
        suggestion: 'Define interfaces or types for component props.',
      });
    }

    // Check for accessibility
    if (this.config.components.accessibility) {
      if (code.includes('<button') && !code.includes('aria-')) {
        warnings.push({
          rule: 'components.accessibility',
          message: 'Consider adding ARIA attributes to interactive elements.',
          suggestion: 'Add aria-label, aria-describedby, or other ARIA attributes.',
        });
      }
    }

    // Check for error handling
    if (this.config.components.errorHandling && !code.includes('try') && !code.includes('catch')) {
      warnings.push({
        rule: 'components.errorHandling',
        message: 'Consider adding error handling for async operations.',
        suggestion: 'Use try-catch blocks or error boundaries.',
      });
    }

    // Check for loading states
    if (
      this.config.components.loadingStates &&
      code.includes('fetch') &&
      !code.includes('loading')
    ) {
      warnings.push({
        rule: 'components.loadingStates',
        message: 'Consider adding loading states for async operations.',
        suggestion: 'Add loading indicators during data fetching.',
      });
    }

    return this.calculateValidationResult(errors, warnings);
  }

  /**
   * Validates Tailwind CSS usage
   */
  validateTailwindCSS(code: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check for custom CSS
    if (this.config.tailwind.avoidCustomCSS) {
      if (code.includes('style={{') || code.includes('styled.')) {
        warnings.push({
          rule: 'tailwind.avoidCustomCSS',
          message: 'Avoid custom CSS. Use Tailwind utility classes instead.',
          suggestion: 'Replace custom styles with Tailwind utility classes.',
        });
      }
    }

    // Check for responsive design
    if (this.config.tailwind.responsiveDesign) {
      const hasResponsiveClasses = /\b(sm:|md:|lg:|xl:|2xl:)/.test(code);
      if (code.includes('className') && !hasResponsiveClasses) {
        warnings.push({
          rule: 'tailwind.responsiveDesign',
          message: 'Consider adding responsive variants for better mobile experience.',
          suggestion: 'Use responsive prefixes like sm:, md:, lg: for different screen sizes.',
        });
      }
    }

    return this.calculateValidationResult(errors, warnings);
  }

  /**
   * Validates Next.js specific patterns
   */
  validateNextJS(code: string, filePath: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check for proper image usage
    if (code.includes('<img') && !code.includes('next/image')) {
      warnings.push({
        rule: 'nextjs.imageOptimization',
        message: 'Use next/image instead of <img> for better performance.',
        suggestion: "Import Image from 'next/image' and use <Image> component.",
      });
    }

    // Check for dynamic imports
    if (code.includes('import(') && this.config.nextjs.performanceOptimizations) {
      // This is good - dynamic imports are encouraged
    }

    // Check for proper data fetching in pages
    if (filePath.includes('/pages/') || filePath.includes('/app/')) {
      const hasDataFetching =
        code.includes('getServerSideProps') ||
        code.includes('getStaticProps') ||
        code.includes('getStaticPaths');

      if (code.includes('fetch') && !hasDataFetching) {
        warnings.push({
          rule: 'nextjs.dataFetching',
          message: 'Consider using Next.js data fetching methods for better performance.',
          suggestion:
            'Use getServerSideProps, getStaticProps, or getStaticPaths for data fetching.',
        });
      }
    }

    return this.calculateValidationResult(errors, warnings);
  }

  /**
   * Validates accessibility compliance
   */
  validateAccessibility(code: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check for alt text on images
    if (code.includes('<img') || code.includes('<Image')) {
      if (!code.includes('alt=')) {
        errors.push({
          rule: 'accessibility.altText',
          message: 'Images must have alt text for screen readers.',
          severity: 'error',
        });
      }
    }

    // Check for proper heading hierarchy
    const headingMatches = code.match(/<h[1-6]/g);
    if (headingMatches && headingMatches.length > 1) {
      // Basic check - could be more sophisticated
      warnings.push({
        rule: 'accessibility.headingHierarchy',
        message: 'Ensure proper heading hierarchy (h1 → h2 �� h3, etc.).',
        suggestion: 'Use headings in sequential order without skipping levels.',
      });
    }

    // Check for keyboard accessibility
    if (code.includes('onClick') && !code.includes('onKeyDown')) {
      warnings.push({
        rule: 'accessibility.keyboardNavigation',
        message: 'Interactive elements should support keyboard navigation.',
        suggestion: 'Add onKeyDown handlers for keyboard accessibility.',
      });
    }

    return this.calculateValidationResult(errors, warnings);
  }

  /**
   * Validates performance best practices
   */
  validatePerformance(code: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check for React.memo usage on expensive components
    if (code.includes('useEffect') && code.includes('useState') && !code.includes('React.memo')) {
      warnings.push({
        rule: 'performance.reactMemo',
        message: 'Consider using React.memo for components with expensive renders.',
        suggestion: 'Wrap component with React.memo to prevent unnecessary re-renders.',
      });
    }

    // Check for proper key props in lists
    if (code.includes('.map(') && !code.includes('key=')) {
      errors.push({
        rule: 'performance.keyProps',
        message: 'List items must have unique key props.',
        severity: 'error',
      });
    }

    // Check for useCallback/useMemo usage
    if (code.includes('useEffect') && code.includes('function') && !code.includes('useCallback')) {
      warnings.push({
        rule: 'performance.useCallback',
        message: 'Consider using useCallback for function dependencies in useEffect.',
        suggestion: 'Wrap functions in useCallback to prevent unnecessary effect runs.',
      });
    }

    return this.calculateValidationResult(errors, warnings);
  }

  /**
   * Runs comprehensive validation on code
   */
  validateCode(code: string, filePath: string, componentName?: string): ValidationResult {
    const results: ValidationResult[] = [];

    // Run all validations
    results.push(this.validateTypeScript(code, filePath));

    if (componentName) {
      results.push(this.validateReactComponent(code, componentName));
    }

    results.push(this.validateTailwindCSS(code));
    results.push(this.validateNextJS(code, filePath));
    results.push(this.validateAccessibility(code));
    results.push(this.validatePerformance(code));

    // Combine results
    const allErrors = results.flatMap((r) => r.errors);
    const allWarnings = results.flatMap((r) => r.warnings);
    const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      score: averageScore,
    };
  }

  private calculateValidationResult(
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): ValidationResult {
    const errorCount = errors.length;
    const warningCount = warnings.length;

    // Calculate score (0-100)
    const maxDeductions = 100;
    const errorDeduction = errorCount * 20; // 20 points per error
    const warningDeduction = warningCount * 5; // 5 points per warning

    const score = Math.max(0, maxDeductions - errorDeduction - warningDeduction);

    return {
      isValid: errorCount === 0,
      errors,
      warnings,
      score,
    };
  }

  /**
   * Generates a validation report
   */
  generateReport(result: ValidationResult): string {
    let report = '# Code Validation Report\n\n';

    report += `**Overall Score:** ${result.score}/100\n`;
    report += `**Status:** ${result.isValid ? '✅ Valid' : '❌ Invalid'}\n\n`;

    if (result.errors.length > 0) {
      report += `## Errors (${result.errors.length})\n\n`;
      result.errors.forEach((error, index) => {
        report += `${index + 1}. **${error.rule}**: ${error.message}\n`;
        if (error.line) {
          report += `   - Line: ${error.line}\n`;
        }
        report += '\n';
      });
    }

    if (result.warnings.length > 0) {
      report += `## Warnings (${result.warnings.length})\n\n`;
      result.warnings.forEach((warning, index) => {
        report += `${index + 1}. **${warning.rule}**: ${warning.message}\n`;
        report += `   - Suggestion: ${warning.suggestion}\n`;
        if (warning.line) {
          report += `   - Line: ${warning.line}\n`;
        }
        report += '\n';
      });
    }

    if (result.errors.length === 0 && result.warnings.length === 0) {
      report += '## ✨ Perfect!\n\nNo issues found. The code follows all established guidelines.\n';
    }

    return report;
  }
}

export const codeValidator = new CodeValidator();
