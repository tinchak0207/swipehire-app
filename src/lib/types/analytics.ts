/**
 * Analytics Types for Resume Optimizer
 *
 * Comprehensive type definitions for tracking optimization success rates,
 * user behavior, and performance metrics with AI-powered insights
 */

// Core Analytics Data Types
export interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  unit: 'percentage' | 'count' | 'score' | 'seconds' | 'rating';
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  category: 'performance' | 'engagement' | 'quality' | 'success';
  timestamp: string;
}

export interface OptimizationSession {
  id: string;
  userId: string;
  resumeId: string;
  sessionStart: string;
  sessionEnd?: string;
  beforeAnalysis: ResumeAnalysisSnapshot;
  afterAnalysis?: ResumeAnalysisSnapshot;
  suggestionsApplied: number;
  suggestionsTotal: number;
  improvementScore: number;
  timeSpent: number; // in seconds
  templateUsed?: string;
  targetRole: string;
  targetIndustry: string;
  sessionType: 'manual' | 'ai_assisted' | 'collaborative';
  status: 'in_progress' | 'completed' | 'abandoned';
}

export interface ResumeAnalysisSnapshot {
  overallScore: number;
  atsScore: number;
  keywordScore: number;
  grammarScore: number;
  formatScore: number;
  quantitativeScore: number;
  strengthsCount: number;
  weaknessesCount: number;
  suggestionsCount: number;
  wordCount: number;
  sectionCount: number;
  timestamp: string;
}

export interface UserAnalytics {
  userId: string;
  totalSessions: number;
  completedSessions: number;
  averageImprovementScore: number;
  totalTimeSpent: number;
  favoriteTemplates: string[];
  commonTargetRoles: string[];
  averageSessionDuration: number;
  successRate: number; // percentage of sessions with positive improvement
  lastActivity: string;
  skillsImproved: string[];
  achievementsUnlocked: string[];
}

// Advanced Analytics Types
export interface AnalyticsTrend {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  data: {
    timestamp: string;
    value: number;
    label: string;
  }[];
  comparison: {
    current: number;
    previous: number;
    change: number;
    changePercentage: number;
  };
  forecast?: {
    timestamp: string;
    predictedValue: number;
    confidence: number;
  }[];
}

export interface BenchmarkData {
  category: 'industry' | 'role' | 'experience_level' | 'overall';
  label: string;
  userScore: number;
  averageScore: number;
  topPercentileScore: number;
  rank: number;
  totalParticipants: number;
  improvements: {
    suggestion: string;
    potentialGain: number;
    difficulty: 'easy' | 'medium' | 'hard';
  }[];
}

export interface AIInsight {
  id: string;
  type: 'success_pattern' | 'improvement_opportunity' | 'benchmark_comparison' | 'trend_prediction';
  title: string;
  description: string;
  confidence: number; // 0-1
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  recommendations: string[];
  supporting_data: Record<string, any>;
  timestamp: string;
  tags: string[];
}

export interface PerformanceBenchmark {
  metric: string;
  userValue: number;
  industryAverage: number;
  topQuartile: number;
  rank: number;
  percentile: number;
  trend: 'improving' | 'declining' | 'stable';
  gap: number; // distance from top quartile
  timeToImprove: number; // estimated days to reach next level
}

// Analytics Dashboard Types
export interface AnalyticsDashboardData {
  overview: {
    totalSessions: number;
    averageImprovement: number;
    successRate: number;
    timeSpent: number;
  };
  trends: {
    improvements: AnalyticsTrend;
    usage: AnalyticsTrend;
    success_rate: AnalyticsTrend;
  };
  benchmarks: BenchmarkData[];
  insights: AIInsight[];
  recentSessions: OptimizationSession[];
  topPerformingTemplates: {
    templateId: string;
    templateName: string;
    usageCount: number;
    averageImprovement: number;
    successRate: number;
  }[];
  skillsAnalysis: {
    skill: string;
    improvementScore: number;
    frequency: number;
    trendDirection: 'up' | 'down' | 'stable';
  }[];
}

export interface AnalyticsFilter {
  dateRange: {
    start: string;
    end: string;
  };
  industries?: string[];
  roles?: string[];
  experienceLevels?: string[];
  templateIds?: string[];
  sessionTypes?: ('manual' | 'ai_assisted' | 'collaborative')[];
  minImprovementScore?: number;
  onlyCompleted?: boolean;
}

// Real-time Analytics Types
export interface RealTimeMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
}

export interface LiveAnalyticsUpdate {
  type: 'metric_update' | 'new_session' | 'session_completed' | 'benchmark_update';
  data: any;
  timestamp: string;
}

// Prediction and ML Types
export interface PredictiveModel {
  modelId: string;
  modelType: 'improvement_prediction' | 'success_likelihood' | 'time_estimation';
  version: string;
  accuracy: number;
  lastTrained: string;
  features: string[];
}

export interface ImprovementPrediction {
  sessionId: string;
  predictedImprovement: number;
  confidence: number;
  suggestedActions: {
    action: string;
    expectedGain: number;
    effort: 'low' | 'medium' | 'high';
  }[];
  timeline: {
    immediate: number; // 0-1 hour
    short_term: number; // 1-24 hours
    medium_term: number; // 1-7 days
  };
}

// Export and Reporting Types
export interface AnalyticsReport {
  id: string;
  title: string;
  description: string;
  reportType: 'user_progress' | 'benchmark_comparison' | 'trend_analysis' | 'custom';
  format: 'pdf' | 'csv' | 'json' | 'excel';
  generatedAt: string;
  dataRange: {
    start: string;
    end: string;
  };
  sections: {
    name: string;
    type: 'chart' | 'table' | 'insights' | 'summary';
    data: any;
  }[];
  insights: AIInsight[];
  recommendations: string[];
}

// API Response Types
export interface AnalyticsAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    total: number;
    page: number;
    limit: number;
    filters: AnalyticsFilter;
    processingTime: number;
  };
}

export interface AnalyticsQuery {
  metrics: string[];
  filters: AnalyticsFilter;
  groupBy?: string[];
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  limit?: number;
  offset?: number;
}

// Event Tracking Types
export interface AnalyticsEvent {
  eventId: string;
  userId: string;
  sessionId?: string;
  eventType:
    | 'session_start'
    | 'suggestion_applied'
    | 'template_selected'
    | 'analysis_completed'
    | 'session_abandoned';
  eventData: Record<string, any>;
  timestamp: string;
  source: 'web' | 'mobile' | 'api';
  metadata: {
    userAgent?: string;
    location?: string;
    referrer?: string;
  };
}

// Configuration Types
export interface AnalyticsConfig {
  trackingEnabled: boolean;
  realTimeUpdates: boolean;
  benchmarkUpdates: boolean;
  aiInsights: boolean;
  dataRetentionDays: number;
  aggregationInterval: number; // minutes
  alertThresholds: {
    lowSuccessRate: number;
    highAbandonmentRate: number;
    slowPerformance: number;
  };
  privacySettings: {
    anonymizeData: boolean;
    shareWithBenchmarks: boolean;
    allowPersonalization: boolean;
  };
}

// Component Props Types
export interface AnalyticsDashboardProps {
  userId?: string;
  timeRange?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  realTime?: boolean;
  showBenchmarks?: boolean;
  showInsights?: boolean;
  allowExport?: boolean;
  theme?: 'light' | 'dark';
}

export interface MetricCardProps {
  metric: AnalyticsMetric;
  showTrend?: boolean;
  showComparison?: boolean;
  size?: 'small' | 'medium' | 'large';
  onClick?: (metric: AnalyticsMetric) => void;
}

export interface TrendChartProps {
  data: AnalyticsTrend;
  height?: number;
  showForecast?: boolean;
  interactive?: boolean;
  exportable?: boolean;
}

export interface BenchmarkComparisonProps {
  benchmarks: BenchmarkData[];
  showDetails?: boolean;
  allowDrillDown?: boolean;
}

export interface InsightsListProps {
  insights: AIInsight[];
  limit?: number;
  category?: string;
  interactive?: boolean;
  showActions?: boolean;
}
