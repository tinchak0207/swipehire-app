/**
 * SEO Schema.org structured data utilities for SwipeHire
 * Optimized for job posting rich results and Google for Jobs
 */

import { JobType } from '@/lib/types';

export interface JobPostingSchemaData {
  title: string;
  description: string;
  company: {
    name: string;
    logo?: string;
    website?: string;
    industry?: string;
  };
  location: {
    city?: string;
    region?: string;
    country?: string;
    isRemote?: boolean;
  };
  salary?: {
    min: number;
    max: number;
    currency: string;
    period: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  };
  jobId: string;
  datePosted: string;
  validThrough?: string;
  employmentType?: string;
  workHours?: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  skills?: string[];
}

/**
 * Generate JobPosting structured data for rich results
 * Compliant with Google for Jobs requirements
 */
export function generateJobPostingSchema(data: JobPostingSchemaData): Record<string, any> {
  const baseSchema = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": data.title,
    "description": data.description,
    "identifier": {
      "@type": "PropertyValue",
      "name": "SwipeHire Job ID",
      "value": data.jobId
    },
    "datePosted": data.datePosted,
    "validThrough": data.validThrough || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    "employmentType": mapEmploymentType(data.employmentType),
    "hiringOrganization": {
      "@type": "Organization",
      "name": data.company.name,
      ...(data.company.website && { "sameAs": data.company.website }),
      ...(data.company.logo && { "logo": data.company.logo }),
      ...(data.company.industry && { "description": `${data.company.industry} company` })
    },
    "jobLocation": generateJobLocationSchema(data.location),
    "applicantLocationRequirements": data.location.country ? {
      "@type": "Country",
      "name": data.location.country
    } : undefined,
    "jobLocationType": data.location.isRemote ? "TELECOMMUTE" : undefined,
    ...(data.salary && {
      "baseSalary": {
        "@type": "MonetaryAmount",
        "currency": data.salary.currency,
        "value": {
          "@type": "QuantitativeValue",
          "minValue": data.salary.min,
          "maxValue": data.salary.max,
          "unitText": data.salary.period
        }
      }
    }),
    ...(data.workHours && { "workHours": data.workHours }),
    ...(data.requirements && data.requirements.length > 0 && { 
      "qualifications": data.requirements.join('; ') 
    }),
    ...(data.responsibilities && data.responsibilities.length > 0 && { 
      "responsibilities": data.responsibilities.join('; ') 
    }),
    ...(data.benefits && data.benefits.length > 0 && { 
      "jobBenefits": data.benefits.join('; ') 
    }),
    ...(data.skills && data.skills.length > 0 && { 
      "skills": data.skills.join(', ') 
    }),
    "industry": data.company.industry,
    "url": `https://swipehire.top/jobs/${data.jobId}`,
    "directApply": true,
    "applicationContact": {
      "@type": "ContactPoint",
      "contactType": "HR",
      "url": `https://swipehire.top/jobs/${data.jobId}/apply`
    }
  };

  // Remove undefined values
  return Object.fromEntries(
    Object.entries(baseSchema).filter(([_, value]) => value !== undefined)
  );
}

function generateJobLocationSchema(location: JobPostingSchemaData['location']) {
  if (location.isRemote) {
    return {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Remote Work",
        "addressLocality": "Anywhere",
        "addressCountry": location.country || "TW"
      }
    };
  }

  return {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      ...(location.city && { "addressLocality": location.city }),
      ...(location.region && { "addressRegion": location.region }),
      "addressCountry": location.country || "TW"
    }
  };
}

function mapEmploymentType(jobType?: string): string {
  const mapping: Record<string, string> = {
    [JobType.FULL_TIME]: "FULL_TIME",
    [JobType.PART_TIME]: "PART_TIME", 
    [JobType.CONTRACT]: "CONTRACTOR",
    [JobType.INTERNSHIP]: "INTERN",
    [JobType.CONSULTANT]: "CONTRACTOR"
  };
  
  return mapping[jobType || ''] || "FULL_TIME";
}

/**
 * Generate Organization structured data for company pages
 */
export interface OrganizationSchemaData {
  name: string;
  url?: string;
  logo?: string;
  description?: string;
  industry?: string;
  foundingDate?: string;
  numberOfEmployees?: string;
  address?: {
    city?: string;
    region?: string;
    country?: string;
  };
  contactPoint?: {
    email?: string;
    phone?: string;
  };
  socialLinks?: string[];
}

export function generateOrganizationSchema(data: OrganizationSchemaData): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": data.name,
    ...(data.url && { "url": data.url }),
    ...(data.logo && { "logo": data.logo }),
    ...(data.description && { "description": data.description }),
    ...(data.industry && { "industry": data.industry }),
    ...(data.foundingDate && { "foundingDate": data.foundingDate }),
    ...(data.numberOfEmployees && { "numberOfEmployees": data.numberOfEmployees }),
    ...(data.address && {
      "address": {
        "@type": "PostalAddress",
        ...(data.address.city && { "addressLocality": data.address.city }),
        ...(data.address.region && { "addressRegion": data.address.region }),
        "addressCountry": data.address.country || "TW"
      }
    }),
    ...(data.contactPoint && {
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        ...(data.contactPoint.email && { "email": data.contactPoint.email }),
        ...(data.contactPoint.phone && { "telephone": data.contactPoint.phone })
      }
    }),
    ...(data.socialLinks && data.socialLinks.length > 0 && { 
      "sameAs": data.socialLinks 
    })
  };
}

/**
 * Generate WebSite structured data with search functionality
 */
export function generateWebSiteSchema(): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "SwipeHire",
    "alternateName": "SwipeHire 智能招募平台",
    "url": "https://swipehire.top",
    "description": "AI智能招募平台，連接頂尖人才與優質企業。提供智能履歷優化、精準職缺媒合、薪資分析等服務。",
    "inLanguage": "zh-TW",
    "publisher": {
      "@type": "Organization",
      "name": "SwipeHire",
      "url": "https://swipehire.top",
      "logo": "https://swipehire.top/logo.png"
    },
    "potentialAction": [
      {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://swipehire.top/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      },
      {
        "@type": "SearchAction",
        "name": "Job Search",
        "target": {
          "@type": "EntryPoint", 
          "urlTemplate": "https://swipehire.top/jobs/search?q={job_title}&location={location}"
        },
        "query-input": [
          "required name=job_title",
          "optional name=location"
        ]
      }
    ]
  };
}

/**
 * Generate FAQ structured data for job-related pages
 */
export interface FAQSchemaData {
  question: string;
  answer: string;
}

export function generateFAQSchema(faqs: FAQSchemaData[]): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

/**
 * Generate BreadcrumbList for navigation
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

/**
 * Utility function to safely stringify schema for HTML
 */
export function stringifySchema(schema: Record<string, any>): string {
  return JSON.stringify(schema, null, 0);
}