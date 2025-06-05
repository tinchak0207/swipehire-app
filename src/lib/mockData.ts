import {
  type Candidate,
  type Company,
  type CompanyJobOpening,
  WorkExperienceLevel,
  EducationLevel,
  LocationPreference,
  Availability,
  JobType,
  type DiaryPost,
  type PersonalityTraitAssessment,
  type Match, // Added Match
  ApplicationStage, // Added ApplicationStage
  type ApplicationStatusUpdate, // Added ApplicationStatusUpdate
} from './types';

export const mockCandidates: Candidate[] = [
  {
    id: 'cand1',
    name: 'Alice Wonderland',
    role: 'Senior Software Engineer',
    experienceSummary: '5 years of Python development, loves remote work and agile teams. Passionate about AI and machine learning applications. Proven track record of delivering high-quality code and leading project teams to success in fast-paced environments.',
    skills: ['Python', 'Django', 'React', 'AWS', 'Docker', 'AI', 'Machine Learning'],
    avatarUrl: 'https://placehold.co/500x700.png',
    dataAiHint: 'woman portrait',
    videoResumeUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    profileStrength: 90,
    location: "San Francisco, CA",
    desiredWorkStyle: "Fully Remote, Flexible Hours, Collaborative projects",
    pastProjects: "Developed an e-commerce recommendation engine, Contributed to open-source ML library",
    workExperienceLevel: WorkExperienceLevel.SENIOR,
    educationLevel: EducationLevel.MASTER,
    locationPreference: LocationPreference.REMOTE,
    languages: ['English', 'German'],
    salaryExpectationMin: 120000,
    salaryExpectationMax: 160000,
    availability: Availability.ONE_MONTH,
    jobTypePreference: [JobType.FULL_TIME, JobType.CONTRACT],
    personalityAssessment: [
      { trait: "Collaborative", fit: "positive", reason: "Experience in agile teams suggests good fit for teamwork." },
      { trait: "Proactive Learner", fit: "positive", reason: "Passion for AI/ML indicates continuous learning." },
      { trait: "Independent (due to remote preference)", fit: "neutral", reason: "Effective in remote settings, ensure clear communication for team cohesion." }
    ],
    optimalWorkStyles: [
      "Remote or hybrid environments with strong communication tools.",
      "Projects involving R&D or new technology adoption.",
      "Agile development with clear sprint goals."
    ],
    isUnderestimatedTalent: true,
    underestimatedReasoning: "Shows strong potential in AI/ML with less formal experience in that specific niche, but transferable skills are high."
  },
  {
    id: 'cand2',
    name: 'Bob The Builder',
    role: 'UX/UI Designer',
    experienceSummary: 'Creative designer with 3 years of experience in mobile and web application design. Proficient in Figma and Adobe Suite. User-centric approach with a strong portfolio of intuitive and visually appealing designs.',
    skills: ['UX Design', 'UI Design', 'Figma', 'Adobe XD', 'Prototyping', 'User Research'],
    avatarUrl: 'https://placehold.co/500x700.png',
    dataAiHint: 'man portrait',
    profileStrength: 85,
    location: "New York, NY",
    desiredWorkStyle: "Hybrid, Collaborative Environment, User-focused projects",
    pastProjects: "Redesigned a mobile banking app, Created a design system for a SaaS product",
    workExperienceLevel: WorkExperienceLevel.JUNIOR,
    educationLevel: EducationLevel.UNIVERSITY,
    locationPreference: LocationPreference.HYBRID,
    languages: ['English'],
    salaryExpectationMin: 70000,
    salaryExpectationMax: 90000,
    availability: Availability.IMMEDIATE,
    jobTypePreference: [JobType.FULL_TIME],
    personalityAssessment: [
      { trait: "Creative", fit: "positive", reason: "Strong portfolio and design focus." },
      { trait: "User-Centric", fit: "positive", reason: "Emphasizes user needs in design." },
      { trait: "Detail-Oriented", fit: "neutral", reason: "Good for design quality, ensure it doesn't slow down agile processes." }
    ],
    optimalWorkStyles: [
      "Cross-functional teams with product managers and developers.",
      "Environments that value user feedback and iterative design.",
      "Opportunities to contribute to design systems."
    ]
  },
  {
    id: 'cand3',
    name: 'Charlie Brown',
    role: 'Product Manager',
    experienceSummary: 'Results-driven PM with a knack for launching successful SaaS products. 7 years in product strategy and roadmap execution. Excellent communication and leadership skills, adept at cross-functional team collaboration.',
    skills: ['Product Management', 'Agile', 'Scrum', 'Roadmapping', 'Market Analysis', 'JIRA'],
    avatarUrl: 'https://placehold.co/500x700.png',
    dataAiHint: 'person thinking',
    videoResumeUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    profileStrength: 95,
    location: "Austin, TX",
    desiredWorkStyle: "Remote or On-site, Fast-paced Startup, Data-driven decision making",
    pastProjects: "Launched three new SaaS products from concept to market, Grew user base by 200% for a B2B platform",
    workExperienceLevel: WorkExperienceLevel.SENIOR,
    educationLevel: EducationLevel.UNIVERSITY,
    locationPreference: LocationPreference.SPECIFIC_CITY,
    languages: ['English', 'Spanish'],
    salaryExpectationMin: 130000,
    salaryExpectationMax: 170000,
    availability: Availability.NEGOTIABLE,
    jobTypePreference: [JobType.FULL_TIME],
    isUnderestimatedTalent: true,
    underestimatedReasoning: "Exceptional track record of growth and product launch success that may not be fully captured by standard experience metrics."
  },
  {
    id: 'cand4',
    name: 'Diana Prince',
    role: 'Data Scientist',
    experienceSummary: 'Expert in statistical modeling and machine learning with 4 years experience. Eager to solve complex problems with data. Strong analytical abilities and experience with big data technologies.',
    skills: ['Machine Learning', 'Data Analysis', 'Python', 'R', 'SQL', 'TensorFlow'],
    avatarUrl: 'https://placehold.co/500x700.png',
    dataAiHint: 'woman thinking',
    profileStrength: 88,
    location: "Boston, MA",
    desiredWorkStyle: "Remote, Research-Oriented, Problem-solving focus",
    pastProjects: "Built a predictive model for customer churn, Optimized ad spend using ML algorithms",
    workExperienceLevel: WorkExperienceLevel.MID_LEVEL,
    educationLevel: EducationLevel.DOCTORATE,
    locationPreference: LocationPreference.REMOTE,
    languages: ['English', 'French'],
    salaryExpectationMin: 100000,
    salaryExpectationMax: 140000,
    availability: Availability.THREE_MONTHS,
    jobTypePreference: [JobType.FULL_TIME, JobType.CONSULTANT],
  },
  {
    id: 'cand5',
    name: 'Edward Scissorhands',
    role: 'Creative Director',
    experienceSummary: 'Visionary creative director with 12 years of experience in branding, advertising, and digital media. Known for innovative campaigns and artistic excellence.',
    skills: ['Branding', 'Art Direction', 'Campaign Strategy', 'Adobe Creative Suite', 'Team Leadership'],
    avatarUrl: 'https://placehold.co/500x700.png',
    dataAiHint: 'director portrait',
    videoResumeUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    profileStrength: 92,
    location: "Los Angeles, CA",
    desiredWorkStyle: "Creative agency, project-based work, innovative environment",
    pastProjects: "Led global rebranding for a major consumer product, Won multiple awards for advertising campaigns.",
    workExperienceLevel: WorkExperienceLevel.EXPERT,
    educationLevel: EducationLevel.MASTER,
    locationPreference: LocationPreference.SPECIFIC_CITY,
    languages: ['English'],
    salaryExpectationMin: 150000,
    salaryExpectationMax: 200000,
    availability: Availability.NEGOTIABLE,
    jobTypePreference: [JobType.FULL_TIME, JobType.CONSULTANT],
    isUnderestimatedTalent: false,
  },
];

const mockJobOpeningsComp1: CompanyJobOpening[] = [
  {
    _id: 'job1comp1',
    title: "Senior Frontend Developer",
    description: "Join our team to build amazing user interfaces with React and Next.js. Experience with TypeScript is a plus. You'll be responsible for developing new features, maintaining existing code, and collaborating with backend developers.",
    salaryRange: '$120k - $160k',
    jobType: JobType.FULL_TIME,
    tags: ['frontend', 'react', 'nextjs', 'typescript'],
    location: "Remote (US)",
    videoOrImageUrl: 'https://placehold.co/600x400.png', // Added image
    dataAiHint: 'developer office', // Added hint based on user's image
    requiredExperienceLevel: WorkExperienceLevel.SENIOR,
    requiredEducationLevel: EducationLevel.UNIVERSITY,
    workLocationType: LocationPreference.REMOTE,
    requiredLanguages: ['English'],
    salaryMin: 120000,
    salaryMax: 160000,
    companyCultureKeywords: ["innovative", "collaborative", "remote-first", "agile", "work-life balance"],
    companyIndustry: "SaaS Technology"
  },
  {
    _id: 'job2comp1',
    title: "Backend Python Developer",
    description: "Help scale our infrastructure and build robust APIs using Python and Django. We are looking for someone with strong database skills and experience with cloud platforms like AWS.",
    salaryRange: '$110k - $150k',
    jobType: JobType.FULL_TIME,
    tags: ['backend', 'python', 'django', 'api', 'aws'],
    location: "Remote (Global)",
    requiredExperienceLevel: WorkExperienceLevel.MID_LEVEL,
    requiredEducationLevel: EducationLevel.UNIVERSITY,
    workLocationType: LocationPreference.REMOTE,
    requiredLanguages: ['English'],
    salaryMin: 110000,
    salaryMax: 150000,
    companyCultureKeywords: ["technical excellence", "ownership", "remote-first", "scalable solutions", "learning"],
    companyIndustry: "SaaS Technology"
  }
];

const mockJobOpeningsComp2: CompanyJobOpening[] = [
 {
    _id: 'job1comp2',
    title: "Graphic Designer",
    description: "Create stunning visuals for various clients, including branding, web assets, and print materials. Proficiency in Adobe Creative Suite is required. A strong portfolio is a must.",
    salaryRange: '$70k - $90k',
    jobType: JobType.FULL_TIME,
    tags: ['design', 'graphic design', 'adobe suite', 'branding'],
    location: "New York, NY (Hybrid)",
    requiredExperienceLevel: WorkExperienceLevel.JUNIOR,
    requiredEducationLevel: EducationLevel.UNIVERSITY,
    workLocationType: LocationPreference.HYBRID,
    requiredLanguages: ['English'],
    salaryMin: 70000,
    salaryMax: 90000,
    companyCultureKeywords: ["creative", "dynamic", "client-focused", "pet-friendly", "team-oriented"],
    companyIndustry: "Marketing & Advertising"
  },
  {
    _id: 'job2comp2',
    title: "Social Media Manager",
    description: "Develop and execute social media strategies to grow our clients' online presence. Experience with content creation, analytics, and community management is key.",
    salaryRange: '$60k - $80k',
    jobType: JobType.PART_TIME,
    tags: ['social media', 'marketing', 'content creation', 'analytics'],
    location: "Remote (US)",
    requiredExperienceLevel: WorkExperienceLevel.JUNIOR,
    requiredEducationLevel: EducationLevel.UNIVERSITY,
    workLocationType: LocationPreference.REMOTE,
    requiredLanguages: ['English'],
    salaryMin: 60000,
    salaryMax: 80000,
    companyCultureKeywords: ["results-oriented", "fast-paced", "data-driven", "flexible", "creative freedom"],
    companyIndustry: "Marketing & Advertising"
  }
];
const mockJobOpeningsComp3: CompanyJobOpening[] = [
  {
    _id: 'job1comp3',
    title: "Environmental Scientist",
    description: "Conduct research and develop solutions for environmental challenges. Requires a Master's degree in Environmental Science or related field and experience with data analysis.",
    salaryRange: '$90k - $130k',
    jobType: JobType.CONTRACT,
    tags: ['science', 'environment', 'research', 'sustainability'],
    location: "Various Project Sites",
    requiredExperienceLevel: WorkExperienceLevel.MID_LEVEL,
    requiredEducationLevel: EducationLevel.MASTER,
    workLocationType: LocationPreference.SPECIFIC_CITY,
    requiredLanguages: ['English'],
    salaryMin: 90000,
    salaryMax: 130000,
    companyCultureKeywords: ["mission-driven", "impactful", "research-oriented", "eco-conscious", "field-work"],
    companyIndustry: "Environmental Consulting"
  },
  {
    _id: 'job2comp3',
    title: "Project Manager - Renewable Energy",
    description: "Lead exciting projects in the renewable energy sector. PMP certification and experience managing large-scale energy projects are preferred.",
    salaryRange: '$100k - $140k',
    jobType: JobType.FULL_TIME,
    tags: ['project management', 'renewable energy', 'pmp', 'leadership'],
    location: "Austin, TX",
    requiredExperienceLevel: WorkExperienceLevel.SENIOR,
    requiredEducationLevel: EducationLevel.UNIVERSITY,
    workLocationType: LocationPreference.SPECIFIC_CITY,
    requiredLanguages: ['English'],
    salaryMin: 100000,
    salaryMax: 140000,
    companyCultureKeywords: ["leadership", "sustainability", "project-excellence", "collaborative", "innovation"],
    companyIndustry: "Renewable Energy"
  }
];

const mockJobOpeningsComp4: CompanyJobOpening[] = [
  {
    _id: 'job1comp4',
    title: "Lead Game Developer (Unity)",
    description: "Spearhead the development of our next hit mobile game. Must have 5+ years of experience with Unity and C#, and a passion for creating engaging gameplay experiences.",
    salaryRange: "$130k - $170k",
    jobType: JobType.FULL_TIME,
    tags: ["gaming", "unity", "csharp", "mobiledev", "lead"],
    location: "Remote (Canada)",
    requiredExperienceLevel: WorkExperienceLevel.SENIOR,
    requiredEducationLevel: EducationLevel.UNIVERSITY,
    workLocationType: LocationPreference.REMOTE,
    requiredLanguages: ['English'],
    salaryMin: 130000,
    salaryMax: 170000,
    companyCultureKeywords: ["passionate", "gamer-centric", "innovative", "flexible-work", "creative"],
    companyIndustry: "Gaming"
  }
];

const mockJobOpeningsComp5: CompanyJobOpening[] = [
  {
    _id: 'job1comp5',
    title: "Junior Marketing Analyst",
    description: "Support our marketing team with data analysis, campaign tracking, and report generation. Entry-level position, great for learning and growth. Basic SQL knowledge is a plus.",
    salaryRange: "$55k - $70k",
    jobType: JobType.FULL_TIME,
    tags: ["marketing", "analysis", "entrylevel", "data"],
    location: "Chicago, IL (Hybrid)",
    requiredExperienceLevel: WorkExperienceLevel.INTERN,
    requiredEducationLevel: EducationLevel.UNIVERSITY,
    workLocationType: LocationPreference.HYBRID,
    requiredLanguages: ['English'],
    salaryMin: 55000,
    salaryMax: 70000,
    companyCultureKeywords: ["data-driven", "learning-oriented", "supportive", "client-focused", "analytical"],
    companyIndustry: "Market Research"
  }
];


export const mockCompanies: Company[] = [
  {
    id: 'comp1',
    name: 'Innovatech Solutions',
    industry: 'SaaS Technology',
    description: 'Cutting-edge software solutions for a brighter future. We value innovation, collaboration, and impact. Join us to work on challenging projects with a talented team.',
    cultureHighlights: ['Remote-First', 'Unlimited PTO', 'Weekly Tech Talks', 'Health & Wellness', 'work-life balance'],
    logoUrl: 'https://placehold.co/500x350.png',
    dataAiHint: 'tech logo',
    introVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    companyNeeds: "We need to optimize our payment processing system and enhance user experience on our e-commerce platform.",
    jobOpenings: mockJobOpeningsComp1,
  },
  {
    id: 'comp2',
    name: 'Creative Spark Inc.',
    industry: 'Marketing & Advertising',
    description: 'We ignite brands with creative campaigns and data-driven strategies. Looking for passionate creators to join our vibrant and dynamic team.',
    cultureHighlights: ['Pet-Friendly Office', 'Flexible Hours', 'Creative Workshops', 'Team Outings', 'team-oriented'],
    logoUrl: 'https://placehold.co/500x350.png',
    dataAiHint: 'creative logo',
    companyNeeds: "We are looking to expand our design team to handle new client projects requiring innovative branding and digital experiences.",
    jobOpenings: mockJobOpeningsComp2,
  },
  {
    id: 'comp3',
    name: 'GreenFuture Ltd.',
    industry: 'Environmental Consulting',
    description: 'Dedicated to building a sustainable future through innovative green technologies. Join our mission-driven team and make a real difference in the world.',
    cultureHighlights: ['Impactful Work', 'Collaborative Environment', 'Eco-Conscious', 'Learning Budget', 'field-work'],
    logoUrl: 'https://placehold.co/500x350.png',
    dataAiHint: 'eco logo',
    introVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    companyNeeds: "Seeking data scientists to analyze environmental data and improve our green tech solutions.",
    jobOpenings: mockJobOpeningsComp3,
  },
  {
    id: 'comp4',
    name: 'PixelPlay Studios',
    industry: 'Gaming',
    description: 'Creating immersive and fun gaming experiences for players worldwide. We are a team of passionate gamers and developers.',
    cultureHighlights: ['Game Nights', 'Latest Hardware', 'Flexible Work', 'Stock Options', 'creative'],
    logoUrl: 'https://placehold.co/500x350.png',
    dataAiHint: 'gaming logo',
    introVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    companyNeeds: "We are looking for experienced game developers and artists to join our growing team for an exciting new IP.",
    jobOpenings: mockJobOpeningsComp4,
  },
  {
    id: 'comp5',
    name: 'MarketMinds Co.',
    industry: 'Market Research',
    description: 'Providing actionable insights through comprehensive market research and data analysis. Helping businesses make informed decisions.',
    cultureHighlights: ['Data-Driven', 'Continuous Learning', 'Client-Focused', 'Supportive Team', 'analytical'],
    logoUrl: 'https://placehold.co/500x350.png',
    dataAiHint: 'chart logo',
    companyNeeds: "Expanding our team of analysts to cover new industries and research methodologies.",
    jobOpenings: mockJobOpeningsComp5,
  },
];

const additionalMockCompanies: Company[] = [
  {
    id: 'comp6',
    name: 'HealthFirst Diagnostics',
    industry: 'Healthcare Technology',
    description: 'Pioneering AI-driven diagnostic tools to improve patient outcomes. We are a fast-growing startup with a mission to revolutionize healthcare.',
    cultureHighlights: ['Impactful Work', 'Stock Options', 'Modern Tech Stack', 'Collaborative Research', 'cutting-edge'],
    logoUrl: 'https://placehold.co/500x350.png',
    dataAiHint: 'healthcare logo',
    companyNeeds: "Looking for machine learning engineers and full-stack developers passionate about healthcare.",
    jobOpenings: [
      {
        _id: 'job1comp6',
        title: "Machine Learning Engineer - Medical Imaging",
        description: "Develop and deploy ML models for analyzing medical images. PhD or MS in CS/EE preferred, with experience in Python, PyTorch/TensorFlow, and medical imaging standards.",
        salaryRange: "$140k - $180k",
        jobType: JobType.FULL_TIME,
        tags: ["ml", "ai", "medicalimaging", "python", "pytorch"],
        location: "Boston, MA (Hybrid)",
        requiredExperienceLevel: WorkExperienceLevel.SENIOR,
        requiredEducationLevel: EducationLevel.MASTER,
        workLocationType: LocationPreference.HYBRID,
        requiredLanguages: ['English'],
        salaryMin: 140000,
        salaryMax: 180000,
        companyCultureKeywords: ["cutting-edge", "research", "healthcare AI", "impactful"],
        companyIndustry: "Healthcare Technology"
      },
    ],
  },
  {
    id: 'comp7',
    name: 'EduSphere Online',
    industry: 'EdTech',
    description: 'Providing accessible and engaging online learning platforms for K-12 and lifelong learners. Join us to shape the future of education.',
    cultureHighlights: ['Remote-First', 'Mission-Driven', 'Continuous Feedback', 'Professional Development', 'learning'],
    logoUrl: 'https://placehold.co/500x350.png',
    dataAiHint: 'education logo',
    companyNeeds: "Hiring instructional designers, full-stack developers, and customer success managers.",
    jobOpenings: [
      {
        _id: 'job1comp7',
        title: "Instructional Designer",
        description: "Design and develop engaging online course content for various subjects. Experience with LMS platforms and curriculum development required.",
        salaryRange: "$75k - $95k",
        jobType: JobType.FULL_TIME,
        tags: ["edtech", "instructionaldesign", "curriculum", "lms"],
        location: "Remote (Global)",
        requiredExperienceLevel: WorkExperienceLevel.MID_LEVEL,
        requiredEducationLevel: EducationLevel.UNIVERSITY,
        workLocationType: LocationPreference.REMOTE,
        requiredLanguages: ['English'],
        salaryMin: 75000,
        salaryMax: 95000,
        companyCultureKeywords: ["education", "remote-first", "impact", "learning"],
        companyIndustry: "EdTech"
      },
    ],
  },
];

mockCompanies.push(...additionalMockCompanies.filter(ac => !mockCompanies.find(mc => mc.id === ac.id)));


export const mockDiaryPosts: DiaryPost[] = [
  {
    id: 'diary1',
    _id: 'diary1mongo',
    authorId: 'cand1',
    authorName: 'Alice Wonderland',
    authorAvatarUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'woman face',
    title: 'My First Week with a New AI Project!',
    content: 'Just wrapped up my first week diving deep into a new machine learning project. The learning curve is steep, but the potential impact is huge. Spent most of my time setting up the environment and preprocessing data. Already learned so much about TensorFlow Extended (TFX)! Excited for what\'s next. #AI #MachineLearning #NewBeginnings',
    imageUrl: 'https://placehold.co/600x400.png',
    diaryImageHint: 'ai project concept',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    tags: ['ai', 'learning', 'tensorflow'],
    likes: 15,
    commentsCount: 3,
    views: 120,
    isFeatured: true,
  },
  {
    id: 'diary2',
    _id: 'diary2mongo',
    authorId: 'cand2',
    authorName: 'Bob The Builder',
    authorAvatarUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'man face',
    title: 'Brainstorming Session: Redesigning a Mobile App',
    content: 'Had an amazing brainstorming session with the team today for the new mobile app redesign. So many creative ideas flowing! We focused on user journey mapping and identifying pain points in the current app. Feeling inspired by the collaborative energy. #UXDesign #Teamwork #Creativity',
    diaryImageHint: 'team brainstorming', // Example, even if no imageUrl for now
    timestamp: Date.now() - 1000 * 60 * 60 * 10, // 10 hours ago
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    tags: ['ux', 'design', 'collaboration'],
    likes: 22,
    commentsCount: 5,
    views: 95,
    isFeatured: false,
  },
  {
    id: 'diary3',
    _id: 'diary3mongo',
    authorId: 'cand1',
    authorName: 'Alice Wonderland',
    authorAvatarUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'woman face',
    title: 'Overcoming a Coding Challenge',
    content: 'Spent the entire day debugging a tricky Python script. It was frustrating, but that moment when you finally find the bug and everything works is just priceless! Persistence pays off. #Python #CodingLife #ProblemSolving',
    imageUrl: 'https://placehold.co/600x400.png',
    diaryImageHint: 'coding screen abstract',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    tags: ['python', 'debugging', 'development'],
    likes: 30,
    commentsCount: 7,
    views: 250,
    isFeatured: true,
  },
  {
    id: 'diary4',
    _id: 'diary4mongo',
    authorId: 'cand3',
    authorName: 'Charlie Brown',
    authorAvatarUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'person face',
    title: 'Reflecting on Q3 Product Strategy',
    content: 'Just finished a deep dive into our Q3 product strategy. Lots of market research and data analysis involved. It\'s crucial to stay agile and adapt to customer needs. Feeling confident about the roadmap ahead. #ProductManagement #Strategy #SaaS',
    diaryImageHint: 'strategy planning board', // Example
    timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    tags: ['product', 'strategy', 'planning'],
    likes: 8,
    commentsCount: 1,
    views: 40,
    isFeatured: false,
  }
];

// Ensure all mock posts have default interaction counts if not specified
mockDiaryPosts.forEach(post => {
  if (post.likes === undefined) post.likes = Math.floor(Math.random() * 50);
  if (post.commentsCount === undefined) post.commentsCount = Math.floor(Math.random() * 10);
  if (post.views === undefined) post.views = Math.floor(Math.random() * 300);
});

// --- Mock Matches with Application Status History ---
const dayMillis = 1000 * 60 * 60 * 24;

export const mockMatches: Match[] = [
  {
    _id: "matchmock1",
    userA_Id: "recruiterUserId1", // Represents recruiter's MongoDB User _id
    userB_Id: "jobseekerUserId1", // Represents jobseeker's MongoDB User _id (Alice Wonderland)
    candidateProfileIdForDisplay: "cand1", // Alice Wonderland's mock profile ID
    companyProfileIdForDisplay: "comp1",   // Innovatech Solutions' mock profile ID
    jobOpeningTitle: "Senior Frontend Developer",
    matchedAt: new Date(Date.now() - 7 * dayMillis).toISOString(), // 7 days ago
    status: 'active',
    uniqueMatchKey: "recruiterUserId1-jobseekerUserId1", // Simplified, backend would sort ObjectIds
    applicationStatusHistory: [
      { stage: ApplicationStage.SUBMITTED, timestamp: new Date(Date.now() - 7 * dayMillis).toISOString(), description: "Application submitted for Senior Frontend Developer.", nextStepSuggestion: "Await company review. They typically respond within a week." },
      { stage: ApplicationStage.COMPANY_VIEWED, timestamp: new Date(Date.now() - 5 * dayMillis).toISOString(), description: "Innovatech Solutions viewed your application.", nextStepSuggestion: "They might reach out soon if there's a fit." },
      { stage: ApplicationStage.SHORTLISTED, timestamp: new Date(Date.now() - 3 * dayMillis).toISOString(), description: "You've been shortlisted for the first round!", nextStepSuggestion: "Prepare for a potential screening call." },
      { stage: ApplicationStage.INTERVIEW_SCHEDULED, timestamp: new Date(Date.now() - 1 * dayMillis).toISOString(), description: "Interview scheduled for tomorrow at 10:00 AM with Jane Doe.", nextStepSuggestion: "Confirm your availability and prepare questions." },
    ],
    candidate: mockCandidates.find(c => c.id === 'cand1'),
    company: mockCompanies.find(c => c.id === 'comp1'),
  },
  {
    _id: "matchmock2",
    userA_Id: "recruiterUserId2",
    userB_Id: "jobseekerUserId2", // Bob The Builder
    candidateProfileIdForDisplay: "cand2",
    companyProfileIdForDisplay: "comp2",
    jobOpeningTitle: "Graphic Designer",
    matchedAt: new Date(Date.now() - 10 * dayMillis).toISOString(), // 10 days ago
    status: 'active',
    uniqueMatchKey: "recruiterUserId2-jobseekerUserId2",
    applicationStatusHistory: [
      { stage: ApplicationStage.SUBMITTED, timestamp: new Date(Date.now() - 10 * dayMillis).toISOString(), description: "Applied for Graphic Designer at Creative Spark Inc." },
      { stage: ApplicationStage.COMPANY_VIEWED, timestamp: new Date(Date.now() - 8 * dayMillis).toISOString(), description: "Your application was viewed." },
      // This one is over 72 hours with no further updates from "COMPANY_VIEWED"
    ],
    candidate: mockCandidates.find(c => c.id === 'cand2'),
    company: mockCompanies.find(c => c.id === 'comp2'),
  },
  {
    _id: "matchmock3",
    userA_Id: "recruiterUserId3", // Represents recruiter's MongoDB User _id
    userB_Id: "jobseekerUserId3", // Represents jobseeker's MongoDB User _id (Charlie Brown)
    candidateProfileIdForDisplay: "cand3", // Charlie Brown's mock profile ID
    companyProfileIdForDisplay: "comp3",   // GreenFuture Ltd.'s mock profile ID
    jobOpeningTitle: "Project Manager - Renewable Energy",
    matchedAt: new Date(Date.now() - 2 * dayMillis).toISOString(), // 2 days ago
    status: 'active',
    uniqueMatchKey: "recruiterUserId3-jobseekerUserId3",
    applicationStatusHistory: [
      { stage: ApplicationStage.SUBMITTED, timestamp: new Date(Date.now() - 2 * dayMillis).toISOString(), description: "Application submitted for Project Manager.", nextStepSuggestion: "You've applied! Good luck." },
      { stage: ApplicationStage.COMPANY_VIEWED, timestamp: new Date(Date.now() - 1 * dayMillis).toISOString(), description: "GreenFuture Ltd. viewed your application.", nextStepSuggestion: "Wait for them to reach out." },
      { stage: ApplicationStage.SHORTLISTED, timestamp: new Date(Date.now() - 0.5 * dayMillis).toISOString(), description: "Congratulations! You're shortlisted.", nextStepSuggestion: "Prepare for the next steps." },
      { stage: ApplicationStage.INTERVIEW_SCHEDULED, timestamp: new Date(Date.now() - 0.2 * dayMillis).toISOString(), description: "Interview scheduled: Next Monday, 2 PM with Mr. Green.", nextStepSuggestion: "Ace that interview!" },
      { stage: ApplicationStage.INTERVIEW_COMPLETED, timestamp: new Date(Date.now() - 0.1 * dayMillis).toISOString(), description: "Interview completed.", nextStepSuggestion: "Fingers crossed! Await their decision." },
      { stage: ApplicationStage.AWAITING_DECISION, timestamp: new Date(Date.now() - 0.05 * dayMillis).toISOString(), description: "Your application is under final review.", nextStepSuggestion: "The company is making a decision. You should hear back soon." },

    ],
    candidate: mockCandidates.find(c => c.id === 'cand3'),
    company: mockCompanies.find(c => c.id === 'comp3'),
  },
];

// Ensure all matches have candidate and company details for the frontend
mockMatches.forEach(match => {
  if (!match.candidate) match.candidate = mockCandidates.find(c => c.id === match.candidateProfileIdForDisplay);
  if (!match.company) match.company = mockCompanies.find(c => c.id === match.companyProfileIdForDisplay);
});
