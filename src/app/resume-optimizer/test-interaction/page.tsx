'use client';

import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import ReportDisplay from '@/components/resume-optimizer/ReportDisplay';
import { ToastContainer } from '@/components/ui/toast';
import { useToast } from '@/hooks/useToast';
import type { OptimizationSuggestion, ResumeAnalysisResponse } from '@/lib/types/resume-optimizer';

/**
 * Test page for Editor Interaction functionality
 * This page demonstrates the Reanalyze, Adopt, and Ignore features
 */
const TestInteractionPage: NextPage = () => {
  const { toasts, addToast, removeToast } = useToast();
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [adoptedSuggestions, setAdoptedSuggestions] = useState<Set<string>>(new Set());
  const [ignoredSuggestions, setIgnoredSuggestions] = useState<Set<string>>(new Set());
  const [currentContent, setCurrentContent] = useState(`John Doe
john.doe@email.com | (555) 123-4567 | LinkedIn: linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Experienced software engineer with 5 years of experience developing web applications.

EXPERIENCE
Software Engineer | Tech Company | 2020 - Present
• Developed web applications
• Worked with team members
• Fixed bugs and issues

EDUCATION
Bachelor of Science in Computer Science | University | 2020

SKILLS
JavaScript, React, Node.js`);

  // Mock analysis result
  const mockAnalysisResult: ResumeAnalysisResponse = {
    id: 'test-analysis-123',
    overallScore: 75,
    atsScore: 70,
    keywordAnalysis: {
      score: 65,
      totalKeywords: 10,
      matchedKeywords: [
        {
          keyword: 'JavaScript',
          frequency: 1,
          relevanceScore: 8,
          context: ['Skills section'],
        },
        {
          keyword: 'React',
          frequency: 1,
          relevanceScore: 9,
          context: ['Skills section'],
        },
      ],
      missingKeywords: [
        {
          keyword: 'TypeScript',
          importance: 'high' as const,
          suggestedPlacement: ['Skills section'],
          relatedTerms: ['JavaScript', 'Frontend'],
        },
      ],
      keywordDensity: {},
      recommendations: [],
    },
    suggestions: [
      {
        id: 'suggestion-1',
        type: 'keyword',
        title: 'Add TypeScript to Skills',
        description: 'TypeScript is a highly sought-after skill for frontend developers.',
        impact: 'high' as const,
        suggestion: 'Add TypeScript to your skills section to improve keyword matching.',
        priority: 1,
        estimatedScoreImprovement: 10,
        beforeText: 'JavaScript, React, Node.js',
        afterText: 'JavaScript, TypeScript, React, Node.js',
        section: 'skills',
      },
      {
        id: 'suggestion-2',
        type: 'achievement',
        title: 'Quantify Your Achievements',
        description: 'Add specific numbers and metrics to your accomplishments.',
        impact: 'high' as const,
        suggestion:
          'Replace "Developed web applications" with "Developed 5+ responsive web applications serving 10,000+ users"',
        priority: 2,
        estimatedScoreImprovement: 15,
        beforeText: '• Developed web applications',
        afterText: '• Developed 5+ responsive web applications serving 10,000+ users',
        section: 'experience',
      },
      {
        id: 'suggestion-3',
        type: 'grammar',
        title: 'Improve Action Verbs',
        description: 'Use stronger action verbs to make your experience more impactful.',
        impact: 'medium' as const,
        suggestion:
          'Replace "Worked with team members" with "Collaborated with cross-functional teams"',
        priority: 3,
        estimatedScoreImprovement: 5,
        beforeText: '• Worked with team members',
        afterText: '• Collaborated with cross-functional teams of 8+ developers and designers',
        section: 'experience',
      },
      {
        id: 'suggestion-4',
        type: 'structure',
        title: 'Add Professional Summary',
        description: 'Enhance your professional summary with more specific details.',
        impact: 'medium' as const,
        suggestion: 'Expand your summary to include specific technologies and achievements.',
        priority: 4,
        estimatedScoreImprovement: 8,
        section: 'summary',
      },
    ],
    grammarCheck: {
      score: 85,
      totalIssues: 2,
      issues: [],
      overallReadability: 80,
    },
    formatAnalysis: {
      score: 80,
      atsCompatibility: 75,
      issues: [],
      recommendations: [],
      sectionStructure: [],
    },
    quantitativeAnalysis: {
      score: 60,
      achievementsWithNumbers: 1,
      totalAchievements: 5,
      suggestions: [],
      impactWords: [],
    },
    strengths: [
      'Clear contact information',
      'Professional experience included',
      'Education background provided',
      'Technical skills listed',
    ],
    weaknesses: [
      'Achievements lack quantification',
      'Missing important keywords',
      'Generic action verbs used',
    ],
    createdAt: new Date().toISOString(),
    processingTime: 1500,
  };

  const targetJobInfo = {
    title: 'Senior Frontend Developer',
    keywords: 'TypeScript, React, JavaScript, Frontend, Web Development',
    description: 'Looking for a senior frontend developer with React and TypeScript experience',
    company: 'Tech Startup Inc.',
  };

  const handleSuggestionAdopt = (suggestionId: string) => {
    setAdoptedSuggestions((prev) => new Set([...prev, suggestionId]));
    setIgnoredSuggestions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(suggestionId);
      return newSet;
    });

    addToast({
      type: 'success',
      title: 'Suggestion Adopted',
      description: 'The suggestion has been marked as adopted.',
      duration: 3000,
    });
  };

  const handleSuggestionIgnore = (suggestionId: string) => {
    setIgnoredSuggestions((prev) => new Set([...prev, suggestionId]));
    setAdoptedSuggestions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(suggestionId);
      return newSet;
    });

    addToast({
      type: 'info',
      title: 'Suggestion Ignored',
      description: 'The suggestion has been marked as ignored.',
      duration: 3000,
    });
  };

  const handleSuggestionModify = (suggestionId: string, modifiedText: string) => {
    // Use the modified text for future reference
    console.log('Modified suggestion:', suggestionId, 'with text:', modifiedText);
    handleSuggestionAdopt(suggestionId);

    addToast({
      type: 'success',
      title: 'Suggestion Modified',
      description: 'The suggestion has been modified and adopted.',
      duration: 3000,
    });
  };

  const handleApplySuggestionToEditor = (
    suggestionId: string,
    suggestion: OptimizationSuggestion
  ) => {
    // Apply the suggestion to the content
    let newContent = currentContent;

    if (suggestion.beforeText && suggestion.afterText) {
      newContent = currentContent.replace(suggestion.beforeText, suggestion.afterText);
    } else {
      // Append the suggestion
      newContent = currentContent + '\n\n[Applied]: ' + suggestion.suggestion;
    }

    setCurrentContent(newContent);
    handleSuggestionAdopt(suggestionId);

    addToast({
      type: 'success',
      title: 'Applied to Editor',
      description: `"${suggestion.title}" has been applied to the resume content.`,
      duration: 4000,
    });
  };

  const handleReanalyze = async () => {
    setIsReanalyzing(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsReanalyzing(false);

    // Reset suggestion states
    setAdoptedSuggestions(new Set());
    setIgnoredSuggestions(new Set());

    addToast({
      type: 'success',
      title: 'Reanalysis Complete',
      description: 'Your resume has been reanalyzed with the updated content.',
      duration: 5000,
    });
  };

  const handleEditorContentChange = (content: string) => {
    // Update the current content state with the new content
    console.log('Editor content changed, length:', content.length);
    setCurrentContent(content);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="container mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/resume-optimizer"
                className="group flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="font-medium">Back to Optimizer</span>
              </Link>
              <div className="h-6 w-px bg-slate-300" />
              <h1 className="text-2xl font-bold text-slate-900">Editor Interaction Test</h1>
            </div>

            <div className="badge badge-info">Test Environment</div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="container mx-auto max-w-7xl px-6 py-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">Test Instructions</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h3 className="font-medium mb-2">Features to Test:</h3>
              <ul className="space-y-1">
                <li>• Click "Adopt" to mark suggestions as adopted</li>
                <li>• Click "Apply to Editor" to modify resume content</li>
                <li>• Click "Ignore" to hide suggestions</li>
                <li>• Edit content in the Editor tab</li>
                <li>• Click "Reanalyze" to simulate new analysis</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Expected Behavior:</h3>
              <ul className="space-y-1">
                <li>• Toast notifications for all actions</li>
                <li>• Real-time content updates in editor</li>
                <li>• Suggestion state management</li>
                <li>• Loading states during reanalysis</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Report Display */}
        <ReportDisplay
          analysisResult={mockAnalysisResult}
          isLoading={false}
          onSuggestionAdopt={handleSuggestionAdopt}
          onSuggestionIgnore={handleSuggestionIgnore}
          onSuggestionModify={handleSuggestionModify}
          onSuggestionApplyToEditor={handleApplySuggestionToEditor}
          adoptedSuggestions={adoptedSuggestions}
          ignoredSuggestions={ignoredSuggestions}
          originalResumeText={currentContent}
          onEditorContentChange={handleEditorContentChange}
          showEditor={true}
          enableAutoSave={false}
          onReanalyze={handleReanalyze}
          isReanalyzing={isReanalyzing}
          targetJobInfo={targetJobInfo}
          className="animate-fade-in"
        />
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

export default TestInteractionPage;
