'use client';

import {
  ArrowRightIcon,
  BeakerIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentArrowUpIcon,
  PlusIcon,
  StarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import type { NextPage } from 'next';
import Link from 'next/link';

import { useEffect, useState } from 'react';
import InteractiveWizard from '@/components/resume-optimizer/wizard/interactive-wizard';

interface QuickStat {
  label: string;
  value: string;
  icon: string;
}

/**
 * Main Resume Optimizer landing page
 * Provides three entry points: Upload File, Import from Profile, Create from Scratch
 * Enhanced with statistics, testimonials, and improved accessibility
 */
const ResumeOptimizerPage: NextPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const quickStats: QuickStat[] = [
    { label: 'Resumes Optimized', value: '10,000+', icon: '📄' },
    { label: 'Average ATS Score Improvement', value: '45%', icon: '📈' },
    { label: 'Interview Rate Increase', value: '3.2x', icon: '🎯' },
    { label: 'User Satisfaction', value: '98%', icon: '⭐' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <InteractiveWizard />
      {/* Hero Section */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header Section */}
        <div
          className={`mb-12 text-center transition-all duration-1000 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="mb-4 flex items-center justify-center">
            <div className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 p-3">
              <DocumentArrowUpIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="mb-4 font-bold text-4xl text-gray-800 md:text-5xl">Resume Optimizer</h1>
          <p className="mx-auto mb-6 max-w-3xl text-gray-600 text-lg">
            Transform your resume with AI-powered analysis, ATS compatibility checks, and
            personalized suggestions. Increase your chances of landing interviews with data-driven
            optimization.
          </p>

          {/* Quick Stats */}
          <div className="mx-auto mb-8 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
            {quickStats.map((stat, index) => (
              <div
                key={stat.label}
                className={`rounded-lg bg-white/70 p-4 backdrop-blur-sm transition-all duration-700 ${
                  isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="mb-1 text-2xl">{stat.icon}</div>
                <div className="font-bold text-gray-800 text-xl">{stat.value}</div>
                <div className="text-gray-600 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Options Grid */}
        <div
          className={`mb-12 grid gap-6 transition-all duration-1000 md:grid-cols-2 lg:grid-cols-4 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          {/* Upload File Option */}
          <Link
            href="/resume-optimizer/upload"
            className="group"
            aria-label="Upload existing resume"
          >
            <div className="card border-2 border-transparent bg-white shadow-lg transition-all duration-300 hover:border-blue-200 hover:shadow-xl group-hover:scale-105">
              <div className="card-body p-8 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-blue-100 p-4 transition-colors group-hover:bg-blue-200">
                    <DocumentArrowUpIcon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h2 className="card-title mb-3 justify-center text-xl">Upload Resume</h2>
                <p className="mb-4 text-gray-600">
                  Upload your existing resume in PDF or DOCX format for instant AI-powered analysis
                </p>
                <div className="mb-4 flex items-center justify-center">
                  <div className="flex items-center text-gray-500 text-sm">
                    <ClockIcon className="mr-1 h-4 w-4" />
                    <span>~2 minutes</span>
                  </div>
                </div>
                <div className="flex items-center justify-center font-medium text-blue-600">
                  Get Started
                  <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>

          {/* Import from Profile Option */}
          <Link
            href="/resume-optimizer/import"
            className="group"
            aria-label="Import from SwipeHire profile"
          >
            <div className="card border-2 border-transparent bg-white shadow-lg transition-all duration-300 hover:border-green-200 hover:shadow-xl group-hover:scale-105">
              <div className="card-body p-8 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-green-100 p-4 transition-colors group-hover:bg-green-200">
                    <UserIcon className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h2 className="card-title mb-3 justify-center text-xl">Import from Profile</h2>
                <p className="mb-4 text-gray-600">
                  Use your existing SwipeHire profile data to create an optimized resume instantly
                </p>
                <div className="mb-4 flex items-center justify-center">
                  <div className="flex items-center text-gray-500 text-sm">
                    <CheckCircleIcon className="mr-1 h-4 w-4" />
                    <span>Pre-filled data</span>
                  </div>
                </div>
                <div className="flex items-center justify-center font-medium text-green-600">
                  Import Now
                  <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>

          {/* Create from Scratch Option */}
          <Link
            href="/resume-optimizer/create"
            className="group"
            aria-label="Create resume from professional templates"
          >
            <div className="card border-2 border-transparent bg-white shadow-lg transition-all duration-300 hover:border-purple-200 hover:shadow-xl group-hover:scale-105">
              <div className="card-body p-8 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-purple-100 p-4 transition-colors group-hover:bg-purple-200">
                    <PlusIcon className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <h2 className="card-title mb-3 justify-center text-xl">Create from Scratch</h2>
                <p className="mb-4 text-gray-600">
                  Start with professional templates and build your resume from the ground up
                </p>
                <div className="mb-4 flex items-center justify-center">
                  <div className="flex items-center text-gray-500 text-sm">
                    <StarIcon className="mr-1 h-4 w-4" />
                    <span>6 templates</span>
                  </div>
                </div>
                <div className="flex items-center justify-center font-medium text-purple-600">
                  Start Building
                  <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>

          {/* Demo Features Option */}
          <Link
            href="/resume-optimizer/demos"
            className="group"
            aria-label="Explore advanced demo features"
          >
            <div className="card border-2 border-transparent bg-white shadow-lg transition-all duration-300 hover:border-orange-200 hover:shadow-xl group-hover:scale-105">
              <div className="card-body p-8 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-orange-100 p-4 transition-colors group-hover:bg-orange-200">
                    <BeakerIcon className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
                <h2 className="card-title mb-3 justify-center text-xl">Feature Demos</h2>
                <p className="mb-4 text-gray-600">
                  Explore advanced AI features: video generation, analytics, ATS scanning & smart
                  suggestions
                </p>
                <div className="mb-4 flex items-center justify-center">
                  <div className="flex items-center text-gray-500 text-sm">
                    <BeakerIcon className="mr-1 h-4 w-4" />
                    <span>5 demos</span>
                  </div>
                </div>
                <div className="flex items-center justify-center font-medium text-orange-600">
                  Try Demos
                  <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Features Section */}
        <div
          className={`mb-12 rounded-lg bg-white p-8 shadow-lg transition-all duration-1000 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
          style={{ transitionDelay: '600ms' }}
        >
          <h3 className="mb-6 text-center font-bold text-2xl text-gray-800">
            Comprehensive Resume Analysis
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="group text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 p-3 transition-colors group-hover:bg-blue-100">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="mb-2 font-semibold">ATS Compatibility</h4>
              <p className="text-gray-600 text-sm">
                Get detailed ATS compatibility scores and formatting recommendations
              </p>
            </div>
            <div className="group text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 p-3 transition-colors group-hover:bg-green-100">
                <span className="text-2xl">🎯</span>
              </div>
              <h4 className="mb-2 font-semibold">Keyword Optimization</h4>
              <p className="text-gray-600 text-sm">
                Match job requirements with intelligent keyword suggestions and placement
              </p>
            </div>
            <div className="group text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-purple-50 p-3 transition-colors group-hover:bg-purple-100">
                <span className="text-2xl">✏️</span>
              </div>
              <h4 className="mb-2 font-semibold">Real-time Editor</h4>
              <p className="text-gray-600 text-sm">
                Edit and reanalyze your resume instantly with live feedback
              </p>
            </div>
            <div className="group text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 p-3 transition-colors group-hover:bg-orange-100">
                <span className="text-2xl">📥</span>
              </div>
              <h4 className="mb-2 font-semibold">Export Options</h4>
              <p className="text-gray-600 text-sm">
                Download optimized resume in multiple formats (PDF, DOCX)
              </p>
            </div>
          </div>
        </div>

        {/* Additional Features */}
        <div
          className={`grid gap-8 transition-all duration-1000 md:grid-cols-2 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
          style={{ transitionDelay: '800ms' }}
        >
          {/* How It Works */}
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 font-bold text-gray-800 text-xl">How It Works</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="mt-1 mr-3 rounded-full bg-blue-100 p-2">
                  <span className="font-bold text-blue-600 text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-semibold">Choose Your Method</h4>
                  <p className="text-gray-600 text-sm">Upload, import, or create from templates</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mt-1 mr-3 rounded-full bg-green-100 p-2">
                  <span className="font-bold text-green-600 text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-semibold">Add Target Job</h4>
                  <p className="text-gray-600 text-sm">Specify job title and relevant keywords</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mt-1 mr-3 rounded-full bg-purple-100 p-2">
                  <span className="font-bold text-purple-600 text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-semibold">Get AI Analysis</h4>
                  <p className="text-gray-600 text-sm">Receive detailed optimization report</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mt-1 mr-3 rounded-full bg-orange-100 p-2">
                  <span className="font-bold text-orange-600 text-sm">4</span>
                </div>
                <div>
                  <h4 className="font-semibold">Optimize & Download</h4>
                  <p className="text-gray-600 text-sm">Apply suggestions and export final resume</p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 font-bold text-gray-800 text-xl">Key Benefits</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <CheckCircleIcon className="mr-3 h-5 w-5 text-green-600" />
                <span className="text-sm">Increase interview callback rates</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="mr-3 h-5 w-5 text-green-600" />
                <span className="text-sm">Pass ATS screening systems</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="mr-3 h-5 w-5 text-green-600" />
                <span className="text-sm">Highlight relevant skills and experience</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="mr-3 h-5 w-5 text-green-600" />
                <span className="text-sm">Professional formatting and layout</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="mr-3 h-5 w-5 text-green-600" />
                <span className="text-sm">Industry-specific recommendations</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="mr-3 h-5 w-5 text-green-600" />
                <span className="text-sm">Grammar and spelling optimization</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeOptimizerPage;
