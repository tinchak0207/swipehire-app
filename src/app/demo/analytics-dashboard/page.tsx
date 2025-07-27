/**
 * Analytics Dashboard Demo Page
 *
 * Interactive demo showcasing the advanced analytics capabilities
 * of the resume optimizer with real-time metrics and AI insights
 */

'use client';

import { useEffect, useState } from 'react';
import { AdvancedAnalyticsDashboard } from '@/components/resume-optimizer/analytics/AdvancedAnalyticsDashboard';
import type { ImprovementPrediction, ResumeAnalysisSnapshot } from '@/lib/types/analytics';
import { resumeAnalyticsService } from '@/services/resumeAnalyticsService';

export default function AnalyticsDashboardDemo() {
  const [isGeneratingData, setIsGeneratingData] = useState(false);
  const [dataGenerated, setDataGenerated] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('demo_user_1');
  const [selectedTimeRange, setSelectedTimeRange] = useState<
    'day' | 'week' | 'month' | 'quarter' | 'year'
  >('month');
  const [prediction, setPrediction] = useState<ImprovementPrediction | null>(null);
  const [showRealTime, setShowRealTime] = useState(true);
  const [showBenchmarks, setShowBenchmarks] = useState(true);
  const [showInsights, setShowInsights] = useState(true);

  // Generate demo data
  const generateDemoData = async () => {
    setIsGeneratingData(true);
    try {
      // Generate multiple demo sessions with realistic data
      const demoSessions = [
        {
          userId: 'demo_user_1',
          targetRole: 'Software Engineer',
          targetIndustry: 'technology',
          beforeAnalysis: {
            overallScore: 65,
            atsScore: 70,
            keywordScore: 60,
            grammarScore: 85,
            formatScore: 75,
            quantitativeScore: 45,
            strengthsCount: 3,
            weaknessesCount: 5,
            suggestionsCount: 8,
            wordCount: 350,
            sectionCount: 5,
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          } as ResumeAnalysisSnapshot,
          afterAnalysis: {
            overallScore: 85,
            atsScore: 90,
            keywordScore: 88,
            grammarScore: 90,
            formatScore: 85,
            quantitativeScore: 78,
            strengthsCount: 6,
            weaknessesCount: 2,
            suggestionsCount: 3,
            wordCount: 420,
            sectionCount: 6,
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
          } as ResumeAnalysisSnapshot,
          suggestionsTotal: 8,
          sessionType: 'ai_assisted' as const,
        },
        {
          userId: 'demo_user_1',
          targetRole: 'Frontend Developer',
          targetIndustry: 'technology',
          beforeAnalysis: {
            overallScore: 72,
            atsScore: 65,
            keywordScore: 78,
            grammarScore: 88,
            formatScore: 70,
            quantitativeScore: 55,
            strengthsCount: 4,
            weaknessesCount: 4,
            suggestionsCount: 6,
            wordCount: 380,
            sectionCount: 5,
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          } as ResumeAnalysisSnapshot,
          afterAnalysis: {
            overallScore: 88,
            atsScore: 85,
            keywordScore: 92,
            grammarScore: 92,
            formatScore: 88,
            quantitativeScore: 75,
            strengthsCount: 7,
            weaknessesCount: 2,
            suggestionsCount: 2,
            wordCount: 410,
            sectionCount: 6,
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 2700000).toISOString(),
          } as ResumeAnalysisSnapshot,
          suggestionsTotal: 6,
          sessionType: 'collaborative' as const,
        },
        {
          userId: 'demo_user_1',
          targetRole: 'Product Manager',
          targetIndustry: 'technology',
          beforeAnalysis: {
            overallScore: 58,
            atsScore: 62,
            keywordScore: 55,
            grammarScore: 82,
            formatScore: 68,
            quantitativeScore: 40,
            strengthsCount: 2,
            weaknessesCount: 6,
            suggestionsCount: 10,
            wordCount: 320,
            sectionCount: 4,
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          } as ResumeAnalysisSnapshot,
          suggestionsTotal: 10,
          sessionType: 'manual' as const,
        },
        {
          userId: 'demo_user_2',
          targetRole: 'Data Scientist',
          targetIndustry: 'technology',
          beforeAnalysis: {
            overallScore: 75,
            atsScore: 80,
            keywordScore: 85,
            grammarScore: 90,
            formatScore: 78,
            quantitativeScore: 60,
            strengthsCount: 5,
            weaknessesCount: 3,
            suggestionsCount: 5,
            wordCount: 450,
            sectionCount: 6,
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          } as ResumeAnalysisSnapshot,
          afterAnalysis: {
            overallScore: 92,
            atsScore: 95,
            keywordScore: 98,
            grammarScore: 95,
            formatScore: 90,
            quantitativeScore: 88,
            strengthsCount: 8,
            weaknessesCount: 1,
            suggestionsCount: 1,
            wordCount: 480,
            sectionCount: 7,
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 4500000).toISOString(),
          } as ResumeAnalysisSnapshot,
          suggestionsTotal: 5,
          sessionType: 'ai_assisted' as const,
        },
      ];

      // Create sessions in the analytics service
      for (const session of demoSessions) {
        const sessionId = await resumeAnalyticsService.trackOptimizationSession(session);

        // Complete the session if it has after analysis
        if (session.afterAnalysis) {
          await resumeAnalyticsService.updateSession(sessionId, {
            afterAnalysis: session.afterAnalysis,
            suggestionsApplied: Math.floor(Math.random() * session.suggestionsTotal) + 1,
            status: 'completed',
            timeSpent: Math.floor(Math.random() * 5400) + 1800, // 30 minutes to 2 hours
          });
        }
      }

      // Generate a prediction for current session
      const currentAnalysis: ResumeAnalysisSnapshot = {
        overallScore: 68,
        atsScore: 72,
        keywordScore: 65,
        grammarScore: 85,
        formatScore: 70,
        quantitativeScore: 50,
        strengthsCount: 3,
        weaknessesCount: 4,
        suggestionsCount: 7,
        wordCount: 365,
        sectionCount: 5,
        timestamp: new Date().toISOString(),
      };

      const prediction = await resumeAnalyticsService.predictImprovement(
        currentAnalysis,
        'Full Stack Developer',
        'technology'
      );

      setPrediction(prediction);
      setDataGenerated(true);
    } catch (error) {
      console.error('Failed to generate demo data:', error);
    } finally {
      setIsGeneratingData(false);
    }
  };

  // Auto-generate demo data on first load
  useEffect(() => {
    if (!dataGenerated) {
      generateDemoData();
    }
  }, [dataGenerated, generateDemoData]);

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="bg-base-100 shadow-lg">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="bg-gradient-to-r from-primary to-secondary bg-clip-text font-bold text-4xl text-transparent">
                Analytics Dashboard Demo
              </h1>
              <p className="mt-2 text-base-content/70 text-lg">
                Explore state-of-the-art resume optimization analytics with AI-powered insights
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className={`btn ${isGeneratingData ? 'btn-disabled' : 'btn-primary'}`}
                onClick={generateDemoData}
                disabled={isGeneratingData}
              >
                {isGeneratingData ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Generating...
                  </>
                ) : (
                  <>
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Regenerate Data
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Configuration Panel */}
        <div className="card mb-6 bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Dashboard Configuration</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">User</span>
                </label>
                <select
                  className="select select-bordered"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  <option value="demo_user_1">Demo User 1</option>
                  <option value="demo_user_2">Demo User 2</option>
                  <option value="">All Users</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Time Range</span>
                </label>
                <select
                  className="select select-bordered"
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value as typeof selectedTimeRange)}
                >
                  <option value="day">Last 24 Hours</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Features</span>
                </label>
                <div className="space-y-2">
                  <label className="label cursor-pointer py-1">
                    <span className="label-text">Real-time Updates</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary toggle-sm"
                      checked={showRealTime}
                      onChange={(e) => setShowRealTime(e.target.checked)}
                    />
                  </label>
                  <label className="label cursor-pointer py-1">
                    <span className="label-text">Benchmarks</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-secondary toggle-sm"
                      checked={showBenchmarks}
                      onChange={(e) => setShowBenchmarks(e.target.checked)}
                    />
                  </label>
                  <label className="label cursor-pointer py-1">
                    <span className="label-text">AI Insights</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-accent toggle-sm"
                      checked={showInsights}
                      onChange={(e) => setShowInsights(e.target.checked)}
                    />
                  </label>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Demo Features</span>
                </label>
                <div className="stats stats-vertical bg-base-200">
                  <div className="stat py-2">
                    <div className="stat-title text-xs">Sessions Generated</div>
                    <div className="stat-value text-sm">{dataGenerated ? '4' : '0'}</div>
                  </div>
                  <div className="stat py-2">
                    <div className="stat-title text-xs">AI Models Active</div>
                    <div className="stat-value text-sm">3</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Prediction Card */}
        {prediction && (
          <div className="card mb-6 bg-gradient-to-r from-primary/10 to-secondary/10 shadow-lg">
            <div className="card-body">
              <h3 className="card-title">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                AI Improvement Prediction
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="stat rounded-box bg-base-100/50">
                  <div className="stat-title">Predicted Improvement</div>
                  <div className="stat-value text-primary">
                    +{Math.round(prediction.predictedImprovement)}%
                  </div>
                  <div className="stat-desc">
                    Confidence: {Math.round(prediction.confidence * 100)}%
                  </div>
                </div>

                <div className="stat rounded-box bg-base-100/50">
                  <div className="stat-title">Immediate Gains</div>
                  <div className="stat-value text-secondary">+{prediction.timeline.immediate}%</div>
                  <div className="stat-desc">Within 1 hour</div>
                </div>

                <div className="stat rounded-box bg-base-100/50">
                  <div className="stat-title">Medium-term Potential</div>
                  <div className="stat-value text-accent">+{prediction.timeline.medium_term}%</div>
                  <div className="stat-desc">Within 1 week</div>
                </div>
              </div>

              {prediction.suggestedActions.length > 0 && (
                <div className="mt-4">
                  <h4 className="mb-2 font-semibold">Recommended Actions:</h4>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {prediction.suggestedActions.slice(0, 4).map((action, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <div
                          className={`badge ${
                            action.effort === 'low'
                              ? 'badge-success'
                              : action.effort === 'medium'
                                ? 'badge-warning'
                                : 'badge-error'
                          } badge-sm`}
                        >
                          {action.effort}
                        </div>
                        <span>{action.action}</span>
                        <span className="font-semibold text-primary">+{action.expectedGain}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Dashboard */}
        {dataGenerated && selectedUserId && (
          <AdvancedAnalyticsDashboard
            userId={selectedUserId}
            timeRange={selectedTimeRange}
            realTime={showRealTime}
            showBenchmarks={showBenchmarks}
            showInsights={showInsights}
            allowExport={true}
            theme="light"
            height={1200}
          />
        )}

        {/* Feature Highlights */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title text-primary">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Real-time Analytics
              </h3>
              <p className="text-base-content/70 text-sm">
                Live metrics and instant updates as users optimize their resumes. Track active
                sessions, success rates, and improvement trends in real-time.
              </p>
              <div className="card-actions justify-end">
                <div className="badge badge-primary">Live Updates</div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title text-secondary">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                AI-Powered Insights
              </h3>
              <p className="text-base-content/70 text-sm">
                Machine learning algorithms analyze optimization patterns to provide personalized
                recommendations and predict improvement potential.
              </p>
              <div className="card-actions justify-end">
                <div className="badge badge-secondary">ML Powered</div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title text-accent">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z"
                  />
                </svg>
                Performance Benchmarks
              </h3>
              <p className="text-base-content/70 text-sm">
                Compare performance against industry standards and peer groups. Track ranking
                improvements and identify optimization opportunities.
              </p>
              <div className="card-actions justify-end">
                <div className="badge badge-accent">Benchmarking</div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="card mt-8 bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title">Technical Implementation</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-2 font-semibold">Analytics Engine Features</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center">
                    <span className="mr-2 text-success">✓</span> Real-time session tracking
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-success">✓</span> AI-powered insights generation
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-success">✓</span> Predictive improvement modeling
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-success">✓</span> Performance benchmarking
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-success">✓</span> Interactive visualizations
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-success">✓</span> Export and reporting
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">Technology Stack</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center">
                    <span className="mr-2 text-info">•</span> TypeScript with comprehensive types
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-info">•</span> Recharts for data visualization
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-info">•</span> Mistral Large Latest for AI insights
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-info">•</span> RESTful API endpoints
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-info">•</span> Real-time WebSocket updates
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-info">•</span> Responsive design with Tailwind CSS
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
