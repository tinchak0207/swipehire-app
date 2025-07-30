import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { AuthWrapper } from '@/components/AuthWrapper';
import QueryProvider from '@/components/QueryProvider';
import { generateWebSiteSchema, stringifySchema } from '@/lib/seo/schemas';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | SwipeHire - AI-Powered Recruitment Platform',
    default: 'SwipeHire - AI-Powered Recruitment Platform | Connecting Talent with Opportunities'
  },
  description: 'The most advanced AI recruitment platform, offering intelligent resume optimization, precise job matching, salary analysis, and more. Helping job seekers find their ideal jobs and companies discover top talent.',
  keywords: [
    'Recruitment platform', 'Job search website', 'AI resume optimization', 'Job matching', 'Talent acquisition', 
    'Salary analysis', 'Job opportunities', 'Human resources', 'Job seeking', 'Find a job',
    'Front-end engineer jobs', 'Software engineer jobs', 'Jobs in Taipei', 'Remote work'
  ],
  authors: [{ name: 'SwipeHire Team' }],
  creator: 'SwipeHire',
  publisher: 'SwipeHire',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover',
  
  openGraph: {
    title: 'SwipeHire - AI-Powered Recruitment Platform',
    description: 'Intelligent recruitment solutions connecting talent and opportunities',
    url: 'https://swipehire.top',
    siteName: 'SwipeHire',
    images: [
      {
        url: '/images/og-homepage.jpg',
        width: 1200,
        height: 630,
        alt: 'SwipeHire AI-Powered Recruitment Platform'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'SwipeHire - AI-Powered Recruitment Platform',
    description: 'The most advanced AI recruitment platform, connecting top talent with quality companies.',
    site: '@SwipeHire',
    images: ['/images/twitter-card.jpg'],
  },

  alternates: {
    canonical: 'https://swipehire.top',
    languages: {
      'en-US': 'https://swipehire.top/en',
      'zh-TW': 'https://swipehire.top'
    }
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
    google: 'your-google-site-verification-code',
  },

  category: 'business',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteSchema = generateWebSiteSchema();

  return (
    <html lang="en" data-theme="light">
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: stringifySchema(websiteSchema)
          }}
        />
        
        {/* Additional Meta Tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SwipeHire" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon and App Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <QueryProvider>
          <AuthWrapper>{children}</AuthWrapper>
        </QueryProvider>

        {/* Google Analytics (replace with your GA4 ID) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX', {
              cookie_flags: 'SameSite=None;Secure',
            });
          `}
        </Script>

        {/* Schema.org Markup for Job Search */}
        <Script id="job-search-schema" type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "SwipeHire Job Search",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "TWD"
              },
              "featureList": [
                "AI Resume Optimization",
                "Intelligent Job Matching",
                "Salary Analysis",
                "Interview Preparation"
              ]
            }
          `}
        </Script>
      </body>
    </html>
  );
}
