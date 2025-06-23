/**
 * Resume Optimizer Service
 * Handles API calls and business logic for the resume optimization feature
 */

import type {
  ApiResponse,
  ExportOptions,
  ExportResult,
  FileValidationResult,
  ResumeAnalysisRequest,
  ResumeAnalysisResponse,
  ResumeTemplate,
  UserProfileData,
} from '@/lib/types/resume-optimizer';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * Validates uploaded file for resume processing
 */
export const validateResumeFile = (file: File): FileValidationResult => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please upload a PDF or DOCX file only.',
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 10MB.',
    };
  }

  if (file.size === 0) {
    return {
      isValid: false,
      error: 'The selected file appears to be empty.',
    };
  }

  return { isValid: true };
};

/**
 * Extracts text content from uploaded resume file
 */
export const extractTextFromFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/resume-optimizer/extract-text`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to extract text: ${response.statusText}`);
    }

    const result: ApiResponse<{ text: string }> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to extract text from file');
    }

    return result.data.text;
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error('Failed to process the uploaded file. Please try again.');
  }
};

/**
 * Maps onboarding profile data to resume optimizer format
 */
const mapOnboardingProfileToResumeProfile = (onboardingProfile: any): UserProfileData | null => {
  if (!onboardingProfile) return null;

  // Extract basic info
  const name = onboardingProfile.displayName || onboardingProfile.name || 'User';
  const email = onboardingProfile.email || '';
  const phone = onboardingProfile.phone || '';
  
  // Map profile data from onboarding system
  const profileData: UserProfileData = {
    name,
    email,
    phone,
    location: onboardingProfile.profileLocationPreference || '',
    summary: onboardingProfile.profileExperienceSummary || onboardingProfile.profileHeadline || '',
    skills: onboardingProfile.profileSkills ? onboardingProfile.profileSkills.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
    experience: [],
    education: [],
  };

  // Add LinkedIn if available
  if (onboardingProfile.linkedinUrl) {
    profileData.linkedinUrl = onboardingProfile.linkedinUrl;
  }

  // Create a basic experience entry from onboarding data
  if (onboardingProfile.profileExperienceSummary && onboardingProfile.profileWorkExperienceLevel) {
    profileData.experience.push({
      title: onboardingProfile.profileHeadline || 'Professional',
      company: 'Previous Experience',
      duration: onboardingProfile.profileWorkExperienceLevel,
      description: onboardingProfile.profileExperienceSummary,
      achievements: [],
      technologies: profileData.skills.slice(0, 5), // Use first 5 skills as technologies
    });
  }

  // Create a basic education entry
  if (onboardingProfile.profileEducationLevel) {
    profileData.education.push({
      degree: onboardingProfile.profileEducationLevel.replace('_', ' '),
      school: 'Educational Institution',
      year: new Date().getFullYear().toString(),
    });
  }

  return profileData;
};

/**
 * Fetches user profile data for resume import
 */
export const fetchUserProfile = async (userId?: string): Promise<UserProfileData | null> => {
  try {
    // First try to get from the backend user profile API
    const backendUrl = `${process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000'}/api/users/profile`;
    
    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
    });

    if (backendResponse.ok) {
      const backendResult = await backendResponse.json();
      if (backendResult.success && backendResult.data) {
        // Map the onboarding profile data to resume optimizer format
        const mappedProfile = mapOnboardingProfileToResumeProfile(backendResult.data);
        if (mappedProfile) {
          return mappedProfile;
        }
      }
    }

    // Fallback to the original API endpoint
    const url = userId ? `${API_BASE_URL}/user/profile/${userId}` : `${API_BASE_URL}/user/profile`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // No profile found
      }
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    const result: ApiResponse<UserProfileData> = await response.json();

    if (!result.success || !result.data) {
      return null;
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    
    // For development/demo purposes, return mock data if API fails
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock profile data for development');
      return getMockProfileData();
    }
    
    throw new Error('Failed to load profile data. Please try again.');
  }
};

/**
 * Returns mock profile data for development/demo purposes
 */
const getMockProfileData = (): UserProfileData => {
  return {
    name: 'Jane Smith',
    email: 'jane.smith@email.com',
    phone: '(555) 987-6543',
    location: 'San Francisco, CA',
    linkedinUrl: 'https://linkedin.com/in/janesmith',
    summary: 'Results-driven product manager with 5+ years of experience leading cross-functional teams to deliver innovative products. Proven track record of driving user growth, increasing revenue, and improving customer satisfaction through data-driven decision making.',
    experience: [
      {
        title: 'Senior Product Manager',
        company: 'Tech Innovations Inc.',
        duration: '2021-2023',
        startDate: '2021-03',
        endDate: '2023-12',
        description: 'Led product strategy and development for B2B SaaS platform serving 50,000+ users.',
        achievements: [
          'Increased user engagement by 65% through feature optimization and A/B testing',
          'Drove 40% revenue growth by launching 3 major product features',
          'Managed cross-functional teams of 12+ members across engineering, design, and marketing',
          'Reduced customer churn by 25% through improved onboarding experience'
        ],
        technologies: ['Product Analytics', 'A/B Testing', 'Agile', 'Scrum', 'SQL', 'Tableau']
      },
      {
        title: 'Product Manager',
        company: 'Digital Solutions Co.',
        duration: '2019-2021',
        startDate: '2019-06',
        endDate: '2021-02',
        description: 'Developed product roadmaps and managed feature releases for mobile application with 100K+ downloads.',
        achievements: [
          'Launched mobile app that achieved 100K+ downloads in first 6 months',
          'Improved app store rating from 3.2 to 4.6 stars through user feedback implementation',
          'Collaborated with engineering and design teams to deliver 15+ feature releases',
          'Conducted user research with 200+ customers to inform product decisions'
        ],
        technologies: ['Mobile Development', 'User Research', 'Wireframing', 'Product Roadmapping']
      },
      {
        title: 'Associate Product Manager',
        company: 'StartupXYZ',
        duration: '2018-2019',
        startDate: '2018-01',
        endDate: '2019-05',
        description: 'Supported product development initiatives and conducted market research for early-stage fintech startup.',
        achievements: [
          'Assisted in product launch that acquired 5,000 beta users in 3 months',
          'Performed competitive analysis across 20+ fintech companies',
          'Created product documentation and user stories for development team'
        ],
        technologies: ['Market Research', 'Competitive Analysis', 'User Stories', 'Product Documentation']
      }
    ],
    education: [
      {
        degree: 'Master of Business Administration (MBA)',
        school: 'Stanford Graduate School of Business',
        year: '2018',
        gpa: '3.8',
        honors: 'Dean\'s List',
        relevantCourses: ['Product Management', 'Data Analytics', 'Strategic Marketing', 'Operations Management']
      },
      {
        degree: 'Bachelor of Science in Computer Science',
        school: 'University of California, Berkeley',
        year: '2016',
        gpa: '3.7',
        honors: 'Magna Cum Laude',
        relevantCourses: ['Software Engineering', 'Database Systems', 'Human-Computer Interaction', 'Statistics']
      }
    ],
    skills: [
      'Product Management',
      'Product Strategy',
      'Agile/Scrum',
      'Data Analysis',
      'User Research',
      'A/B Testing',
      'SQL',
      'Tableau',
      'Google Analytics',
      'Wireframing',
      'Product Roadmapping',
      'Cross-functional Leadership',
      'Market Research',
      'Competitive Analysis',
      'User Experience (UX)',
      'Project Management',
      'Stakeholder Management'
    ],
    certifications: [
      {
        name: 'Certified Scrum Product Owner (CSPO)',
        issuer: 'Scrum Alliance',
        date: '2020-03',
        credentialId: 'CSPO-123456'
      },
      {
        name: 'Google Analytics Certified',
        issuer: 'Google',
        date: '2021-01',
        expiryDate: '2024-01'
      }
    ],
    projects: [
      {
        name: 'Customer Analytics Dashboard',
        description: 'Built comprehensive analytics dashboard to track user behavior and product metrics',
        technologies: ['Tableau', 'SQL', 'Python', 'Google Analytics'],
        duration: '3 months',
        role: 'Product Lead'
      },
      {
        name: 'Mobile App Redesign',
        description: 'Led complete redesign of mobile application resulting in 40% increase in user engagement',
        technologies: ['Figma', 'User Research', 'A/B Testing', 'React Native'],
        duration: '6 months',
        role: 'Product Manager'
      }
    ],
    languages: [
      {
        language: 'English',
        proficiency: 'native'
      },
      {
        language: 'Spanish',
        proficiency: 'conversational'
      }
    ]
  };
};

/**
 * Fetches available resume templates
 */
export const fetchResumeTemplates = async (): Promise<ResumeTemplate[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/resume-optimizer/templates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch templates: ${response.statusText}`);
    }

    const result: ApiResponse<ResumeTemplate[]> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to load templates');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching resume templates:', error);
    // Return default templates as fallback
    return getDefaultTemplates();
  }
};

/**
 * Submits resume for AI analysis
 */
export const analyzeResume = async (
  request: ResumeAnalysisRequest
): Promise<ResumeAnalysisResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/resume-optimizer/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.statusText}`);
    }

    const result: ApiResponse<ResumeAnalysisResponse> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to analyze resume');
    }

    return result.data;
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw new Error('Failed to analyze resume. Please try again.');
  }
};

/**
 * Re-analyzes resume with updated content
 */
export const reanalyzeResume = async (
  resumeText: string,
  originalAnalysisId: string,
  targetJob: ResumeAnalysisRequest['targetJob']
): Promise<ResumeAnalysisResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/resume-optimizer/reanalyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText,
        originalAnalysisId,
        targetJob,
      }),
    });

    if (!response.ok) {
      throw new Error(`Re-analysis failed: ${response.statusText}`);
    }

    const result: ApiResponse<ResumeAnalysisResponse> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to re-analyze resume');
    }

    return result.data;
  } catch (error) {
    console.error('Error re-analyzing resume:', error);
    throw new Error('Failed to re-analyze resume. Please try again.');
  }
};

/**
 * Exports optimized resume in specified format
 */
export const exportResume = async (
  resumeText: string,
  options: ExportOptions
): Promise<ExportResult> => {
  try {
    const response = await fetch(`${API_BASE_URL}/resume-optimizer/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText,
        ...options,
      }),
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    const result: ApiResponse<ExportResult> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to export resume');
    }

    return result.data;
  } catch (error) {
    console.error('Error exporting resume:', error);
    return {
      success: false,
      error: 'Failed to export resume. Please try again.',
    };
  }
};

/**
 * Saves analysis results for future reference
 */
export const saveAnalysisResult = async (
  analysisResult: ResumeAnalysisResponse,
  userId?: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/resume-optimizer/save-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        analysisResult,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save analysis: ${response.statusText}`);
    }

    const result: ApiResponse<{ saved: boolean }> = await response.json();
    return result.success && result.data?.saved === true;
  } catch (error) {
    console.error('Error saving analysis result:', error);
    return false;
  }
};

/**
 * Generates resume text from profile data
 */
export const generateResumeFromProfile = (profileData: UserProfileData): string => {
  let resumeText = `${profileData.name}\n`;

  // Contact Information
  const contactInfo = [];
  if (profileData.email) contactInfo.push(`Email: ${profileData.email}`);
  if (profileData.phone) contactInfo.push(`Phone: ${profileData.phone}`);
  if (profileData.location) contactInfo.push(`Location: ${profileData.location}`);
  if (profileData.linkedinUrl) contactInfo.push(`LinkedIn: ${profileData.linkedinUrl}`);
  if (profileData.githubUrl) contactInfo.push(`GitHub: ${profileData.githubUrl}`);
  if (profileData.portfolioUrl) contactInfo.push(`Portfolio: ${profileData.portfolioUrl}`);

  if (contactInfo.length > 0) {
    resumeText += contactInfo.join(' | ') + '\n\n';
  }

  // Professional Summary
  if (profileData.summary) {
    resumeText += 'PROFESSIONAL SUMMARY\n';
    resumeText += `${profileData.summary}\n\n`;
  }

  // Professional Experience
  if (profileData.experience.length > 0) {
    resumeText += 'PROFESSIONAL EXPERIENCE\n\n';
    profileData.experience.forEach((exp, index) => {
      resumeText += `${exp.title} | ${exp.company} | ${exp.duration}\n`;
      if (exp.location) resumeText += `${exp.location}\n`;
      resumeText += `${exp.description}\n`;
      
      if (exp.achievements && exp.achievements.length > 0) {
        exp.achievements.forEach((achievement) => {
          resumeText += `• ${achievement}\n`;
        });
      }
      
      if (exp.technologies && exp.technologies.length > 0) {
        resumeText += `Technologies: ${exp.technologies.join(', ')}\n`;
      }
      
      if (index < profileData.experience.length - 1) {
        resumeText += '\n';
      }
    });
    resumeText += '\n';
  }

  // Projects (if available)
  if (profileData.projects && profileData.projects.length > 0) {
    resumeText += 'KEY PROJECTS\n\n';
    profileData.projects.forEach((project, index) => {
      resumeText += `${project.name}`;
      if (project.role) resumeText += ` | ${project.role}`;
      if (project.duration) resumeText += ` | ${project.duration}`;
      resumeText += '\n';
      
      resumeText += `${project.description}\n`;
      
      if (project.technologies && project.technologies.length > 0) {
        resumeText += `Technologies: ${project.technologies.join(', ')}\n`;
      }
      
      if (project.url) {
        resumeText += `URL: ${project.url}\n`;
      }
      
      if (index < profileData.projects.length - 1) {
        resumeText += '\n';
      }
    });
    resumeText += '\n';
  }

  // Education
  if (profileData.education.length > 0) {
    resumeText += 'EDUCATION\n\n';
    profileData.education.forEach((edu, index) => {
      resumeText += `${edu.degree} | ${edu.school} | ${edu.year}\n`;
      if (edu.location) resumeText += `${edu.location}\n`;
      if (edu.gpa) resumeText += `GPA: ${edu.gpa}\n`;
      if (edu.honors) resumeText += `Honors: ${edu.honors}\n`;
      if (edu.relevantCourses && edu.relevantCourses.length > 0) {
        resumeText += `Relevant Coursework: ${edu.relevantCourses.join(', ')}\n`;
      }
      
      if (index < profileData.education.length - 1) {
        resumeText += '\n';
      }
    });
    resumeText += '\n';
  }

  // Certifications (if available)
  if (profileData.certifications && profileData.certifications.length > 0) {
    resumeText += 'CERTIFICATIONS\n\n';
    profileData.certifications.forEach((cert, index) => {
      resumeText += `${cert.name} | ${cert.issuer} | ${cert.date}\n`;
      if (cert.credentialId) resumeText += `Credential ID: ${cert.credentialId}\n`;
      if (cert.expiryDate) resumeText += `Expires: ${cert.expiryDate}\n`;
      
      if (index < profileData.certifications.length - 1) {
        resumeText += '\n';
      }
    });
    resumeText += '\n';
  }

  // Skills
  if (profileData.skills.length > 0) {
    resumeText += 'TECHNICAL SKILLS\n';
    resumeText += profileData.skills.join(' • ') + '\n\n';
  }

  // Languages (if available)
  if (profileData.languages && profileData.languages.length > 0) {
    resumeText += 'LANGUAGES\n';
    const languageStrings = profileData.languages.map(lang => 
      `${lang.language} (${lang.proficiency.charAt(0).toUpperCase() + lang.proficiency.slice(1)})`
    );
    resumeText += languageStrings.join(' • ');
  }

  return resumeText.trim();
};

/**
 * Returns default resume templates as fallback
 */
const getDefaultTemplates = (): ResumeTemplate[] => {
  return [
    {
      id: 'software-engineer',
      name: 'Software Engineer',
      description: 'Perfect for developers and technical roles',
      category: 'tech',
      content: `[Your Name]
[Your Email] | [Your Phone] | [Your Location]
[LinkedIn Profile] | [GitHub Profile]

PROFESSIONAL SUMMARY
Experienced software engineer with [X] years of experience in developing scalable web applications and systems. Proficient in modern programming languages and frameworks with a strong focus on clean code and best practices.

TECHNICAL SKILLS
• Programming Languages: JavaScript, TypeScript, Python, Java, C++
• Frontend: React, Vue.js, Angular, HTML5, CSS3, Tailwind CSS
• Backend: Node.js, Express, Django, Spring Boot, FastAPI
• Databases: PostgreSQL, MongoDB, MySQL, Redis
• Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD, Jenkins
• Tools: Git, Jest, Webpack, VS Code, Postman

PROFESSIONAL EXPERIENCE

Senior Software Engineer | [Company Name] | [Start Date] - Present
• Developed and maintained web applications serving [X] users
• Led technical architecture decisions for [specific project]
• Improved application performance by [X]% through optimization
• Mentored junior developers and conducted code reviews
• Collaborated with cross-functional teams to deliver features on time

Software Engineer | [Previous Company] | [Start Date] - [End Date]
• Built responsive web interfaces using React and modern JavaScript
• Implemented RESTful APIs and microservices architecture
• Wrote comprehensive unit and integration tests
• Participated in agile development processes and sprint planning

EDUCATION
Bachelor of Science in Computer Science | [University Name] | [Year]

PROJECTS
[Project Name] | [Technologies Used]
• Brief description of the project and your role
• Key achievements and impact

CERTIFICATIONS
• [Relevant certification name] | [Year]`,
      tags: ['React', 'Node.js', 'JavaScript', 'Full Stack', 'API Development'],
    },
    {
      id: 'product-manager',
      name: 'Product Manager',
      description: 'Ideal for product management and strategy roles',
      category: 'business',
      content: `[Your Name]
[Your Email] | [Your Phone] | [Your Location]
[LinkedIn Profile]

PROFESSIONAL SUMMARY
Results-driven product manager with [X] years of experience leading cross-functional teams to deliver innovative products. Proven track record of driving user growth, increasing revenue, and improving customer satisfaction through data-driven decision making.

CORE COMPETENCIES
• Product Strategy & Roadmap Planning
• User Research & Market Analysis
• Agile/Scrum Methodologies
• Data Analysis & A/B Testing
• Stakeholder Management
• Go-to-Market Strategy
• UX/UI Collaboration
• Technical Product Management

PROFESSIONAL EXPERIENCE

Senior Product Manager | [Company Name] | [Start Date] - Present
• Led product strategy for [product/feature] serving [X] users
• Increased user engagement by [X]% through feature optimization
• Managed product roadmap and prioritized features based on user feedback
• Collaborated with engineering, design, and marketing teams
• Conducted user research and analyzed product metrics

Product Manager | [Previous Company] | [Start Date] - [End Date]
• Launched [X] new features resulting in [X]% increase in user adoption
• Defined product requirements and user stories for development team
• Performed competitive analysis and market research
• Managed product backlog and sprint planning sessions

EDUCATION
Master of Business Administration (MBA) | [University Name] | [Year]
Bachelor of Science in [Field] | [University Name] | [Year]

KEY ACHIEVEMENTS
• Launched [product/feature] that generated $[X] in revenue
• Improved customer satisfaction score from [X] to [X]
• Led successful product pivot that increased market share by [X]%

CERTIFICATIONS
• Certified Scrum Product Owner (CSPO) | [Year]
• Google Analytics Certified | [Year]`,
      tags: ['Product Strategy', 'Agile', 'User Research', 'Analytics', 'Roadmapping'],
    },
    {
      id: 'marketing-specialist',
      name: 'Marketing Specialist',
      description: 'Great for marketing and communications roles',
      category: 'business',
      content: `[Your Name]
[Your Email] | [Your Phone] | [Your Location]
[LinkedIn Profile] | [Portfolio Website]

PROFESSIONAL SUMMARY
Creative and analytical marketing professional with [X] years of experience developing and executing successful marketing campaigns. Expertise in digital marketing, content creation, and brand management with a proven track record of driving engagement and conversions.

MARKETING SKILLS
• Digital Marketing Strategy
• Content Marketing & SEO
• Social Media Management
• Email Marketing Campaigns
• Google Ads & Facebook Ads
• Marketing Analytics & Reporting
• Brand Management
• Event Planning & Execution

PROFESSIONAL EXPERIENCE

Marketing Specialist | [Company Name] | [Start Date] - Present
• Developed and executed marketing campaigns that increased brand awareness by [X]%
• Managed social media accounts with [X] followers across platforms
• Created content that generated [X] leads per month
• Analyzed campaign performance and optimized for better ROI
• Collaborated with sales team to align marketing and sales strategies

Marketing Coordinator | [Previous Company] | [Start Date] - [End Date]
• Assisted in planning and executing marketing events and trade shows
• Created marketing materials including brochures, presentations, and web content
• Managed email marketing campaigns with [X]% open rate
• Conducted market research and competitor analysis

EDUCATION
Bachelor of Arts in Marketing | [University Name] | [Year]

ACHIEVEMENTS
• Increased website traffic by [X]% through SEO optimization
• Generated [X] qualified leads through content marketing
• Improved email campaign performance by [X]%

TOOLS & PLATFORMS
• Google Analytics, Google Ads, Facebook Business Manager
• HubSpot, Mailchimp, Hootsuite
• Adobe Creative Suite, Canva
• WordPress, HTML/CSS basics`,
      tags: ['Digital Marketing', 'SEO', 'Social Media', 'Content Marketing', 'Analytics'],
    },
    {
      id: 'data-scientist',
      name: 'Data Scientist',
      description: 'Specialized for data science and analytics roles',
      category: 'tech',
      content: `[Your Name]
[Your Email] | [Your Phone] | [Your Location]
[LinkedIn Profile] | [GitHub Profile]

PROFESSIONAL SUMMARY
Data scientist with [X] years of experience in machine learning, statistical analysis, and data visualization. Proven ability to extract actionable insights from complex datasets and drive business decisions through data-driven solutions.

TECHNICAL SKILLS
• Programming: Python, R, SQL, Scala, Java
• Machine Learning: Scikit-learn, TensorFlow, PyTorch, Keras
• Data Analysis: Pandas, NumPy, SciPy, Matplotlib, Seaborn
• Big Data: Spark, Hadoop, Kafka, Airflow
• Databases: PostgreSQL, MongoDB, Cassandra, Snowflake
• Cloud Platforms: AWS, GCP, Azure
• Visualization: Tableau, Power BI, Plotly, D3.js

PROFESSIONAL EXPERIENCE

Senior Data Scientist | [Company Name] | [Start Date] - Present
• Developed machine learning models that improved [metric] by [X]%
• Built predictive analytics solutions for [business area]
• Collaborated with product and engineering teams to implement ML solutions
• Mentored junior data scientists and established best practices

Data Scientist | [Previous Company] | [Start Date] - [End Date]
• Analyzed large datasets to identify trends and business opportunities
• Created automated reporting dashboards for stakeholders
• Implemented A/B testing frameworks for product optimization
• Presented findings to executive leadership and cross-functional teams

EDUCATION
Master of Science in Data Science | [University Name] | [Year]
Bachelor of Science in [Field] | [University Name] | [Year]

KEY PROJECTS
[Project Name] | [Technologies Used]
• Description of the project and business impact
• Quantifiable results and achievements

CERTIFICATIONS
• AWS Certified Machine Learning - Specialty | [Year]
• Google Cloud Professional Data Engineer | [Year]`,
      tags: ['Python', 'Machine Learning', 'SQL', 'Statistics', 'Big Data'],
    },
    {
      id: 'ux-designer',
      name: 'UX/UI Designer',
      description: 'Perfect for user experience and interface design roles',
      category: 'creative',
      content: `[Your Name]
[Your Email] | [Your Phone] | [Your Location]
[LinkedIn Profile] | [Portfolio Website]

PROFESSIONAL SUMMARY
Creative UX/UI designer with [X] years of experience creating user-centered digital experiences. Passionate about solving complex problems through intuitive design and improving user satisfaction through research-driven design decisions.

DESIGN SKILLS
• User Experience (UX) Design
• User Interface (UI) Design
• User Research & Testing
• Information Architecture
• Interaction Design
• Prototyping & Wireframing
• Design Systems
• Accessibility Design

TOOLS & SOFTWARE
• Design: Figma, Sketch, Adobe XD, Adobe Creative Suite
• Prototyping: InVision, Principle, Framer
• Research: Miro, Optimal Workshop, UserTesting
• Development: HTML, CSS, JavaScript (basic)

PROFESSIONAL EXPERIENCE

Senior UX/UI Designer | [Company Name] | [Start Date] - Present
• Led design for [product/feature] used by [X] users
• Conducted user research and usability testing to inform design decisions
• Created and maintained design system for consistent user experience
• Collaborated with product managers and developers to implement designs
• Improved user satisfaction scores by [X]% through design optimization

UX/UI Designer | [Previous Company] | [Start Date] - [End Date]
• Designed mobile and web interfaces for [type of application]
• Created wireframes, prototypes, and high-fidelity mockups
• Conducted user interviews and analyzed user behavior data
• Participated in design sprints and cross-functional collaboration

EDUCATION
Bachelor of Fine Arts in Graphic Design | [University Name] | [Year]

KEY PROJECTS
[Project Name] | [Platform/Type]
• Brief description of the project and your role
• Impact on user experience and business metrics

CERTIFICATIONS
• Google UX Design Certificate | [Year]
• Nielsen Norman Group UX Certification | [Year]`,
      tags: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Usability Testing'],
    },
    {
      id: 'general-professional',
      name: 'General Professional',
      description: 'Versatile template for various professional roles',
      category: 'general',
      content: `[Your Name]
[Your Email] | [Your Phone] | [Your Location]
[LinkedIn Profile]

PROFESSIONAL SUMMARY
Dedicated professional with [X] years of experience in [your field/industry]. Strong background in [key skills/areas] with a proven ability to [key achievement/strength]. Seeking to leverage expertise in [relevant area] to contribute to [type of organization/role].

CORE SKILLS
• [Skill 1]
• [Skill 2]
• [Skill 3]
• [Skill 4]
• [Skill 5]
• [Skill 6]

PROFESSIONAL EXPERIENCE

[Job Title] | [Company Name] | [Start Date] - Present
• [Achievement or responsibility with quantifiable result]
• [Achievement or responsibility with quantifiable result]
• [Achievement or responsibility with quantifiable result]
• [Achievement or responsibility with quantifiable result]

[Previous Job Title] | [Previous Company] | [Start Date] - [End Date]
• [Achievement or responsibility with quantifiable result]
• [Achievement or responsibility with quantifiable result]
• [Achievement or responsibility with quantifiable result]

EDUCATION
[Degree] in [Field of Study] | [University Name] | [Year]

ADDITIONAL QUALIFICATIONS
• [Certification or additional qualification]
• [Language proficiency]
• [Volunteer experience or relevant activity]

ACHIEVEMENTS
• [Specific achievement with measurable impact]
• [Recognition or award received]
• [Process improvement or cost savings implemented]`,
      tags: ['Professional', 'Versatile', 'Adaptable', 'General Purpose'],
    },
  ];
};

/**
 * Utility function to format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Utility function to generate a descriptive filename
 */
export const generateFileName = (
  baseName: string,
  format: ExportOptions['format'],
  timestamp?: string
): string => {
  const cleanBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
  const dateStr = timestamp
    ? new Date(timestamp).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  return `${cleanBaseName}_optimized_${dateStr}.${format}`;
};
