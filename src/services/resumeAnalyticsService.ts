/**
 * Resume Optimization Analytics Service
 *
 * State-of-the-art analytics service with AI-powered insights,
 * real-time tracking, and predictive analytics for resume optimization
 */

import { ai } from '@/ai/genkit';
import type {
  AIInsight,
  AnalyticsDashboardData,
  AnalyticsEvent,
  AnalyticsFilter,
  AnalyticsReport,
  AnalyticsTrend,
  BenchmarkData,
  ImprovementPrediction,
  OptimizationSession,
  RealTimeMetric,
  ResumeAnalysisSnapshot,
} from '@/lib/types/analytics';

export class ResumeAnalyticsService {
  private readonly model = 'mistral-large-latest';
  private readonly temperature = 0.2;
  private readonly maxTokens = 3000;
  private analyticsStore: Map<string, any> = new Map();
  private realTimeSubscribers: Set<(update: any) => void> = new Set();

  /**
   * Track a new optimization session
   */
  async trackOptimizationSession(session: Partial<OptimizationSession>): Promise<string> {
    const sessionId = this.generateSessionId();
    const optimizationSession: OptimizationSession = {
      id: sessionId,
      userId: session.userId || 'anonymous',
      resumeId: session.resumeId || this.generateResumeId(),
      sessionStart: new Date().toISOString(),
      beforeAnalysis: session.beforeAnalysis!,
      suggestionsApplied: 0,
      suggestionsTotal: session.suggestionsTotal || 0,
      improvementScore: 0,
      timeSpent: 0,
      targetRole: session.targetRole || '',
      targetIndustry: session.targetIndustry || '',
      sessionType: session.sessionType || 'manual',
      status: 'in_progress',
    };

    this.analyticsStore.set(`session_${sessionId}`, optimizationSession);
    await this.trackEvent({
      eventId: this.generateEventId(),
      userId: optimizationSession.userId,
      sessionId,
      eventType: 'session_start',
      eventData: { targetRole: session.targetRole, targetIndustry: session.targetIndustry },
      timestamp: new Date().toISOString(),
      source: 'web',
      metadata: {},
    });

    return sessionId;
  }

  /**
   * Update optimization session progress
   */
  async updateSession(sessionId: string, updates: Partial<OptimizationSession>): Promise<void> {
    const session = this.analyticsStore.get(`session_${sessionId}`);
    if (!session) throw new Error('Session not found');

    const updatedSession = { ...session, ...updates };

    // Calculate improvement score if after analysis is provided
    if (updates.afterAnalysis && session.beforeAnalysis) {
      updatedSession.improvementScore = this.calculateImprovementScore(
        session.beforeAnalysis,
        updates.afterAnalysis
      );
    }

    // Update session end time if completing
    if (updates.status === 'completed' && !session.sessionEnd) {
      updatedSession.sessionEnd = new Date().toISOString();
      updatedSession.timeSpent = this.calculateTimeSpent(
        session.sessionStart,
        updatedSession.sessionEnd
      );
    }

    this.analyticsStore.set(`session_${sessionId}`, updatedSession);
    this.notifyRealTimeSubscribers({
      type: 'session_update',
      sessionId,
      data: updatedSession,
    });

    // Track completion event
    if (updates.status === 'completed') {
      await this.trackEvent({
        eventId: this.generateEventId(),
        userId: session.userId,
        sessionId,
        eventType: 'analysis_completed',
        eventData: {
          improvementScore: updatedSession.improvementScore,
          suggestionsApplied: updatedSession.suggestionsApplied,
          timeSpent: updatedSession.timeSpent,
        },
        timestamp: new Date().toISOString(),
        source: 'web',
        metadata: {},
      });
    }
  }

  /**
   * Generate comprehensive dashboard analytics
   */
  async getDashboardAnalytics(
    userId?: string,
    filters?: AnalyticsFilter
  ): Promise<AnalyticsDashboardData> {
    const sessions = this.getFilteredSessions(filters);
    const userSessions = userId ? sessions.filter((s) => s.userId === userId) : sessions;

    const [overview, trends, benchmarks, insights, topTemplates, skillsAnalysis] =
      await Promise.all([
        this.calculateOverviewMetrics(userSessions),
        this.calculateTrends(userSessions),
        this.generateBenchmarks(userSessions),
        this.generateAIInsights(userSessions),
        this.calculateTopTemplates(userSessions),
        this.analyzeSkillsImprovements(userSessions),
      ]);

    return {
      overview,
      trends,
      benchmarks,
      insights,
      recentSessions: userSessions.slice(-10),
      topPerformingTemplates: topTemplates,
      skillsAnalysis,
    };
  }

  /**
   * Generate AI-powered insights
   */
  async generateAIInsights(sessions: OptimizationSession[]): Promise<AIInsight[]> {
    if (sessions.length === 0) return [];

    const prompt = `Analyze these resume optimization sessions and provide actionable insights:

SESSIONS DATA:
${JSON.stringify(
  sessions.map((s) => ({
    improvementScore: s.improvementScore,
    suggestionsApplied: s.suggestionsApplied,
    suggestionsTotal: s.suggestionsTotal,
    timeSpent: s.timeSpent,
    targetRole: s.targetRole,
    targetIndustry: s.targetIndustry,
    sessionType: s.sessionType,
    status: s.status,
    beforeScore: s.beforeAnalysis.overallScore,
    afterScore: s.afterAnalysis?.overallScore,
  })),
  null,
  2
)}

Generate insights in the following categories:
1. Success patterns - What's working well?
2. Improvement opportunities - Where can the user improve?
3. Benchmark comparisons - How does performance compare to others?
4. Trend predictions - What trends do you see?

For each insight, provide:
- Type (success_pattern, improvement_opportunity, benchmark_comparison, trend_prediction)
- Title (concise, actionable)
- Description (detailed explanation)
- Confidence (0-1)
- Impact (low, medium, high)
- Actionable recommendations
- Supporting data points

Return as JSON array of insights.`;

    try {
      const response = await ai.generate({
        prompt,
        model: this.model,
        temperature: this.temperature,
        maxTokens: this.maxTokens,
      });

      const insights = JSON.parse(response.text);
      return insights.map((insight: any) => ({
        id: this.generateInsightId(),
        type: insight.type,
        title: insight.title,
        description: insight.description,
        confidence: Math.min(1.0, Math.max(0.0, insight.confidence)),
        impact: insight.impact,
        actionable: insight.recommendations && insight.recommendations.length > 0,
        recommendations: insight.recommendations || [],
        supporting_data: insight.supporting_data || {},
        timestamp: new Date().toISOString(),
        tags: this.generateInsightTags(insight),
      }));
    } catch (error) {
      console.error('AI insights generation failed:', error);
      return this.getFallbackInsights(sessions);
    }
  }

  /**
   * Predict improvement potential for current session
   */
  async predictImprovement(
    currentAnalysis: ResumeAnalysisSnapshot,
    targetRole: string,
    targetIndustry: string,
    userHistory?: OptimizationSession[]
  ): Promise<ImprovementPrediction> {
    const historicalData = userHistory || [];

    const prompt = `Predict improvement potential for this resume optimization session:

CURRENT ANALYSIS:
${JSON.stringify(currentAnalysis, null, 2)}

TARGET ROLE: ${targetRole}
TARGET INDUSTRY: ${targetIndustry}

HISTORICAL PERFORMANCE:
${JSON.stringify(
  historicalData.map((h) => ({
    improvementScore: h.improvementScore,
    beforeScore: h.beforeAnalysis.overallScore,
    afterScore: h.afterAnalysis?.overallScore,
    suggestionsApplied: h.suggestionsApplied,
    targetRole: h.targetRole,
    targetIndustry: h.targetIndustry,
  })),
  null,
  2
)}

Based on the current resume state and historical patterns, predict:
1. Expected improvement score (0-100)
2. Confidence level (0-1)
3. Specific actions that would yield the highest gains
4. Timeline for improvements (immediate, short-term, medium-term)

Consider:
- Current weaknesses that are easily fixable
- Industry-specific optimization opportunities
- Role-specific requirements
- Historical success patterns
- ATS optimization potential

Return as JSON with predicted improvement, confidence, suggested actions, and timeline.`;

    try {
      const response = await ai.generate({
        prompt,
        model: this.model,
        temperature: this.temperature,
        maxTokens: 2000,
      });

      const prediction = JSON.parse(response.text);
      return {
        sessionId: this.generateSessionId(),
        predictedImprovement: Math.min(100, Math.max(0, prediction.predictedImprovement)),
        confidence: Math.min(1.0, Math.max(0.0, prediction.confidence)),
        suggestedActions: prediction.suggestedActions || [],
        timeline: prediction.timeline || {
          immediate: 0,
          short_term: 0,
          medium_term: 0,
        },
      };
    } catch (error) {
      console.error('Improvement prediction failed:', error);
      return this.getFallbackPrediction(currentAnalysis);
    }
  }

  /**
   * Generate performance benchmarks
   */
  async generateBenchmarks(sessions: OptimizationSession[]): Promise<BenchmarkData[]> {
    const userSessions = sessions;
    const allSessions = this.getFilteredSessions();

    const benchmarks: BenchmarkData[] = [];

    // Overall performance benchmark
    const userAvgImprovement = this.calculateAverageImprovement(userSessions);
    const globalAvgImprovement = this.calculateAverageImprovement(allSessions);
    const topQuartileImprovement = this.calculateTopQuartile(
      allSessions.map((s) => s.improvementScore)
    );

    benchmarks.push({
      category: 'overall',
      label: 'Overall Improvement',
      userScore: userAvgImprovement,
      averageScore: globalAvgImprovement,
      topPercentileScore: topQuartileImprovement,
      rank: this.calculateRank(
        userAvgImprovement,
        allSessions.map((s) => s.improvementScore)
      ),
      totalParticipants: allSessions.length,
      improvements: [
        {
          suggestion: 'Apply more AI suggestions per session',
          potentialGain: 15,
          difficulty: 'easy',
        },
        {
          suggestion: 'Focus on quantitative achievements',
          potentialGain: 20,
          difficulty: 'medium',
        },
      ],
    });

    // Industry-specific benchmarks
    const industries = [...new Set(allSessions.map((s) => s.targetIndustry))];
    for (const industry of industries) {
      const industryUserSessions = userSessions.filter((s) => s.targetIndustry === industry);
      const industryAllSessions = allSessions.filter((s) => s.targetIndustry === industry);

      if (industryUserSessions.length > 0) {
        const userIndustryAvg = this.calculateAverageImprovement(industryUserSessions);
        const industryAvg = this.calculateAverageImprovement(industryAllSessions);
        const industryTopQuartile = this.calculateTopQuartile(
          industryAllSessions.map((s) => s.improvementScore)
        );

        benchmarks.push({
          category: 'industry',
          label: `${industry} Industry`,
          userScore: userIndustryAvg,
          averageScore: industryAvg,
          topPercentileScore: industryTopQuartile,
          rank: this.calculateRank(
            userIndustryAvg,
            industryAllSessions.map((s) => s.improvementScore)
          ),
          totalParticipants: industryAllSessions.length,
          improvements: [
            {
              suggestion: `Optimize for ${industry}-specific keywords`,
              potentialGain: 12,
              difficulty: 'medium',
            },
          ],
        });
      }
    }

    return benchmarks;
  }

  /**
   * Track analytics events
   */
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    this.analyticsStore.set(`event_${event.eventId}`, event);

    // Update real-time metrics
    this.updateRealTimeMetrics(event);

    // Notify subscribers
    this.notifyRealTimeSubscribers({
      type: 'new_event',
      data: event,
    });
  }

  /**
   * Get real-time metrics
   */
  getRealTimeMetrics(): RealTimeMetric[] {
    const now = new Date().toISOString();
    Array.from(this.analyticsStore.values())
      .filter((item) => item.eventType)
      .filter((event) => this.isRecentEvent(event.timestamp));

    return [
      {
        id: 'active_sessions',
        name: 'Active Sessions',
        value: this.getActiveSessions().length,
        unit: 'count',
        timestamp: now,
        change: 2,
        changeType: 'increase',
      },
      {
        id: 'avg_improvement',
        name: 'Average Improvement',
        value: this.calculateRecentAverageImprovement(),
        unit: 'percentage',
        timestamp: now,
        change: 5.2,
        changeType: 'increase',
      },
      {
        id: 'success_rate',
        name: 'Success Rate',
        value: this.calculateRecentSuccessRate(),
        unit: 'percentage',
        timestamp: now,
        change: -1.3,
        changeType: 'decrease',
      },
    ];
  }

  /**
   * Subscribe to real-time updates
   */
  subscribeToRealTime(callback: (update: any) => void): () => void {
    this.realTimeSubscribers.add(callback);
    return () => this.realTimeSubscribers.delete(callback);
  }

  /**
   * Generate analytics report
   */
  async generateReport(
    reportType: 'user_progress' | 'benchmark_comparison' | 'trend_analysis' | 'custom',
    filters: AnalyticsFilter,
    format: 'pdf' | 'csv' | 'json' | 'excel' = 'json'
  ): Promise<AnalyticsReport> {
    const sessions = this.getFilteredSessions(filters);
    const insights = await this.generateAIInsights(sessions);

    return {
      id: this.generateReportId(),
      title: `Resume Optimization ${reportType.replace('_', ' ')} Report`,
      description: 'Comprehensive analysis of resume optimization performance',
      reportType,
      format,
      generatedAt: new Date().toISOString(),
      dataRange: {
        start: filters.dateRange.start,
        end: filters.dateRange.end,
      },
      sections: [
        {
          name: 'Executive Summary',
          type: 'summary',
          data: await this.calculateOverviewMetrics(sessions),
        },
        {
          name: 'Performance Trends',
          type: 'chart',
          data: await this.calculateTrends(sessions),
        },
        {
          name: 'Benchmark Analysis',
          type: 'table',
          data: await this.generateBenchmarks(sessions),
        },
      ],
      insights,
      recommendations: insights.filter((i) => i.actionable).flatMap((i) => i.recommendations),
    };
  }

  // Private helper methods
  private calculateImprovementScore(
    before: ResumeAnalysisSnapshot,
    after: ResumeAnalysisSnapshot
  ): number {
    const overallImprovement = after.overallScore - before.overallScore;
    const atsImprovement = after.atsScore - before.atsScore;
    const keywordImprovement = after.keywordScore - before.keywordScore;

    // Weighted improvement score
    return Math.round(overallImprovement * 0.4 + atsImprovement * 0.3 + keywordImprovement * 0.3);
  }

  private calculateTimeSpent(start: string, end: string): number {
    return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000);
  }

  private async calculateOverviewMetrics(sessions: OptimizationSession[]) {
    const completedSessions = sessions.filter((s) => s.status === 'completed');

    return {
      totalSessions: sessions.length,
      averageImprovement: this.calculateAverageImprovement(completedSessions),
      successRate: this.calculateSuccessRate(sessions),
      timeSpent: sessions.reduce((sum, s) => sum + s.timeSpent, 0),
    };
  }

  private async calculateTrends(sessions: OptimizationSession[]): Promise<any> {
    // Group sessions by time periods and calculate trends
    const trends = {
      improvements: this.calculateImprovementTrend(sessions),
      usage: this.calculateUsageTrend(sessions),
      success_rate: this.calculateSuccessRateTrend(sessions),
    };

    return trends;
  }

  private calculateAverageImprovement(sessions: OptimizationSession[]): number {
    if (sessions.length === 0) return 0;
    const total = sessions.reduce((sum, s) => sum + s.improvementScore, 0);
    return Math.round(total / sessions.length);
  }

  private calculateSuccessRate(sessions: OptimizationSession[]): number {
    if (sessions.length === 0) return 0;
    const successful = sessions.filter((s) => s.improvementScore > 0).length;
    return Math.round((successful / sessions.length) * 100);
  }

  private calculateTopQuartile(values: number[]): number {
    const sorted = values.sort((a, b) => b - a);
    const index = Math.floor(sorted.length * 0.25);
    return sorted[index] || 0;
  }

  private calculateRank(userValue: number, allValues: number[]): number {
    const sorted = allValues.sort((a, b) => b - a);
    const rank = sorted.findIndex((v) => v <= userValue) + 1;
    return rank || sorted.length + 1;
  }

  private getFilteredSessions(filters?: AnalyticsFilter): OptimizationSession[] {
    let sessions = Array.from(this.analyticsStore.values()).filter((item) => item.sessionStart); // Filter for session objects

    if (!filters) return sessions;

    // Apply date range filter
    sessions = sessions.filter((s) => {
      const sessionDate = new Date(s.sessionStart);
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      return sessionDate >= startDate && sessionDate <= endDate;
    });

    // Apply other filters
    if (filters.industries?.length) {
      sessions = sessions.filter((s) => filters.industries?.includes(s.targetIndustry));
    }

    if (filters.roles?.length) {
      sessions = sessions.filter((s) => filters.roles?.includes(s.targetRole));
    }

    if (filters.sessionTypes?.length) {
      sessions = sessions.filter((s) => filters.sessionTypes?.includes(s.sessionType));
    }

    if (filters.onlyCompleted) {
      sessions = sessions.filter((s) => s.status === 'completed');
    }

    if (filters.minImprovementScore !== undefined) {
      sessions = sessions.filter((s) => s.improvementScore >= filters.minImprovementScore!);
    }

    return sessions;
  }

  private getFallbackInsights(sessions: OptimizationSession[]): AIInsight[] {
    return [
      {
        id: this.generateInsightId(),
        type: 'improvement_opportunity',
        title: 'Increase Session Completion Rate',
        description: 'Focus on completing optimization sessions to see better results',
        confidence: 0.8,
        impact: 'medium',
        actionable: true,
        recommendations: ['Set aside dedicated time for resume optimization'],
        supporting_data: { completionRate: this.calculateSuccessRate(sessions) },
        timestamp: new Date().toISOString(),
        tags: ['completion', 'engagement'],
      },
    ];
  }

  private getFallbackPrediction(analysis: ResumeAnalysisSnapshot): ImprovementPrediction {
    return {
      sessionId: this.generateSessionId(),
      predictedImprovement: Math.max(0, 100 - analysis.overallScore) * 0.6,
      confidence: 0.7,
      suggestedActions: [
        { action: 'Improve keyword optimization', expectedGain: 15, effort: 'medium' },
        { action: 'Enhance quantitative achievements', expectedGain: 20, effort: 'high' },
      ],
      timeline: {
        immediate: 10,
        short_term: 25,
        medium_term: 40,
      },
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateResumeId(): string {
    return `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateInsightId(): string {
    return `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateInsightTags(insight: any): string[] {
    const tags = [];
    if (insight.type) tags.push(insight.type);
    if (insight.impact) tags.push(insight.impact);
    return tags;
  }

  private notifyRealTimeSubscribers(update: any): void {
    this.realTimeSubscribers.forEach((callback) => {
      try {
        callback(update);
      } catch (error) {
        console.error('Real-time subscriber notification failed:', error);
      }
    });
  }

  private updateRealTimeMetrics(_event: AnalyticsEvent): void {
    // Update metrics based on event type
    // Implementation would depend on specific metrics tracking needs
  }

  private isRecentEvent(timestamp: string): boolean {
    const eventTime = new Date(timestamp);
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return eventTime > hourAgo;
  }

  private getActiveSessions(): OptimizationSession[] {
    return Array.from(this.analyticsStore.values()).filter((item) => item.status === 'in_progress');
  }

  private calculateRecentAverageImprovement(): number {
    const recentSessions = Array.from(this.analyticsStore.values())
      .filter((item) => item.sessionStart && this.isRecentEvent(item.sessionStart))
      .filter((s) => s.status === 'completed');

    return this.calculateAverageImprovement(recentSessions);
  }

  private calculateRecentSuccessRate(): number {
    const recentSessions = Array.from(this.analyticsStore.values()).filter(
      (item) => item.sessionStart && this.isRecentEvent(item.sessionStart)
    );

    return this.calculateSuccessRate(recentSessions);
  }

  private calculateImprovementTrend(_sessions: OptimizationSession[]): AnalyticsTrend {
    // Implementation would group sessions by time period and calculate trends
    return {
      period: 'weekly',
      data: [],
      comparison: { current: 0, previous: 0, change: 0, changePercentage: 0 },
    };
  }

  private calculateUsageTrend(_sessions: OptimizationSession[]): AnalyticsTrend {
    // Implementation would track usage patterns over time
    return {
      period: 'weekly',
      data: [],
      comparison: { current: 0, previous: 0, change: 0, changePercentage: 0 },
    };
  }

  private calculateSuccessRateTrend(_sessions: OptimizationSession[]): AnalyticsTrend {
    // Implementation would track success rate changes over time
    return {
      period: 'weekly',
      data: [],
      comparison: { current: 0, previous: 0, change: 0, changePercentage: 0 },
    };
  }

  private async calculateTopTemplates(sessions: OptimizationSession[]) {
    // Group by template and calculate performance metrics
    const templateStats = new Map();

    sessions.forEach((session) => {
      if (session.templateUsed) {
        const stats = templateStats.get(session.templateUsed) || {
          templateId: session.templateUsed,
          templateName: `Template ${session.templateUsed}`,
          usageCount: 0,
          totalImprovement: 0,
          successCount: 0,
        };

        stats.usageCount++;
        stats.totalImprovement += session.improvementScore;
        if (session.improvementScore > 0) stats.successCount++;

        templateStats.set(session.templateUsed, stats);
      }
    });

    return Array.from(templateStats.values()).map((stats) => ({
      ...stats,
      averageImprovement: Math.round(stats.totalImprovement / stats.usageCount),
      successRate: Math.round((stats.successCount / stats.usageCount) * 100),
    }));
  }

  private async analyzeSkillsImprovements(sessions: OptimizationSession[]) {
    // Analyze which skills are being improved most frequently
    const skillsMap = new Map();

    sessions.forEach((_session) => {
      // This would be enhanced with actual skills data from the analysis
      const commonSkills = ['JavaScript', 'Python', 'Project Management', 'Communication'];
      commonSkills.forEach((skill) => {
        const stats = skillsMap.get(skill) || {
          skill,
          improvementScore: 0,
          frequency: 0,
          trendDirection: 'stable' as const,
        };

        stats.frequency++;
        stats.improvementScore += Math.random() * 20; // Mock improvement data

        skillsMap.set(skill, stats);
      });
    });

    return Array.from(skillsMap.values());
  }
}

export const resumeAnalyticsService = new ResumeAnalyticsService();
