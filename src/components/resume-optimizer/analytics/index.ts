/**
 * Resume Optimizer Analytics Components
 *
 * Export all analytics-related components, types, and services
 * for the advanced analytics dashboard system
 */

// Analytics Types
export type {
  AIInsight,
  AnalyticsAPIResponse,
  AnalyticsConfig,
  AnalyticsDashboardData,
  AnalyticsDashboardProps,
  AnalyticsEvent,
  AnalyticsFilter,
  AnalyticsMetric,
  AnalyticsQuery,
  AnalyticsReport,
  AnalyticsTrend,
  BenchmarkComparisonProps,
  BenchmarkData,
  ImprovementPrediction,
  InsightsListProps,
  MetricCardProps,
  OptimizationSession,
  PerformanceBenchmark,
  RealTimeMetric,
  ResumeAnalysisSnapshot,
  TrendChartProps,
  UserAnalytics,
} from '@/lib/types/analytics';

// Analytics Service
export { ResumeAnalyticsService, resumeAnalyticsService } from '@/services/resumeAnalyticsService';
// Main Analytics Dashboard Component
export { AdvancedAnalyticsDashboard } from './AdvancedAnalyticsDashboard';
export { default as PredictiveAnalyticsDashboard } from './PredictiveAnalyticsDashboard';

/**
 * Analytics System Features:
 *
 * 🚀 Real-time Performance Tracking
 * - Live session monitoring with WebSocket updates
 * - Instant metric calculations and updates
 * - Real-time success rate and improvement tracking
 *
 * 🤖 AI-Powered Insights
 * - Machine learning analysis using Mistral Large Latest
 * - Confidence-scored recommendations and predictions
 * - Pattern recognition for optimization opportunities
 *
 * 📊 Interactive Visualizations
 * - Recharts-powered charts and graphs
 * - Responsive design with mobile optimization
 * - Export capabilities (PDF, CSV, JSON)
 *
 * 🎯 Performance Benchmarking
 * - Industry-specific comparisons
 * - Peer group ranking and percentile calculations
 * - Gap analysis with improvement suggestions
 *
 * 🔮 Predictive Analytics
 * - Improvement potential forecasting
 * - Timeline-based gain predictions
 * - Action recommendation engine
 *
 * 📈 Comprehensive Tracking
 * - Session lifecycle management
 * - Event-driven analytics collection
 * - Historical trend analysis
 */
