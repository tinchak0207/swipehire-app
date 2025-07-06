import type {
  ActionStep,
  CandidateProfileForAI,
  CareerChatMessage,
  CareerReminder,
  CareerReport,
  Goal,
  SkillAssessment,
} from '../lib/types';

interface CareerRecommendation {
  careerStage: string;
  careerPaths: {
    title: string;
    description: string;
    requiredSkills: string[];
    growthPotential: number;
    salaryRange: string;
    educationRequirements: string[];
  }[];
}

export async function getCareerRecommendations(
  _profile: CandidateProfileForAI
): Promise<CareerRecommendation> {
  // TODO: Implement actual API call to AI service
  // For now returning mock data based on profile
  const mockStages = ['exploration', 'early', 'mid', 'late', 'transition'];
  const randomStage = mockStages[Math.floor(Math.random() * mockStages.length)] || 'exploration';

  return {
    careerStage: randomStage,
    careerPaths: [
      {
        title: 'Senior Software Engineer',
        description:
          'Technical leadership role focusing on complex system design and mentoring junior developers',
        requiredSkills: ['TypeScript', 'System Design', 'Mentoring', 'Cloud Architecture'],
        growthPotential: 8,
        salaryRange: '$100k-$160k',
        educationRequirements: ['Bachelor in CS or equivalent experience'],
      },
      {
        title: 'Engineering Manager',
        description:
          'Lead engineering teams and drive technical strategy while managing people and projects',
        requiredSkills: ['Leadership', 'Project Management', 'Communication', 'Technical Strategy'],
        growthPotential: 9,
        salaryRange: '$120k-$180k',
        educationRequirements: ['Technical degree preferred', 'Management experience'],
      },
      {
        title: 'Technical Product Manager',
        description:
          'Bridge between engineering and product teams to deliver user-focused solutions',
        requiredSkills: ['Product Strategy', 'Technical Understanding', 'Agile', 'User Research'],
        growthPotential: 7.5,
        salaryRange: '$110k-$160k',
        educationRequirements: ['Business or Technical degree'],
      },
    ],
  };
}

export async function sendCareerChatMessage(
  message: string,
  _context: {
    profile?: CandidateProfileForAI;
    goals?: Goal[];
    currentStage?: string;
  }
): Promise<CareerChatMessage> {
  // TODO: Implement actual AI chat API
  // Mock AI responses based on message content
  const responses = {
    'what should i do':
      'Based on your profile, I recommend focusing on developing your leadership skills and exploring senior technical roles. Consider taking on mentoring responsibilities and learning system design.',
    'how to improve':
      'Here are some specific steps: 1) Complete a system design course, 2) Start mentoring junior developers, 3) Lead a technical project, 4) Build your network in the industry.',
    'career path':
      'Your career path looks promising! You have strong technical skills. Consider these next steps: Senior Engineer → Tech Lead → Engineering Manager or Staff Engineer.',
    'skills to learn':
      'Based on market trends, focus on: Cloud Architecture (AWS/Azure), System Design, Leadership & Communication, and emerging technologies like AI/ML.',
    'salary negotiation':
      'For your experience level, research shows salaries range from $100k-$160k. Prepare by documenting your achievements, researching market rates, and practicing negotiation scenarios.',
    'work life balance':
      'Maintaining work-life balance is crucial for long-term success. Set boundaries, prioritize tasks, and consider companies with strong culture values that align with yours.',
  };

  const lowerMessage = message.toLowerCase();
  let response =
    'I understand your question. Let me provide some personalized guidance based on your profile and goals.';

  for (const [key, value] of Object.entries(responses)) {
    if (lowerMessage.includes(key)) {
      response = value;
      break;
    }
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    id: Date.now().toString(),
    role: 'assistant',
    content: response,
    timestamp: new Date().toISOString(),
    type: 'text',
  };
}

export async function generateActionPlan(_goal: Goal): Promise<ActionStep[]> {
  // TODO: Implement AI-powered action plan generation
  const mockActionSteps: ActionStep[] = [
    {
      id: 1,
      description: 'Research industry trends and requirements',
      completed: false,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      resources: ['Industry reports', 'LinkedIn Learning courses'],
      estimatedHours: 5,
    },
    {
      id: 2,
      description: 'Identify skill gaps and create learning plan',
      completed: false,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      resources: ['Skill assessment tools', 'Online courses'],
      estimatedHours: 8,
    },
    {
      id: 3,
      description: 'Network with professionals in target role',
      completed: false,
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      resources: ['LinkedIn', 'Professional meetups', 'Industry conferences'],
      estimatedHours: 10,
    },
  ];

  return mockActionSteps;
}

export async function generateCareerReport(
  type: 'skills' | 'progress' | 'market' | 'goals',
  _data: any
): Promise<CareerReport> {
  // TODO: Implement AI-powered report generation
  const mockReport: CareerReport = {
    id: Date.now().toString(),
    title: `${type.charAt(0).toUpperCase() + type.slice(1)} Analysis Report`,
    type,
    generatedAt: new Date().toISOString(),
    data: {
      insights: [
        'Your technical skills are well-aligned with market demands',
        'Consider developing leadership skills for career advancement',
        'Your goal completion rate is above average at 75%',
      ],
      recommendations: [
        'Focus on system design and architecture skills',
        'Seek mentoring opportunities to develop leadership',
        'Consider pursuing cloud certifications',
      ],
      metrics: {
        skillsGrowth: 85,
        goalCompletion: 75,
        marketAlignment: 90,
        careerProgress: 80,
      },
    },
  };

  return mockReport;
}

export async function getCareerReminders(): Promise<CareerReminder[]> {
  // TODO: Implement actual reminder system
  return [
    {
      id: '1',
      title: 'Weekly Goal Review',
      description: 'Review your progress on current goals and update status',
      type: 'goal_check',
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      recurring: true,
      frequency: 'weekly',
      completed: false,
    },
    {
      id: '2',
      title: 'Update Skills Assessment',
      description: 'Review and update your skill levels based on recent learning',
      type: 'skill_update',
      scheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      recurring: true,
      frequency: 'monthly',
      completed: false,
    },
  ];
}

export async function getSkillAssessments(): Promise<SkillAssessment[]> {
  // TODO: Implement actual skill tracking
  return [
    {
      skill: 'TypeScript',
      currentLevel: 7,
      targetLevel: 9,
      lastUpdated: new Date().toISOString(),
      resources: ['TypeScript Handbook', 'Advanced TypeScript Course'],
      marketDemand: 'high',
    },
    {
      skill: 'System Design',
      currentLevel: 5,
      targetLevel: 8,
      lastUpdated: new Date().toISOString(),
      resources: ['System Design Interview', 'Designing Data-Intensive Applications'],
      marketDemand: 'high',
    },
    {
      skill: 'Leadership',
      currentLevel: 4,
      targetLevel: 7,
      lastUpdated: new Date().toISOString(),
      resources: ['Leadership courses', 'Mentoring programs'],
      marketDemand: 'medium',
    },
  ];
}
