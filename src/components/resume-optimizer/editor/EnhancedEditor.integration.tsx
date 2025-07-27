/**
 * Enhanced Editor Integration Example
 *
 * Demonstrates real-world usage of the Enhanced Editor component
 * integrated with other resume optimizer components and services
 *
 * Features demonstrated:
 * - Integration with Analysis Dashboard
 * - Real-time collaboration setup
 * - AI service integration
 * - Version history management
 * - Template system integration
 * - Export functionality
 * - Auto-save with backend sync
 * - Error handling and recovery
 */

'use client';

import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnalysisDashboard } from '../analysis/AnalysisDashboard';
import type {
  CollaborationUser,
  EnhancedAnalysisResult,
  OptimizationGoals,
  ResumeSection,
  SuggestionAction,
  UserProfile,
  VersionHistoryEntry,
} from '../types';
import { EnhancedEditor } from './EnhancedEditor';

// Mock services for demonstration
class ResumeAnalysisService {
  static async analyzeResume(
    _content: string,
    goals: OptimizationGoals
  ): Promise<EnhancedAnalysisResult> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      id: `analysis-${Date.now()}`,
      overallScore: Math.floor(Math.random() * 40) + 60, // 60-100
      categoryScores: {
        ats: Math.floor(Math.random() * 30) + 70,
        keywords: Math.floor(Math.random() * 30) + 70,
        format: Math.floor(Math.random() * 30) + 70,
        content: Math.floor(Math.random() * 30) + 70,
        impact: Math.floor(Math.random() * 30) + 70,
        readability: Math.floor(Math.random() * 30) + 70,
      },
      suggestions: [
        {
          id: `suggestion-${Date.now()}`,
          type: 'keyword-optimization',
          priority: 'high',
          category: 'keywords',
          title: 'Add relevant keywords',
          description: 'Include more industry-specific keywords to improve ATS compatibility',
          impact: {
            scoreIncrease: Math.floor(Math.random() * 10) + 3,
            atsCompatibility: Math.floor(Math.random() * 15) + 5,
            readabilityImprovement: 0,
            keywordDensity: Math.floor(Math.random() * 20) + 10,
          },
          effort: {
            timeMinutes: Math.floor(Math.random() * 15) + 5,
            difficulty: 'easy',
            requiresManualReview: false,
          },
          beforePreview: 'Developed software applications',
          afterPreview: 'Developed scalable software applications using React and Node.js',
          isApplied: false,
          canAutoApply: true,
        },
      ],
      achievements: [],
      nextMilestones: [],
      industryBenchmarks: {
        industry: goals.targetIndustry,
        role: goals.targetRole,
        averageScore: 75,
        topPercentileScore: 95,
        commonKeywords: ['React', 'JavaScript', 'Node.js'],
        trendingSkills: ['TypeScript', 'AWS', 'Docker'],
      },
      analysisTimestamp: new Date(),
      version: '1.0.0',
    };
  }

  static async applySuggestion(_suggestionId: string, content: string): Promise<string> {
    // Simulate AI suggestion application
    await new Promise((resolve) => setTimeout(resolve, 500));
    return `${content} [AI Enhancement Applied]`;
  }
}

class CollaborationService {
  private static collaborators: CollaborationUser[] = [
    {
      id: 'user-1',
      name: 'Sarah Johnson',
      avatar: '/avatars/sarah.jpg',
      cursor: { line: 1, column: 0 },
      isActive: true,
      lastSeen: new Date(),
    },
    {
      id: 'user-2',
      name: 'Mike Chen',
      avatar: '/avatars/mike.jpg',
      cursor: { line: 5, column: 12 },
      isActive: false,
      lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
    },
  ];

  static getCollaborators(): CollaborationUser[] {
    return CollaborationService.collaborators;
  }

  static updateCursor(userId: string, line: number, column: number): void {
    const userIndex = CollaborationService.collaborators.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      const existingUser = CollaborationService.collaborators[userIndex];
      if (existingUser) {
        CollaborationService.collaborators[userIndex] = {
          id: existingUser.id,
          name: existingUser.name,
          avatar: existingUser.avatar,
          cursor: { line, column },
          isActive: existingUser.isActive,
          lastSeen: new Date(),
        };
      }
    }
  }
}

class VersionHistoryService {
  private static versions: VersionHistoryEntry[] = [];

  static async saveVersion(content: string, author: string): Promise<VersionHistoryEntry> {
    const version: VersionHistoryEntry = {
      id: `version-${Date.now()}`,
      content,
      timestamp: new Date(),
      author,
      changes: [
        {
          type: 'modification',
          section: 'Professional Summary',
          description: 'Updated summary with new achievements',
          impact: 5,
        },
      ],
      score: Math.floor(Math.random() * 40) + 60,
    };

    VersionHistoryService.versions.unshift(version);
    return version;
  }

  static getVersionHistory(): VersionHistoryEntry[] {
    return VersionHistoryService.versions;
  }

  static async restoreVersion(versionId: string): Promise<string> {
    const version = VersionHistoryService.versions.find((v) => v.id === versionId);
    return version?.content || '';
  }
}

class ExportService {
  static async exportResume(content: string, format: 'pdf' | 'docx' | 'txt'): Promise<Blob> {
    // Simulate export processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mimeTypes = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      txt: 'text/plain',
    };

    return new Blob([content], { type: mimeTypes[format] });
  }
}

// Integration component props
interface EnhancedEditorIntegrationProps {
  readonly resumeId: string;
  readonly initialContent?: string;
  readonly userProfile: UserProfile;
  readonly optimizationGoals: OptimizationGoals;
}

// Main integration component
export const EnhancedEditorIntegration: React.FC<EnhancedEditorIntegrationProps> = ({
  resumeId,
  initialContent = '',
  userProfile,
  optimizationGoals,
}) => {
  // State management
  const [content, setContent] = useState(initialContent);
  const [analysisResult, setAnalysisResult] = useState<EnhancedAnalysisResult | undefined>();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnalysisDashboard, setShowAnalysisDashboard] = useState(false);

  // Refs for cleanup
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const analysisTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize collaboration and version history
  useEffect(() => {
    setCollaborators(CollaborationService.getCollaborators());
  }, []);

  // Auto-save functionality
  const autoSave = useCallback(
    async (contentToSave: string) => {
      try {
        // Save to backend
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call

        // Save version
        await VersionHistoryService.saveVersion(contentToSave, userProfile.name);

        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        setError(null);
      } catch (err) {
        setError('Failed to save changes. Please try again.');
        console.error('Auto-save failed:', err);
      }
    },
    [userProfile.name]
  );

  // Debounced auto-save
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    if (hasUnsavedChanges) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        autoSave(content);
      }, 3000); // Auto-save after 3 seconds of inactivity
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [content, hasUnsavedChanges, autoSave]);

  // Auto-analysis on content changes
  useEffect(() => {
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }

    if (content.trim()) {
      analysisTimeoutRef.current = setTimeout(async () => {
        setIsAnalyzing(true);
        try {
          const result = await ResumeAnalysisService.analyzeResume(content, optimizationGoals);
          setAnalysisResult(result);
          setError(null);
        } catch (err) {
          setError('Failed to analyze resume. Please try again.');
          console.error('Analysis failed:', err);
        } finally {
          setIsAnalyzing(false);
        }
      }, 5000); // Analyze after 5 seconds of inactivity
    }

    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, [content, optimizationGoals]);

  // Handle content changes
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  }, []);

  // Handle section reordering
  const handleSectionReorder = useCallback((sections: ResumeSection[]) => {
    // Update content based on reordered sections
    const reorderedContent = sections.map((section) => section.content).join('\n\n');

    setContent(reorderedContent);
    setHasUnsavedChanges(true);
  }, []);

  // Handle AI suggestion application
  const handleSuggestionApply = useCallback(
    async (action: SuggestionAction) => {
      if (action.type === 'apply') {
        try {
          const enhancedContent = await ResumeAnalysisService.applySuggestion(
            action.suggestionId,
            content
          );
          setContent(enhancedContent);
          setHasUnsavedChanges(true);

          // Re-analyze after applying suggestion
          const newAnalysis = await ResumeAnalysisService.analyzeResume(
            enhancedContent,
            optimizationGoals
          );
          setAnalysisResult(newAnalysis);
        } catch (err) {
          setError('Failed to apply suggestion. Please try again.');
          console.error('Suggestion application failed:', err);
        }
      }
    },
    [content, optimizationGoals]
  );

  // Handle template changes
  const handleTemplateChange = useCallback((templateId: string) => {
    // Apply template formatting to content
    console.log('Template changed to:', templateId);
    setHasUnsavedChanges(true);
  }, []);

  // Handle export
  const handleExport = useCallback(
    async (format: 'pdf' | 'docx' | 'txt') => {
      setIsExporting(true);
      try {
        const blob = await ExportService.exportResume(content, format);

        // Download the file
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume-${resumeId}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setError(null);
      } catch (err) {
        setError('Failed to export resume. Please try again.');
        console.error('Export failed:', err);
      } finally {
        setIsExporting(false);
      }
    },
    [content, resumeId]
  );

  // Handle score updates from analysis dashboard
  const handleScoreUpdate = useCallback(
    (newScore: number) => {
      if (analysisResult) {
        setAnalysisResult({
          ...analysisResult,
          overallScore: newScore,
        });
      }
    },
    [analysisResult]
  );

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header with status and controls */}
      <div className="border-base-300 border-b bg-base-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-bold text-xl">Resume Editor</h1>

              {/* Status indicators */}
              <div className="flex items-center gap-3">
                {isAnalyzing && (
                  <div className="flex items-center gap-2 text-info">
                    <div className="loading loading-spinner loading-sm" />
                    <span className="text-sm">Analyzing...</span>
                  </div>
                )}

                {hasUnsavedChanges ? (
                  <div className="flex items-center gap-2 text-warning">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-warning" />
                    <span className="text-sm">Unsaved changes</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-success">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    <span className="text-sm">Saved {lastSaved.toLocaleTimeString()}</span>
                  </div>
                )}

                {analysisResult && (
                  <div className="badge badge-primary">Score: {analysisResult.overallScore}</div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowAnalysisDashboard(!showAnalysisDashboard)}
              >
                {showAnalysisDashboard ? 'Hide' : 'Show'} Analysis
              </button>

              {isExporting ? (
                <button className="btn btn-primary btn-sm loading">Exporting...</button>
              ) : (
                <div className="dropdown dropdown-end">
                  <button className="btn btn-primary btn-sm">Export Resume</button>
                  <ul className="dropdown-content menu w-52 rounded-box bg-base-100 p-2 shadow">
                    <li>
                      <button onClick={() => handleExport('pdf')}>Export as PDF</button>
                    </li>
                    <li>
                      <button onClick={() => handleExport('docx')}>Export as DOCX</button>
                    </li>
                    <li>
                      <button onClick={() => handleExport('txt')}>Export as TXT</button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="alert alert-error mt-3">
              <svg className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setError(null)}>
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="mx-auto max-w-7xl p-4">
        {showAnalysisDashboard && analysisResult ? (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Analysis Dashboard */}
            <div>
              <AnalysisDashboard
                analysisResult={analysisResult}
                userGoals={optimizationGoals}
                industryBenchmarks={analysisResult.industryBenchmarks}
                enableRealTimeUpdates={true}
                onSuggestionInteraction={handleSuggestionApply}
                onScoreUpdate={handleScoreUpdate}
              />
            </div>

            {/* Enhanced Editor */}
            <div>
              <EnhancedEditor
                initialContent={content}
                analysisResult={analysisResult!}
                userProfile={userProfile}
                optimizationGoals={optimizationGoals}
                enableCollaboration={true}
                enableAIAssistant={true}
                enableVersionHistory={true}
                onContentChange={handleContentChange}
                onSectionReorder={handleSectionReorder}
                onSuggestionApply={handleSuggestionApply}
                onTemplateChange={handleTemplateChange}
                onExport={handleExport}
              />
            </div>
          </div>
        ) : (
          /* Full-width editor when analysis is hidden */
          <EnhancedEditor
            initialContent={content}
            analysisResult={analysisResult!}
            userProfile={userProfile}
            optimizationGoals={optimizationGoals}
            enableCollaboration={true}
            enableAIAssistant={true}
            enableVersionHistory={true}
            onContentChange={handleContentChange}
            onSectionReorder={handleSectionReorder}
            onSuggestionApply={handleSuggestionApply}
            onTemplateChange={handleTemplateChange}
            onExport={handleExport}
          />
        )}
      </div>

      {/* Collaboration status bar */}
      {collaborators.length > 0 && (
        <div className="fixed right-4 bottom-4 rounded-lg border border-base-300 bg-base-100 p-3 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">Collaborators:</span>
            <div className="-space-x-2 flex">
              {collaborators.map((user) => (
                <div
                  key={user.id}
                  className={`avatar ${user.isActive ? 'online' : 'offline'}`}
                  title={`${user.name} ${user.isActive ? '(active)' : '(away)'}`}
                >
                  <div className="h-8 w-8 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
                    <img src={user.avatar} alt={user.name} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Example usage component
export const EnhancedEditorExample: React.FC = () => {
  const mockUserProfile: UserProfile = {
    id: 'user-123',
    email: 'sarah.johnson@example.com',
    name: 'Sarah Johnson',
    role: 'admin',
    industry: 'Technology',
    experienceLevel: 'senior',
    preferences: {
      theme: 'light',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        analysisComplete: true,
        weeklyTips: true,
      },
      privacy: {
        shareAnalytics: true,
        allowPeerReview: true,
        publicProfile: false,
      },
    },
    createdAt: new Date('2022-03-15'),
    lastActive: new Date(),
  };

  const mockOptimizationGoals: OptimizationGoals = {
    primaryObjective: 'ats-optimization',
    targetIndustry: 'Technology',
    targetRole: 'Senior Software Engineer',
    timeframe: 'week',
    experienceLevel: 'senior',
  };

  const sampleContent = `
SARAH JOHNSON
Senior Software Engineer
sarah.johnson@example.com | (555) 123-4567

PROFESSIONAL SUMMARY
Experienced Senior Software Engineer with 8+ years of expertise in full-stack development.

TECHNICAL SKILLS
• Languages: JavaScript, TypeScript, Python
• Frontend: React, Vue.js, Angular
• Backend: Node.js, Express, Django
• Cloud: AWS, Azure, Docker

PROFESSIONAL EXPERIENCE
Senior Software Engineer | TechCorp Inc. | 2020 - Present
• Led development of microservices architecture
• Improved application performance by 40%
• Mentored 5 junior developers

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2014 - 2018
  `.trim();

  return (
    <EnhancedEditorIntegration
      resumeId="resume-456"
      initialContent={sampleContent}
      userProfile={mockUserProfile}
      optimizationGoals={mockOptimizationGoals}
    />
  );
};

export default EnhancedEditorIntegration;
