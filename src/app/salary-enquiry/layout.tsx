import type { Metadata } from 'next';
import type React from 'react';

// Metadata for the salary enquiry section
export const metadata: Metadata = {
  title: {
    template: '%s | SwipeHire Salary Enquiry',
    default: 'Market Salary Enquiry | SwipeHire',
  },
  description:
    "Discover competitive salary ranges and compensation data for your industry and role. Get insights into market rates, benefits, and total compensation packages with SwipeHire's comprehensive salary database.",
  keywords: [
    'salary',
    'compensation',
    'market rates',
    'salary data',
    'job market',
    'pay scale',
    'salary comparison',
    'salary statistics',
    'compensation analysis',
    'salary benchmarking',
    'market research',
    'career insights',
  ],
  authors: [{ name: 'SwipeHire Team' }],
  creator: 'SwipeHire',
  publisher: 'SwipeHire',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://swipehire.top/salary-enquiry',
    siteName: 'SwipeHire',
    title: 'Market Salary Enquiry - Discover Competitive Compensation Data',
    description:
      "Access comprehensive salary data and compensation insights. Compare market rates, analyze trends, and make informed career decisions with SwipeHire's salary database.",
    images: [
      {
        url: '/images/salary-enquiry-og.jpg',
        width: 1200,
        height: 630,
        alt: 'SwipeHire Salary Enquiry - Market Compensation Data',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@SwipeHire',
    creator: '@SwipeHire',
    title: 'Market Salary Enquiry - SwipeHire',
    description:
      'Discover competitive salary ranges and compensation data for your industry and role.',
    images: ['/images/salary-enquiry-twitter.jpg'],
  },
  alternates: {
    canonical: 'https://swipehire.top/salary-enquiry',
  },
  category: 'Career Tools',
};

interface SalaryEnquiryLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout component for the salary enquiry section
 * Provides consistent structure and metadata for all salary-related pages
 */
const SalaryEnquiryLayout: React.FC<SalaryEnquiryLayoutProps> = ({ children }) => {
  return (
    <>
      {/* JSON-LD structured data for better SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'SwipeHire Salary Enquiry',
            description: 'Comprehensive salary data and compensation analysis tool',
            url: 'https://swipehire.top/salary-enquiry',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web Browser',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            featureList: [
              'Salary data search and analysis',
              'Compensation benchmarking',
              'Market rate comparisons',
              'Interactive salary charts',
              'Detailed compensation statistics',
              'Industry-specific insights',
            ],
            provider: {
              '@type': 'Organization',
              name: 'SwipeHire',
              url: 'https://swipehire.top',
            },
          }),
        }}
      />

      {/* Breadcrumb structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https:/swipehire.top',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Salary Enquiry',
                item: 'https://swipehire.top/salary-enquiry',
              },
            ],
          }),
        }}
      />

      {/* Main content */}
      <main className="salary-enquiry-layout">{children}</main>
    </>
  );
};

export default SalaryEnquiryLayout;
