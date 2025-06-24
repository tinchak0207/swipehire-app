/**
 * Test component for download functionality
 */

'use client';

import React, { useState } from 'react';
import {
  DownloadButton,
  DownloadDropdown,
  DownloadOptionsModal,
} from '@/components/resume-optimizer/DownloadButton';
import type { ResumeAnalysisResponse } from '@/lib/types/resume-optimizer';

const mockResumeContent = `John Doe
Software Engineer

Contact Information:
Email: john.doe@email.com
Phone: (555) 123-4567
Location: San Francisco, CA

Professional Summary:
Experienced software engineer with 5+ years of experience in full-stack development. Proficient in React, Node.js, and cloud technologies. Passionate about creating scalable and efficient solutions.

Experience:
Senior Software Engineer | TechCorp Inc. | 2021 - Present
• Led development of microservices architecture serving 1M+ users
• Improved application performance by 40% through optimization
• Mentored 3 junior developers and conducted code reviews

Software Engineer | StartupXYZ | 2019 - 2021
• Developed responsive web applications using React and TypeScript
• Implemented CI/CD pipelines reducing deployment time by 60%
• Collaborated with cross-functional teams to deliver features

Education:
Bachelor of Science in Computer Science
University of California, Berkeley | 2019

Skills:
• Programming Languages: JavaScript, TypeScript, Python, Java
• Frontend: React, Vue.js, HTML5, CSS3, Tailwind CSS
• Backend: Node.js, Express, Django, Spring Boot
• Databases: PostgreSQL, MongoDB, Redis
• Cloud: AWS, Docker, Kubernetes
• Tools: Git, Jenkins, Jira, Figma`;

const mockAnalysisResult: ResumeAnalysisResponse = {
  id: 'test-analysis-123',
  overallScore: 85,
  atsScore: 78,
  keywordAnalysis: {
    score: 82,
    totalKeywords: 15,
    matchedKeywords: [
      {
        keyword: 'React',
        frequency: 2,
        relevanceScore: 95,
        context: ['Frontend development', 'Web applications'],
      },
      {
        keyword: 'Node.js',
        frequency: 2,
        relevanceScore: 90,
        context: ['Backend development', 'Server-side'],
      },
    ],
    missingKeywords: [
      {
        keyword: 'GraphQL',
        importance: 'medium' as const,
        suggestedPlacement: ['Skills section'],
        relatedTerms: ['API', 'Query language'],
      },
    ],
    keywordDensity: {
      React: 0.02,
      'Node.js': 0.02,
      JavaScript: 0.01,
    },
    recommendations: [
      'Add more specific technical keywords',
      'Include industry-specific terminology',
    ],
  },
  suggestions: [
    {
      id: 'suggestion-1',
      type: 'keyword',
      title: 'Add GraphQL to Skills',
      description:
        'Adding GraphQL to your skills section will improve keyword matching for modern web development roles.',
      impact: 'medium',
      suggestion: 'Add "GraphQL" to your skills section under API technologies.',
      section: 'skills',
      priority: 2,
      estimatedScoreImprovement: 5,
    },
    {
      id: 'suggestion-2',
      type: 'achievement',
      title: 'Quantify Leadership Impact',
      description: 'Add specific metrics about your mentoring achievements.',
      impact: 'high',
      suggestion:
        'Specify the impact of mentoring, such as "Mentored 3 junior developers, resulting in 25% faster onboarding time"',
      section: 'experience',
      priority: 1,
      estimatedScoreImprovement: 8,
    },
  ],
  grammarCheck: {
    score: 92,
    totalIssues: 2,
    issues: [],
    overallReadability: 88,
  },
  formatAnalysis: {
    score: 80,
    atsCompatibility: 85,
    issues: [],
    recommendations: ['Use consistent bullet points', 'Ensure proper spacing'],
    sectionStructure: [],
  },
  quantitativeAnalysis: {
    score: 75,
    achievementsWithNumbers: 4,
    totalAchievements: 6,
    suggestions: [],
    impactWords: ['Led', 'Improved', 'Implemented', 'Collaborated'],
  },
  strengths: [
    'Strong technical skills coverage',
    'Good use of action verbs',
    'Quantified achievements',
    'Clear professional progression',
  ],
  weaknesses: [
    'Could include more industry keywords',
    'Missing some quantified results',
    'Could expand on leadership experience',
  ],
  createdAt: new Date().toISOString(),
  processingTime: 2500,
};

export const DownloadTestComponent: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [includeAnalysis, setIncludeAnalysis] = useState(true);

  const handleDownloadSuccess = (fileName: string) => {
    console.log('Download successful:', fileName);
    alert(`Download successful: ${fileName}`);
  };

  const handleDownloadError = (error: string) => {
    console.error('Download error:', error);
    alert(`Download error: ${error}`);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Download Functionality Test</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Resume Content Preview</h2>
        <div className="bg-gray-50 p-4 rounded border max-h-64 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm">{mockResumeContent}</pre>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Download Options</h2>

        <div className="space-y-4">
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Include Analysis Report</span>
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={includeAnalysis}
                onChange={(e) => setIncludeAnalysis(e.target.checked)}
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-4">
            <DownloadButton
              resumeContent={mockResumeContent}
              analysisResult={includeAnalysis ? mockAnalysisResult : null}
              format="pdf"
              includeAnalysis={includeAnalysis}
              adoptedSuggestions={['suggestion-1']}
              onDownloadSuccess={handleDownloadSuccess}
              onDownloadError={handleDownloadError}
            />

            <DownloadButton
              resumeContent={mockResumeContent}
              analysisResult={includeAnalysis ? mockAnalysisResult : null}
              format="docx"
              includeAnalysis={includeAnalysis}
              adoptedSuggestions={['suggestion-1']}
              onDownloadSuccess={handleDownloadSuccess}
              onDownloadError={handleDownloadError}
            />

            <DownloadDropdown
              resumeContent={mockResumeContent}
              analysisResult={includeAnalysis ? mockAnalysisResult : null}
              includeAnalysis={includeAnalysis}
              adoptedSuggestions={['suggestion-1']}
              onDownloadSuccess={handleDownloadSuccess}
              onDownloadError={handleDownloadError}
            />

            <button onClick={() => setShowModal(true)} className="btn btn-outline">
              Advanced Options
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Analysis Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat">
            <div className="stat-title">Overall Score</div>
            <div className="stat-value text-primary">{mockAnalysisResult.overallScore}</div>
          </div>
          <div className="stat">
            <div className="stat-title">ATS Score</div>
            <div className="stat-value text-secondary">{mockAnalysisResult.atsScore}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Suggestions</div>
            <div className="stat-value text-accent">{mockAnalysisResult.suggestions.length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Adopted</div>
            <div className="stat-value text-success">1</div>
          </div>
        </div>
      </div>

      <DownloadOptionsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        resumeContent={mockResumeContent}
        analysisResult={includeAnalysis ? mockAnalysisResult : null}
        adoptedSuggestions={['suggestion-1']}
        onDownloadSuccess={handleDownloadSuccess}
        onDownloadError={handleDownloadError}
      />
    </div>
  );
};

export default DownloadTestComponent;
