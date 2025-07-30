import type { Metadata } from 'next';

// Base configuration for all pages
export const baseMetadata = {
  generator: 'SwipeHire',
  applicationName: 'SwipeHire',
  referrer: 'origin-when-cross-origin',
  authors: [{ name: 'SwipeHire Team', url: 'https://swipehire.top' }],
  creator: 'SwipeHire',
  publisher: 'SwipeHire',
  metadataBase: new URL('https://swipehire.top'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    bing: 'your-bing-verification-code',
  },
  category: 'technology',
};

// Job-related metadata generator
export const generateJobMetadata = ({
  title,
  company,
  location,
  type,
  salaryMin,
  salaryMax,
  skills = [],
  url,
}: {
  title: string;
  company: string;
  location: string;
  type: string;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  url: string;
}): Metadata => {
  const salaryRange = salaryMin && salaryMax ? `${salaryMin}k-${salaryMax}k` : '';
  const skillsText = skills.length > 0 ? skills.slice(0, 3).join(', ') : '';

  const metaTitle = `${title} at ${company} - ${location} ${salaryRange ? `| ${salaryRange}` : ''} | ${new Date().getFullYear()}`;
  const metaDescription = `Apply for ${title} position at ${company} in ${location}. ${salaryRange ? `Salary: ${salaryRange}. ` : ''}${skillsText ? `Skills: ${skillsText}. ` : ''}Join innovative team on SwipeHire.`;

  return {
    ...(baseMetadata as any),
    title: metaTitle,
    description: metaDescription,
    keywords: [
      title.toLowerCase(),
      `${title.toLowerCase()} jobs`,
      company.toLowerCase(),
      `${company.toLowerCase()} careers`,
      location.toLowerCase(),
      `${location.toLowerCase()} tech jobs`,
      type.toLowerCase(),
      ...skills.map((skill) => skill.toLowerCase()),
      'remote work',
      'tech jobs',
      'software engineer',
      'developer position',
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} at ${company} - Apply Now on SwipeHire`,
      description: metaDescription,
      url,
      siteName: 'SwipeHire',
      type: 'website',
      images: [
        {
          url: '/og-images/job-posting.png',
          width: 1200,
          height: 630,
          alt: `${title} at ${company}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} at ${company}`,
      description: metaDescription,
      creator: '@SwipeHire',
      images: ['/og-images/job-posting.png'],
    },
  };
};

// Event metadata generator
export const generateEventMetadata = ({
  title,
  description,
  organizer,
  startDate,
  location,
  price,
  isFree,
  eventType,
  url,
  image,
}: {
  title: string;
  description: string;
  organizer: string;
  startDate: string;
  location: string;
  price?: number;
  isFree?: boolean;
  eventType: string;
  url: string;
  image?: string;
}): Metadata => {
  const eventDate = new Date(startDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const priceText = isFree ? 'Free' : price ? `${price}` : 'TBA';
  const metaTitle = `${title} - ${eventDate} | Tech Events on SwipeHire | ${new Date().getFullYear()}`;
  const metaDescription = `Join ${title} organized by ${organizer}. ${description.slice(0, 100)}... ${priceText} • ${location} • Register on SwipeHire.`;

  return {
    ...(baseMetadata as any),
    title: metaTitle,
    description: metaDescription,
    keywords: [
      title.toLowerCase(),
      eventType.toLowerCase(),
      'tech event',
      'networking event',
      'professional development',
      organizer.toLowerCase(),
      location.toLowerCase(),
      'career growth',
      'industry conference',
      'tech meetup',
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} - Don't Miss This Tech Event`,
      description: metaDescription,
      url,
      siteName: 'SwipeHire',
      type: 'website',
      images: [
        {
          url: image || '/og-images/tech-event.png',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} - Tech Event`,
      description: metaDescription,
      creator: '@SwipeHire',
      images: [image || '/og-images/tech-event.png'],
    },
  };
};

// Company profile metadata generator
export const generateCompanyMetadata = ({
  name,
  industry,
  description,
  location,
  openJobs,
  url,
  logo,
}: {
  name: string;
  industry: string;
  description: string;
  location?: string;
  openJobs?: number;
  url: string;
  logo?: string;
}): Metadata => {
  const metaTitle = `${name} Careers - Company Profile & Jobs | SwipeHire | ${new Date().getFullYear()}`;
  const metaDescription = `Explore career opportunities at ${name}. ${industry} company ${location ? `based in ${location}` : ''}. ${openJobs ? `${openJobs} open positions. ` : ''}${description.slice(0, 100)}...`;

  return {
    ...(baseMetadata as any),
    title: metaTitle,
    description: metaDescription,
    keywords: [
      `${name.toLowerCase()} careers`,
      `${name.toLowerCase()} jobs`,
      `work at ${name.toLowerCase()}`,
      `${name.toLowerCase()} company culture`,
      industry.toLowerCase(),
      location?.toLowerCase(),
      'tech company',
      'software jobs',
      'developer positions',
      'company reviews',
    ].filter(Boolean) as string[],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${name} - Company Profile & Career Opportunities`,
      description: metaDescription,
      url,
      siteName: 'SwipeHire',
      type: 'website',
      images: [
        {
          url: logo || '/og-images/company-profile.png',
          width: 1200,
          height: 630,
          alt: `${name} company profile`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} - Career Opportunities`,
      description: metaDescription,
      creator: '@SwipeHire',
      images: [logo || '/og-images/company-profile.png'],
    },
  };
};

// Blog article metadata generator
export const generateArticleMetadata = ({
  title,
  description,
  author,
  publishedTime,
  modifiedTime,
  category,
  tags = [],
  url,
  image,
}: {
  title: string;
  description: string;
  author: string;
  publishedTime: string;
  modifiedTime?: string;
  category: string;
  tags?: string[];
  url: string;
  image?: string;
}): Metadata => {
  const metaTitle = `${title} - Expert Career Advice | SwipeHire Blog | ${new Date().getFullYear()}`;
  const metaDescription = `${description} Expert insights and actionable tips for tech professionals from SwipeHire's career experts.`;

  return {
    ...(baseMetadata as any),
    title: metaTitle,
    description: metaDescription,
    keywords: [
      ...title.toLowerCase().split(' '),
      ...tags.map((tag) => tag.toLowerCase()),
      category.toLowerCase(),
      'career advice',
      'tech industry insights',
      'professional development',
      'career growth',
      'job search tips',
    ],
    authors: [{ name: author }],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description: metaDescription,
      url,
      siteName: 'SwipeHire',
      type: 'article',
      publishedTime,
      modifiedTime,
      authors: [author],
      section: category,
      tags,
      images: [
        {
          url: image || '/og-images/blog-article.png',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} - SwipeHire Blog`,
      description: metaDescription,
      creator: '@SwipeHire',
      images: [image || '/og-images/blog-article.png'],
    },
  };
};

// Location-based landing page metadata
export const generateLocationMetadata = ({
  city,
  state,
  jobCount,
  topCompanies = [],
  averageSalary,
  url,
}: {
  city: string;
  state: string;
  jobCount: number;
  topCompanies?: string[];
  averageSalary?: { min: number; max: number };
  url: string;
}): Metadata => {
  const location = `${city}, ${state}`;
  const salaryText = averageSalary
    ? `Average salary: ${averageSalary.min}k-${averageSalary.max}k. `
    : '';
  const companiesText =
    topCompanies.length > 0 ? `Top employers: ${topCompanies.slice(0, 3).join(', ')}. ` : '';

  const metaTitle = `Tech Jobs in ${location} - ${jobCount}+ Opportunities | SwipeHire | ${new Date().getFullYear()}`;
  const metaDescription = `Find ${jobCount}+ tech jobs in ${location}. ${salaryText}${companiesText}Remote and on-site positions available. Apply now on SwipeHire.`;

  return {
    ...(baseMetadata as any),
    title: metaTitle,
    description: metaDescription,
    keywords: [
      `tech jobs ${city.toLowerCase()}`,
      `software engineer jobs ${city.toLowerCase()}`,
      `developer positions ${city.toLowerCase()}`,
      `${city.toLowerCase()} tech careers`,
      `${state.toLowerCase()} tech jobs`,
      'remote work opportunities',
      'startup jobs',
      'engineering positions',
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `Tech Jobs in ${location} - Find Your Next Opportunity`,
      description: metaDescription,
      url,
      siteName: 'SwipeHire',
      type: 'website',
      images: [
        {
          url: '/og-images/location-jobs.png',
          width: 1200,
          height: 630,
          alt: `Tech jobs in ${location}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Tech Jobs in ${location}`,
      description: metaDescription,
      creator: '@SwipeHire',
      images: ['/og-images/location-jobs.png'],
    },
  };
};

// Homepage metadata
export const generateHomepageMetadata = (): Metadata => {
  return {
    ...(baseMetadata as any),
    title: 'SwipeHire - AI-Powered Tech Recruitment Platform | Find Your Dream Job',
    description:
      "Discover your next tech role with SwipeHire's AI-powered job matching platform. Connect with top companies, optimize your resume, and accelerate your career in technology. Join 50,000+ professionals today.",
    keywords: [
      'tech jobs',
      'AI recruitment',
      'software engineer jobs',
      'developer careers',
      'tech talent platform',
      'resume optimization',
      'career growth',
      'job matching',
      'remote tech jobs',
      'startup careers',
    ],
    openGraph: {
      title: 'SwipeHire - Where Tech Talent Meets Opportunity',
      description:
        'Join the smartest tech recruitment platform. AI-powered matching, personalized career insights, and direct connections with innovative companies.',
      url: 'https://swipehire.top',
      siteName: 'SwipeHire',
      type: 'website',
      images: [
        {
          url: '/og-images/homepage.png',
          width: 1200,
          height: 630,
          alt: 'SwipeHire - AI-Powered Tech Recruitment Platform',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'SwipeHire - AI-Powered Tech Recruitment Platform',
      description:
        'Discover your next tech role with intelligent job matching and career optimization tools.',
      creator: '@SwipeHire',
      images: ['/og-images/homepage.png'],
    },
  };
};

// Utility function to truncate description to optimal length
export const optimizeDescription = (text: string, maxLength = 160): string => {
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');

  return lastSpace > 0 ? truncated.slice(0, lastSpace) + '...' : truncated + '...';
};

// Utility function to generate keywords from text
export const extractKeywords = (text: string, additionalKeywords: string[] = []): string[] => {
  const commonWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'could',
    'should',
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !commonWords.has(word));

  const keywordCounts = new Map<string, number>();
  words.forEach((word) => {
    keywordCounts.set(word, (keywordCounts.get(word) || 0) + 1);
  });

  const sortedKeywords = Array.from(keywordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .slice(0, 10);

  return [...new Set([...sortedKeywords, ...additionalKeywords])];
};
