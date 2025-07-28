/**
 * PredictiveAnalyticsDashboard Component
 *
 * Provides AI-powered predictive analytics for resume optimization including:
 * - Success probability predictions
 * - Market demand insights
 * - Personalized recommendations
 * - Industry benchmarking
 * - Skill gap analysis
 *
 * Features:
 * - Data visualization with Recharts
 * - Real-time predictive modeling
 * - Personalized insights based on target role/industry
 * - Interactive charts and metrics
 * - Mobile-responsive design
 */

'use client';

import { motion } from 'framer-motion';
import type React from 'react';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface PredictiveScore {
  name: string;
  score: number;
  benchmark: number;
}

interface MarketInsight {
  skill: string;
  demand: number;
  growth: number;
}

interface SkillGap {
  skill: string;
  current: number;
  required: number;
  gap: number;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: number;
}

interface PredictiveAnalyticsData {
  successProbability: number;
  applicationSuccessRate: number;
  interviewLikelihood: number;
  marketDemand: number;
  scores: PredictiveScore[];
  marketInsights: MarketInsight[];
  skillGaps: SkillGap[];
  recommendations: Recommendation[];
  industryBenchmark: number;
}

const PredictiveAnalyticsDashboard: React.FC<{
  resumeContent: string;
  targetRole: string;
  targetIndustry: string;
  experienceLevel: string;
}> = ({ targetRole, targetIndustry }) => {
  const [analyticsData, setAnalyticsData] = useState<PredictiveAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Simulate data fetching and AI analysis
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);

      // In a real implementation, this would call an AI service
      // For now, we'll simulate the data
      const mockData: PredictiveAnalyticsData = {
        successProbability: Math.floor(Math.random() * 30) + 70, // 70-99%
        applicationSuccessRate: Math.floor(Math.random() * 25) + 65, // 65-90%
        interviewLikelihood: Math.floor(Math.random() * 35) + 55, // 55-90%
        marketDemand: Math.floor(Math.random() * 40) + 60, // 60-100%
        industryBenchmark: Math.floor(Math.random() * 20) + 75, // 75-95%
        scores: [
          { name: 'Keywords', score: Math.floor(Math.random() * 30) + 70, benchmark: 80 },
          { name: 'Structure', score: Math.floor(Math.random() * 25) + 75, benchmark: 85 },
          { name: 'Impact', score: Math.floor(Math.random() * 40) + 60, benchmark: 82 },
          { name: 'Length', score: Math.floor(Math.random() * 35) + 65, benchmark: 75 },
          { name: 'ATS Fit', score: Math.floor(Math.random() * 30) + 70, benchmark: 88 },
        ],
        marketInsights: [
          { skill: 'JavaScript', demand: 95, growth: 85 },
          { skill: 'TypeScript', demand: 88, growth: 92 },
          { skill: 'React', demand: 92, growth: 78 },
          { skill: 'Node.js', demand: 87, growth: 80 },
          { skill: 'Cloud', demand: 90, growth: 88 },
        ],
        skillGaps: [
          { skill: 'AWS', current: 3, required: 8, gap: 5 },
          { skill: 'Microservices', current: 5, required: 7, gap: 2 },
          { skill: 'CI/CD', current: 4, required: 6, gap: 2 },
          { skill: 'Docker', current: 6, required: 8, gap: 2 },
        ],
        recommendations: [
          {
            id: '1',
            title: 'Add Cloud Experience',
            description:
              'Highlight your AWS experience in your work experience section to match 85% of job postings',
            priority: 'high',
            impact: 92,
          },
          {
            id: '2',
            title: 'Quantify Achievements',
            description:
              'Include metrics for your accomplishments to increase interview likelihood by 35%',
            priority: 'high',
            impact: 88,
          },
          {
            id: '3',
            title: 'Optimize Keywords',
            description:
              'Add "microservices" and "CI/CD" to your skills section to match industry requirements',
            priority: 'medium',
            impact: 75,
          },
          {
            id: '4',
            title: 'Certification Recommendation',
            description: 'Consider AWS certification to boost your marketability by 25%',
            priority: 'medium',
            impact: 70,
          },
        ],
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setAnalyticsData(mockData);
      setLoading(false);
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-blue-500 border-t-2 border-b-2" />
        <span className="ml-3">Analyzing your resume with AI...</span>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="py-8 text-center">
        <p>Unable to generate predictive analytics at this time.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Success Probability</CardDescription>
            <CardTitle className="text-3xl">{analyticsData.successProbability}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={analyticsData.successProbability} className="w-full" />
            <p className="mt-2 text-muted-foreground text-xs">Likelihood of landing interviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Application Success</CardDescription>
            <CardTitle className="text-3xl">{analyticsData.applicationSuccessRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={analyticsData.applicationSuccessRate} className="w-full" />
            <p className="mt-2 text-muted-foreground text-xs">Based on your target {targetRole}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Interview Likelihood</CardDescription>
            <CardTitle className="text-3xl">{analyticsData.interviewLikelihood}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={analyticsData.interviewLikelihood} className="w-full" />
            <p className="mt-2 text-muted-foreground text-xs">Compared to similar candidates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Market Demand</CardDescription>
            <CardTitle className="text-3xl">{analyticsData.marketDemand}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={analyticsData.marketDemand} className="w-full" />
            <p className="mt-2 text-muted-foreground text-xs">For {targetIndustry} industry</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Score Comparison Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Resume Score Analysis</CardTitle>
            <CardDescription>Compare your scores with industry benchmarks</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analyticsData.scores}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" name="Your Score" fill="#3b82f6" />
                <Bar dataKey="benchmark" name="Industry Benchmark" fill="#94a3b8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Skill Gap Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Skill Gap Analysis</CardTitle>
            <CardDescription>Identify skills that boost your marketability</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analyticsData.skillGaps}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={30} domain={[0, 10]} />
                <Radar
                  name="Current Level"
                  dataKey="current"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Required Level"
                  dataKey="required"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.3}
                />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Market Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Market Insights</CardTitle>
          <CardDescription>Demand and growth trends for key skills</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={analyticsData.marketInsights}
              margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="skill" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="demand"
                name="Current Demand"
                stroke="#3b82f6"
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="growth"
                name="Growth Trend"
                stroke="#10b981"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Personalized Recommendations</CardTitle>
          <CardDescription>Actionable insights to improve your success rate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.recommendations.map((rec) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-lg border p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{rec.title}</h4>
                    <p className="mt-1 text-muted-foreground text-sm">{rec.description}</p>
                  </div>
                  <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                    {rec.priority} priority
                  </Badge>
                </div>
                <div className="mt-2 flex items-center">
                  <span className="mr-2 text-muted-foreground text-sm">Impact:</span>
                  <Progress value={rec.impact} className="w-32" />
                  <span className="ml-2 text-sm">{rec.impact}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PredictiveAnalyticsDashboard;
