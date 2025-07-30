import React from 'react';
import { IndustryEvent, EventFormat } from '@/lib/types';

// Base interfaces for structured data
interface Organization {
  '@type': 'Organization';
  name: string;
  url?: string;
  logo?: string;
  description?: string;
}

interface Place {
  '@type': 'Place';
  name?: string;
  address?: {
    '@type': 'PostalAddress';
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
}

// Job Posting Schema
interface JobPostingSchema {
  '@context': 'https://schema.org';
  '@type': 'JobPosting';
  title: string;
  description: string;
  hiringOrganization: Organization;
  jobLocation: Place | Place[];
  datePosted: string;
  validThrough?: string;
  employmentType?: string;
  baseSalary?: {
    '@type': 'MonetaryAmount';
    currency: string;
    value?: {
      '@type': 'QuantitativeValue';
      minValue?: number;
      maxValue?: number;
      unitText?: string;
    };
  };
  qualifications?: string;
  responsibilities?: string;
  industry?: string;
  occupationalCategory?: string;
  workHours?: string;
  benefits?: string[];
  applicationContact?: {
    '@type': 'ContactPoint';
    contactType: string;
    email?: string;
    url?: string;
  };
}

// Event Schema
interface EventSchema {
  '@context': 'https://schema.org';
  '@type': 'Event';
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  eventAttendanceMode: string;
  eventStatus: string;
  location?: Place | {
    '@type': 'VirtualLocation';
    url: string;
    name?: string;
  };
  organizer: Organization;
  offers?: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
    availability: string;
    url?: string;
  };
  performer?: {
    '@type': 'Person' | 'Organization';
    name: string;
    description?: string;
    image?: string;
  }[];
  audience?: {
    '@type': 'Audience';
    audienceType: string;
  };
  image?: string;
  url?: string;
}

// Article Schema
interface ArticleSchema {
  '@context': 'https://schema.org';
  '@type': 'Article';
  headline: string;
  description: string;
  author: {
    '@type': 'Person' | 'Organization';
    name: string;
    url?: string;
  };
  publisher: Organization;
  datePublished: string;
  dateModified?: string;
  image?: string;
  url: string;
  articleSection?: string;
  wordCount?: number;
  keywords?: string[];
  mainEntityOfPage?: {
    '@type': 'WebPage';
    '@id': string;
  };
}

// Company Profile Schema
interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  description: string;
  url: string;
  logo?: string;
  address?: {
    '@type': 'PostalAddress';
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  contactPoint?: {
    '@type': 'ContactPoint';
    telephone?: string;
    contactType: string;
    email?: string;
  };
  foundingDate?: string;
  numberOfEmployees?: {
    '@type': 'QuantitativeValue';
    minValue?: number;
    maxValue?: number;
  };
  industry?: string;
  sameAs?: string[];
}

// Utility functions
export const generateJobPostingSchema = (job: {
  title: string;
  description: string;
  company: string;
  companyUrl?: string;
  companyLogo?: string;
  location: string;
  type: string;
  datePosted: string;
  validThrough?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  qualifications?: string;
  responsibilities?: string;
  industry?: string;
  benefits?: string[];
  applicationUrl?: string;
  applicationEmail?: string;
}): JobPostingSchema => {
  const schema: JobPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company,
      url: job.companyUrl || '',
      logo: job.companyLogo || '',
    },
    jobLocation: {
      '@type': 'Place',
      name: job.location,
    },
    datePosted: job.datePosted,
    employmentType: getEmploymentType(job.type),
  };

  if (job.validThrough) {
    schema.validThrough = job.validThrough;
  }

  if (job.salaryMin || job.salaryMax) {
    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: job.currency || 'USD',
      value: {
        '@type': 'QuantitativeValue',
        ...(job.salaryMin && { minValue: job.salaryMin }),
        ...(job.salaryMax && { maxValue: job.salaryMax }),
        unitText: 'YEAR',
      },
    };
  }

  if (job.qualifications) {
    schema.qualifications = job.qualifications;
  }

  if (job.responsibilities) {
    schema.responsibilities = job.responsibilities;
  }

  if (job.industry) {
    schema.industry = job.industry;
  }

  if (job.benefits) {
    schema.benefits = job.benefits;
  }

  if (job.applicationUrl || job.applicationEmail) {
    schema.applicationContact = {
      '@type': 'ContactPoint',
      contactType: 'application',
      ...(job.applicationEmail && { email: job.applicationEmail }),
      ...(job.applicationUrl && { url: job.applicationUrl }),
    };
  }

  return schema;
};

export const generateEventSchema = (event: IndustryEvent): EventSchema => {
  const schema: EventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate: event.startDateTime,
    endDate: event.endDateTime,
    eventAttendanceMode: getEventAttendanceMode(event.format!),
    eventStatus: getEventStatus(event),
    organizer: {
      '@type': 'Organization',
      name: event.organizer.name,
      url: event.organizer.website || '',
    },
  };

  // Location handling
  if (event.format === 'virtual') {
    if (event.location.meetingUrl) {
      schema.location = {
        '@type': 'VirtualLocation',
        url: event.location.meetingUrl,
        name: event.location.platform || 'Virtual Event',
      };
    }
  } else {
    schema.location = {
      '@type': 'Place',
      name: event.location.venue || event.location.city || '',
      ...(event.location.address && {
        address: {
          '@type': 'PostalAddress',
          streetAddress: event.location.address,
          addressLocality: event.location.city || '',
          addressRegion: event.location.state || '',
          addressCountry: event.location.country || 'US',
        },
      }),
    };
  }

  // Pricing
  if (event.isFree || event.price !== undefined) {
    schema.offers = {
      '@type': 'Offer',
      price: event.isFree ? '0' : (event.price?.toString() || '0'),
      priceCurrency: event.currency || 'USD',
      availability: event.capacity && event.registeredCount >= event.capacity 
        ? 'https://schema.org/SoldOut' 
        : 'https://schema.org/InStock',
      ...(event.registrationUrl && { url: event.registrationUrl }),
    };
  }

  // Speakers/Performers
  if (event.speakers && event.speakers.length > 0) {
    schema.performer = event.speakers.map(speaker => ({
      '@type': 'Person' as const,
      name: speaker.name,
      description: speaker.bio || '',
      image: speaker.photoUrl || '',
    }));
  }

  // Target audience
  if (event.targetAudience && event.targetAudience.length > 0) {
    schema.audience = {
      '@type': 'Audience',
      audienceType: event.targetAudience.join(', '),
    };
  }

  if (event.bannerUrl) {
    schema.image = event.bannerUrl;
  }

  return schema;
};

export const generateArticleSchema = (article: {
  headline: string;
  description: string;
  content?: string;
  author: string;
  authorUrl?: string;
  publisherName: string;
  publisherUrl: string;
  publisherLogo?: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  url: string;
  category?: string;
  keywords?: string[];
}): ArticleSchema => {
  const wordCount = article.content ? article.content.split(/\s+/).length : undefined;

  const schema: ArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author,
      url: article.authorUrl || '',
    },
    publisher: {
      '@type': 'Organization',
      name: article.publisherName,
      url: article.publisherUrl,
      logo: article.publisherLogo || '',
    },
    datePublished: article.datePublished,
    url: article.url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
  };

  if (article.dateModified) {
    schema.dateModified = article.dateModified;
  }

  if (article.image) {
    schema.image = article.image;
  }

  if (article.category) {
    schema.articleSection = article.category;
  }

  if (wordCount) {
    schema.wordCount = wordCount;
  }

  if (article.keywords) {
    schema.keywords = article.keywords;
  }

  return schema;
};

export const generateOrganizationSchema = (organization: {
  name: string;
  description: string;
  url: string;
  logo?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  phone?: string;
  email?: string;
  foundingDate?: string;
  employeeCount?: { min?: number; max?: number };
  industry?: string;
  socialProfiles?: string[];
}): OrganizationSchema => {
  const schema: OrganizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: organization.name,
    description: organization.description,
    url: organization.url,
  };

  if (organization.logo) {
    schema.logo = organization.logo;
  }

  if (organization.address) {
    schema.address = {
      '@type': 'PostalAddress',
      streetAddress: organization.address.street || '',
      addressLocality: organization.address.city || '',
      addressRegion: organization.address.state || '',
      postalCode: organization.address.zipCode || '',
      addressCountry: organization.address.country || 'US',
    };
  }

  if (organization.phone || organization.email) {
    schema.contactPoint = {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: organization.phone || '',
      email: organization.email || '',
    };
  }

  if (organization.foundingDate) {
    schema.foundingDate = organization.foundingDate;
  }

  if (organization.employeeCount) {
    schema.numberOfEmployees = {
      '@type': 'QuantitativeValue',
      minValue: organization.employeeCount.min || 0,
      maxValue: organization.employeeCount.max || 0,
    };
  }

  if (organization.industry) {
    schema.industry = organization.industry;
  }

  if (organization.socialProfiles) {
    schema.sameAs = organization.socialProfiles;
  }

  return schema;
};

// Helper functions
const getEmploymentType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'full-time': 'FULL_TIME',
    'part-time': 'PART_TIME',
    'contract': 'CONTRACTOR',
    'temporary': 'TEMPORARY',
    'internship': 'INTERN',
    'freelance': 'CONTRACTOR',
  };
  return typeMap[type.toLowerCase()] || 'FULL_TIME';
};

const getEventAttendanceMode = (format: EventFormat | string): string => {
  const modeMap: Record<string, string> = {
    'virtual': 'https://schema.org/OnlineEventAttendanceMode',
    'in_person': 'https://schema.org/OfflineEventAttendanceMode',
    'hybrid': 'https://schema.org/MixedEventAttendanceMode',
  };
  return modeMap[format] || 'https://schema.org/OfflineEventAttendanceMode';
};

const getEventStatus = (event: IndustryEvent): string => {
  const now = new Date();
  const startDate = new Date(event.startDateTime);
  const endDate = new Date(event.endDateTime);

  if (now < startDate) {
    return 'https://schema.org/EventScheduled';
  } else if (now >= startDate && now <= endDate) {
    return 'https://schema.org/EventRescheduled'; // Live events
  } else {
    return 'https://schema.org/EventCancelled'; // Past events
  }
};

// React component for injecting structured data
export const StructuredData = ({ data }: { data: any }) => {
  return React.createElement('script', {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: {
      __html: JSON.stringify(data, null, 2),
    },
  });
};