import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://swipehire.top';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/jobs/',
          '/jobs/*',
          '/company/',
          '/company/*',
          '/blog/',
          '/blog/*',
          '/search',
          '/resume-optimizer',
          '/salary-enquiry',
          '/portfolio',
          '/events',
          '/interview-guide',
          '/skills/',
          '/skills/*',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/debug/',
          '/test*',
          '/demo/',
          '/private/',
          '/*?*utm_*', // Block UTM parameters
          '/*?*fbclid*', // Block Facebook click IDs
          '/*?*gclid*', // Block Google click IDs
          '/resume-optimizer/editor-test/',
          '/resume-optimizer/report-test/',
          '/resume-optimizer/test-*',
          '/backend-test/',
          '/design-preview/',
          '/test-*',
          '/career-dashboard-demo/',
          '/typeform-demo/',
        ],
        crawlDelay: 1,
      },
      // Special rules for search engines
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/jobs/',
          '/jobs/*',
          '/company/',
          '/company/*',
          '/blog/',
          '/blog/*',
          '/search',
          '/resume-optimizer',
          '/salary-enquiry',
          '/portfolio',
          '/events',
          '/interview-guide',
        ],
        disallow: ['/api/', '/admin/', '/dashboard/', '/debug/', '/test*', '/demo/', '/private/'],
      },
      // Block AI scrapers but allow search engines
      {
        userAgent: ['CCBot', 'ChatGPT-User', 'Claude-Web', 'anthropic-ai'],
        disallow: ['/'],
      },
      // Allow job aggregators
      {
        userAgent: [
          'LinkedInBot',
          'IndeedBot',
          'Slurp', // Yahoo/Verizon Media (owns some job sites)
        ],
        allow: ['/jobs/', '/jobs/*', '/company/', '/company/*'],
        disallow: ['/api/', '/admin/', '/dashboard/', '/resume-optimizer/', '/private/'],
        crawlDelay: 2,
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      // If you have multiple sitemaps:
      // `${baseUrl}/sitemap-jobs.xml`,
      // `${baseUrl}/sitemap-companies.xml`,
      // `${baseUrl}/sitemap-blog.xml`
    ],
    host: baseUrl,
  };
}
