import { Brain, FileText, MessageSquare } from 'lucide-react';
import type { Metadata } from 'next';
import PillarPageComponent from '@/components/pillar/PillarPageComponent';
import { generatePillarPageBreadcrumbs, pillarPages } from '@/lib/pillar-content-strategy';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schemas';
import { StructuredData } from '@/lib/structured-data';

const pillarData = pillarPages.find((p) => p.id === 'tech-interview-preparation')!;

export const metadata: Metadata = {
  title: pillarData.title,
  description: pillarData.description,
  keywords: pillarData.keywords,
  openGraph: {
    title: pillarData.title,
    description: pillarData.description,
    type: 'article',
    url: `https://swipehire.top/guides/${pillarData.slug}`,
    images: [
      {
        url: '/og-images/tech-interview-guide.png',
        width: 1200,
        height: 630,
        alt: pillarData.title,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: pillarData.title,
    description: pillarData.description,
  },
};

// FAQ Schema for rich results
const faqs = [
  {
    question: 'How long should I prepare for a tech interview?',
    answer:
      "Most candidates need 2-3 months of consistent preparation (2-3 hours daily) to feel confident. However, the timeline varies based on your current skill level and the role you're targeting. Senior positions may require 3-6 months of preparation.",
  },
  {
    question: 'What are the most important topics to study for coding interviews?',
    answer:
      'Focus on data structures (arrays, strings, trees, graphs, hashmaps), algorithms (sorting, searching, dynamic programming), system design fundamentals, and behavioral interview preparation. Practice on platforms like LeetCode, HackerRank, or our AI-powered interview prep tool.',
  },
  {
    question: 'How do I prepare for system design interviews?',
    answer:
      'Start with understanding fundamental concepts like scalability, load balancing, databases, and caching. Practice designing real-world systems like Twitter, Uber, or Netflix. Focus on trade-offs and be able to explain your decisions clearly.',
  },
  {
    question: 'What should I ask at the end of a tech interview?',
    answer:
      "Ask about the team structure, engineering culture, technical challenges, growth opportunities, and the company's tech stack. Avoid questions about salary, benefits, or time off in initial interviews. Show genuine interest in the role and company.",
  },
  {
    question: 'How important are behavioral interviews in tech hiring?',
    answer:
      'Behavioral interviews are crucial - they can make or break your candidacy even if you excel technically. Companies want to ensure you can work well with teams, communicate effectively, and align with their culture. Use the STAR method (Situation, Task, Action, Result) to structure your responses.',
  },
];

const breadcrumbs = generatePillarPageBreadcrumbs(pillarData.slug);

export default function TechInterviewPreparationPage() {
  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  const relatedTools = [
    {
      name: 'AI Interview Coach',
      description:
        'Practice coding interviews with AI feedback and personalized improvement suggestions.',
      url: '/tools/interview-coach',
      icon: <Brain className="h-6 w-6 text-white" />,
    },
    {
      name: 'Resume Optimizer',
      description: 'Optimize your resume for tech roles with our ATS-beating optimization engine.',
      url: '/resume-optimizer',
      icon: <FileText className="h-6 w-6 text-white" />,
    },
    {
      name: 'Mock Interview Platform',
      description: 'Schedule practice interviews with experienced tech professionals.',
      url: '/tools/mock-interviews',
      icon: <MessageSquare className="h-6 w-6 text-white" />,
    },
  ];

  return (
    <>
      <StructuredData data={faqSchema} />
      <StructuredData data={breadcrumbSchema} />

      <PillarPageComponent pillar={pillarData} relatedTools={relatedTools} />
    </>
  );
}
