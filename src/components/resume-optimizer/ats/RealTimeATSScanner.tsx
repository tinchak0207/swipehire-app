'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Download,
  Eye,
  FileCheck,
  Lightbulb,
  RefreshCw,
  Shield,
  Target,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  ATSAnalysisParams,
  ATSCompatibilityResult,
  ATSSuggestion,
} from '@/services/atsCompatibilityService';

interface RealTimeATSScannerProps {
  resumeText: string;
  targetRole?: string;
  targetIndustry?: string;
  jobDescription?: string;
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
  onSuggestionApplied?: (suggestion: ATSSuggestion) => void;
  className?: string;
}

export const RealTimeATSScanner: React.FC<RealTimeATSScannerProps> = ({
  resumeText,
  targetRole,
  targetIndustry,
  jobDescription,
  experienceLevel,
  onSuggestionApplied,
  className = '',
}) => {
  const [atsResult, setATSResult] = useState<ATSCompatibilityResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>('overview');
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());
  const [realTimeScore, setRealTimeScore] = useState<number>(0);

  const analyzeATS = useCallback(async () => {
    if (!resumeText.trim()) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const params: ATSAnalysisParams = {
        resumeText,
        targetRole: targetRole || '',
        targetIndustry: targetIndustry || '',
        jobDescription: jobDescription || '',
        experienceLevel: experienceLevel || 'entry',
      };

      const response = await fetch('/api/resume-optimizer/ats-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('ATS analysis failed');
      }

      const result: ATSCompatibilityResult = await response.json();
      setATSResult(result);
      setRealTimeScore(result.overallScore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [resumeText, targetRole, targetIndustry, jobDescription, experienceLevel]);

  // Real-time analysis when resume text changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (resumeText.trim()) {
        analyzeATS();
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timeoutId);
  }, [analyzeATS, resumeText.trim]);

  const handleApplySuggestion = (suggestion: ATSSuggestion) => {
    setAppliedSuggestions((prev) => new Set(prev).add(suggestion.id));
    onSuggestionApplied?.(suggestion);

    // Simulate score improvement
    setRealTimeScore((prev) => Math.min(100, prev + suggestion.impact));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'important':
        return 'default';
      case 'suggestion':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const exportReport = async () => {
    if (!atsResult) return;

    const reportData = {
      overallScore: atsResult.overallScore,
      timestamp: new Date().toISOString(),
      sections: atsResult.sections,
      suggestions: atsResult.suggestions,
      riskFactors: atsResult.riskFactors,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ats-analysis-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <XCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          ATS Analysis Error: {error}
          <Button variant="outline" size="sm" onClick={analyzeATS} className="ml-2">
            <RefreshCw className="mr-1 h-3 w-3" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Real-time Score Header */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div
                  className={`h-20 w-20 rounded-full bg-gradient-to-r ${getScoreGradient(realTimeScore)} flex items-center justify-center`}
                >
                  <span className="font-bold text-2xl text-white">{Math.round(realTimeScore)}</span>
                </div>
                {isAnalyzing && (
                  <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-300 border-t-transparent" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-xl">
                  Real-time ATS Compatibility Score
                </h3>
                <p className="text-gray-600">
                  {isAnalyzing ? 'Analyzing...' : 'Live analysis complete'}
                </p>
                <div className="mt-2 flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-gray-500 text-sm">Real-time scanning active</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={analyzeATS}
                disabled={isAnalyzing}
                className="space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>Rescan</span>
              </Button>
              <Button
                variant="outline"
                onClick={exportReport}
                disabled={!atsResult}
                className="space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {atsResult && (
        <Tabs value={selectedSection} onValueChange={setSelectedSection}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="sections" className="space-x-2">
              <FileCheck className="h-4 w-4" />
              <span>Sections</span>
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="space-x-2">
              <Target className="h-4 w-4" />
              <span>Suggestions</span>
            </TabsTrigger>
            <TabsTrigger value="risks" className="space-x-2">
              <Shield className="h-4 w-4" />
              <span>Risk Factors</span>
            </TabsTrigger>
            <TabsTrigger value="optimize" className="space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Optimize</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Quick Stats */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Passed Checks</p>
                      <p className="font-bold text-2xl text-green-600">
                        {atsResult.passedChecks.length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Failed Checks</p>
                      <p className="font-bold text-2xl text-red-600">
                        {atsResult.failedChecks.length}
                      </p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Suggestions</p>
                      <p className="font-bold text-2xl text-blue-600">
                        {atsResult.suggestions.length}
                      </p>
                    </div>
                    <Lightbulb className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Bars for Each Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Section Breakdown</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(atsResult.sections).map(([sectionName, section]) => (
                  <div key={sectionName} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm capitalize">
                        {sectionName.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className={`font-bold text-sm ${getScoreColor(section.score)}`}>
                        {section.score}/{section.maxScore}
                      </span>
                    </div>
                    <Progress value={(section.score / section.maxScore) * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Industry Compliance */}
            {atsResult.industryCompliance.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Industry Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {atsResult.industryCompliance.slice(0, 4).map((industry) => (
                      <div key={industry.industry} className="rounded-lg border p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-medium">{industry.industry}</span>
                          <Badge variant={industry.score >= 70 ? 'default' : 'destructive'}>
                            {industry.score}%
                          </Badge>
                        </div>
                        <Progress value={industry.score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Sections Tab */}
          <TabsContent value="sections" className="space-y-4">
            {Object.entries(atsResult.sections).map(([sectionName, section]) => (
              <motion.div
                key={sectionName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="capitalize">
                        {sectionName.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            section.impact === 'high'
                              ? 'destructive'
                              : section.impact === 'medium'
                                ? 'default'
                                : 'secondary'
                          }
                        >
                          {section.impact} impact
                        </Badge>
                        <span className={`font-bold text-lg ${getScoreColor(section.score)}`}>
                          {section.score}/{section.maxScore}
                        </span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Progress value={(section.score / section.maxScore) * 100} className="h-3" />

                    {section.issues.length > 0 && (
                      <div>
                        <h4 className="mb-2 flex items-center font-medium text-red-600">
                          <XCircle className="mr-2 h-4 w-4" />
                          Issues Found
                        </h4>
                        <ul className="space-y-1">
                          {section.issues.map((issue, index) => (
                            <li key={index} className="pl-4 text-gray-600 text-sm">
                              • {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {section.recommendations.length > 0 && (
                      <div>
                        <h4 className="mb-2 flex items-center font-medium text-green-600">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Recommendations
                        </h4>
                        <ul className="space-y-1">
                          {section.recommendations.map((rec, index) => (
                            <li key={index} className="pl-4 text-gray-600 text-sm">
                              • {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-4">
            <AnimatePresence>
              {atsResult.suggestions.map((suggestion) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className={
                      appliedSuggestions.has(suggestion.id) ? 'border-green-200 bg-green-50' : ''
                    }
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center space-x-2">
                            <Badge variant={getSeverityColor(suggestion.severity)}>
                              {suggestion.severity}
                            </Badge>
                            <Badge variant="outline">+{suggestion.impact} points</Badge>
                            <Badge variant="secondary">{suggestion.type}</Badge>
                          </div>

                          <h4 className="mb-2 font-medium">{suggestion.description}</h4>
                          <p className="mb-3 text-gray-600 text-sm">{suggestion.reasoning}</p>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                              <p className="mb-1 font-medium text-red-600 text-sm">Before:</p>
                              <div className="rounded bg-red-50 p-2 text-sm">
                                {suggestion.before}
                              </div>
                            </div>
                            <div>
                              <p className="mb-1 font-medium text-green-600 text-sm">After:</p>
                              <div className="rounded bg-green-50 p-2 text-sm">
                                {suggestion.after}
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleApplySuggestion(suggestion)}
                          disabled={appliedSuggestions.has(suggestion.id)}
                          variant={appliedSuggestions.has(suggestion.id) ? 'secondary' : 'default'}
                          className="ml-4"
                        >
                          {appliedSuggestions.has(suggestion.id) ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Applied
                            </>
                          ) : (
                            'Apply Fix'
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </TabsContent>

          {/* Risk Factors Tab */}
          <TabsContent value="risks" className="space-y-4">
            {atsResult.riskFactors.map((risk, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className={`rounded-full p-2 ${getRiskColor(risk.risk)}`}>
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-medium">{risk.factor}</h4>
                        <Badge
                          variant={
                            risk.risk === 'high'
                              ? 'destructive'
                              : risk.risk === 'medium'
                                ? 'default'
                                : 'secondary'
                          }
                        >
                          {risk.risk} risk
                        </Badge>
                      </div>
                      <p className="mb-2 text-gray-600 text-sm">{risk.description}</p>
                      <div className="rounded-lg bg-blue-50 p-3">
                        <p className="text-blue-800 text-sm">
                          <strong>Solution:</strong> {risk.solution}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Optimization Tips Tab */}
          <TabsContent value="optimize" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {atsResult.optimizationTips.map((tip, index) => (
                <Card key={index} className="transition-shadow hover:shadow-md">
                  <CardContent className="pt-6">
                    <div className="mb-3 flex items-start justify-between">
                      <Badge variant="outline">{tip.category}</Badge>
                      <div className="text-right">
                        <div className="font-medium text-green-600 text-sm">
                          +{tip.expectedImprovement}%
                        </div>
                        <div className="text-gray-500 text-xs">{tip.difficulty} to implement</div>
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm">{tip.tip}</p>

                    <div className="mt-3 flex items-center space-x-2">
                      <div
                        className={`h-2 flex-1 rounded-full ${
                          tip.difficulty === 'easy'
                            ? 'bg-green-200'
                            : tip.difficulty === 'medium'
                              ? 'bg-yellow-200'
                              : 'bg-red-200'
                        }`}
                      >
                        <div
                          className={`h-full rounded-full ${
                            tip.difficulty === 'easy'
                              ? 'bg-green-500'
                              : tip.difficulty === 'medium'
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                          }`}
                          style={{ width: '100%' }}
                        />
                      </div>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {!atsResult && !isAnalyzing && resumeText && (
        <Card className="border-2 border-gray-300 border-dashed">
          <CardContent className="pt-6 text-center">
            <Eye className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 font-medium text-gray-900 text-lg">Ready for ATS Analysis</h3>
            <p className="mb-4 text-gray-600">
              Click 'Analyze' to start real-time ATS compatibility scanning
            </p>
            <Button onClick={analyzeATS} className="space-x-2">
              <Zap className="h-4 w-4" />
              <span>Start ATS Analysis</span>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealTimeATSScanner;
