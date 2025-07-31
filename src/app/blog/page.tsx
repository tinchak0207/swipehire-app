'use client';

import {
  BookOpen,
  Briefcase,
  Download,
  FileText,
  FileVideo2,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardTitle } from '@/components/ui/card';

const categoryMeta = [
  {
    label: 'TRENDS',
    color: 'from-blue-500 to-cyan-500',
    text: 'text-blue-600',
    border: 'border-t-4 border-blue-400',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-500',
    time: '5 min read',
  },
  {
    label: 'TIPS',
    color: 'from-fuchsia-500 to-pink-400',
    text: 'text-fuchsia-600',
    border: 'border-t-4 border-fuchsia-400',
    iconBg: 'bg-fuchsia-100',
    iconText: 'text-fuchsia-500',
    time: '7 min read',
  },
  {
    label: 'GUIDE',
    color: 'from-green-500 to-lime-400',
    text: 'text-green-600',
    border: 'border-t-4 border-green-400',
    iconBg: 'bg-green-100',
    iconText: 'text-green-500',
    time: '10 min read',
  },
  {
    label: 'BEST PRACTICES',
    color: 'from-orange-500 to-yellow-400',
    text: 'text-orange-600',
    border: 'border-t-4 border-orange-400',
    iconBg: 'bg-orange-100',
    iconText: 'text-orange-500',
    time: '6 min read',
  },
  {
    label: 'PRIVACY',
    color: 'from-purple-500 to-indigo-400',
    text: 'text-purple-600',
    border: 'border-t-4 border-purple-400',
    iconBg: 'bg-purple-100',
    iconText: 'text-purple-500',
    time: '8 min read',
  },
  {
    label: 'STORIES',
    color: 'from-blue-500 to-indigo-400',
    text: 'text-blue-600',
    border: 'border-t-4 border-blue-400',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-500',
    time: '4 min read',
  },
  // Additional categories for new blog posts
  {
    label: 'PRODUCTIVITY',
    color: 'from-green-500 to-emerald-500',
    text: 'text-green-600',
    border: 'border-t-4 border-green-400',
    iconBg: 'bg-green-100',
    iconText: 'text-green-500',
    time: '12 min read',
  },
  {
    label: 'AI',
    color: 'from-purple-500 to-fuchsia-500',
    text: 'text-purple-600',
    border: 'border-t-4 border-purple-400',
    iconBg: 'bg-purple-100',
    iconText: 'text-purple-500',
    time: '15 min read',
  },
  {
    label: 'CAREER',
    color: 'from-amber-500 to-orange-500',
    text: 'text-amber-600',
    border: 'border-t-4 border-amber-400',
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-500',
    time: '14 min read',
  },
  {
    label: 'PERSONAL BRAND',
    color: 'from-cyan-500 to-blue-500',
    text: 'text-cyan-600',
    border: 'border-t-4 border-cyan-400',
    iconBg: 'bg-cyan-100',
    iconText: 'text-cyan-500',
    time: '16 min read',
  },
  // New comprehensive categories
  {
    label: 'OPTIMIZATION',
    color: 'from-indigo-500 to-purple-500',
    text: 'text-indigo-600',
    border: 'border-t-4 border-indigo-400',
    iconBg: 'bg-indigo-100',
    iconText: 'text-indigo-500',
    time: '15 min read',
  },
  {
    label: 'NEGOTIATION',
    color: 'from-emerald-500 to-teal-500',
    text: 'text-emerald-600',
    border: 'border-t-4 border-emerald-400',
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-500',
    time: '18 min read',
  },
  {
    label: 'HIRING TRENDS',
    color: 'from-violet-500 to-purple-500',
    text: 'text-violet-600',
    border: 'border-t-4 border-violet-400',
    iconBg: 'bg-violet-100',
    iconText: 'text-violet-500',
    time: '16 min read',
  },
  {
    label: 'LEADERSHIP',
    color: 'from-sky-500 to-cyan-500',
    text: 'text-sky-600',
    border: 'border-t-4 border-sky-400',
    iconBg: 'bg-sky-100',
    iconText: 'text-sky-500',
    time: '20 min read',
  },
  {
    label: 'DIVERSITY',
    color: 'from-rose-500 to-pink-500',
    text: 'text-rose-600',
    border: 'border-t-4 border-rose-400',
    iconBg: 'bg-rose-100',
    iconText: 'text-rose-500',
    time: '17 min read',
  },
];

export default function BlogPage() {
  const blogCategories = [
    {
      title: 'AI Recruitment Trends',
      description:
        'Learn how AI is changing recruitment and hiring. Discover machine learning, automated screening, and predictive analytics ',
      icon: <TrendingUp className="h-6 w-6" />, // blue
      link: '/blog/ai-recruitment-trends',
    },
    {
      title: 'Video Resume Tips',
      description:
        'Create video resumes that stand out. Learn scripting, storytelling, and presentation skills to showcase your personality to employers.',
      icon: <FileText className="h-6 w-6" />, // purple
      link: '/blog/video-resume-tips',
    },
    {
      title: 'Remote Work Guide',
      description:
        'Find and succeed in remote jobs. This guide covers job searching, tools, and techniques for productivity and work-life balance.',
      icon: <Briefcase className="h-6 w-6" />, // green
      link: '/blog/remote-work-guide',
    },
    {
      title: 'Employer Best Practices',
      description:
        'Attract and keep top talent. Learn modern recruitment techniques, employee engagement, and retention strategies.',
      icon: <Users className="h-6 w-6" />, // orange
      link: '/blog/employer-best-practices',
    },
    {
      title: 'Data Privacy in Recruitment',
      description:
        'Understand data privacy in hiring. Learn about GDPR, CCPA, and best practices for protecting candidate information.',
      icon: <Shield className="h-6 w-6" />, // dark
      link: '/blog/data-privacy',
    },
    {
      title: 'Success Stories',
      description:
        'Real stories from job seekers and employers who found success with SwipeHire. Get inspired by their journeys.',
      icon: <BookOpen className="h-6 w-6" />, // lavender
      link: '/blog/success-stories',
    },
    {
      title: 'The Future of AI in HR',
      description:
        'Explore how AI is transforming HR. Learn about chatbots, sentiment analysis, and workforce planning tools.',
      icon: <Zap className="h-6 w-6" />, // purple
      link: '/blog/future-of-ai-in-hr',
    },
    {
      title: 'Mental Health in the Workplace',
      description:
        'Create a healthy work environment. Learn about mental wellness programs and building supportive workplace cultures.',
      icon: <Briefcase className="h-6 w-6" />, // green
      link: '/blog/mental-health-in-the-workplace',
    },
    {
      title: 'The Importance of a Strong Company Culture',
      description:
        'Build a culture that attracts talent. Learn how culture drives performance and employee satisfaction.',
      icon: <Users className="h-6 w-6" />, // orange
      link: '/blog/importance-of-company-culture',
    },
    // New comprehensive blog posts
    {
      title: 'Remote Work Productivity',
      description:
        'Work effectively from anywhere. Learn 10 strategies for staying productive in remote environments.',
      icon: <Briefcase className="h-6 w-6" />, // green
      link: '/blog/remote-work-productivity',
    },
    {
      title: 'AI Interview Preparation',
      description:
        'Ace AI-powered interviews. Learn how to optimize your communication for AI evaluation tools.',
      icon: <Zap className="h-6 w-6" />, // purple
      link: '/blog/ai-interview-preparation',
    },
    {
      title: 'Career Transition Strategies',
      description:
        'Change careers successfully. Learn how to identify transferable skills and communicate your value.',
      icon: <TrendingUp className="h-6 w-6" />, // blue
      link: '/blog/career-transition-strategies',
    },
    {
      title: 'Personal Branding in the Digital Age',
      description:
        'Build your professional identity online. Learn how to optimize your profiles and engage with your community.',
      icon: <Users className="h-6 w-6" />, // orange
      link: '/blog/digital-personal-branding',
    },
    // Latest comprehensive blog posts (1000+ words each)
    {
      title: 'LinkedIn Optimization Guide',
      description:
        'Make your LinkedIn profile stand out. Learn how to optimize your profile and build your network.',
      icon: <Users className="h-6 w-6" />, // orange
      link: '/blog/linkedin-optimization-guide',
    },
    {
      title: 'Salary Negotiation Strategies',
      description:
        'Get the salary you deserve. Learn research-backed techniques for confident compensation discussions.',
      icon: <TrendingUp className="h-6 w-6" />, // blue
      link: '/blog/salary-negotiation-strategies',
    },
    {
      title: 'Skills-Based Hiring Revolution',
      description:
        'Discover the shift to skills-focused hiring. Learn how employers are redefining talent acquisition.',
      icon: <Zap className="h-6 w-6" />, // purple
      link: '/blog/skills-based-hiring-trends',
    },
    {
      title: 'Remote Leadership Mastery',
      description:
        'Lead distributed teams effectively. Learn how to build trust and communicate across distances.',
      icon: <Briefcase className="h-6 w-6" />, // green
      link: '/blog/remote-leadership-guide',
    },
    {
      title: 'Inclusive Recruitment Practices',
      description:
        'Create fair hiring processes. Learn how to remove bias and unlock diverse talent.',
      icon: <Users className="h-6 w-6" />, // orange
      link: '/blog/inclusive-recruitment-practices',
    },
  ];

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 animate-fadeInPage">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md shadow-sm border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity"
          >
            <FileVideo2 className="h-8 w-8" />
            <span className="text-2xl font-bold text-gray-900 font-heading">SwipeHire</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors px-4 py-2 rounded-md"
            >
              Home
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-md"
            >
              Blog
            </Link>
          </nav>
        </div>
      </header>

      <section className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-gray-900 drop-shadow-lg">
            SwipeHire Blog
          </h1>
          <p className="text-2xl text-gray-600 font-medium max-w-2xl mx-auto">
            Learn about AI recruitment, remote work, career development, and more.
          </p>
        </header>

        <section
          aria-label="Blog Categories"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {blogCategories.map((category, index) => {
            const meta = categoryMeta[index];
            if (!meta) return null;
            return (
              <Link
                href={category.link}
                key={index}
                className="group focus:outline-none focus:ring-4 focus:ring-blue-200 rounded-2xl"
              >
                <article
                  className={`relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 ${meta.border} flex flex-col h-full`}
                >
                  <div className="flex items-center gap-3 px-6 pt-6 pb-2">
                    <span
                      className={`inline-flex items-center justify-center rounded-full ${meta.iconBg} ${meta.iconText} p-2 transition-all duration-300`}
                    >
                      {category.icon}
                    </span>
                    <div className="flex flex-col">
                      <span className={`uppercase text-xs font-bold tracking-widest ${meta.text}`}>
                        {meta.label}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">{meta.time}</span>
                    </div>
                  </div>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                        {category.title}
                      </CardTitle>
                      <p className="text-gray-600 text-base mb-4 min-h-[64px]">
                        {category.description}
                      </p>
                    </div>
                    <Button
                      variant="link"
                      className="mt-auto p-0 text-blue-600 font-semibold transition-colors duration-300 group-hover:translate-x-1 group-hover:text-blue-700"
                    >
                      Read more →
                    </Button>
                  </CardContent>
                </article>
              </Link>
            );
          })}
        </section>

        {/* Whitepaper Section (refined) */}
        <section className="mt-24 mb-8">
          <h2 className="text-4xl font-extrabold text-center mb-2 text-gray-900">
            Download Our Whitepapers
          </h2>
          <p className="text-lg text-center text-gray-600 mb-12">
            Get in-depth research and expert analysis on key topics shaping the future of work and
            recruitment.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center text-center hover:shadow-xl transition-all">
              <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-400 mb-6">
                <Zap className="h-8 w-8 text-white" />
              </span>
              <h3 className="text-xl font-extrabold mb-2 text-gray-900">
                AI in Recruitment: A Comprehensive Guide
              </h3>
              <p className="text-gray-600 mb-4">
                Learn how AI is revolutionizing recruitment through algorithms, machine learning,
                and analytics. Discover practical applications and best practices.
              </p>
              <div className="flex items-center justify-center gap-4 text-gray-400 text-sm mb-8">
                <span className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  2.3k downloads
                </span>
                <span>24 pages</span>
              </div>
              <a href="/whitepapers/ai-recruitment-whitepaper.pdf" download className="w-full">
                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-md hover:scale-105 hover:shadow-lg transition-all text-base">
                  <Download className="h-5 w-5" /> Download PDF
                </button>
              </a>
            </div>
            {/* Card 2 */}
            <div className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center text-center hover:shadow-xl transition-all">
              <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-400 mb-6">
                <Users className="h-8 w-8 text-white" />
              </span>
              <h3 className="text-xl font-extrabold mb-2 text-gray-900">
                The Future of Work: Remote & Hybrid Models
              </h3>
              <p className="text-gray-600 mb-4">
                Explore the shift to flexible work models. Learn about productivity, employee
                satisfaction, and managing distributed teams.
              </p>
              <div className="flex items-center justify-center gap-4 text-gray-400 text-sm mb-8">
                <span className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  1.8k downloads
                </span>
                <span>32 pages</span>
              </div>
              <a href="/whitepapers/remote-work-guide.pdf" download className="w-full">
                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-md hover:scale-105 hover:shadow-lg transition-all text-base">
                  <Download className="h-5 w-5" /> Download PDF
                </button>
              </a>
            </div>
            {/* Card 3 */}
            <div className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center text-center hover:shadow-xl transition-all">
              <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-400 mb-6">
                <FileText className="h-8 w-8 text-white" />
              </span>
              <h3 className="text-xl font-extrabold mb-2 text-gray-900">
                Data-Driven Recruitment Strategies
              </h3>
              <p className="text-gray-600 mb-4">
                Use data to improve hiring. Learn how to leverage analytics for better recruitment
                outcomes.
              </p>
              <div className="flex items-center justify-center gap-4 text-gray-400 text-sm mb-8">
                <span className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  1.5k downloads
                </span>
                <span>28 pages</span>
              </div>
              <a href="/whitepapers/data-privacy-guide.pdf" download className="w-full">
                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-md hover:scale-105 hover:shadow-lg transition-all text-base">
                  <Download className="h-5 w-5" /> Download PDF
                </button>
              </a>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
