'use client';

import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CheckIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useState } from 'react';

interface AnalysisReport {
  overallScore: number;
  atsScore: number;
  keywordMatching: {
    matched: string[];
    missing: string[];
    score: number;
  };
  suggestions: Array<{
    id: string;
    type: 'keyword' | 'grammar' | 'format' | 'achievement';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    suggestion: string;
  }>;
  grammarIssues: number;
  formatScore: number;
}

/**
 * Resume analysis report page component
 * Displays detailed analysis results and provides editing capabilities
 */
const ResumeReportPage: NextPage = () => {
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [adoptedSuggestions, setAdoptedSuggestions] = useState<Set<string>>(new Set());
  const [ignoredSuggestions, setIgnoredSuggestions] = useState<Set<string>>(new Set());

  // Mock analysis data - in real implementation, this would come from API/props
  const mockReport: AnalysisReport = {
    overallScore: 78,
    atsScore: 85,
    keywordMatching: {
      matched: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
      missing: ['AWS', 'Docker', 'Kubernetes', 'GraphQL'],
      score: 65,
    },
    suggestions: [
      {
        id: '1',
        type: 'keyword',
        title: 'Add Missing Keywords',
        description: 'Your resume is missing key technologies mentioned in the job posting',
        impact: 'high',
        suggestion: 'Consider adding AWS, Docker, and Kubernetes to your skills section',
      },
      {
        id: '2',
        type: 'achievement',
        title: 'Quantify Achievements',
        description: 'Add specific numbers and metrics to your accomplishments',
        impact: 'high',
        suggestion: 'Replace "improved performance" with "improved performance by 40%"',
      },
      {
        id: '3',
        type: 'format',
        title: 'Improve Section Headers',
        description: 'Use consistent formatting for section headers',
        impact: 'medium',
        suggestion: 'Make all section headers bold and uppercase',
      },
      {
        id: '4',
        type: 'grammar',
        title: 'Fix Grammar Issues',
        description: 'There are minor grammar issues that should be corrected',
        impact: 'low',
        suggestion: 'Review verb tenses and ensure consistency throughout',
      },
    ],
    grammarIssues: 3,
    formatScore: 72,
  };

  const handleReanalyze = async (): Promise<void> => {
    setIsReanalyzing(true);
    // Simulate reanalysis
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsReanalyzing(false);
  };

  const handleAdoptSuggestion = (suggestionId: string): void => {
    setAdoptedSuggestions((prev) => new Set([...prev, suggestionId]));
    setIgnoredSuggestions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(suggestionId);
      return newSet;
    });
  };

  const handleIgnoreSuggestion = (suggestionId: string): void => {
    setIgnoredSuggestions((prev) => new Set([...prev, suggestionId]));
    setAdoptedSuggestions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(suggestionId);
      return newSet;
    });
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getImpactColor = (impact: string): string => {
    switch (impact) {
      case 'high':
        return 'badge-error';
      case 'medium':
        return 'badge-warning';
      case 'low':
        return 'badge-info';
      default:
        return 'badge-neutral';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/resume-optimizer" className="btn btn-ghost btn-sm mr-4">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Resume Analysis Report</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReanalyze}
              disabled={isReanalyzing}
              className="btn btn-outline btn-primary"
            >
              {isReanalyzing && <span className="loading loading-spinner loading-sm" />}
              <ArrowPathIcon className="w-4 h-4" />
              {isReanalyzing ? 'Analyzing...' : 'Reanalyze'}
            </button>
            <button className="btn btn-success">
              <DocumentArrowDownIcon className="w-4 h-4" />
              Download PDF
            </button>
            <button className="btn btn-success btn-outline">
              <DocumentArrowDownIcon className="w-4 h-4" />
              Download DOCX
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Analysis Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Score Overview */}
            <div className="card bg-white shadow-lg">
              <div className="card-body">
                <h2 className="card-title mb-4">Overall Analysis</h2>
                <div className="grid md:grid-cols-4 gap-4">
                  <div
                    className={`text-center p-4 rounded-lg ${getScoreBgColor(mockReport.overallScore)}`}
                  >
                    <div className={`text-3xl font-bold ${getScoreColor(mockReport.overallScore)}`}>
                      {mockReport.overallScore}
                    </div>
                    <div className="text-sm font-medium">Overall Score</div>
                  </div>
                  <div
                    className={`text-center p-4 rounded-lg ${getScoreBgColor(mockReport.atsScore)}`}
                  >
                    <div className={`text-3xl font-bold ${getScoreColor(mockReport.atsScore)}`}>
                      {mockReport.atsScore}
                    </div>
                    <div className="text-sm font-medium">ATS Friendly</div>
                  </div>
                  <div
                    className={`text-center p-4 rounded-lg ${getScoreBgColor(mockReport.keywordMatching.score)}`}
                  >
                    <div
                      className={`text-3xl font-bold ${getScoreColor(mockReport.keywordMatching.score)}`}
                    >
                      {mockReport.keywordMatching.score}
                    </div>
                    <div className="text-sm font-medium">Keywords</div>
                  </div>
                  <div
                    className={`text-center p-4 rounded-lg ${getScoreBgColor(mockReport.formatScore)}`}
                  >
                    <div className={`text-3xl font-bold ${getScoreColor(mockReport.formatScore)}`}>
                      {mockReport.formatScore}
                    </div>
                    <div className="text-sm font-medium">Format</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Keyword Analysis */}
            <div className="card bg-white shadow-lg">
              <div className="card-body">
                <h3 className="card-title mb-4">Keyword Analysis</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-2">Matched Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {mockReport.keywordMatching.matched.map((keyword, index) => (
                        <span key={index} className="badge badge-success">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-600 mb-2">Missing Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {mockReport.keywordMatching.missing.map((keyword, index) => (
                        <span key={index} className="badge badge-error">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div className="card bg-white shadow-lg">
              <div className="card-body">
                <h3 className="card-title mb-4">Optimization Suggestions</h3>
                <div className="space-y-4">
                  {mockReport.suggestions.map((suggestion) => {
                    const isAdopted = adoptedSuggestions.has(suggestion.id);
                    const isIgnored = ignoredSuggestions.has(suggestion.id);

                    return (
                      <div
                        key={suggestion.id}
                        className={`border rounded-lg p-4 ${
                          isAdopted
                            ? 'border-green-300 bg-green-50'
                            : isIgnored
                              ? 'border-gray-300 bg-gray-50 opacity-60'
                              : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{suggestion.title}</h4>
                            <span className={`badge badge-sm ${getImpactColor(suggestion.impact)}`}>
                              {suggestion.impact} impact
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {!isAdopted && !isIgnored && (
                              <>
                                <button
                                  onClick={() => handleAdoptSuggestion(suggestion.id)}
                                  className="btn btn-success btn-sm"
                                >
                                  <CheckIcon className="w-4 h-4" />
                                  Adopt
                                </button>
                                <button
                                  onClick={() => handleIgnoreSuggestion(suggestion.id)}
                                  className="btn btn-ghost btn-sm"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                  Ignore
                                </button>
                              </>
                            )}
                            {isAdopted && (
                              <span className="text-green-600 text-sm font-medium">✓ Adopted</span>
                            )}
                            {isIgnored && (
                              <span className="text-gray-500 text-sm font-medium">Ignored</span>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{suggestion.description}</p>
                        <p className="text-gray-800 text-sm font-medium">{suggestion.suggestion}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Resume Editor */}
          <div className="card bg-white shadow-lg h-fit">
            <div className="card-body">
              <h3 className="card-title mb-4">Resume Editor</h3>
              <div className="form-control">
                <textarea
                  className="textarea textarea-bordered w-full h-96 font-mono text-sm"
                  placeholder="Your resume content will appear here for editing..."
                  defaultValue={`John Doe
Software Engineer
Email: john.doe@email.com
Phone: (555) 123-4567

EXPERIENCE
Senior Software Engineer | Tech Company | 2020-2023
• Developed and maintained web applications using React and Node.js
• Led a team of 5 developers on multiple projects
• Improved application performance by 40%

Software Engineer | Previous Company | 2018-2020
• Built responsive web interfaces using modern JavaScript frameworks
• Collaborated with cross-functional teams to deliver high-quality software
• Implemented automated testing procedures

EDUCATION
Bachelor of Science in Computer Science | University Name | 2018

SKILLS
JavaScript, TypeScript, React, Node.js, Python, SQL, Git`}
                />
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">
                  Edit your resume content above. Click "Reanalyze" to get updated suggestions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeReportPage;
