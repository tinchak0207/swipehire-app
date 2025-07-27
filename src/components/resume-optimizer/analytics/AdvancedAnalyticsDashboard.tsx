/**
 * Advanced Analytics Dashboard for Resume Optimizer
 *
 * State-of-the-art analytics dashboard with real-time metrics,
 * AI-powered insights, and interactive visualizations
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {
  AnalyticsDashboardData,
  AnalyticsFilter,
  RealTimeMetric,
} from '@/lib/types/analytics';
import { resumeAnalyticsService } from '@/services/resumeAnalyticsService';

interface AdvancedAnalyticsDashboardProps {
  userId?: string;
  timeRange?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  realTime?: boolean;
  showBenchmarks?: boolean;
  showInsights?: boolean;
  allowExport?: boolean;
  theme?: 'light' | 'dark';
  height?: number;
}

const COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',
  gradient: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'],
};

export function AdvancedAnalyticsDashboard({
  userId,
  timeRange = 'month',
  realTime = true,
  showBenchmarks = true,
  showInsights = true,
  allowExport = true,
  height = 800,
}: AdvancedAnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetric[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [filters, setFilters] = useState<AnalyticsFilter>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
    },
  });

  // Load dashboard data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const dashboardData = await resumeAnalyticsService.getDashboardAnalytics(userId, filters);
      setData(dashboardData);

      if (realTime) {
        const metrics = resumeAnalyticsService.getRealTimeMetrics();
        setRealTimeMetrics(metrics);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [userId, filters, realTime]);

  // Setup real-time updates
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    if (realTime) {
      unsubscribe = resumeAnalyticsService.subscribeToRealTime((update) => {
        if (update.type === 'metric_update') {
          setRealTimeMetrics((prev) => {
            const newMetrics = [...prev];
            const index = newMetrics.findIndex((m) => m.id === update.data.id);
            if (index >= 0) {
              newMetrics[index] = update.data;
            } else {
              newMetrics.push(update.data);
            }
            return newMetrics;
          });
        }
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [realTime]);

  // Load data on mount and filter changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update filters when time range changes
  useEffect(() => {
    const now = new Date();
    let startDate: Date;

    switch (selectedTimeRange) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    setFilters((prev) => ({
      ...prev,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString(),
      },
    }));
  }, [selectedTimeRange]);

  // Memoized chart data
  const chartData = useMemo(() => {
    if (!data) return null;

    return {
      improvementTrend: data.trends.improvements.data || [],
      usageTrend: data.trends.usage.data || [],
      skillsData: data.skillsAnalysis.slice(0, 8),
      templatesData: data.topPerformingTemplates.slice(0, 6),
      benchmarkData: data.benchmarks,
    };
  }, [data]);

  // Handle export
  const handleExport = useCallback(
    async (format: 'pdf' | 'csv' | 'json') => {
      try {
        const report = await resumeAnalyticsService.generateReport(
          'user_progress',
          filters,
          format
        );

        // In a real implementation, this would trigger a download
        console.log('Generated report:', report);

        // Create download link (simplified implementation)
        const blob = new Blob([JSON.stringify(report, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics-report-${Date.now()}.${format}`;
        link.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Export failed:', err);
      }
    },
    [filters]
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="loading loading-spinner loading-lg" />
        <span className="ml-4 text-lg">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <svg className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Error loading analytics: {error}</span>
        <button className="btn btn-sm" onClick={loadData}>
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-8 text-center">
        <p className="text-base-content/70 text-lg">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4" style={{ minHeight: height }}>
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-bold text-3xl">Resume Optimization Analytics</h1>
          <p className="text-base-content/70">AI-powered insights and performance tracking</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Time Range Selector */}
          <div className="form-control">
            <select
              className="select select-bordered"
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as typeof timeRange)}
            >
              <option value="day">Last 24 Hours</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>

          {/* Export Options */}
          {allowExport && (
            <div className="dropdown dropdown-end">
              <label className="btn btn-outline">
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export
              </label>
              <ul className="dropdown-content menu z-[1] w-52 rounded-box bg-base-100 p-2 shadow">
                <li>
                  <a onClick={() => handleExport('json')}>JSON</a>
                </li>
                <li>
                  <a onClick={() => handleExport('csv')}>CSV</a>
                </li>
                <li>
                  <a onClick={() => handleExport('pdf')}>PDF</a>
                </li>
              </ul>
            </div>
          )}

          {/* Refresh Button */}
          <button className="btn btn-square btn-outline" onClick={loadData}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Real-time Metrics Bar */}
      {realTime && realTimeMetrics.length > 0 && (
        <div className="alert alert-info">
          <svg className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex gap-6">
            {realTimeMetrics.map((metric) => (
              <div key={metric.id} className="text-sm">
                <span className="font-semibold">{metric.name}:</span>
                <span className="ml-1">
                  {metric.value}
                  {metric.unit === 'percentage' ? '%' : ''}
                </span>
                <span
                  className={`ml-1 ${metric.changeType === 'increase' ? 'text-success' : metric.changeType === 'decrease' ? 'text-error' : ''}`}
                >
                  (
                  {metric.changeType === 'increase'
                    ? '+'
                    : metric.changeType === 'decrease'
                      ? '-'
                      : ''}
                  {Math.abs(metric.change)})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="stat rounded-box bg-base-100 shadow">
          <div className="stat-figure text-primary">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z"
              />
            </svg>
          </div>
          <div className="stat-title">Total Sessions</div>
          <div className="stat-value text-primary">{data.overview.totalSessions}</div>
          <div className="stat-desc">Optimization sessions completed</div>
        </div>

        <div className="stat rounded-box bg-base-100 shadow">
          <div className="stat-figure text-secondary">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
          <div className="stat-title">Average Improvement</div>
          <div className="stat-value text-secondary">{data.overview.averageImprovement}%</div>
          <div className="stat-desc">Score increase per session</div>
        </div>

        <div className="stat rounded-box bg-base-100 shadow">
          <div className="stat-figure text-success">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="stat-title">Success Rate</div>
          <div className="stat-value text-success">{data.overview.successRate}%</div>
          <div className="stat-desc">Sessions with positive improvement</div>
        </div>

        <div className="stat rounded-box bg-base-100 shadow">
          <div className="stat-figure text-info">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="stat-title">Time Spent</div>
          <div className="stat-value text-info">{Math.round(data.overview.timeSpent / 3600)}h</div>
          <div className="stat-desc">Total optimization time</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Improvement Trend Chart */}
        {chartData?.improvementTrend && chartData.improvementTrend.length > 0 && (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title">Improvement Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.improvementTrend}>
                    <defs>
                      <linearGradient id="improvementGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={COLORS.primary}
                      fillOpacity={1}
                      fill="url(#improvementGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Skills Analysis Chart */}
        {chartData?.skillsData && chartData.skillsData.length > 0 && (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title">Skills Improvement</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.skillsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="skill" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="improvementScore" fill={COLORS.secondary} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Top Templates Chart */}
        {chartData?.templatesData && chartData.templatesData.length > 0 && (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title">Top Performing Templates</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.templatesData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="templateName" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="averageImprovement" fill={COLORS.success} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Benchmarks Radial Chart */}
        {showBenchmarks && chartData?.benchmarkData && chartData.benchmarkData.length > 0 && (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title">Performance Benchmarks</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="20%"
                    outerRadius="80%"
                    barSize={10}
                    data={chartData.benchmarkData.map((b) => ({
                      name: b.label,
                      value: b.rank,
                      fill: COLORS.gradient[Math.floor(Math.random() * COLORS.gradient.length)],
                    }))}
                  >
                    <RadialBar background dataKey="value" />
                    <Legend
                      iconSize={10}
                      width={120}
                      height={140}
                      layout="vertical"
                      verticalAlign="middle"
                      wrapperStyle={{ lineHeight: '40px' }}
                    />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Insights Section */}
      {showInsights && data.insights.length > 0 && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title">AI-Powered Insights</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.insights.slice(0, 6).map((insight) => (
                <div key={insight.id} className="card compact bg-base-200">
                  <div className="card-body">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{insight.title}</h4>
                        <p className="mt-1 text-base-content/70 text-xs">{insight.description}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div
                          className={`badge badge-sm ${
                            insight.impact === 'high'
                              ? 'badge-error'
                              : insight.impact === 'medium'
                                ? 'badge-warning'
                                : 'badge-info'
                          }`}
                        >
                          {insight.impact}
                        </div>
                        <div className="text-base-content/50 text-xs">
                          {Math.round(insight.confidence * 100)}%
                        </div>
                      </div>
                    </div>

                    {insight.actionable && insight.recommendations.length > 0 && (
                      <div className="mt-2">
                        <p className="mb-1 font-medium text-xs">Recommendations:</p>
                        <ul className="space-y-1 text-xs">
                          {insight.recommendations.slice(0, 2).map((rec, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-1 text-success">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-2 flex flex-wrap gap-1">
                      {insight.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="badge badge-ghost badge-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Sessions Table */}
      {data.recentSessions.length > 0 && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title">Recent Sessions</h3>
            <div className="overflow-x-auto">
              <table className="table-zebra table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Target Role</th>
                    <th>Industry</th>
                    <th>Improvement</th>
                    <th>Suggestions Applied</th>
                    <th>Time Spent</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentSessions.slice(0, 10).map((session) => (
                    <tr key={session.id}>
                      <td>{new Date(session.sessionStart).toLocaleDateString()}</td>
                      <td>{session.targetRole}</td>
                      <td>
                        <span className="badge badge-outline">{session.targetIndustry}</span>
                      </td>
                      <td>
                        <span
                          className={`font-semibold ${session.improvementScore > 0 ? 'text-success' : 'text-error'}`}
                        >
                          {session.improvementScore > 0 ? '+' : ''}
                          {session.improvementScore}%
                        </span>
                      </td>
                      <td>
                        {session.suggestionsApplied}/{session.suggestionsTotal}
                      </td>
                      <td>{Math.round(session.timeSpent / 60)}m</td>
                      <td>
                        <span
                          className={`badge ${
                            session.status === 'completed'
                              ? 'badge-success'
                              : session.status === 'in_progress'
                                ? 'badge-warning'
                                : 'badge-error'
                          }`}
                        >
                          {session.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
