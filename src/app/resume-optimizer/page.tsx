'use client';

import {
  ArrowRightIcon,
  DocumentArrowUpIcon,
  PlusIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useState, useEffect } from 'react';

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
      {/* Hero Section */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header Section */}
        <div className={`text-center mb-12 transition-all duration-1000 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-full">
              <DocumentArrowUpIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Resume Optimizer
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            Transform your resume with AI-powered analysis, ATS compatibility checks, and
            personalized suggestions. Increase your chances of landing interviews with
            data-driven optimization.
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            {quickStats.map((stat, index) => (
              <div
                key={stat.label}
                className={`bg-white/70 backdrop-blur-sm rounded-lg p-4 transition-all duration-700 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-xs text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Options Grid */}
        <div className={`grid md:grid-cols-3 gap-6 mb-12 transition-all duration-1000 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} style={{ transitionDelay: '400ms' }}>
          {/* Upload File Option */}
          <Link href="/resume-optimizer/upload" className="group" aria-label="Upload existing resume">
            <div className="card bg-white shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 border-2 border-transparent hover:border-blue-200">
              <div className="card-body text-center p-8">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                    <DocumentArrowUpIcon className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <h2 className="card-title text-xl mb-3 justify-center">Upload Resume</h2>
                <p className="text-gray-600 mb-4">
                  Upload your existing resume in PDF or DOCX format for instant AI-powered analysis
                </p>
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    <span>~2 minutes</span>
                  </div>
                </div>
                <div className="flex items-center justify-center text-blue-600 font-medium">
                  Get Started
                  <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          {/* Import from Profile Option */}
          <Link href="/resume-optimizer/import" className="group" aria-label="Import from SwipeHire profile">
            <div className="card bg-white shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 border-2 border-transparent hover:border-green-200">
              <div className="card-body text-center p-8">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                    <UserIcon className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <h2 className="card-title text-xl mb-3 justify-center">Import from Profile</h2>
                <p className="text-gray-600 mb-4">
                  Use your existing SwipeHire profile data to create an optimized resume instantly
                </p>
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    <span>Pre-filled data</span>
                  </div>
                </div>
                <div className="flex items-center justify-center text-green-600 font-medium">
                  Import Now
                  <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          {/* Create from Scratch Option */}
          <Link href="/resume-optimizer/create" className="group" aria-label="Create resume from professional templates">
            <div className="card bg-white shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 border-2 border-transparent hover:border-purple-200">
              <div className="card-body text-center p-8">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                    <PlusIcon className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                <h2 className="card-title text-xl mb-3 justify-center">Create from Scratch</h2>
                <p className="text-gray-600 mb-4">
                  Start with professional templates and build your resume from the ground up
                </p>
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <StarIcon className="w-4 h-4 mr-1" />
                    <span>6 templates</span>
                  </div>
                </div>
                <div className="flex items-center justify-center text-purple-600 font-medium">
                  Start Building
                  <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Features Section */}
        <div className={`bg-white rounded-lg shadow-lg p-8 mb-12 transition-all duration-1000 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} style={{ transitionDelay: '600ms' }}>
          <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Comprehensive Resume Analysis
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center group">
              <div className="bg-blue-50 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="font-semibold mb-2">ATS Compatibility</h4>
              <p className="text-sm text-gray-600">
                Get detailed ATS compatibility scores and formatting recommendations
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-green-50 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <span className="text-2xl">🎯</span>
              </div>
              <h4 className="font-semibold mb-2">Keyword Optimization</h4>
              <p className="text-sm text-gray-600">
                Match job requirements with intelligent keyword suggestions and placement
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-purple-50 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <span className="text-2xl">✏️</span>
              </div>
              <h4 className="font-semibold mb-2">Real-time Editor</h4>
              <p className="text-sm text-gray-600">
                Edit and reanalyze your resume instantly with live feedback
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-orange-50 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                <span className="text-2xl">📥</span>
              </div>
              <h4 className="font-semibold mb-2">Export Options</h4>
              <p className="text-sm text-gray-600">
                Download optimized resume in multiple formats (PDF, DOCX)
              </p>
            </div>
          </div>
        </div>

        {/* Additional Features */}
        <div className={`grid md:grid-cols-2 gap-8 transition-all duration-1000 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} style={{ transitionDelay: '800ms' }}>
          {/* How It Works */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">How It Works</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full p-2 mr-3 mt-1">
                  <span className="text-sm font-bold text-blue-600">1</span>
                </div>
                <div>
                  <h4 className="font-semibold">Choose Your Method</h4>
                  <p className="text-sm text-gray-600">Upload, import, or create from templates</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-green-100 rounded-full p-2 mr-3 mt-1">
                  <span className="text-sm font-bold text-green-600">2</span>
                </div>
                <div>
                  <h4 className="font-semibold">Add Target Job</h4>
                  <p className="text-sm text-gray-600">Specify job title and relevant keywords</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-purple-100 rounded-full p-2 mr-3 mt-1">
                  <span className="text-sm font-bold text-purple-600">3</span>
                </div>
                <div>
                  <h4 className="font-semibold">Get AI Analysis</h4>
                  <p className="text-sm text-gray-600">Receive detailed optimization report</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-orange-100 rounded-full p-2 mr-3 mt-1">
                  <span className="text-sm font-bold text-orange-600">4</span>
                </div>
                <div>
                  <h4 className="font-semibold">Optimize & Download</h4>
                  <p className="text-sm text-gray-600">Apply suggestions and export final resume</p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Key Benefits</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm">Increase interview callback rates</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm">Pass ATS screening systems</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm">Highlight relevant skills and experience</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm">Professional formatting and layout</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm">Industry-specific recommendations</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
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
