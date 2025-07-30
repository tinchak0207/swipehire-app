// Advanced Schema.org markup for rich results

// FAQ Page Schema
export interface FAQItem {
  question: string;
  answer: string;
}

export const generateFAQSchema = (faqs: FAQItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

// Breadcrumb List Schema
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export const generateBreadcrumbSchema = (breadcrumbs: BreadcrumbItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url.startsWith('http') ? item.url : `https://swipehire.top${item.url}`,
  })),
});

// HowTo Schema
export interface HowToStep {
  name: string;
  text: string;
  image?: string;
  url?: string;
}

export const generateHowToSchema = ({
  name,
  description,
  steps,
  totalTime,
  estimatedCost,
  supply = [],
  tool = [],
  image,
}: {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string; // ISO 8601 duration format (e.g., "PT30M" for 30 minutes)
  estimatedCost?: {
    currency: string;
    value: string;
  };
  supply?: string[];
  tool?: string[];
  image?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name,
  description,
  image,
  totalTime,
  estimatedCost,
  supply: supply.map((item) => ({
    '@type': 'HowToSupply',
    name: item,
  })),
  tool: tool.map((item) => ({
    '@type': 'HowToTool',
    name: item,
  })),
  step: steps.map((step, index) => ({
    '@type': 'HowToStep',
    position: index + 1,
    name: step.name,
    text: step.text,
    image: step.image,
    url: step.url,
  })),
});

// Course Schema (for comprehensive guides)
export const generateCourseSchema = ({
  name,
  description,
  provider,
  instructor,
  courseCode,
  hasCourseInstance,
  audience,
  competencyRequired,
  educationalCredentialAwarded,
  image,
  url,
}: {
  name: string;
  description: string;
  provider: string;
  instructor?: string;
  courseCode?: string;
  hasCourseInstance?: Array<{
    courseMode: string;
    startDate: string;
    endDate?: string;
    courseSchedule?: string;
  }>;
  audience?: string;
  competencyRequired?: string[];
  educationalCredentialAwarded?: string;
  image?: string;
  url: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Course',
  name,
  description,
  provider: {
    '@type': 'Organization',
    name: provider,
    url: 'https://swipehire.top',
  },
  instructor: instructor
    ? {
        '@type': 'Person',
        name: instructor,
      }
    : undefined,
  courseCode,
  hasCourseInstance: hasCourseInstance?.map((instance) => ({
    '@type': 'CourseInstance',
    courseMode: instance.courseMode,
    startDate: instance.startDate,
    endDate: instance.endDate,
    courseSchedule: instance.courseSchedule,
  })),
  audience: audience
    ? {
        '@type': 'Audience',
        audienceType: audience,
      }
    : undefined,
  competencyRequired: competencyRequired?.join(', '),
  educationalCredentialAwarded,
  image,
  url,
});

// WebSite Schema with SearchAction
export const generateWebSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'SwipeHire',
  alternateName: 'SwipeHire - Tech Recruitment Platform',
  url: 'https://swipehire.top',
  description:
    'AI-powered tech recruitment platform connecting talented developers with innovative companies.',
  publisher: {
    '@type': 'Organization',
    name: 'SwipeHire',
    url: 'https://swipehire.top',
    logo: 'https://swipehire.top/logo.png',
    sameAs: [
      'https://linkedin.com/company/swipehire',
      'https://twitter.com/swipehire',
      'https://github.com/swipehire',
    ],
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://swipehire.top/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
});

// ItemList Schema (for job listings, articles, etc.)
export const generateItemListSchema = ({
  name,
  description,
  url,
  items,
}: {
  name: string;
  description: string;
  url: string;
  items: Array<{
    name: string;
    url: string;
    description?: string;
    image?: string;
    datePublished?: string;
  }>;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name,
  description,
  url,
  numberOfItems: items.length,
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'Thing',
      name: item.name,
      url: item.url,
      description: item.description,
      image: item.image,
      datePublished: item.datePublished,
    },
  })),
});

// LocalBusiness Schema (for location-specific pages)
export const generateLocalBusinessSchema = ({
  name,
  address,
  telephone,
  priceRange,
  openingHours,
  geo,
}: {
  name: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  telephone?: string;
  priceRange?: string;
  openingHours?: string[];
  geo?: {
    latitude: number;
    longitude: number;
  };
}) => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `https://swipehire.top/locations/${address.addressLocality.toLowerCase()}`,
  name,
  address: {
    '@type': 'PostalAddress',
    ...address,
  },
  telephone,
  priceRange,
  openingHoursSpecification: openingHours?.map(() => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: 'Monday,Tuesday,Wednesday,Thursday,Friday',
    opens: '09:00',
    closes: '17:00',
  })),
  geo: geo
    ? {
        '@type': 'GeoCoordinates',
        latitude: geo.latitude,
        longitude: geo.longitude,
      }
    : undefined,
});

// Review Schema
export const generateReviewSchema = ({
  itemReviewed,
  author,
  reviewRating,
  reviewBody,
  datePublished,
}: {
  itemReviewed: {
    type: string;
    name: string;
    url?: string;
  };
  author: string;
  reviewRating: {
    ratingValue: number;
    bestRating?: number;
    worstRating?: number;
  };
  reviewBody: string;
  datePublished: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Review',
  itemReviewed: {
    '@type': itemReviewed.type,
    name: itemReviewed.name,
    url: itemReviewed.url,
  },
  author: {
    '@type': 'Person',
    name: author,
  },
  reviewRating: {
    '@type': 'Rating',
    ratingValue: reviewRating.ratingValue,
    bestRating: reviewRating.bestRating || 5,
    worstRating: reviewRating.worstRating || 1,
  },
  reviewBody,
  datePublished,
  publisher: {
    '@type': 'Organization',
    name: 'SwipeHire',
  },
});

// Utility function to stringify schema for script tags
export const stringifySchema = (schema: any): string => {
  return JSON.stringify(schema, null, 0);
};

// Multiple schema combination utility
export const combineSchemas = (...schemas: any[]): string => {
  return schemas.map((schema) => stringifySchema(schema)).join('\n');
};

// Schema validation utility (development only)
export const validateSchema = (schema: any): boolean => {
  try {
    JSON.stringify(schema);
    return schema['@context'] && schema['@type'];
  } catch {
    return false;
  }
};
