/**
 * AI Content Validation and Sanitization
 *
 * Security-focused validation and sanitization for AI-generated content
 * to prevent injection attacks, inappropriate content, and data leaks.
 */

import DOMPurify from 'dompurify';
import { z } from 'zod';

/**
 * Content types for validation
 */
export type ContentType =
  | 'profile_recommendation'
  | 'video_script'
  | 'icebreaker'
  | 'resume_analysis'
  | 'chat_reply'
  | 'job_description'
  | 'company_qa'
  | 'general';

/**
 * Validation severity levels
 */
export type ValidationSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  sanitizedContent: string;
  issues: ValidationIssue[];
  risk: ValidationSeverity;
  metadata: {
    originalLength: number;
    sanitizedLength: number;
    blocked: string[];
    modified: string[];
  };
}

/**
 * Validation issue
 */
export interface ValidationIssue {
  type: 'security' | 'content' | 'privacy' | 'format';
  severity: ValidationSeverity;
  message: string;
  pattern?: string;
  suggestion?: string;
}

/**
 * Validation configuration
 */
interface ValidationConfig {
  enabled: boolean;
  strictMode: boolean;
  allowedHtmlTags: string[];
  blockedPatterns: RegExp[];
  sensitiveDataPatterns: RegExp[];
  contentLengthLimits: Record<ContentType, number>;
  profanityFilter: boolean;
  linkValidation: boolean;
}

/**
 * Default validation configuration
 */
const DEFAULT_CONFIG: ValidationConfig = {
  enabled: true,
  strictMode: false,
  allowedHtmlTags: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
  blockedPatterns: [
    // Script injection attempts
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onclick\s*=/gi,
    /onerror\s*=/gi,

    // SQL injection patterns
    /union\s+select/gi,
    /drop\s+table/gi,
    /delete\s+from/gi,
    /insert\s+into/gi,
    /update\s+.*\s+set/gi,

    // Server-side includes
    /<!--\s*#exec/gi,
    /<!--\s*#include/gi,

    // Suspicious protocols
    /data:text\/html/gi,
    /file:\/\//gi,

    // Command injection
    /&&\s*[a-z]/gi,
    /\|\|\s*[a-z]/gi,
    /;\s*[a-z]/gi,
  ],
  sensitiveDataPatterns: [
    // Credit card numbers
    /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,

    // Social Security Numbers
    /\b\d{3}-\d{2}-\d{4}\b/g,

    // Email addresses (in some contexts)
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,

    // Phone numbers
    /\b\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,

    // API keys or tokens (common patterns)
    /[a-zA-Z0-9]{32,}/g,

    // AWS Access Keys
    /AKIA[0-9A-Z]{16}/g,

    // GitHub tokens
    /ghp_[a-zA-Z0-9]{36}/g,

    // Private keys
    /-----BEGIN\s+.*PRIVATE\s+KEY-----/gi,
  ],
  contentLengthLimits: {
    profile_recommendation: 5000,
    video_script: 3000,
    icebreaker: 500,
    resume_analysis: 8000,
    chat_reply: 1000,
    job_description: 10000,
    company_qa: 2000,
    general: 2000,
  },
  profanityFilter: true,
  linkValidation: true,
};

/**
 * Common profanity patterns (basic list - should be expanded)
 */
const PROFANITY_PATTERNS = [
  /\b(fuck|shit|damn|ass|bitch|crap)\b/gi,
  // Add more patterns as needed, consider using a proper profanity filter library
];

/**
 * Zod schemas for structured content validation
 */
const ProfileRecommendationSchema = z.object({
  candidateId: z.string().min(1).max(100),
  reasoning: z.string().min(1).max(500),
  matchScore: z.number().min(0).max(100),
  weightedScores: z.object({
    skillsMatchScore: z.number().min(0).max(100),
    experienceRelevanceScore: z.number().min(0).max(100),
    cultureFitScore: z.number().min(0).max(100),
    growthPotentialScore: z.number().min(0).max(100),
  }),
  isUnderestimatedTalent: z.boolean(),
  personalityAssessment: z
    .array(
      z.object({
        trait: z.string().min(1).max(50),
        fit: z.enum(['positive', 'neutral', 'negative']),
        reason: z.string().min(1).max(200),
      })
    )
    .max(10),
  optimalWorkStyles: z.array(z.string().min(1).max(50)).max(10),
});

const VideoScriptSchema = z.object({
  script: z.string().min(50).max(3000),
  tips: z.array(z.string().min(1).max(200)).max(10),
});

const IcebreakerSchema = z.object({
  icebreaker: z.string().min(10).max(500),
  alternatives: z.array(z.string().min(10).max(500)).max(5),
});

const ResumeAnalysisSchema = z.object({
  score: z.number().min(0).max(100),
  feedback: z.array(z.string().min(1).max(200)).max(20),
  strengths: z.array(z.string().min(1).max(200)).max(20),
  improvements: z.array(z.string().min(1).max(200)).max(20),
});

/**
 * AI Content Validator
 */
class AIContentValidator {
  private config: ValidationConfig;

  constructor(config: Partial<ValidationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Validate and sanitize AI-generated content
   */
  validate(content: string, contentType: ContentType = 'general'): ValidationResult {
    if (!this.config.enabled) {
      return {
        isValid: true,
        sanitizedContent: content,
        issues: [],
        risk: 'low',
        metadata: {
          originalLength: content.length,
          sanitizedLength: content.length,
          blocked: [],
          modified: [],
        },
      };
    }

    const issues: ValidationIssue[] = [];
    const blocked: string[] = [];
    const modified: string[] = [];
    let sanitizedContent = content;
    let risk: ValidationSeverity = 'low';

    // 1. Length validation
    const lengthLimit = this.config.contentLengthLimits[contentType];
    if (content.length > lengthLimit) {
      issues.push({
        type: 'format',
        severity: 'medium',
        message: `Content exceeds maximum length of ${lengthLimit} characters`,
        suggestion: 'Truncate content or request shorter response',
      });
      sanitizedContent = sanitizedContent.substring(0, lengthLimit);
      modified.push('length_truncated');
      risk = this.updateRisk(risk, 'medium');
    }

    // 2. Security pattern detection
    for (const pattern of this.config.blockedPatterns) {
      if (pattern.test(sanitizedContent)) {
        const matches = sanitizedContent.match(pattern);
        if (matches) {
          for (const match of matches) {
            blocked.push(match);
            issues.push({
              type: 'security',
              severity: 'critical',
              message: 'Potentially malicious pattern detected',
              pattern: match,
              suggestion: 'Remove or replace suspicious content',
            });
          }
          sanitizedContent = sanitizedContent.replace(pattern, '[BLOCKED]');
          risk = this.updateRisk(risk, 'critical');
        }
      }
    }

    // 3. Sensitive data detection
    for (const pattern of this.config.sensitiveDataPatterns) {
      if (pattern.test(sanitizedContent)) {
        const matches = sanitizedContent.match(pattern);
        if (matches) {
          for (const match of matches) {
            blocked.push(match);
            issues.push({
              type: 'privacy',
              severity: 'high',
              message: 'Sensitive data pattern detected',
              pattern: this.maskSensitiveData(match),
              suggestion: 'Remove or redact sensitive information',
            });
          }
          sanitizedContent = sanitizedContent.replace(pattern, '[REDACTED]');
          modified.push('sensitive_data_redacted');
          risk = this.updateRisk(risk, 'high');
        }
      }
    }

    // 4. HTML sanitization
    if (this.containsHtml(sanitizedContent)) {
      const originalHtml = sanitizedContent;
      sanitizedContent = this.sanitizeHtml(sanitizedContent);

      if (originalHtml !== sanitizedContent) {
        modified.push('html_sanitized');
        issues.push({
          type: 'security',
          severity: 'medium',
          message: 'HTML content sanitized',
          suggestion: 'Review sanitized HTML content',
        });
        risk = this.updateRisk(risk, 'medium');
      }
    }

    // 5. Profanity filtering
    if (this.config.profanityFilter) {
      for (const pattern of PROFANITY_PATTERNS) {
        if (pattern.test(sanitizedContent)) {
          const matches = sanitizedContent.match(pattern);
          if (matches) {
            for (const match of matches) {
              blocked.push(match);
              issues.push({
                type: 'content',
                severity: 'medium',
                message: 'Inappropriate language detected',
                suggestion: 'Use professional language',
              });
            }
            sanitizedContent = sanitizedContent.replace(pattern, '[FILTERED]');
            modified.push('profanity_filtered');
            risk = this.updateRisk(risk, 'medium');
          }
        }
      }
    }

    // 6. Link validation
    if (this.config.linkValidation) {
      const linkIssues = this.validateLinks(sanitizedContent);
      issues.push(...linkIssues.issues);
      sanitizedContent = linkIssues.sanitizedContent;
      if (linkIssues.modified) {
        modified.push('links_sanitized');
        risk = this.updateRisk(risk, linkIssues.risk);
      }
    }

    // 7. Structured content validation (if JSON)
    if (this.isJsonLike(sanitizedContent)) {
      const structureValidation = this.validateStructuredContent(sanitizedContent, contentType);
      issues.push(...structureValidation.issues);
      if (!structureValidation.isValid) {
        risk = this.updateRisk(risk, 'medium');
      }
    }

    const isValid = issues.filter((issue) => issue.severity === 'critical').length === 0;

    return {
      isValid,
      sanitizedContent,
      issues,
      risk,
      metadata: {
        originalLength: content.length,
        sanitizedLength: sanitizedContent.length,
        blocked: Array.from(new Set(blocked)),
        modified: Array.from(new Set(modified)),
      },
    };
  }

  /**
   * Validate structured content against schemas
   */
  private validateStructuredContent(
    content: string,
    contentType: ContentType
  ): {
    isValid: boolean;
    issues: ValidationIssue[];
  } {
    const issues: ValidationIssue[] = [];

    try {
      const parsed = JSON.parse(content);
      let schema: z.ZodSchema;

      switch (contentType) {
        case 'profile_recommendation':
          schema = ProfileRecommendationSchema;
          break;
        case 'video_script':
          schema = VideoScriptSchema;
          break;
        case 'icebreaker':
          schema = IcebreakerSchema;
          break;
        case 'resume_analysis':
          schema = ResumeAnalysisSchema;
          break;
        default:
          return { isValid: true, issues: [] };
      }

      const result = schema.safeParse(parsed);
      if (!result.success) {
        for (const error of result.error.errors) {
          issues.push({
            type: 'format',
            severity: 'medium',
            message: `Validation error: ${error.message} at ${error.path.join('.')}`,
            suggestion: 'Ensure content matches expected structure',
          });
        }
        return { isValid: false, issues };
      }

      return { isValid: true, issues: [] };
    } catch (_error) {
      issues.push({
        type: 'format',
        severity: 'low',
        message: 'Content is not valid JSON but appears JSON-like',
        suggestion: 'Check JSON formatting',
      });
      return { isValid: false, issues };
    }
  }

  /**
   * Validate and sanitize links
   */
  private validateLinks(content: string): {
    sanitizedContent: string;
    issues: ValidationIssue[];
    modified: boolean;
    risk: ValidationSeverity;
  } {
    const issues: ValidationIssue[] = [];
    let sanitizedContent = content;
    let modified = false;
    let risk: ValidationSeverity = 'low';

    // URL pattern
    const urlPattern = /(https?:\/\/[^\s<>"']+)/gi;
    const matches = content.match(urlPattern);

    if (matches) {
      for (const url of matches) {
        // Check for suspicious domains
        const suspiciousDomains = [
          'bit.ly',
          'tinyurl.com',
          'goo.gl',
          't.co', // URL shorteners
          'suspicious-domain.com', // Add known malicious domains
        ];

        try {
          const urlObj = new URL(url);

          // Check protocol
          if (!['http:', 'https'].includes(urlObj.protocol)) {
            issues.push({
              type: 'security',
              severity: 'high',
              message: `Unsafe URL protocol: ${urlObj.protocol}`,
              pattern: url,
              suggestion: 'Use only HTTP/HTTPS URLs',
            });
            sanitizedContent = sanitizedContent.replace(url, '[UNSAFE_URL_REMOVED]');
            modified = true;
            risk = this.updateRisk(risk, 'high');
            continue;
          }

          // Check for suspicious domains
          if (suspiciousDomains.some((domain) => urlObj.hostname.includes(domain))) {
            issues.push({
              type: 'security',
              severity: 'medium',
              message: `Potentially suspicious domain: ${urlObj.hostname}`,
              pattern: url,
              suggestion: 'Verify link legitimacy',
            });
            risk = this.updateRisk(risk, 'medium');
          }

          // Check for long URLs (potential for obfuscation)
          if (url.length > 200) {
            issues.push({
              type: 'security',
              severity: 'low',
              message: 'Unusually long URL detected',
              pattern: `${url.substring(0, 50)}...`,
              suggestion: 'Verify URL legitimacy',
            });
            risk = this.updateRisk(risk, 'low');
          }
        } catch (_error) {
          issues.push({
            type: 'format',
            severity: 'medium',
            message: 'Invalid URL format detected',
            pattern: url,
            suggestion: 'Remove or fix malformed URL',
          });
          sanitizedContent = sanitizedContent.replace(url, '[INVALID_URL_REMOVED]');
          modified = true;
          risk = this.updateRisk(risk, 'medium');
        }
      }
    }

    return { sanitizedContent, issues, modified, risk };
  }

  /**
   * Sanitize HTML content
   */
  private sanitizeHtml(content: string): string {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: this.config.allowedHtmlTags,
      ALLOWED_ATTR: ['href', 'title', 'alt', 'src'],
      // FORBID_SCRIPT: true,
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
      FORBID_ATTR: ['onclick', 'onload', 'onerror', 'style'],
    });
  }

  /**
   * Check if content contains HTML
   */
  private containsHtml(content: string): boolean {
    return /<[^>]*>/g.test(content);
  }

  /**
   * Check if content appears to be JSON
   */
  private isJsonLike(content: string): boolean {
    const trimmed = content.trim();
    return (
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))
    );
  }

  /**
   * Mask sensitive data for logging
   */
  private maskSensitiveData(data: string): string {
    if (data.length <= 4) return '*'.repeat(data.length);
    return data.substring(0, 2) + '*'.repeat(data.length - 4) + data.substring(data.length - 2);
  }

  /**
   * Update risk level (always use highest)
   */
  private updateRisk(current: ValidationSeverity, newRisk: ValidationSeverity): ValidationSeverity {
    const levels = { low: 1, medium: 2, high: 3, critical: 4 };
    return levels[newRisk] > levels[current] ? newRisk : current;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ValidationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): ValidationConfig {
    return { ...this.config };
  }
}

/**
 * Default validator instance
 */
export const aiContentValidator = new AIContentValidator();

/**
 * Validation middleware for AI services
 */
export function validateAIContent(
  content: string,
  contentType: ContentType = 'general',
  options: { throwOnCritical?: boolean; logIssues?: boolean } = {}
): ValidationResult {
  const { throwOnCritical = true, logIssues = true } = options;

  const result = aiContentValidator.validate(content, contentType);

  // Log issues if requested
  if (logIssues && result.issues.length > 0) {
    console.warn('[AI Content Validation]', {
      contentType,
      risk: result.risk,
      issueCount: result.issues.length,
      issues: result.issues.map((issue) => ({
        type: issue.type,
        severity: issue.severity,
        message: issue.message,
      })),
      metadata: result.metadata,
    });
  }

  // Throw on critical issues if requested
  if (throwOnCritical && result.issues.some((issue) => issue.severity === 'critical')) {
    throw new Error(
      `Critical security issue detected in AI content: ${result.issues
        .filter((issue) => issue.severity === 'critical')
        .map((issue) => issue.message)
        .join(', ')}`
    );
  }

  return result;
}

/**
 * Content type-specific validators
 */
export const validators = {
  profileRecommendation: (content: string) => validateAIContent(content, 'profile_recommendation'),

  videoScript: (content: string) => validateAIContent(content, 'video_script'),

  icebreaker: (content: string) => validateAIContent(content, 'icebreaker'),

  resumeAnalysis: (content: string) => validateAIContent(content, 'resume_analysis'),

  chatReply: (content: string) => validateAIContent(content, 'chat_reply'),

  jobDescription: (content: string) => validateAIContent(content, 'job_description'),

  companyQA: (content: string) => validateAIContent(content, 'company_qa'),
};

/**
 * Safe AI content wrapper for components
 */
export function SafeAIContent({
  content,
  contentType = 'general',
  fallback = '[Content validation failed]',
  className = '',
}: {
  content: string;
  contentType?: ContentType;
  fallback?: string;
  className?: string;
}) {
  try {
    const validation = validateAIContent(content, contentType, {
      throwOnCritical: false,
      logIssues: true,
    });

    if (!validation.isValid && validation.risk === 'critical') {
      return <div className={`text-red-500 ${className}`}>{fallback}</div>;
    }

    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: validation.sanitizedContent }}
      />
    );
  } catch (error) {
    console.error('AI content validation error:', error);
    return <div className={`text-gray-500 ${className}`}>{fallback}</div>;
  }
}

/**
 * Export types and utilities
 */
export { AIContentValidator };

export default aiContentValidator;
