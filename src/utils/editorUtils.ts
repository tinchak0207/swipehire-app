/**
 * Utility functions for editor content manipulation
 */

import type { OptimizationSuggestion } from '@/lib/types/resume-optimizer';

/**
 * Apply a suggestion to editor content
 */
export function applySuggestionToContent(
  content: string,
  suggestion: OptimizationSuggestion
): string {
  // Handle different types of suggestions
  switch (suggestion.type) {
    case 'keyword':
      return applyKeywordSuggestion(content, suggestion);
    case 'grammar':
      return applyGrammarSuggestion(content, suggestion);
    case 'format':
      return applyFormatSuggestion(content, suggestion);
    case 'achievement':
      return applyAchievementSuggestion(content, suggestion);
    case 'structure':
      return applyStructureSuggestion(content, suggestion);
    case 'ats':
      return applyATSSuggestion(content, suggestion);
    default:
      return applyGenericSuggestion(content, suggestion);
  }
}

/**
 * Apply keyword-related suggestions
 */
function applyKeywordSuggestion(content: string, suggestion: OptimizationSuggestion): string {
  if (suggestion.beforeText && suggestion.afterText) {
    // Direct text replacement
    return content.replace(suggestion.beforeText, suggestion.afterText);
  }

  // If no specific replacement, try to intelligently add keywords
  const lines = content.split('\n');

  // Look for skills section to add keywords
  const skillsIndex = lines.findIndex((line) =>
    /skills|technologies|technical skills|core competencies/i.test(line)
  );

  if (skillsIndex !== -1) {
    // Add keywords to skills section
    const keywordText = `• ${suggestion.suggestion}`;
    lines.splice(skillsIndex + 1, 0, keywordText);
    return lines.join('\n');
  }

  // If no skills section found, add at the end
  return content + '\n\n' + suggestion.suggestion;
}

/**
 * Apply grammar-related suggestions
 */
function applyGrammarSuggestion(content: string, suggestion: OptimizationSuggestion): string {
  if (suggestion.beforeText && suggestion.afterText) {
    return content.replace(suggestion.beforeText, suggestion.afterText);
  }

  // For grammar suggestions without specific text, just mark as applied
  return content;
}

/**
 * Apply format-related suggestions
 */
function applyFormatSuggestion(content: string, suggestion: OptimizationSuggestion): string {
  if (suggestion.beforeText && suggestion.afterText) {
    return content.replace(suggestion.beforeText, suggestion.afterText);
  }

  // Apply common formatting improvements
  let formattedContent = content;

  // Ensure proper section headers
  if (suggestion.suggestion.includes('section headings')) {
    formattedContent = formattedContent.replace(
      /^(experience|education|skills|summary|objective)/gim,
      (match) => match.toUpperCase()
    );
  }

  // Ensure consistent bullet points
  if (suggestion.suggestion.includes('bullet points')) {
    formattedContent = formattedContent.replace(/^[-*]\s/gm, '• ');
  }

  return formattedContent;
}

/**
 * Apply achievement-related suggestions
 */
function applyAchievementSuggestion(content: string, suggestion: OptimizationSuggestion): string {
  if (suggestion.beforeText && suggestion.afterText) {
    return content.replace(suggestion.beforeText, suggestion.afterText);
  }

  // Look for experience section to enhance achievements
  const lines = content.split('\n');
  const experienceIndex = lines.findIndex((line) =>
    /experience|work history|professional experience/i.test(line)
  );

  if (experienceIndex !== -1) {
    // Add quantified achievement example
    const achievementText = `• ${suggestion.suggestion}`;
    lines.splice(experienceIndex + 2, 0, achievementText);
    return lines.join('\n');
  }

  return content + '\n\n' + suggestion.suggestion;
}

/**
 * Apply structure-related suggestions
 */
function applyStructureSuggestion(content: string, suggestion: OptimizationSuggestion): string {
  if (suggestion.beforeText && suggestion.afterText) {
    return content.replace(suggestion.beforeText, suggestion.afterText);
  }

  // Handle common structure improvements
  if (suggestion.suggestion.includes('professional summary')) {
    const summaryText = `PROFESSIONAL SUMMARY\n${suggestion.suggestion}\n\n`;
    return summaryText + content;
  }

  if (suggestion.suggestion.includes('contact information')) {
    const contactText = `[Your Name]\n[Your Email] | [Your Phone] | [Your Location]\n[LinkedIn Profile]\n\n`;
    return contactText + content;
  }

  return content + '\n\n' + suggestion.suggestion;
}

/**
 * Apply ATS-related suggestions
 */
function applyATSSuggestion(content: string, suggestion: OptimizationSuggestion): string {
  if (suggestion.beforeText && suggestion.afterText) {
    return content.replace(suggestion.beforeText, suggestion.afterText);
  }

  // Apply ATS-friendly formatting
  let atsContent = content;

  // Ensure standard section headers
  atsContent = atsContent.replace(/^(work experience|employment)/gim, 'EXPERIENCE');
  atsContent = atsContent.replace(/^(schooling|academic background)/gim, 'EDUCATION');
  atsContent = atsContent.replace(/^(technical skills|competencies)/gim, 'SKILLS');

  return atsContent;
}

/**
 * Apply generic suggestions
 */
function applyGenericSuggestion(content: string, suggestion: OptimizationSuggestion): string {
  if (suggestion.beforeText && suggestion.afterText) {
    return content.replace(suggestion.beforeText, suggestion.afterText);
  }

  // For generic suggestions, append at the end with context
  return content + '\n\n[Suggestion Applied]: ' + suggestion.suggestion;
}

/**
 * Find the best position to insert content based on section
 */
export function findInsertionPoint(content: string, section?: string): number {
  if (!section) return content.length;

  const lines = content.split('\n');

  // Common section patterns
  const sectionPatterns: Record<string, RegExp> = {
    summary: /^(professional summary|summary|objective|profile)/i,
    experience: /^(experience|work history|professional experience|employment)/i,
    education: /^(education|academic background|schooling)/i,
    skills: /^(skills|technical skills|core competencies|technologies)/i,
    projects: /^(projects|portfolio|notable projects)/i,
    certifications: /^(certifications|certificates|credentials)/i,
  };

  const pattern = sectionPatterns[section.toLowerCase()];
  if (pattern) {
    const sectionIndex = lines.findIndex((line) => pattern.test(line.trim()));
    if (sectionIndex !== -1) {
      // Find the end of this section (next section or end of content)
      let endIndex = lines.length;
      for (let i = sectionIndex + 1; i < lines.length; i++) {
        if (Object.values(sectionPatterns).some((p) => p.test(lines[i].trim()))) {
          endIndex = i;
          break;
        }
      }
      return lines.slice(0, endIndex).join('\n').length;
    }
  }

  return content.length;
}

/**
 * Extract text content from HTML (for rich text editors)
 */
export function extractTextFromHTML(html: string): string {
  // Simple HTML tag removal - in production, you might want to use a proper HTML parser
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * Convert plain text to basic HTML (for rich text editors)
 */
export function convertTextToHTML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}
