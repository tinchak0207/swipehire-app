/**
 * Resume Analyzer Service
 * Provides functionality to analyze resumes and extract relevant information
 */

export const analyzeResume = async (payload, nodeData) => {
  try {
    // Extract resume content from payload
    const resumeContent = payload.resume_content || payload.resume || '';
    
    if (!resumeContent) {
      throw new Error('No resume content provided for analysis');
    }

    // Basic resume analysis logic
    const analysis = {
      skills: extractSkills(resumeContent),
      experience_years: extractExperienceYears(resumeContent),
      education: extractEducation(resumeContent),
      contact_info: extractContactInfo(resumeContent),
      match_score: calculateMatchScore(resumeContent, nodeData.job_requirements || []),
      summary: generateSummary(resumeContent)
    };

    return {
      ...payload,
      resume_analysis: analysis,
      match_score: analysis.match_score
    };
  } catch (error) {
    console.error('Resume analysis failed:', error);
    return {
      ...payload,
      resume_analysis: null,
      match_score: 0,
      analysis_error: error.message
    };
  }
};

const extractSkills = (resumeContent) => {
  // Simple skill extraction - in production, this would use NLP
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'HTML', 'CSS',
    'TypeScript', 'Angular', 'Vue.js', 'Docker', 'Kubernetes', 'AWS', 'Azure',
    'Git', 'MongoDB', 'PostgreSQL', 'Redis', 'GraphQL', 'REST API'
  ];
  
  const foundSkills = commonSkills.filter(skill => 
    resumeContent.toLowerCase().includes(skill.toLowerCase())
  );
  
  return foundSkills;
};

const extractExperienceYears = (resumeContent) => {
  // Simple regex to find experience mentions
  const experiencePatterns = [
    /(\d+)\+?\s*years?\s*of\s*experience/i,
    /(\d+)\+?\s*years?\s*experience/i,
    /experience\s*:\s*(\d+)\+?\s*years?/i
  ];
  
  for (const pattern of experiencePatterns) {
    const match = resumeContent.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }
  
  return 0;
};

const extractEducation = (resumeContent) => {
  const educationKeywords = [
    'Bachelor', 'Master', 'PhD', 'Doctorate', 'Associate',
    'Computer Science', 'Engineering', 'Mathematics', 'Physics'
  ];
  
  const foundEducation = educationKeywords.filter(keyword =>
    resumeContent.toLowerCase().includes(keyword.toLowerCase())
  );
  
  return foundEducation;
};

const extractContactInfo = (resumeContent) => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  
  const emails = resumeContent.match(emailRegex) || [];
  const phones = resumeContent.match(phoneRegex) || [];
  
  return {
    emails: emails.slice(0, 2), // Limit to first 2 emails
    phones: phones.slice(0, 2)  // Limit to first 2 phone numbers
  };
};

const calculateMatchScore = (resumeContent, jobRequirements) => {
  if (!jobRequirements || jobRequirements.length === 0) {
    return 50; // Default score when no requirements specified
  }
  
  const content = resumeContent.toLowerCase();
  let matchCount = 0;
  
  jobRequirements.forEach(requirement => {
    if (content.includes(requirement.toLowerCase())) {
      matchCount++;
    }
  });
  
  const score = Math.round((matchCount / jobRequirements.length) * 100);
  return Math.min(score, 100);
};

const generateSummary = (resumeContent) => {
  // Simple summary generation - in production, this would use AI
  const sentences = resumeContent.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const firstFewSentences = sentences.slice(0, 3).join('. ');
  
  return firstFewSentences.length > 200 
    ? firstFewSentences.substring(0, 200) + '...'
    : firstFewSentences;
};