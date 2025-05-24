
import type { Candidate, Company } from './types';

export const mockCandidates: Candidate[] = [
  {
    id: 'cand1',
    name: 'Alice Wonderland',
    role: 'Senior Software Engineer',
    experienceSummary: '5 years of Python development, loves remote work and agile teams. Passionate about AI and machine learning applications. Proven track record of delivering high-quality code and leading project teams to success in fast-paced environments.',
    skills: ['Python', 'Django', 'React', 'AWS', 'Docker', 'AI'],
    avatarUrl: 'https://placehold.co/500x700.png', // Taller image
    dataAiHint: 'professional woman',
    videoResumeUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', // Actual video URL placeholder
    profileStrength: 90,
    location: "San Francisco, CA",
    desiredWorkStyle: "Fully Remote, Flexible Hours",
    pastProjects: "Developed an e-commerce recommendation engine, Contributed to open-source ML library"
  },
  {
    id: 'cand2',
    name: 'Bob The Builder',
    role: 'UX/UI Designer',
    experienceSummary: 'Creative designer with 3 years of experience in mobile and web application design. Proficient in Figma and Adobe Suite. User-centric approach with a strong portfolio of intuitive and visually appealing designs.',
    skills: ['UX Design', 'UI Design', 'Figma', 'Adobe XD', 'Prototyping'],
    avatarUrl: 'https://placehold.co/500x700.png',
    dataAiHint: 'creative man',
    profileStrength: 85,
    location: "New York, NY",
    desiredWorkStyle: "Hybrid, Collaborative Environment",
    pastProjects: "Redesigned a mobile banking app, Created a design system for a SaaS product"
  },
  {
    id: 'cand3',
    name: 'Charlie Brown',
    role: 'Product Manager',
    experienceSummary: 'Results-driven PM with a knack for launching successful SaaS products. 7 years in product strategy and roadmap execution. Excellent communication and leadership skills, adept at cross-functional team collaboration.',
    skills: ['Product Management', 'Agile', 'Scrum', 'Roadmapping', 'Market Analysis'],
    avatarUrl: 'https://placehold.co/500x700.png',
    dataAiHint: 'focused person',
    videoResumeUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    profileStrength: 95,
    location: "Austin, TX",
    desiredWorkStyle: "Remote or On-site, Fast-paced Startup",
    pastProjects: "Launched three new SaaS products from concept to market, Grew user base by 200% for a B2B platform"
  },
  {
    id: 'cand4',
    name: 'Diana Prince',
    role: 'Data Scientist',
    experienceSummary: 'Expert in statistical modeling and machine learning with 4 years experience. Eager to solve complex problems with data. Strong analytical abilities and experience with big data technologies.',
    skills: ['Machine Learning', 'Data Analysis', 'Python', 'R', 'SQL'],
    avatarUrl: 'https://placehold.co/500x700.png',
    dataAiHint: 'intelligent woman',
    profileStrength: 88,
    location: "Remote",
    desiredWorkStyle: "Remote, Research-Oriented",
    pastProjects: "Built a predictive model for customer churn, Optimized ad spend using ML algorithms"
  },
];

export const mockCompanies: Company[] = [
  {
    id: 'comp1',
    name: 'Innovatech Solutions',
    industry: 'Technology',
    description: 'Cutting-edge software solutions for a brighter future. We value innovation, collaboration, and impact. Join us to work on challenging projects with a talented team.',
    cultureHighlights: ['Remote-First', 'Unlimited PTO', 'Weekly Tech Talks', 'Health & Wellness'],
    logoUrl: 'https://placehold.co/500x350.png', // Wider logo/banner
    dataAiHint: 'modern logo tech company',
    introVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    companyNeeds: "We need to optimize our payment processing system and enhance user experience on our e-commerce platform.",
    jobOpenings: [
      { title: "Senior Frontend Developer", description: "Join our team to build amazing user interfaces."},
      { title: "Backend Python Developer", description: "Help scale our infrastructure and build robust APIs."}
    ],
    salaryRange: '$120k - $160k',
    jobType: 'Full-time',
  },
  {
    id: 'comp2',
    name: 'Creative Spark Inc.',
    industry: 'Marketing & Advertising',
    description: 'We ignite brands with creative campaigns and data-driven strategies. Looking for passionate creators to join our vibrant and dynamic team.',
    cultureHighlights: ['Pet-Friendly Office', 'Flexible Hours', 'Creative Workshops', 'Team Outings'],
    logoUrl: 'https://placehold.co/500x350.png',
    dataAiHint: 'creative agency logo',
    companyNeeds: "We are looking to expand our design team to handle new client projects requiring innovative branding and digital experiences.",
    jobOpenings: [
      { title: "Graphic Designer", description: "Create stunning visuals for various clients."},
      { title: "Social Media Manager", description: "Develop and execute social media strategies."}
    ],
    salaryRange: '$70k - $90k',
    jobType: 'Full-time',
  },
  {
    id: 'comp3',
    name: 'GreenFuture Ltd.',
    industry: 'Sustainability',
    description: 'Dedicated to building a sustainable future through innovative green technologies. Join our mission-driven team and make a real difference in the world.',
    cultureHighlights: ['Impactful Work', 'Collaborative Environment', 'Eco-Conscious', 'Learning Budget'],
    logoUrl: 'https://placehold.co/500x350.png',
    dataAiHint: 'eco friendly logo',
    introVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    companyNeeds: "Seeking data scientists to analyze environmental data and improve our green tech solutions.",
     jobOpenings: [
      { title: "Environmental Scientist", description: "Conduct research and develop solutions for environmental challenges."},
      { title: "Project Manager - Renewable Energy", description: "Lead exciting projects in the renewable energy sector."}
    ],
    salaryRange: '$90k - $130k',
    jobType: 'Contract',
  },
];
