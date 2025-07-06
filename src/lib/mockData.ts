import {
  ApplicationStage, // Added ApplicationStage
  Availability,
  type Candidate,
  type Company,
  type CompanyJobOpening,
  type DiaryPost,
  EducationLevel,
  JobType,
  LocationPreference,
  type Match, // Added Match
  type NotificationItem, // Added NotificationItem
  NotificationItemType, // Added NotificationItemType
  WorkExperienceLevel,
} from './types';

export const mockCandidates: Candidate[] = [
  {
    id: 'cand1',
    name: 'Alice Wonderland',
    role: 'Senior Software Engineer',
    experienceSummary:
      '5 years of Python development, loves remote work and agile teams. Passionate about AI and machine learning applications. Proven track record of delivering high-quality code and leading project teams to success in fast-paced environments.',
    skills: ['Python', 'Django', 'React', 'AWS', 'Docker', 'AI', 'Machine Learning'],
    avatarUrl: 'https://placehold.co/100x100.png', // Changed to smaller placeholder for cards
    dataAiHint: 'woman portrait',
    videoResumeUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    profileStrength: 90,
    location: 'San Francisco, CA',
    desiredWorkStyle: 'Fully Remote, Flexible Hours, Collaborative projects',
    pastProjects:
      'Developed an e-commerce recommendation engine, Contributed to open-source ML library',
    workExperienceLevel: WorkExperienceLevel.SENIOR,
    educationLevel: EducationLevel.MASTER,
    locationPreference: LocationPreference.REMOTE,
    languages: ['English', 'German'],
    salaryExpectationMin: 120000,
    salaryExpectationMax: 160000,
    availability: Availability.ONE_MONTH,
    jobTypePreference: [JobType.FULL_TIME, JobType.CONTRACT],
    personalityAssessment: [
      {
        trait: 'Collaborative',
        fit: 'positive',
        reason: 'Experience in agile teams suggests good fit for teamwork.',
      },
      {
        trait: 'Proactive Learner',
        fit: 'positive',
        reason: 'Passion for AI/ML indicates continuous learning.',
      },
      {
        trait: 'Independent (due to remote preference)',
        fit: 'neutral',
        reason: 'Effective in remote settings, ensure clear communication for team cohesion.',
      },
    ],
    optimalWorkStyles: [
      'Remote or hybrid environments with strong communication tools.',
      'Projects involving R&D or new technology adoption.',
      'Agile development with clear sprint goals.',
    ],
    isUnderestimatedTalent: true,
    underestimatedReasoning:
      'Shows strong potential in AI/ML with less formal experience in that specific niche, but transferable skills are high.',
  },
  {
    id: 'cand2',
    name: 'Bob The Builder',
    role: 'UX/UI Designer',
    experienceSummary:
      'Creative designer with 3 years of experience in mobile and web application design. Proficient in Figma and Adobe Suite. User-centric approach with a strong portfolio of intuitive and visually appealing designs.',
    skills: ['UX Design', 'UI Design', 'Figma', 'Adobe XD', 'Prototyping', 'User Research'],
    avatarUrl: 'https://placehold.co/100x100.png', // Changed to smaller placeholder
    dataAiHint: 'man portrait',
    profileStrength: 85,
    location: 'New York, NY',
    desiredWorkStyle: 'Hybrid, Collaborative Environment, User-focused projects',
    pastProjects: 'Redesigned a mobile banking app, Created a design system for a SaaS product',
    workExperienceLevel: WorkExperienceLevel.JUNIOR,
    educationLevel: EducationLevel.UNIVERSITY,
    locationPreference: LocationPreference.HYBRID,
    languages: ['English'],
    salaryExpectationMin: 70000,
    salaryExpectationMax: 90000,
    availability: Availability.IMMEDIATE,
    jobTypePreference: [JobType.FULL_TIME],
    personalityAssessment: [
      { trait: 'Creative', fit: 'positive', reason: 'Strong portfolio and design focus.' },
      { trait: 'User-Centric', fit: 'positive', reason: 'Emphasizes user needs in design.' },
      {
        trait: 'Detail-Oriented',
        fit: 'neutral',
        reason: "Good for design quality, ensure it doesn't slow down agile processes.",
      },
    ],
    optimalWorkStyles: [
      'Cross-functional teams with product managers and developers.',
      'EnvironMENTS that value user feedback and iterative design.',
      'Opportunities to contribute to design systems.',
    ],
  },
  {
    id: 'cand3',
    name: 'Charlie Brown',
    role: 'Product Manager',
    experienceSummary:
      'Results-driven PM with a knack for launching successful SaaS products. 7 years in product strategy and roadmap execution. Excellent communication and leadership skills, adept at cross-functional team collaboration.',
    skills: ['Product Management', 'Agile', 'Scrum', 'Roadmapping', 'Market Analysis', 'JIRA'],
    avatarUrl: 'https://placehold.co/100x100.png', // Changed to smaller placeholder
    dataAiHint: 'person thinking',
    videoResumeUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    profileStrength: 95,
    location: 'Austin, TX',
    desiredWorkStyle: 'Remote or On-site, Fast-paced Startup, Data-driven decision making',
    pastProjects:
      'Launched three new SaaS products from concept to market, Grew user base by 200% for a B2B platform',
    workExperienceLevel: WorkExperienceLevel.SENIOR,
    educationLevel: EducationLevel.UNIVERSITY,
    locationPreference: LocationPreference.SPECIFIC_CITY,
    languages: ['English', 'Spanish'],
    salaryExpectationMin: 130000,
    salaryExpectationMax: 170000,
    availability: Availability.NEGOTIABLE,
    jobTypePreference: [JobType.FULL_TIME],
    isUnderestimatedTalent: true,
    underestimatedReasoning:
      'Exceptional track record of growth and product launch success that may not be fully captured by standard experience metrics.',
  },
];

const mockJobOpeningsComp1: CompanyJobOpening[] = [
  {
    _id: 'job1comp1',
    title: 'Senior Frontend Developer',
    description:
      "Join our team to build amazing user interfaces with React and Next.js. Experience with TypeScript is a plus. You'll be responsible for developing new features, maintaining existing code, and collaborating with backend developers.",
    salaryRange: '$120k - $160k',
    jobType: JobType.FULL_TIME,
    tags: ['frontend', 'react', 'nextjs', 'typescript'],
    location: 'Remote (US)',
    videoOrImageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'developer office',
    requiredExperienceLevel: WorkExperienceLevel.SENIOR,
    requiredEducationLevel: EducationLevel.UNIVERSITY,
    workLocationType: LocationPreference.REMOTE,
    requiredLanguages: ['English'],
    salaryMin: 120000,
    salaryMax: 160000,
    companyCultureKeywords: [
      'innovative',
      'collaborative',
      'remote-first',
      'agile',
      'work-life balance',
    ],
    companyIndustry: 'SaaS Technology',
  },
];

const mockJobOpeningsComp2: CompanyJobOpening[] = [
  {
    _id: 'job1comp2',
    title: 'Graphic Designer',
    description:
      'Create stunning visuals for various clients, including branding, web assets, and print materials. Proficiency in Adobe Creative Suite is required. A strong portfolio is a must.',
    salaryRange: '$70k - $90k',
    jobType: JobType.FULL_TIME,
    tags: ['design', 'graphic design', 'adobe suite', 'branding'],
    location: 'New York, NY (Hybrid)',
    requiredExperienceLevel: WorkExperienceLevel.JUNIOR,
    requiredEducationLevel: EducationLevel.UNIVERSITY,
    workLocationType: LocationPreference.HYBRID,
    requiredLanguages: ['English'],
    salaryMin: 70000,
    salaryMax: 90000,
    companyCultureKeywords: [
      'creative',
      'dynamic',
      'client-focused',
      'pet-friendly',
      'team-oriented',
    ],
    companyIndustry: 'Marketing & Advertising',
  },
];
const mockJobOpeningsComp3: CompanyJobOpening[] = [
  {
    _id: 'job1comp3',
    title: 'Environmental Scientist',
    description:
      "Conduct research and develop solutions for environmental challenges. Requires a Master's degree in Environmental Science or related field and experience with data analysis.",
    salaryRange: '$90k - $130k',
    jobType: JobType.CONTRACT,
    tags: ['science', 'environment', 'research', 'sustainability'],
    location: 'Various Project Sites',
    requiredExperienceLevel: WorkExperienceLevel.MID_LEVEL,
    requiredEducationLevel: EducationLevel.MASTER,
    workLocationType: LocationPreference.SPECIFIC_CITY,
    requiredLanguages: ['English'],
    salaryMin: 90000,
    salaryMax: 130000,
    companyCultureKeywords: [
      'mission-driven',
      'impactful',
      'research-oriented',
      'eco-conscious',
      'field-work',
    ],
    companyIndustry: 'Environmental Consulting',
  },
];

export const mockCompanies: Company[] = [
  {
    id: 'comp1',
    recruiterUserId: 'recruiterUserId1', // Mock recruiter ID
    name: 'Innovatech Solutions',
    industry: 'SaaS Technology',
    description:
      'Cutting-edge software solutions for a brighter future. We value innovation, collaboration, and impact. Join us to work on challenging projects with a talented team.',
    cultureHighlights: [
      'Remote-First',
      'Unlimited PTO',
      'Weekly Tech Talks',
      'Health & Wellness',
      'work-life balance',
    ],
    logoUrl: 'https://placehold.co/100x100.png', // Placeholder for logo
    dataAiHint: 'tech logo',
    introVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    companyNeeds:
      'We need to optimize our payment processing system and enhance user experience on our e-commerce platform.',
    jobOpenings: mockJobOpeningsComp1,
    reputationScore: 85,
    reputationGrade: '優秀',
    timelyReplyRate: 92,
    commonRejectionReasons: ['經驗不符', '技能要求'],
  },
  {
    id: 'comp2',
    recruiterUserId: 'recruiterUserId2',
    name: 'Creative Spark Inc.',
    industry: 'Marketing & Advertising',
    description:
      'We ignite brands with creative campaigns and data-driven strategies. Looking for passionate creators to join our vibrant and dynamic team.',
    cultureHighlights: [
      'Pet-Friendly Office',
      'Flexible Hours',
      'Creative Workshops',
      'Team Outings',
      'team-oriented',
    ],
    logoUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'creative logo',
    companyNeeds:
      'We are looking to expand our design team to handle new client projects requiring innovative branding and digital experiences.',
    jobOpenings: mockJobOpeningsComp2,
    reputationScore: 78,
    reputationGrade: '良好',
    timelyReplyRate: 85,
    commonRejectionReasons: ['作品集不符', '薪資期望'],
  },
  {
    id: 'comp3',
    recruiterUserId: 'recruiterUserId3',
    name: 'GreenFuture Ltd.',
    industry: 'Environmental Consulting',
    description:
      'Dedicated to building a sustainable future through innovative green technologies. Join our mission-driven team and make a real difference in the world.',
    cultureHighlights: [
      'Impactful Work',
      'Collaborative Environment',
      'Eco-Conscious',
      'Learning Budget',
      'field-work',
    ],
    logoUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'eco logo',
    introVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    companyNeeds:
      'Seeking data scientists to analyze environmental data and improve our green tech solutions.',
    jobOpenings: mockJobOpeningsComp3,
    reputationScore: 95,
    reputationGrade: '卓越',
    timelyReplyRate: 98,
    commonRejectionReasons: ['地點不符'],
  },
];

const dayMillis = 1000 * 60 * 60 * 24;

export const mockMatches: Match[] = [
  {
    _id: 'matchmock1',
    userA_Id: 'recruiterUserId1',
    userB_Id: 'jobseekerUserId1',
    candidateProfileIdForDisplay: 'cand1',
    companyProfileIdForDisplay: 'comp1',
    jobOpeningTitle: 'Senior Frontend Developer',
    matchedAt: new Date(Date.now() - 7 * dayMillis).toISOString(),
    applicationTimestamp: new Date(Date.now() - 70 * 60 * 60 * 1000).toISOString(), // 70 hours ago (2 hours left)
    status: 'active',
    uniqueMatchKey: 'recruiterUserId1-jobseekerUserId1',
    applicationStatusHistory: [
      {
        stage: ApplicationStage.SUBMITTED,
        timestamp: new Date(Date.now() - 7 * dayMillis).toISOString(),
        description: 'Application submitted for Senior Frontend Developer.',
        nextStepSuggestion: 'Await company review. They typically respond within a week.',
      },
      {
        stage: ApplicationStage.COMPANY_VIEWED,
        timestamp: new Date(Date.now() - 5 * dayMillis).toISOString(),
        description: 'Innovatech Solutions viewed your application.',
        nextStepSuggestion: "They might reach out soon if there's a fit.",
      },
    ],
    candidate: mockCandidates.find((c) => c.id === 'cand1')!,
    company: mockCompanies.find((c) => c.id === 'comp1')!,
  },
  {
    _id: 'matchmock2',
    userA_Id: 'recruiterUserId2',
    userB_Id: 'jobseekerUserId2',
    candidateProfileIdForDisplay: 'cand2',
    companyProfileIdForDisplay: 'comp2',
    jobOpeningTitle: 'Graphic Designer',
    matchedAt: new Date(Date.now() - 10 * dayMillis).toISOString(),
    applicationTimestamp: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago (47 hours left)
    status: 'active',
    uniqueMatchKey: 'recruiterUserId2-jobseekerUserId2',
    applicationStatusHistory: [
      {
        stage: ApplicationStage.SUBMITTED,
        timestamp: new Date(Date.now() - 10 * dayMillis).toISOString(),
        description: 'Applied for Graphic Designer at Creative Spark Inc.',
      },
    ],
    candidate: mockCandidates.find((c) => c.id === 'cand2')!,
    company: mockCompanies.find((c) => c.id === 'comp2')!,
  },
  {
    _id: 'matchmock3',
    userA_Id: 'recruiterUserId3',
    userB_Id: 'jobseekerUserId3',
    candidateProfileIdForDisplay: 'cand3',
    companyProfileIdForDisplay: 'comp3',
    jobOpeningTitle: 'Project Manager - Renewable Energy',
    matchedAt: new Date(Date.now() - 2 * dayMillis).toISOString(),
    applicationTimestamp: new Date(Date.now() - 71.5 * 60 * 60 * 1000).toISOString(), // 71.5 hours ago (30 mins left) - RED
    status: 'active',
    uniqueMatchKey: 'recruiterUserId3-jobseekerUserId3',
    applicationStatusHistory: [
      {
        stage: ApplicationStage.SUBMITTED,
        timestamp: new Date(Date.now() - 2 * dayMillis).toISOString(),
        description: 'Application submitted for Project Manager.',
        nextStepSuggestion: "You've applied! Good luck.",
      },
      {
        stage: ApplicationStage.COMPANY_VIEWED,
        timestamp: new Date(Date.now() - 1 * dayMillis).toISOString(),
        description: 'GreenFuture Ltd. viewed your application.',
        nextStepSuggestion: 'Wait for them to reach out.',
      },
      {
        stage: ApplicationStage.SHORTLISTED,
        timestamp: new Date(Date.now() - 0.5 * dayMillis).toISOString(),
        description: "Congratulations! You're shortlisted.",
        nextStepSuggestion: 'Prepare for the next steps.',
      },
    ],
    candidate: mockCandidates.find((c) => c.id === 'cand3')!,
    company: mockCompanies.find((c) => c.id === 'comp3')!,
  },
  {
    _id: 'matchmock4',
    userA_Id: 'recruiterUserId1', // Innovatech
    userB_Id: 'jobseekerUserId2', // Bob
    candidateProfileIdForDisplay: 'cand2',
    companyProfileIdForDisplay: 'comp1',
    jobOpeningTitle: 'Backend Python Developer',
    matchedAt: new Date(Date.now() - 4 * dayMillis).toISOString(),
    applicationTimestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago (67 hours left) - YELLOW
    status: 'active',
    uniqueMatchKey: 'recruiterUserId1-jobseekerUserId2',
    applicationStatusHistory: [
      {
        stage: ApplicationStage.SUBMITTED,
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        description: 'Applied.',
      },
    ],
    candidate: mockCandidates.find((c) => c.id === 'cand2')!,
    company: mockCompanies.find((c) => c.id === 'comp1')!,
  },
];

mockMatches.forEach((match) => {
  if (!match.candidate)
    match.candidate = mockCandidates.find((c) => c.id === match.candidateProfileIdForDisplay)!;
  if (!match.company)
    match.company = mockCompanies.find((c) => c.id === match.companyProfileIdForDisplay)!;
});

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif1',
    type: NotificationItemType.OFFER_EXTENDED,
    title: '🎉 Offer Extended from Innovatech Solutions!',
    message:
      'Congratulations! Innovatech Solutions has extended an offer for the Senior Frontend Developer role. Check My Matches for details.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    read: false,
    link: '/matches/matchmock1', // Conceptual link
    isUrgent: true,
  },
];

export const mockDiaryPosts: DiaryPost[] = [
  {
    _id: 'diary1mongo',
    authorId: 'cand1',
    authorName: 'Alice Wonderland',
    authorAvatarUrl: 'https://placehold.co/100x100.png',
    title: 'My First Week with a New AI Project!',
    content:
      "Just wrapped up my first week diving deep into a new machine learning project. The learning curve is steep, but the potential impact is huge. Spent most of my time setting up the environment and preprocessing data. Already learned so much about TensorFlow Extended (TFX)! Excited for what's next. #AI #MachineLearning #NewBeginnings",
    imageUrl: 'https://placehold.co/600x400.png',
    diaryImageHint: 'ai project concept',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    tags: ['ai', 'learning', 'tensorflow'],
    likes: 15,
    likedBy: [],
    commentsCount: 3,
    views: 120,
    isFeatured: true,
  },
];
