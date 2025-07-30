import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SkillLocationPage from '@/components/programmatic/SkillLocationPage';
import {
  generateSkillLocationPage,
  getRelatedLocations,
  getRelatedSkills,
} from '@/lib/programmatic-content';
import { generateJobPostingSchema, StructuredData } from '@/lib/structured-data';

interface PageProps {
  params: Promise<{
    skill: string;
    location: string;
  }>;
}

// Generate static params for popular combinations
export async function generateStaticParams() {
  const popularCombinations = [];

  // Top 5 skills × Top 4 locations for static generation
  const topSkills = ['react', 'python', 'javascript', 'node-js', 'typescript'];
  const topLocations = ['san-francisco', 'new-york', 'seattle', 'remote'];

  for (const skill of topSkills) {
    for (const location of topLocations) {
      popularCombinations.push({ skill, location });
    }
  }

  return popularCombinations;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { skill, location } = await params;

  const pageData = generateSkillLocationPage(skill.replace(/-/g, ' '), location.replace(/-/g, ' '));

  if (!pageData) {
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found.',
    };
  }

  return {
    title: pageData.metaTitle,
    description: pageData.metaDescription,
    keywords: pageData.keywords,
    openGraph: {
      title: pageData.metaTitle,
      description: pageData.metaDescription,
      type: 'website',
      url: `https://swipehire.top/skills/${pageData.slug}`,
      images: [
        {
          url: '/og-images/skill-location-jobs.png',
          width: 1200,
          height: 630,
          alt: `${pageData.skill} jobs in ${pageData.location}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageData.metaTitle,
      description: pageData.metaDescription,
    },
    alternates: {
      canonical: `https://swipehire.top/skills/${pageData.slug}`,
    },
  };
}

export default async function SkillLocationJobsPage({ params }: PageProps) {
  const { skill, location } = await params;

  const pageData = generateSkillLocationPage(skill.replace(/-/g, ' '), location.replace(/-/g, ' '));

  if (!pageData) {
    notFound();
  }

  const relatedSkills = getRelatedSkills(pageData.skill);
  const relatedLocations = getRelatedLocations(pageData.location);

  // Mock job listings for demonstration
  const mockJobs = [
    {
      id: '1',
      title: `Senior ${pageData.skill} Developer`,
      company: pageData.topCompanies[0] || 'Innovate Inc.',
      salary: `${Math.round(pageData.averageSalary * 1.2).toLocaleString()}`,
      type: 'Full-time',
      posted: '2 days ago',
    },
    {
      id: '2',
      title: `${pageData.skill} Engineer`,
      company: pageData.topCompanies[1] || 'Tech Solutions',
      salary: `${Math.round(pageData.averageSalary * 0.9).toLocaleString()}`,
      type: 'Full-time',
      posted: '1 week ago',
    },
    {
      id: '3',
      title: `Lead ${pageData.skill} Developer`,
      company: pageData.topCompanies[2] || 'Future Forward',
      salary: `${Math.round(pageData.averageSalary * 1.4).toLocaleString()}`,
      type: 'Full-time',
      posted: '3 days ago',
    },
  ];

  // Generate structured data for the mock jobs
  const jobSchemas = mockJobs.map((job) =>
    generateJobPostingSchema({
      title: job.title,
      description: `Join ${job.company} as a ${job.title}. Work with cutting-edge ${pageData.skill} technology and contribute to innovative projects.`,
      company: job.company,
      location: pageData.location,
      type: job.type,
      datePosted: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      salaryMin: Math.round(pageData.averageSalary * 0.8),
      salaryMax: Math.round(pageData.averageSalary * 1.3),
      currency: 'USD',
      qualifications: `3+ years of experience with ${pageData.skill}, strong problem-solving skills, experience with modern development tools.`,
      responsibilities: `Develop and maintain ${pageData.skill}-based applications, collaborate with cross-functional teams, mentor junior developers.`,
      industry: 'Technology',
    })
  );

  return (
    <>
      {jobSchemas.map((schema, index) => (
        <StructuredData key={index} data={schema} />
      ))}

      <SkillLocationPage
        data={pageData}
        relatedSkills={relatedSkills}
        relatedLocations={relatedLocations}
        mockJobs={mockJobs}
      />
    </>
  );
}
