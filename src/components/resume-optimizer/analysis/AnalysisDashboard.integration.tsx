/**
 * Analysis Dashboard Integration Example
 *
 * Demonstrates how to integrate the Analysis Dashboard into a real application
 * with proper state management, API integration, and error handling
 */

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type {
  BenchmarkData,
  EnhancedAnalysisResult,
  OptimizationGoals,
  SuggestionAction,
  UserProfile,
} from '../types';
import { AnalysisDashboard } from './AnalysisDashboard';

// Mock API service for demonstration
class ResumeAnalysisService {
  static async analyzeResume(resumeId: string): Promise<EnhancedAnalysisResult> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      id: resumeId,
      overallScore: 78,
      categoryScores: {
        ats: 85,
        keywords: 72,
        format: 90,
        content: 68,
        impact: 75,
        readability: 82,
      },
      suggestions: [
        {
          id: 'suggestion-1',
          type: 'keyword-optimization',
          priority: 'high',
          category: 'keywords',
          title: 'Add Industry Keywords',
          description: 'Include more relevant keywords for your target role',
          impact: {
            scoreIncrease: 8,
            atsCompatibility: 15,
            readabilityImprovement: 0,
            keywordDensity: 12,
          },
          effort: {
            timeMinutes: 10,
            difficulty: 'easy',
            requiresManualReview: false,
          },
          beforePreview: 'Managed team projects',
          afterPreview: 'Led cross-functional team projects using Agile methodologies',
          isApplied: false,
          canAutoApply: true,
        },
      ],
      achievements: [
        {
          id: 'achievement-1',
          title: 'First Analysis',
          description: 'Completed your first resume analysis',
          icon: 'trophy',
          category: 'first-steps',
          points: 100,
          unlockedAt: new Date(),
          rarity: 'common',
        },
      ],
      nextMilestones: [
        {
          id: 'milestone-1',
          title: 'Score Master',
          description: 'Reach a resume score of 85',
          targetScore: 85,
          currentProgress: 78,
          reward: {
            id: 'reward-1',
            title: 'Score Master Badge',
            description: 'Achieved excellent resume score',
            icon: 'medal',
            category: 'optimization-master',
            points: 500,
            unlockedAt: new Date(),
            rarity: 'epic',
          },
          estimatedTimeToComplete: 15,
        },
      ],
      industryBenchmarks: {
        industry: 'Technology',
        role: 'Software Engineer',
        averageScore: 72,
        topPercentileScore: 88,
        commonKeywords: ['JavaScript', 'React', 'Node.js', 'Python'],
        trendingSkills: ['TypeScript', 'AWS', 'Docker', 'Kubernetes'],
      },
      analysisTimestamp: new Date(),
      version: '1.0.0',
    };
  }

  static async applySuggestion(): Promise<{ success: boolean; newScore: number }> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      success: true,
      newScore: 86, // Simulated new score after applying suggestion
    };
  }

  static async getBenchmarkData(industry: string, role: string): Promise<BenchmarkData> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      industry,
      role,
      averageScore: 72,
      topPercentileScore: 88,
      commonKeywords: ['JavaScript', 'React', 'Node.js', 'Python', 'Git'],
      trendingSkills: ['TypeScript', 'AWS', 'Docker', 'Kubernetes', 'GraphQL'],
    };
  }
}

// WebSocket service for real-time updates
class RealtimeService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, (data: any) => void> = new Map();

  connect(userId: string) {
    if (typeof window === 'undefined') return;

    this.ws = new WebSocket(`wss://api.swipehire.com/ws/${userId}`);

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const listener = this.listeners.get(data.type);
      if (listener) {
        listener(data.payload);
      }
    };
  }

  subscribe(eventType: string, callback: (data: any) => void) {
    this.listeners.set(eventType, callback);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }
}

// Analytics service for tracking user interactions
class AnalyticsService {
  static track(event: string, properties: Record<string, any>) {
    // Simulate analytics tracking
    console.log('Analytics:', event, properties);

    // In real implementation, this would send to analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, properties);
    }
  }
}

// Error boundary for the dashboard
class AnalysisDashboardErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AnalysisDashboard Error:', error, errorInfo);
    this.props.onError?.(error);

    // Send error to monitoring service
    AnalyticsService.track('component_error', {
      component: 'AnalysisDashboard',
      error: error.message,
      stack: error.stack,
    });
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="card bg-error text-error-content">
          <div className="card-body text-center">
            <h2 className="card-title">Something went wrong</h2>
            <p>We're sorry, but the analysis dashboard encountered an error.</p>
            <div className="card-actions justify-center">
              <button
                className="btn btn-outline"
                onClick={() => this.setState({ hasError: false, error: undefined } as any)}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading skeleton component
const AnalysisDashboardSkeleton: React.FC = () => (
  <div className="mx-auto w-full max-w-7xl space-y-6 p-4">
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body p-4">
        <div className="skeleton mb-2 h-8 w-64" />
        <div className="skeleton mb-4 h-4 w-96" />
        <div className="flex gap-2">
          <div className="skeleton h-10 w-20" />
          <div className="skeleton h-10 w-24" />
          <div className="skeleton h-10 w-20" />
          <div className="skeleton h-10 w-22" />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="skeleton mb-4 h-6 w-48" />
            <div className="flex justify-center">
              <div className="skeleton h-32 w-32 rounded-full" />
            </div>
            <div className="mt-6 space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="skeleton h-4 w-20" />
                  <div className="skeleton h-2 w-24" />
                  <div className="skeleton h-4 w-8" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-4">
            <div className="skeleton mb-3 h-6 w-24" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="skeleton h-4 w-16" />
                  <div className="skeleton h-4 w-8" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Main integration component
interface AnalysisDashboardIntegrationProps {
  resumeId: string;
  userProfile: UserProfile;
  userGoals: OptimizationGoals;
  enableRealTimeUpdates?: boolean;
  onAnalysisComplete?: (result: EnhancedAnalysisResult) => void;
  onError?: (error: Error) => void;
}

export const AnalysisDashboardIntegration: React.FC<AnalysisDashboardIntegrationProps> = ({
  resumeId,
  userProfile,
  userGoals,
  enableRealTimeUpdates = true,
  onAnalysisComplete,
  onError,
}) => {
  // State management
  const [analysisResult, setAnalysisResult] = useState<EnhancedAnalysisResult | null>(null);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [realtimeService] = useState(() => new RealtimeService());

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load analysis result and benchmark data in parallel
        const [analysis, benchmarks] = await Promise.all([
          ResumeAnalysisService.analyzeResume(resumeId),
          ResumeAnalysisService.getBenchmarkData(userGoals.targetIndustry, userGoals.targetRole),
        ]);

        setAnalysisResult(analysis);
        setBenchmarkData(benchmarks);
        onAnalysisComplete?.(analysis);

        // Track successful load
        AnalyticsService.track('analysis_dashboard_loaded', {
          resumeId,
          userId: userProfile.id,
          overallScore: analysis.overallScore,
          suggestionsCount: analysis.suggestions.length,
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load analysis');
        setError(error);
        onError?.(error);

        AnalyticsService.track('analysis_dashboard_error', {
          resumeId,
          userId: userProfile.id,
          error: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [
    resumeId,
    userGoals.targetIndustry,
    userGoals.targetRole,
    userProfile.id,
    onAnalysisComplete,
    onError,
  ]);

  // Setup real-time updates
  useEffect(() => {
    if (!enableRealTimeUpdates || !userProfile.id) return;

    realtimeService.connect(userProfile.id);

    // Subscribe to analysis updates
    realtimeService.subscribe('analysis_updated', (data) => {
      setAnalysisResult((prev) => (prev ? { ...prev, ...data } : null));
    });

    // Subscribe to benchmark updates
    realtimeService.subscribe('benchmarks_updated', (data) => {
      setBenchmarkData((prev) => (prev ? { ...prev, ...data } : null));
    });

    return () => {
      realtimeService.disconnect();
    };
  }, [enableRealTimeUpdates, userProfile.id, realtimeService]);

  // Handle suggestion interactions
  const handleSuggestionInteraction = useCallback(
    async (action: SuggestionAction) => {
      if (!analysisResult) return;

      try {
        // Track interaction
        AnalyticsService.track('suggestion_interaction', {
          action: action.type,
          suggestionId: action.suggestionId,
          userId: userProfile.id,
          resumeId,
        });

        if (action.type === 'apply') {
          // Apply suggestion via API
          const result = await ResumeAnalysisService.applySuggestion();

          if (result.success) {
            // Update local state
            setAnalysisResult((prev) => {
              if (!prev) return null;

              return {
                ...prev,
                overallScore: result.newScore,
                suggestions: prev.suggestions.map((s) =>
                  s.id === action.suggestionId ? { ...s, isApplied: true } : s
                ),
              };
            });

            // Track successful application
            AnalyticsService.track('suggestion_applied', {
              suggestionId: action.suggestionId,
              newScore: result.newScore,
              userId: userProfile.id,
              resumeId,
            });
          }
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to apply suggestion');
        console.error('Suggestion interaction error:', error);

        AnalyticsService.track('suggestion_interaction_error', {
          action: action.type,
          suggestionId: action.suggestionId,
          error: error.message,
          userId: userProfile.id,
          resumeId,
        });
      }
    },
    [analysisResult, userProfile.id, resumeId]
  );

  // Handle score updates
  const handleScoreUpdate = useCallback(
    (newScore: number) => {
      if (!analysisResult) return;

      setAnalysisResult((prev) => (prev ? { ...prev, overallScore: newScore } : null));

      AnalyticsService.track('score_updated', {
        newScore,
        previousScore: analysisResult.overallScore,
        improvement: newScore - analysisResult.overallScore,
        userId: userProfile.id,
        resumeId,
      });
    },
    [analysisResult, userProfile.id, resumeId]
  );

  // Handle errors
  const handleError = useCallback(
    (error: Error) => {
      setError(error);
      onError?.(error);
    },
    [onError]
  );

  // Retry function
  const handleRetry = useCallback(() => {
    setError(null);
    setIsLoading(true);

    // Trigger reload by updating a dependency
    const loadData = async () => {
      try {
        const analysis = await ResumeAnalysisService.analyzeResume(resumeId);
        setAnalysisResult(analysis);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Retry failed');
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [resumeId]);

  // Render loading state
  if (isLoading) {
    return <AnalysisDashboardSkeleton />;
  }

  // Render error state
  if (error) {
    return (
      <div className="card mx-auto max-w-md bg-error text-error-content">
        <div className="card-body text-center">
          <h2 className="card-title">Analysis Failed</h2>
          <p>{error.message}</p>
          <div className="card-actions justify-center">
            <button className="btn btn-outline" onClick={handleRetry}>
              Retry Analysis
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render dashboard
  if (!analysisResult || !benchmarkData) {
    return <AnalysisDashboardSkeleton />;
  }

  return (
    <AnalysisDashboardErrorBoundary onError={handleError}>
      <AnalysisDashboard
        analysisResult={analysisResult}
        userGoals={userGoals}
        industryBenchmarks={benchmarkData}
        enableRealTimeUpdates={enableRealTimeUpdates}
        onSuggestionInteraction={handleSuggestionInteraction}
        onScoreUpdate={handleScoreUpdate}
      />
    </AnalysisDashboardErrorBoundary>
  );
};

// Example usage component
export const ExampleUsage: React.FC = () => {
  const mockUserProfile: UserProfile = {
    id: 'user-123',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'user',
    industry: 'Technology',
    experienceLevel: 'mid',
    preferences: {
      theme: 'light',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        analysisComplete: true,
        weeklyTips: false,
      },
      privacy: {
        shareAnalytics: true,
        allowPeerReview: false,
        publicProfile: false,
      },
    },
    createdAt: new Date('2024-01-01'),
    lastActive: new Date(),
  };

  const mockUserGoals: OptimizationGoals = {
    primaryObjective: 'ats-optimization',
    targetIndustry: 'Technology',
    targetRole: 'Senior Software Engineer',
    timeframe: 'week',
    experienceLevel: 'mid',
  };

  const handleAnalysisComplete = (result: EnhancedAnalysisResult) => {
    console.log('Analysis completed:', result);
  };

  const handleError = (error: Error) => {
    console.error('Dashboard error:', error);
  };

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <AnalysisDashboardIntegration
        resumeId="resume-123"
        userProfile={mockUserProfile}
        userGoals={mockUserGoals}
        enableRealTimeUpdates={true}
        onAnalysisComplete={handleAnalysisComplete}
        onError={handleError}
      />
    </div>
  );
};

export default AnalysisDashboardIntegration;
