import { NextResponse } from 'next/server';

// Enhanced sitemap.xml generator for SwipeHire SEO optimization
// Includes static pages, job categories, locations, and dynamic content

export async function GET() {
  const currentDate = new Date().toISOString().split('T')[0];
  const baseUrl = 'https://swipehire.top';

  // Core pages - highest priority
  const corePages = [
    {
      url: `${baseUrl}/`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '1.0',
    },
    {
      url: `${baseUrl}/jobs`,
      lastmod: currentDate,
      changefreq: 'hourly',
      priority: '0.9',
    },
    {
      url: `${baseUrl}/companies`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '0.8',
    },
    {
      url: `${baseUrl}/resume-optimizer`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.9',
    },
    {
      url: `${baseUrl}/salary-enquiry`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.8',
    },
    {
      url: `${baseUrl}/interview-guide`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.8',
    },
    {
      url: `${baseUrl}/portfolio`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.7',
    },
    {
      url: `${baseUrl}/events`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '0.7',
    },
    {
      url: `${baseUrl}/blog`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.8',
    },
  ];

  // Job category pages - high SEO value
  const jobCategories = [
    'frontend-engineer',
    'backend-engineer',
    'fullstack-engineer',
    'ui-ux-designer',
    'product-manager',
    'data-scientist',
    'devops-engineer',
    'mobile-developer',
  ];

  const jobCategoryPages = jobCategories.map((category) => ({
    url: `${baseUrl}/jobs/${category}`,
    lastmod: currentDate,
    changefreq: 'daily',
    priority: '0.9',
  }));

  // Location-based job pages - high local SEO value
  const locations = ['taipei', 'hsinchu', 'taichung', 'tainan', 'kaohsiung', 'remote'];
  const locationJobPages = jobCategories.flatMap((category) =>
    locations.map((location) => ({
      url: `${baseUrl}/jobs/${category}/${location}`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '0.8',
    }))
  );

  // Blog article pages
  const blogPages = [
    {
      url: `${baseUrl}/blog/ai-recruitment-trends`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.6',
    },
    {
      url: `${baseUrl}/blog/data-privacy`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.6',
    },
    {
      url: `${baseUrl}/blog/employer-best-practices`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.6',
    },
    {
      url: `${baseUrl}/blog/remote-work-guide`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.6',
    },
    {
      url: `${baseUrl}/blog/success-stories`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.6',
    },
    {
      url: `${baseUrl}/blog/video-resume-tips`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.6',
    },
    {
      url: `${baseUrl}/blog/how-to-beat-the-ats-in-2025`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.7',
    },
  ];

  // Search pages for popular queries
  const searchPages = [
    {
      url: `${baseUrl}/search`,
      lastmod: currentDate,
      changefreq: 'hourly',
      priority: '0.5',
    },
    {
      url: `${baseUrl}/search?q=frontend-engineer&location=taipei`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '0.8',
    },
    {
      url: `${baseUrl}/search?q=backend-engineer&location=hsinchu`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '0.7',
    },
  ];

  // Skill pages
  const skills = [
    'react',
    'vue',
    'angular',
    'nodejs',
    'python',
    'java',
    'typescript',
    'javascript',
  ];
  const skillPages = skills.map((skill) => ({
    url: `${baseUrl}/skills/${skill}`,
    lastmod: currentDate,
    changefreq: 'weekly',
    priority: '0.6',
  }));

  // Demo pages - lower priority
  const demoPages = [
    {
      url: `${baseUrl}/demo/ai-resume-optimizer`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.4',
    },
    {
      url: `${baseUrl}/demo/ai-video-generator`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.4',
    },
    {
      url: `${baseUrl}/demo/analytics-dashboard`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.4',
    },
    {
      url: `${baseUrl}/demo/ats-scanner`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.4',
    },
    {
      url: `${baseUrl}/demo/smart-suggestions`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.4',
    },
  ];

  // Combine all pages
  const allPages = [
    ...corePages,
    ...jobCategoryPages,
    ...locationJobPages,
    ...blogPages,
    ...searchPages,
    ...skillPages,
    ...demoPages,
  ];

  // TODO: In the future, add dynamic content here:
  // - Job postings from database
  // - Company profiles
  // - Event details
  // - Portfolio pages
  // - Additional blog content

  // Generate XML for all pages
  const urlEntries = allPages
    .map(
      (page) => `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlEntries}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
    },
  });
}
