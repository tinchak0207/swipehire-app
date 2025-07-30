/**
 * SEO Meta tag generation utilities for SwipeHire
 * Optimized for job posting and recruitment platform SEO
 */

import type { Metadata } from 'next';
import type { JobPostingSchemaData, OrganizationSchemaData } from './schemas';

export interface SEOConfig {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string[];
  defaultImage: string;
  twitterHandle?: string;
  locale: string;
}

export const defaultSEOConfig: SEOConfig = {
  siteName: 'SwipeHire',
  siteUrl: 'https://swipehire.top',
  defaultTitle: 'SwipeHire - AI智能招募平台 | 連接人才與機會',
  defaultDescription: '最先進的AI招募平台，提供智能履歷優化、精準職缺媒合、薪資分析等服務。讓求職者找到理想工作，企業發現頂尖人才。',
  defaultKeywords: [
    '招募平台', '求職網站', 'AI履歷優化', '職缺媒合', '人才招聘', 
    '薪資分析', '工作機會', '人力資源', '求職', '找工作'
  ],
  defaultImage: '/images/og-default.jpg',
  twitterHandle: '@SwipeHire',
  locale: 'zh_TW'
};

/**
 * Generate optimized metadata for job posting pages
 */
export function generateJobPostingMetadata(
  job: JobPostingSchemaData,
  config: SEOConfig = defaultSEOConfig
): Metadata {
  const salaryInfo = job.salary ? 
    `月薪${Math.floor(job.salary.min / 1000)}-${Math.floor(job.salary.max / 1000)}K` : '';
  const locationInfo = job.location.isRemote ? '遠距工作' : 
    job.location.city ? `${job.location.city}` : '';
  
  const title = `${job.title}職缺 ${salaryInfo} | ${job.company.name} ${locationInfo} - ${config.siteName}`;
  const description = `【立即應徵】${job.company.name} 誠徵 ${job.title}${salaryInfo ? `，${salaryInfo}` : ''}${locationInfo ? `，工作地點：${locationInfo}` : ''}。透過SwipeHire快速媒合，開啟職涯新機會！`;
  
  const keywords = [
    job.title,
    `${job.title}工作`,
    `${job.title}職缺`,
    ...(locationInfo ? [`${locationInfo}${job.title}`] : []),
    job.company.name,
    ...(job.skills?.slice(0, 5) || []),
    ...config.defaultKeywords.slice(0, 3)
  ].join(', ');

  return {
    title,
    description,
    keywords,
    
    openGraph: {
      title: `${job.title} - ${job.company.name}`,
      description: `${salaryInfo} | ${locationInfo} | 立即應徵`,
      url: `${config.siteUrl}/jobs/${job.jobId}`,
      siteName: config.siteName,
      images: [
        {
          url: job.company.logo || config.defaultImage,
          width: 1200,
          height: 630,
          alt: `${job.title} at ${job.company.name}`
        }
      ],
      locale: config.locale,
      type: 'website',
    },
    
    twitter: {
      card: 'summary_large_image',
      title: `${job.title} 職缺 - ${job.company.name}`,
      description: `${salaryInfo} | ${locationInfo} | 透過SwipeHire應徵`,
      ...(config.twitterHandle && { site: config.twitterHandle }),
      images: [job.company.logo || config.defaultImage],
    },

    alternates: {
      canonical: `${config.siteUrl}/jobs/${job.jobId}`
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
    }
  };
}

/**
 * Generate metadata for job search/listing pages
 */
export interface JobSearchMetadataOptions {
  query?: string;
  location?: string;
  jobType?: string;
  experienceLevel?: string;
  page?: number;
  totalJobs?: number;
}

export function generateJobSearchMetadata(
  options: JobSearchMetadataOptions,
  config: SEOConfig = defaultSEOConfig
): Metadata {
  const { query = '', location = '', jobType, experienceLevel, page = 1, totalJobs } = options;
  
  const titleParts = [
    query && `${query}職缺`,
    location && `${location}地區`,
    jobType && `${jobType}工作`,
    experienceLevel && `${experienceLevel}`,
    page > 1 && `第${page}頁`,
    '工作機會搜尋',
    config.siteName
  ].filter(Boolean);
  
  const title = titleParts.join(' | ');
  
  const description = `搜尋${query}${location ? `在${location}的` : ''}最新職缺與工作機會${totalJobs ? `（共${totalJobs}個職位）` : ''}。SwipeHire提供即時更新的職位資訊，薪資透明，快速媒合。立即找到理想工作！`;
  
  const keywords = [
    query && `${query}工作`,
    query && `${query}職缺`,
    location && query && `${location}${query}`,
    query && `${query}招聘`,
    '求職網站',
    '找工作',
    '職缺搜尋',
    ...config.defaultKeywords.slice(0, 3)
  ].filter(Boolean).join(', ');

  return {
    title,
    description,
    keywords,
    
    openGraph: {
      title: `${query}職缺搜尋結果${location ? ` - ${location}` : ''}`,
      description: `找到${totalJobs || '多個'}${query}相關職缺`,
      url: buildJobSearchUrl(options, config.siteUrl),
      siteName: config.siteName,
      images: [{ url: config.defaultImage }],
      locale: config.locale,
      type: 'website',
    },
    
    twitter: {
      card: 'summary',
      title: `${query}職缺 - ${config.siteName}`,
      description: description.slice(0, 200),
      ...(config.twitterHandle && { site: config.twitterHandle }),
    },

    alternates: {
      canonical: buildJobSearchUrl(options, config.siteUrl)
    },

    robots: {
      index: !!(query || location), // Only index if there's a meaningful search
      follow: true,
    }
  };
}

/**
 * Generate metadata for company pages
 */
export function generateCompanyMetadata(
  company: OrganizationSchemaData,
  jobCount?: number,
  config: SEOConfig = defaultSEOConfig
): Metadata {
  const title = `${company.name}公司簡介與職缺${jobCount ? ` (${jobCount}個職位)` : ''} - ${config.siteName}`;
  const description = `${company.description || `了解${company.name}公司文化、福利待遇與工作環境`}${jobCount ? `。目前有${jobCount}個職缺開放中` : ''}。透過SwipeHire探索更多工作機會！`;
  
  return {
    title,
    description,
    keywords: [
      company.name,
      `${company.name}職缺`,
      `${company.name}工作`,
      company.industry || '',
      '公司介紹',
      ...config.defaultKeywords.slice(0, 3)
    ].filter(Boolean).join(', '),
    
    openGraph: {
      title: `${company.name} - 公司介紹與職缺`,
      description: `${company.industry || ''}公司 | ${jobCount || '多個'}職缺開放中`,
      url: company.url || `${config.siteUrl}/company/${encodeURIComponent(company.name)}`,
      siteName: config.siteName,
      images: [
        {
          url: company.logo || config.defaultImage,
          width: 1200,
          height: 630,
          alt: `${company.name} 公司介紹`
        }
      ],
      locale: config.locale,
      type: 'website',
    },
    
    twitter: {
      card: 'summary_large_image',
      title: `${company.name} 職缺與公司介紹`,
      description: description.slice(0, 200),
      ...(config.twitterHandle && { site: config.twitterHandle }),
    },

    alternates: {
      canonical: company.url || `${config.siteUrl}/company/${encodeURIComponent(company.name)}`
    }
  };
}

/**
 * Generate metadata for category/skill-specific job pages
 */
export interface JobCategoryMetadataOptions {
  skill: string;
  location?: string;
  level?: string;
  jobCount?: number;
  averageSalary?: { min: number; max: number };
}

export function generateJobCategoryMetadata(
  options: JobCategoryMetadataOptions,
  config: SEOConfig = defaultSEOConfig
): Metadata {
  const { skill, location, level, jobCount, averageSalary } = options;
  
  const titleParts = [
    skill,
    location,
    level,
    '職缺',
    jobCount && `${jobCount}個工作機會`,
    config.siteName
  ].filter(Boolean);
  
  const title = titleParts.join(' | ');
  
  const salaryInfo = averageSalary ? 
    `平均薪資${Math.floor(averageSalary.min / 1000)}-${Math.floor(averageSalary.max / 1000)}K` : '';
  
  const description = `最新${skill}職缺大集合！${salaryInfo}${location ? `，${location}地區` : ''}${jobCount ? `，共${jobCount}個職位` : ''}。立即查看${skill}工作機會，快速投遞履歷！透過SwipeHire找到理想${skill}工作。`;
  
  return {
    title,
    description,
    keywords: [
      skill,
      `${skill}職缺`,
      `${skill}工作`,
      location && `${location}${skill}`,
      level && `${level}${skill}`,
      `${skill}招聘`,
      ...config.defaultKeywords.slice(0, 3)
    ].filter(Boolean).join(', '),
    
    openGraph: {
      title: `${skill}職缺精選${location ? ` - ${location}` : ''}`,
      description: `${jobCount || '多個'}職位 | ${salaryInfo || '薪資優渥'}`,
      url: `${config.siteUrl}/jobs/${encodeURIComponent(skill.toLowerCase())}`,
      siteName: config.siteName,
      images: [{ url: config.defaultImage }],
      locale: config.locale,
      type: 'website',
    },
    
    twitter: {
      card: 'summary',
      title: `${skill}職缺 - ${config.siteName}`,
      description: description.slice(0, 200),
      ...(config.twitterHandle && { site: config.twitterHandle }),
    },

    alternates: {
      canonical: `${config.siteUrl}/jobs/${encodeURIComponent(skill.toLowerCase())}`
    }
  };
}

/**
 * Helper function to build job search URLs
 */
function buildJobSearchUrl(options: JobSearchMetadataOptions, baseUrl: string): string {
  const params = new URLSearchParams();
  
  if (options.query) params.set('q', options.query);
  if (options.location) params.set('location', options.location);  
  if (options.jobType) params.set('type', options.jobType);
  if (options.experienceLevel) params.set('level', options.experienceLevel);
  if (options.page && options.page > 1) params.set('page', options.page.toString());
  
  const queryString = params.toString();
  return `${baseUrl}/search${queryString ? `?${queryString}` : ''}`;
}

/**
 * Generate structured data script tag
 */
export function generateStructuredDataScript(schema: Record<string, any>): string {
  return `<script type="application/ld+json">${JSON.stringify(schema, null, 0)}</script>`;
}

/**
 * Utility to truncate text for meta descriptions
 */
export function truncateDescription(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;
  
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 ? 
    truncated.slice(0, lastSpace) + '...' : 
    truncated + '...';
}