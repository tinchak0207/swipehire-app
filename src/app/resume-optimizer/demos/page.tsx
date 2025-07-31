'use client';

import {
  ArrowRightIcon,
  BeakerIcon,
  CalendarIcon,
  ChartBarIcon,
  CpuChipIcon,
  EyeIcon,
  LightBulbIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  UserGroupIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * Demo Hub Page - Central access point for all resume optimizer demo features
 * Links to the existing /demo/* pages and provides overview of capabilities
 */
export default function DemoHubPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const demoFeatures = [
    {
      id: 'ai-resume-optimizer',
      title: 'AI Resume Optimizer',
      description:
        'Experience our state-of-the-art AI-powered resume optimization with real-time analysis',
      icon: <CpuChipIcon className="h-8 w-8" />,
      color: 'blue',
      href: '/demo/ai-resume-optimizer',
      features: [
        'Real-time AI Analysis',
        'ATS Optimization',
        'Keyword Enhancement',
        'Format Checking',
      ],
      stats: { users: '10K+', accuracy: '95%', time: '30-60s' },
      status: 'live',
    },
    {
      id: 'ai-video-generator',
      title: 'AI Video Generator',
      description:
        'Transform your resume into professional video presentations using cutting-edge AI',
      icon: <VideoCameraIcon className="h-8 w-8" />,
      color: 'purple',
      href: '/demo/ai-video-generator',
      features: [
        'AI Script Generation',
        'Professional Templates',
        'Voice Synthesis',
        'Multiple Formats',
      ],
      stats: { quality: '4K', voices: '10+', time: '60s' },
      status: 'live',
    },
    {
      id: 'analytics-dashboard',
      title: 'Analytics Dashboard',
      description: 'Comprehensive analytics with AI-powered insights and performance predictions',
      icon: <ChartBarIcon className="h-8 w-8" />,
      color: 'green',
      href: '/demo/analytics-dashboard',
      features: ['Real-time Metrics', 'AI Predictions', 'Performance Tracking', 'Export Reports'],
      stats: { insights: '100+', accuracy: '92%', data: 'Real-time' },
      status: 'live',
    },
    {
      id: 'ats-scanner',
      title: 'ATS Scanner',
      description:
        'Real-time ATS compatibility analysis with intelligent suggestions and risk assessment',
      icon: <MagnifyingGlassIcon className="h-8 w-8" />,
      color: 'indigo',
      href: '/demo/ats-scanner',
      features: ['Real-time Scanning', 'Risk Assessment', 'Format Analysis', 'Industry Specific'],
      stats: { compatibility: '98%', systems: '50+', feedback: 'Instant' },
      status: 'live',
    },
    {
      id: 'smart-suggestions',
      title: 'Smart Suggestions',
      description: 'AI-powered resume optimization suggestions with ML-driven recommendations',
      icon: <LightBulbIcon className="h-8 w-8" />,
      color: 'orange',
      href: '/demo/smart-suggestions',
      features: ['ML Suggestions', 'Auto-Apply', 'Context Aware', 'Priority Scoring'],
      stats: { suggestions: '1000+', accuracy: '89%', types: '15+' },
      status: 'live',
    },
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      hover: 'hover:border-blue-300',
      icon: 'bg-blue-100 text-blue-600',
      button: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-800',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      hover: 'hover:border-purple-300',
      icon: 'bg-purple-100 text-purple-600',
      button: 'text-purple-600',
      badge: 'bg-purple-100 text-purple-800',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      hover: 'hover:border-green-300',
      icon: 'bg-green-100 text-green-600',
      button: 'text-green-600',
      badge: 'bg-green-100 text-green-800',
    },
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      hover: 'hover:border-indigo-300',
      icon: 'bg-indigo-100 text-indigo-600',
      button: 'text-indigo-600',
      badge: 'bg-indigo-100 text-indigo-800',
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      hover: 'hover:border-orange-300',
      icon: 'bg-orange-100 text-orange-600',
      button: 'text-orange-600',
      badge: 'bg-orange-100 text-orange-800',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header Section */}
        <div
          className={`mb-12 text-center transition-all duration-1000 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="mb-6 flex items-center justify-center">
            <div className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
              <BeakerIcon className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="mb-4 font-bold text-4xl text-gray-800 md:text-5xl">
            Resume Optimizer Demo Hub
          </h1>
          <p className="mx-auto mb-6 max-w-3xl text-gray-600 text-xl">
            Explore our cutting-edge AI-powered resume optimization features. Each demo showcases
            advanced capabilities that help job seekers maximize their resume's impact.
          </p>

          {/* Quick Navigation */}
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            <Link
              href="/resume-optimizer"
              className="rounded-full bg-white/70 px-4 py-2 text-gray-600 text-sm backdrop-blur-sm transition-colors hover:bg-white/90 hover:text-gray-800"
            >
              ← Back to Resume Optimizer
            </Link>
          </div>
        </div>

        {/* Demo Features Grid */}
        <div
          className={`mb-12 grid gap-8 transition-all duration-1000 md:grid-cols-2 lg:grid-cols-3 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          {demoFeatures.map((demo, index) => {
            const colors = colorClasses[demo.color as keyof typeof colorClasses];
            return (
              <div
                key={demo.id}
                className={`group transition-all duration-300 ${
                  isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
                style={{ transitionDelay: `${300 + index * 100}ms` }}
              >
                <div
                  className={`card border-2 ${colors.border} ${colors.bg} ${colors.hover} shadow-lg transition-all duration-300 hover:shadow-xl group-hover:scale-105`}
                >
                  <div className="card-body p-6">
                    {/* Header */}
                    <div className="mb-4 flex items-center justify-between">
                      <div className={`rounded-full p-3 ${colors.icon}`}>{demo.icon}</div>
                      <div className={`rounded-full px-3 py-1 text-xs ${colors.badge}`}>
                        {demo.status}
                      </div>
                    </div>

                    {/* Title and Description */}
                    <h3 className="mb-3 font-bold text-gray-800 text-xl">{demo.title}</h3>
                    <p className="mb-4 text-gray-600 text-sm">{demo.description}</p>

                    {/* Features */}
                    <div className="mb-4">
                      <h4 className="mb-2 font-semibold text-gray-700 text-sm">Key Features:</h4>
                      <div className="flex flex-wrap gap-1">
                        {demo.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className="rounded-md bg-white/70 px-2 py-1 text-gray-600 text-xs"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="mb-6 grid grid-cols-3 gap-2 text-center">
                      {Object.entries(demo.stats).map(([key, value]) => (
                        <div key={key} className="rounded-md bg-white/70 p-2">
                          <div className="font-bold text-gray-800 text-sm">{value}</div>
                          <div className="text-gray-600 text-xs capitalize">{key}</div>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <Link href={demo.href} className="group">
                      <div
                        className={`flex items-center justify-center font-medium transition-all ${colors.button} hover:underline`}
                      >
                        Try {demo.title}
                        <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Overview Statistics */}
        <div
          className={`mb-12 rounded-lg bg-white/70 p-8 backdrop-blur-sm transition-all duration-1000 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
          style={{ transitionDelay: '600ms' }}
        >
          <h3 className="mb-6 text-center font-bold text-2xl text-gray-800">
            Demo Platform Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <div className="rounded-full bg-blue-100 p-3">
                  <EyeIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="font-bold text-2xl text-gray-800">50K+</div>
              <div className="text-gray-600 text-sm">Demo Views</div>
            </div>
            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <UserGroupIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="font-bold text-2xl text-gray-800">12K+</div>
              <div className="text-gray-600 text-sm">Active Users</div>
            </div>
            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <div className="rounded-full bg-purple-100 p-3">
                  <SparklesIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="font-bold text-2xl text-gray-800">95%</div>
              <div className="text-gray-600 text-sm">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <div className="rounded-full bg-orange-100 p-3">
                  <CalendarIcon className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="font-bold text-2xl text-gray-800">24/7</div>
              <div className="text-gray-600 text-sm">Availability</div>
            </div>
          </div>
        </div>

        {/* Technology Section */}
        <div
          className={`rounded-lg bg-white/70 p-8 backdrop-blur-sm transition-all duration-1000 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
          style={{ transitionDelay: '800ms' }}
        >
          <h3 className="mb-6 text-center font-bold text-2xl text-gray-800">
            Powered by Advanced AI Technology
          </h3>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-4 font-semibold text-gray-800">AI Models & Services</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-center">
                  <span className="mr-3 h-2 w-2 rounded-full bg-blue-500" />
                  Mistral Large Latest - Advanced language understanding
                </li>
                <li className="flex items-center">
                  <span className="mr-3 h-2 w-2 rounded-full bg-green-500" />
                  ElevenLabs - Premium voice synthesis
                </li>
                <li className="flex items-center">
                  <span className="mr-3 h-2 w-2 rounded-full bg-purple-500" />
                  Runway ML - Video generation
                </li>
                <li className="flex items-center">
                  <span className="mr-3 h-2 w-2 rounded-full bg-orange-500" />
                  Custom ML models - Resume analysis
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-gray-800">Technical Capabilities</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-center">
                  <span className="mr-3 h-2 w-2 rounded-full bg-red-500" />
                  Real-time processing & analysis
                </li>
                <li className="flex items-center">
                  <span className="mr-3 h-2 w-2 rounded-full bg-yellow-500" />
                  Multi-format support (PDF, DOCX, TXT)
                </li>
                <li className="flex items-center">
                  <span className="mr-3 h-2 w-2 rounded-full bg-indigo-500" />
                  Industry-specific optimization
                </li>
                <li className="flex items-center">
                  <span className="mr-3 h-2 w-2 rounded-full bg-pink-500" />
                  Enterprise-grade security
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
