/**
 * Resume Intelligence Service
 * Automatically detects target job information from resume content
 * to minimize user effort in the optimization process
 */

export interface ResumeIntelligence {
  targetJobTitle: string;
  inferredKeywords: string[];
  industryDomain: string;
  seniorityLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  suggestedJobDescription: string;
  confidence: number; // 0-1 score indicating detection confidence
  detectionSources: {
    jobTitleSource: 'current_role' | 'career_progression' | 'skills_based' | 'fallback';
    keywordSources: string[];
    industryIndicators: string[];
  };
}

// Career progression patterns for role prediction
const CAREER_PROGRESSIONS: Record<string, string[]> = {
  'software engineer': [
    'senior software engineer',
    'staff software engineer',
    'engineering manager',
    'tech lead',
  ],
  developer: ['senior developer', 'lead developer', 'software engineer', 'full stack developer'],
  'frontend developer': ['senior frontend developer', 'frontend engineer', 'ui engineer'],
  'backend developer': ['senior backend developer', 'backend engineer', 'systems engineer'],
  'data analyst': [
    'senior data analyst',
    'data scientist',
    'analytics manager',
    'business analyst',
  ],
  'product manager': ['senior product manager', 'director of product', 'product lead'],
  'marketing coordinator': ['marketing manager', 'senior marketing manager', 'marketing director'],
  'business analyst': ['senior business analyst', 'product manager', 'operations manager'],
  designer: ['senior designer', 'lead designer', 'design manager', 'ux designer'],
  'project manager': ['senior project manager', 'program manager', 'project director'],
};

// Seniority detection patterns
const SENIORITY_KEYWORDS = {
  entry: [
    'intern',
    'junior',
    'associate',
    'coordinator',
    'trainee',
    'graduate',
    'entry',
    '0-2 years',
  ],
  mid: ['analyst', 'engineer', 'specialist', 'developer', '2-5 years', '3-5 years'],
  senior: ['senior', 'lead', '5+ years', '5-8 years', 'team lead', 'principal'],
  lead: ['staff', 'principal', 'architect', 'team lead', '8+ years', 'technical lead'],
  executive: ['director', 'vp', 'vice president', 'chief', 'head of', 'c-level', '10+ years'],
};

// Technical skills database for keyword extraction
const TECHNICAL_SKILLS = {
  frontend: [
    'react',
    'vue',
    'angular',
    'javascript',
    'typescript',
    'html',
    'css',
    'sass',
    'next.js',
    'nuxt',
  ],
  backend: [
    'node.js',
    'python',
    'java',
    'c#',
    'php',
    'ruby',
    'go',
    'rust',
    'express',
    'django',
    'spring',
  ],
  database: ['mysql', 'postgresql', 'mongodb', 'redis', 'sql', 'nosql', 'oracle', 'sqlite'],
  cloud: ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'ci/cd'],
  mobile: ['react native', 'swift', 'kotlin', 'flutter', 'ios', 'android', 'mobile development'],
  data: ['pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'sql', 'tableau', 'power bi'],
  marketing: ['google analytics', 'sem', 'seo', 'facebook ads', 'marketing automation', 'hubspot'],
  design: ['figma', 'sketch', 'adobe', 'photoshop', 'illustrator', 'ux/ui', 'prototyping'],
};

// Industry classification patterns
const INDUSTRY_INDICATORS = {
  technology: [
    'software',
    'tech',
    'startup',
    'saas',
    'fintech',
    'api',
    'microservices',
    'agile',
    'scrum',
  ],
  healthcare: [
    'medical',
    'healthcare',
    'hospital',
    'patient',
    'clinical',
    'hipaa',
    'pharmaceutical',
  ],
  finance: [
    'banking',
    'financial',
    'investment',
    'trading',
    'fintech',
    'compliance',
    'risk management',
  ],
  marketing: ['marketing', 'advertising', 'brand', 'campaign', 'social media', 'content marketing'],
  consulting: [
    'consulting',
    'strategy',
    'client',
    'stakeholder',
    'business process',
    'transformation',
  ],
  education: [
    'education',
    'teaching',
    'academic',
    'university',
    'student',
    'curriculum',
    'learning',
  ],
};

// Job description templates by role and industry
const JOB_DESCRIPTION_TEMPLATES = {
  'software engineer': {
    technology: `We are seeking a talented Software Engineer to join our dynamic team. The ideal candidate will have strong programming skills, experience with modern development frameworks, and a passion for building scalable applications. You will collaborate with cross-functional teams, contribute to architectural decisions, and help drive technical innovation.

Key responsibilities include developing high-quality code, participating in code reviews, troubleshooting complex technical issues, and mentoring junior developers. Experience with cloud platforms, containerization, and agile methodologies is highly valued.`,

    default:
      'We are looking for a skilled Software Engineer to develop and maintain software applications. The role involves writing clean, efficient code, participating in the full software development lifecycle, and working collaboratively with team members to deliver high-quality solutions.',
  },

  'product manager': {
    technology: `We are hiring a Product Manager to drive product strategy and execution. The ideal candidate will have experience in product development, user research, and cross-functional team leadership. You will be responsible for defining product roadmaps, gathering requirements, and ensuring successful product launches.

Key responsibilities include conducting market research, analyzing user feedback, collaborating with engineering and design teams, and tracking product metrics. Experience with agile methodologies and data-driven decision making is essential.`,

    default:
      'We seek a Product Manager to oversee product development from conception to launch. The role involves strategic planning, stakeholder management, and ensuring products meet market needs and business objectives.',
  },
  // Add more templates as needed
};

/**
 * Analyzes resume text to automatically detect target job information
 */
export async function analyzeResumeIntelligence(resumeText: string): Promise<ResumeIntelligence> {
  const normalizedText = resumeText.toLowerCase();

  // Extract current/recent job titles
  const detectedJobTitles = extractJobTitles(normalizedText);

  // Determine seniority level
  const seniorityLevel = determineSeniorityLevel(normalizedText);

  // Extract technical and domain skills
  const extractedSkills = extractSkills(normalizedText);

  // Classify industry domain
  const industryDomain = classifyIndustry(normalizedText, extractedSkills);

  // Predict target job title based on career progression
  const targetJobPrediction = predictTargetJobTitle(
    detectedJobTitles,
    seniorityLevel,
    extractedSkills
  );

  // Generate appropriate job description
  const jobDescription = generateJobDescription(
    targetJobPrediction.title,
    industryDomain,
    extractedSkills
  );

  // Calculate confidence score
  const confidence = calculateConfidenceScore(
    detectedJobTitles,
    extractedSkills,
    targetJobPrediction,
    industryDomain
  );

  return {
    targetJobTitle: targetJobPrediction.title,
    inferredKeywords: extractedSkills,
    industryDomain,
    seniorityLevel,
    suggestedJobDescription: jobDescription,
    confidence,
    detectionSources: {
      jobTitleSource: targetJobPrediction.source,
      keywordSources: ['technical_skills', 'job_descriptions', 'achievements'],
      industryIndicators: getIndustryIndicators(normalizedText, industryDomain),
    },
  };
}

/**
 * Extract job titles from resume text
 */
function extractJobTitles(text: string): string[] {
  const jobTitlePatterns = [
    // Common job title patterns
    /(?:^|\n|\r)([a-zA-Z\s]+(?:engineer|developer|manager|analyst|designer|coordinator|specialist|director|lead))/gi,
    // Role after "as" or similar
    /(?:work(?:ed|ing)?\s+as|role\s+as|position\s+as|employed\s+as)\s+([a-zA-Z\s]+)/gi,
    // Job title before company or dates
    /([a-zA-Z\s]+(?:engineer|developer|manager|analyst|designer))\s+(?:at|@|\||–|-)/gi,
  ];

  const titles = new Set<string>();

  jobTitlePatterns.forEach((pattern) => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach((match) => {
        const cleaned = match.replace(/^[\n\r\s]+|[\n\r\s]+$/g, '').toLowerCase();
        if (cleaned.length > 3 && cleaned.length < 50) {
          titles.add(cleaned);
        }
      });
    }
  });

  return Array.from(titles);
}

/**
 * Determine seniority level from resume content
 */
function determineSeniorityLevel(text: string): ResumeIntelligence['seniorityLevel'] {
  const seniorityScores = {
    entry: 0,
    mid: 0,
    senior: 0,
    lead: 0,
    executive: 0,
  };

  // Check for seniority keywords
  Object.entries(SENIORITY_KEYWORDS).forEach(([level, keywords]) => {
    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        seniorityScores[level as keyof typeof seniorityScores] += matches.length;
      }
    });
  });

  // Find the level with highest score
  const maxScore = Math.max(...Object.values(seniorityScores));
  const detectedLevel = Object.entries(seniorityScores).find(
    ([_, score]) => score === maxScore
  )?.[0];

  return (detectedLevel as ResumeIntelligence['seniorityLevel']) || 'mid';
}

/**
 * Extract technical and domain skills from resume
 */
function extractSkills(text: string): string[] {
  const skills = new Set<string>();

  // Extract technical skills
  Object.values(TECHNICAL_SKILLS)
    .flat()
    .forEach((skill) => {
      const regex = new RegExp(`\\b${skill.replace('.', '\\.')}\\b`, 'gi');
      if (regex.test(text)) {
        skills.add(skill);
      }
    });

  // Add commonly found skills patterns
  const skillPatterns = [
    /skills?:?\s*([^.\n]+)/gi,
    /technologies?:?\s*([^.\n]+)/gi,
    /tools?:?\s*([^.\n]+)/gi,
  ];

  skillPatterns.forEach((pattern) => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach((match) => {
        // Extract individual skills from comma-separated lists
        const skillList = match.split(/[,;|]/);
        skillList.forEach((skill) => {
          const cleaned = skill.trim().toLowerCase();
          if (cleaned.length > 2 && cleaned.length < 30) {
            skills.add(cleaned);
          }
        });
      });
    }
  });

  return Array.from(skills).slice(0, 20); // Limit to top 20 skills
}

/**
 * Classify industry domain based on content and skills
 */
function classifyIndustry(text: string, skills: string[]): string {
  const industryScores: Record<string, number> = {};

  // Score based on industry indicators in text
  Object.entries(INDUSTRY_INDICATORS).forEach(([industry, indicators]) => {
    let score = 0;
    indicators.forEach((indicator) => {
      const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        score += matches.length;
      }
    });
    industryScores[industry] = score;
  });

  // Boost scores based on technical skills
  if (
    skills.some(
      (skill) =>
        TECHNICAL_SKILLS.frontend.includes(skill) || TECHNICAL_SKILLS.backend.includes(skill)
    )
  ) {
    industryScores['technology'] = (industryScores['technology'] || 0) + 3;
  }

  // Find highest scoring industry
  const maxScore = Math.max(...Object.values(industryScores));
  const detectedIndustry = Object.entries(industryScores).find(
    ([_, score]) => score === maxScore
  )?.[0];

  return detectedIndustry || 'technology'; // Default to technology
}

/**
 * Predict target job title based on current role and career progression patterns
 */
function predictTargetJobTitle(
  currentTitles: string[],
  seniority: string,
  skills: string[]
): { title: string; source: ResumeIntelligence['detectionSources']['jobTitleSource'] } {
  if (currentTitles.length === 0) {
    // Fallback based on skills
    if (skills.some((skill) => TECHNICAL_SKILLS.frontend.includes(skill))) {
      return { title: 'Frontend Developer', source: 'skills_based' };
    }
    if (skills.some((skill) => TECHNICAL_SKILLS.backend.includes(skill))) {
      return { title: 'Backend Developer', source: 'skills_based' };
    }
    return { title: 'Software Engineer', source: 'fallback' };
  }

  // Look for career progression opportunities
  for (const currentTitle of currentTitles) {
    const progressions = CAREER_PROGRESSIONS[currentTitle];
    if (progressions && progressions.length > 0) {
      // Choose progression based on seniority
      if (seniority === 'entry' || seniority === 'mid') {
        return { title: formatJobTitle(progressions[0] || ''), source: 'career_progression' };
      }
      return { title: formatJobTitle(currentTitle), source: 'current_role' };
    }
  }

  // Use most recent/common title
  return { title: formatJobTitle(currentTitles[0] || ''), source: 'current_role' };
}

/**
 * Generate job description based on role and industry
 */
function generateJobDescription(jobTitle: string, industry: string, skills: string[]): string {
  const normalizedTitle = jobTitle.toLowerCase() as keyof typeof JOB_DESCRIPTION_TEMPLATES;

  // Try to find specific template
  const template: { [key: string]: string } | undefined =
    JOB_DESCRIPTION_TEMPLATES[normalizedTitle];
  if (template) {
    return (
      template[industry] ||
      template['default'] ||
      template[Object.keys(template)[0] as keyof typeof template] ||
      ''
    );
  }

  // Generate generic description with skills
  const skillsText = skills.slice(0, 8).join(', ');

  return `We are seeking a qualified ${jobTitle} to join our team. The ideal candidate will have experience with ${skillsText} and a passion for delivering high-quality results. You will work collaboratively with cross-functional teams to drive project success and contribute to our organization's growth.

Key responsibilities include leveraging your technical expertise, participating in strategic planning, and maintaining high standards of work quality. Experience in ${industry} industry is preferred, along with strong problem-solving and communication skills.`;
}

/**
 * Calculate confidence score for the detection results
 */
function calculateConfidenceScore(
  jobTitles: string[],
  skills: string[],
  targetJob: { title: string; source: string },
  _industry: string
): number {
  let confidence = 0.3; // Base confidence

  // Boost confidence based on job title detection
  if (jobTitles.length > 0) confidence += 0.2;
  if (jobTitles.length > 2) confidence += 0.1;

  // Boost confidence based on skill extraction
  if (skills.length > 5) confidence += 0.2;
  if (skills.length > 10) confidence += 0.1;

  // Boost confidence based on detection source
  switch (targetJob.source) {
    case 'current_role':
      confidence += 0.3;
      break;
    case 'career_progression':
      confidence += 0.2;
      break;
    case 'skills_based':
      confidence += 0.1;
      break;
    default:
      confidence += 0.0;
  }

  // Cap at 0.95 to leave room for user verification
  return Math.min(confidence, 0.95);
}

/**
 * Get industry indicators found in text
 */
function getIndustryIndicators(text: string, industry: string): string[] {
  const indicators = (INDUSTRY_INDICATORS as Record<string, string[]>)[industry] || [];
  return indicators.filter((indicator: string) => {
    const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
    return regex.test(text);
  });
}

/**
 * Format job title with proper capitalization
 */
function formatJobTitle(title: string): string {
  return title
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
