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
];

export default function BlogPage() {
  const blogCategories = [
    {
      title: 'AI Recruitment Trends',
      description:
        "Explore the latest developments in AI-powered recruitment and how they're transforming the hiring landscape.",
      icon: <TrendingUp className="h-6 w-6" />, // blue
      link: '/blog/ai-recruitment-trends',
    },
    {
      title: 'Video Resume Tips',
      description:
        'Learn how to create compelling video resumes that stand out to employers and showcase your personality.',
      icon: <FileText className="h-6 w-6" />, // purple
      link: '/blog/video-resume-tips',
    },
    {
      title: 'Remote Work Guide',
      description:
        'Comprehensive guide to finding and succeeding in remote work opportunities in the digital age.',
      icon: <Briefcase className="h-6 w-6" />, // green
      link: '/blog/remote-work-guide',
    },
    {
      title: 'Employer Best Practices',
      description:
        "Discover effective strategies for employers to attract and retain top talent in today's competitive market.",
      icon: <Users className="h-6 w-6" />, // orange
      link: '/blog/employer-best-practices',
    },
    {
      title: 'Data Privacy in Recruitment',
      description:
        'Understanding the importance of data privacy and security in modern recruitment processes.',
      icon: <Shield className="h-6 w-6" />, // dark
      link: '/blog/data-privacy',
    },
    {
      title: 'Success Stories',
      description:
        'Real success stories from job seekers and employers who found their perfect match through SwipeHire.',
      icon: <BookOpen className="h-6 w-6" />, // lavender
      link: '/blog/success-stories',
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
            Insights, trends, and best practices in modern recruitment
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
            Deep dive into specialized topics with our comprehensive whitepapers
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
                Deep dive into how artificial intelligence is revolutionizing the recruitment
                industry.
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
                Exploring the evolving landscape of remote and hybrid work arrangements.
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
                How to leverage data analytics to improve your hiring process and outcomes.
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
