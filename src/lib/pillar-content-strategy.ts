// Topic cluster configuration and utilities
export interface ClusterArticle {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  pillarTopic: string;
  keywords: string[];
  publishedDate: string;
  readingTime: number;
  author: string;
  featured?: boolean;
}

export interface PillarPage {
  id: string;
  title: string;
  slug: string;
  description: string;
  keywords: string[];
  clusterArticles: ClusterArticle[];
  lastUpdated: string;
  readingTime: number;
  targetKeyword: string;
  searchVolume: number;
}

// Pillar page configuration
export const pillarPages: PillarPage[] = [
  {
    id: 'tech-interview-preparation',
    title: 'The Complete Guide to Tech Interview Preparation in 2025',
    slug: 'tech-interview-preparation-guide',
    description:
      'Master every aspect of tech interviews with our comprehensive guide. From coding challenges to system design, behavioral questions to salary negotiation - everything you need to land your dream tech job.',
    keywords: [
      'tech interview preparation',
      'coding interview guide',
      'system design interview',
      'behavioral interview questions',
      'tech interview tips',
      'software engineer interview',
      'programming interview prep',
    ],
    targetKeyword: 'tech interview preparation',
    searchVolume: 22000,
    readingTime: 45,
    lastUpdated: new Date().toISOString(),
    clusterArticles: [
      {
        id: 'coding-interview-patterns',
        title: 'Top 20 Coding Interview Patterns Every Developer Should Know',
        slug: 'coding-interview-patterns',
        description:
          'Master the most common coding interview patterns and solve any algorithmic challenge.',
        category: 'Technical Preparation',
        pillarTopic: 'tech-interview-preparation',
        keywords: ['coding patterns', 'algorithm interview', 'data structures'],
        publishedDate: '2024-12-01',
        readingTime: 15,
        author: 'SwipeHire Team',
        featured: true,
      },
      {
        id: 'system-design-basics',
        title: "System Design Interview: A Complete Beginner's Guide",
        slug: 'system-design-interview-guide',
        description:
          'Learn how to approach system design interviews with confidence and structured thinking.',
        category: 'Technical Preparation',
        pillarTopic: 'tech-interview-preparation',
        keywords: ['system design', 'scalability', 'architecture interview'],
        publishedDate: '2024-11-15',
        readingTime: 20,
        author: 'SwipeHire Team',
      },
      {
        id: 'behavioral-interview-questions',
        title: 'How to Answer "Tell Me About Yourself" and 50 Other Behavioral Questions',
        slug: 'behavioral-interview-questions-tech',
        description:
          'Perfect your behavioral interview responses with proven frameworks and examples.',
        category: 'Soft Skills',
        pillarTopic: 'tech-interview-preparation',
        keywords: ['behavioral interview', 'STAR method', 'soft skills'],
        publishedDate: '2024-11-20',
        readingTime: 12,
        author: 'SwipeHire Team',
      },
      {
        id: 'salary-negotiation-tech',
        title: 'Tech Salary Negotiation: How to Get 20-50% More Money',
        slug: 'tech-salary-negotiation-guide',
        description:
          'Learn proven strategies to negotiate your tech salary and maximize your compensation package.',
        category: 'Career Growth',
        pillarTopic: 'tech-interview-preparation',
        keywords: ['salary negotiation', 'tech compensation', 'job offer'],
        publishedDate: '2024-10-30',
        readingTime: 18,
        author: 'SwipeHire Team',
      },
    ],
  },
  {
    id: 'resume-optimization',
    title: 'The Ultimate Resume Optimization Guide for Tech Professionals',
    slug: 'resume-optimization-guide',
    description:
      'Transform your resume into an ATS-beating, recruiter-attracting masterpiece. Complete guide to resume optimization for software engineers, data scientists, and tech professionals.',
    keywords: [
      'resume optimization',
      'ATS resume tips',
      'tech resume examples',
      'software engineer resume',
      'resume keywords',
      'resume formatting',
      'tech CV guide',
    ],
    targetKeyword: 'resume optimization',
    searchVolume: 15000,
    readingTime: 35,
    lastUpdated: new Date().toISOString(),
    clusterArticles: [
      {
        id: 'ats-resume-guide',
        title: 'How to Beat the ATS in 2025: An AI-Powered Guide for Engineers',
        slug: 'how-to-beat-the-ats-in-2025',
        description:
          'Learn how to optimize your engineering resume for Applicant Tracking Systems using AI.',
        category: 'Resume Writing',
        pillarTopic: 'resume-optimization',
        keywords: ['ATS optimization', 'resume scanning', 'keyword optimization'],
        publishedDate: '2023-10-26',
        readingTime: 12,
        author: 'SwipeHire Team',
        featured: true,
      },
      {
        id: 'resume-keywords-2025',
        title: 'Top 100 Resume Keywords for Tech Jobs in 2025',
        slug: 'resume-keywords-tech-jobs-2025',
        description:
          'The most important keywords to include in your tech resume to get noticed by recruiters.',
        category: 'Resume Writing',
        pillarTopic: 'resume-optimization',
        keywords: ['resume keywords', 'tech skills', 'programming languages'],
        publishedDate: '2024-12-15',
        readingTime: 10,
        author: 'SwipeHire Team',
      },
      {
        id: 'resume-templates-tech',
        title: '15 Professional Resume Templates for Software Engineers',
        slug: 'software-engineer-resume-templates',
        description:
          'Download free, ATS-friendly resume templates specifically designed for tech professionals.',
        category: 'Resume Templates',
        pillarTopic: 'resume-optimization',
        keywords: ['resume templates', 'software engineer resume', 'free resume'],
        publishedDate: '2024-11-05',
        readingTime: 8,
        author: 'SwipeHire Team',
      },
    ],
  },
  {
    id: 'career-growth-developers',
    title: 'Career Growth for Developers: From Junior to Principal Engineer',
    slug: 'developer-career-growth-guide',
    description:
      'Navigate your entire tech career journey with our comprehensive guide. Learn how to advance from junior developer to senior engineer, tech lead, and beyond.',
    keywords: [
      'developer career growth',
      'software engineer career path',
      'tech career advancement',
      'programming career guide',
      'senior developer skills',
      'tech leadership',
      'career progression',
    ],
    targetKeyword: 'developer career growth',
    searchVolume: 8500,
    readingTime: 40,
    lastUpdated: new Date().toISOString(),
    clusterArticles: [
      {
        id: 'junior-to-senior-developer',
        title: 'From Junior to Senior Developer: What It Really Takes',
        slug: 'junior-to-senior-developer-guide',
        description:
          'The essential skills and mindset shifts needed to advance from junior to senior developer.',
        category: 'Career Progression',
        pillarTopic: 'career-growth-developers',
        keywords: ['senior developer', 'career advancement', 'programming skills'],
        publishedDate: '2024-11-30',
        readingTime: 15,
        author: 'SwipeHire Team',
      },
      {
        id: 'tech-lead-skills',
        title: 'Essential Skills Every Tech Lead Needs in 2025',
        slug: 'tech-lead-essential-skills',
        description:
          'Master the technical and leadership skills required to become an effective tech lead.',
        category: 'Leadership',
        pillarTopic: 'career-growth-developers',
        keywords: ['tech lead', 'technical leadership', 'team management'],
        publishedDate: '2024-10-15',
        readingTime: 18,
        author: 'SwipeHire Team',
      },
      {
        id: 'remote-developer-career',
        title: 'Building a Successful Remote Developer Career: Complete Guide',
        slug: 'remote-developer-career-guide',
        description:
          'How to thrive as a remote developer and advance your career while working from anywhere.',
        category: 'Remote Work',
        pillarTopic: 'career-growth-developers',
        keywords: ['remote developer', 'remote work', 'distributed teams'],
        publishedDate: '2024-09-20',
        readingTime: 14,
        author: 'SwipeHire Team',
      },
    ],
  },
];

// Utility functions for pillar page management
export const getPillarPageBySlug = (slug: string): PillarPage | undefined => {
  return pillarPages.find((pillar) => pillar.slug === slug);
};

export const getClusterArticlesByPillar = (pillarId: string): ClusterArticle[] => {
  const pillar = pillarPages.find((p) => p.id === pillarId);
  return pillar?.clusterArticles || [];
};

export const getAllClusterArticles = (): ClusterArticle[] => {
  return pillarPages.flatMap((pillar) => pillar.clusterArticles);
};

export const getRelatedClusterArticles = (currentArticleId: string): ClusterArticle[] => {
  const currentArticle = getAllClusterArticles().find((article) => article.id === currentArticleId);
  if (!currentArticle) return [];

  return getClusterArticlesByPillar(currentArticle.pillarTopic)
    .filter((article) => article.id !== currentArticleId)
    .slice(0, 3);
};

// Internal linking utilities
export const generateInternalLinks = (
  pillarId: string
): Array<{ title: string; url: string; context: string }> => {
  const pillar = pillarPages.find((p) => p.id === pillarId);
  if (!pillar) return [];

  return pillar.clusterArticles.map((article) => ({
    title: article.title,
    url: `/blog/${article.slug}`,
    context: `Learn more about ${article.category.toLowerCase()}`,
  }));
};

export const generatePillarPageBreadcrumbs = (pillarSlug: string) => [
  { name: 'Home', url: '/' },
  { name: 'Career Guides', url: '/guides' },
  { name: 'Complete Guide', url: `/guides/${pillarSlug}` },
];

export const generateClusterArticleBreadcrumbs = (articleSlug: string) => {
  const article = getAllClusterArticles().find((a) => a.slug === articleSlug);
  const pillar = pillarPages.find((p) => p.id === article?.pillarTopic);

  return [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: pillar?.title || 'Guide', url: `/guides/${pillar?.slug}` },
    { name: article?.title || 'Article', url: `/blog/${articleSlug}` },
  ];
};
