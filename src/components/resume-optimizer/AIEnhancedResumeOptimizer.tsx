'use client';

import {
  AlertCircle,
  BarChart3,
  Brain,
  CheckCircle,
  Download,
  Eye,
  FileText,
  Lightbulb,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Video,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { AdvancedAnalyticsDashboard } from '@/components/resume-optimizer/analytics/AdvancedAnalyticsDashboard';
import { EnhancedAnalysisProgress } from '@/components/resume-optimizer/EnhancedAnalysisProgress';
import { SmartSuggestionsEngine } from '@/components/resume-optimizer/suggestions/SmartSuggestionsEngine';
import { AIResumeVideoGenerator } from '@/components/resume-optimizer/video/AIResumeVideoGenerator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import type {
  OptimizationSuggestion,
  ResumeAnalysisResponse,
  TargetJobInfo,
} from '@/lib/types/resume-optimizer';

interface AIEnhancedResumeOptimizerProps {
  className?: string;
  initialResumeText?: string;
  initialTargetJob?: Partial<TargetJobInfo>;
  onAnalysisComplete?: (result: ResumeAnalysisResponse) => void;
}

export function AIEnhancedResumeOptimizer({
  className = '',
  initialResumeText = '',
  initialTargetJob = {},
  onAnalysisComplete,
}: AIEnhancedResumeOptimizerProps) {
  const [resumeText, setResumeText] = useState(initialResumeText);
  const [targetJob, setTargetJob] = useState<TargetJobInfo>({
    title: 'Software Engineer',
    company: 'Tech Company',
    description:
      'We are looking for a talented Software Engineer to join our dynamic team. The ideal candidate will have experience in full-stack development, problem-solving skills, and the ability to work in a fast-paced environment. You will be responsible for developing scalable applications, collaborating with cross-functional teams, and contributing to technical decisions.',
    keywords:
      'JavaScript, TypeScript, React, Node.js, Python, SQL, Git, Agile, Problem Solving, Team Collaboration, API Development, Database Design',
    ...initialTargetJob,
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResponse | null>(null);
  const [activeTab, setActiveTab] = useState('input');
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());
  // State to track actual analysis time from the timer
  const [actualAnalysisTime, setActualAnalysisTime] = useState<number>(0);

  // Load analysis result from sessionStorage on component mount
  useEffect(() => {
    const storedResult = sessionStorage.getItem('resumeAnalysisResult');
    const storedTargetJob = sessionStorage.getItem('targetJobInfo');

    if (storedResult) {
      try {
        const result = JSON.parse(storedResult);
        setAnalysisResult(result);
        setActiveTab('results'); // Automatically switch to results tab

        // Clear the stored result to prevent reloading on subsequent visits
        sessionStorage.removeItem('resumeAnalysisResult');
      } catch (error) {
        console.error('Failed to parse stored analysis result:', error);
      }
    }

    if (storedTargetJob) {
      try {
        const targetJobInfo = JSON.parse(storedTargetJob);
        setTargetJob((prev) => ({ ...prev, ...targetJobInfo }));

        // Clear the stored target job info
        sessionStorage.removeItem('targetJobInfo');
      } catch (error) {
        console.error('Failed to parse stored target job info:', error);
      }
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!resumeText.trim() || !targetJob.title.trim()) {
      alert('Please provide both resume text and target job title');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/resume-optimizer/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          targetJob,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAnalysisResult(data.data);
        setActiveTab('results');
        // Call the callback if provided
        if (onAnalysisComplete) {
          onAnalysisComplete(data.data);
        }
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [resumeText, targetJob]);

  const handleApplySuggestion = useCallback((suggestion: OptimizationSuggestion) => {
    setAppliedSuggestions((prev) => new Set([...prev, suggestion.id]));
    // In a real implementation, this would apply the suggestion to the resume text
    console.log('Applying suggestion:', suggestion);
  }, []);

  const handleSmartSuggestionApplied = useCallback((suggestionId: string) => {
    console.log('Smart suggestion applied:', suggestionId);
  }, []);

  const handleSmartSuggestionDismissed = useCallback((suggestionId: string) => {
    console.log('Smart suggestion dismissed:', suggestionId);
  }, []);

  const handleContentUpdate = useCallback((newContent: string) => {
    setResumeText(newContent);
  }, []);

  const handleVideoGenerated = useCallback((videoUrl: string) => {
    console.log('Video generated:', videoUrl);
    // Could show success message or update UI
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'keyword':
        return <Target className="h-4 w-4" />;
      case 'grammar':
        return <FileText className="h-4 w-4" />;
      case 'format':
        return <BarChart3 className="h-4 w-4" />;
      case 'achievement':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`mx-auto max-w-6xl space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            AI-Enhanced Resume Optimizer
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="mr-1 h-3 w-3" />
              SOTA AI
            </Badge>
          </CardTitle>
          <p className="text-gray-600">
            {analysisResult ? (
              <span className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-600" />
                <span className="text-green-700 font-semibold">
                  We analyzed your resume in{' '}
                  {actualAnalysisTime > 0
                    ? actualAnalysisTime.toFixed(1)
                    : (analysisResult.processingTime / 1000).toFixed(1)}{' '}
                  seconds! ⚡
                </span>
              </span>
            ) : (
              'Leverage state-of-the-art AI to analyze and optimize your resume for maximum impact'
            )}
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="input">Input & Setup</TabsTrigger>
          <TabsTrigger value="results" disabled={!analysisResult}>
            Analysis Results
          </TabsTrigger>
          <TabsTrigger value="optimization" disabled={!analysisResult}>
            Optimization
          </TabsTrigger>
        </TabsList>

        {/* Input Tab */}
        <TabsContent value="input" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Resume Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Resume Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste your resume text here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="min-h-[300px] resize-none"
                />
                <div className="mt-2 text-gray-500 text-sm">
                  {resumeText.split(/\s+/).filter(Boolean).length} words
                </div>
              </CardContent>
            </Card>

            {/* Target Job Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Target Job Information
                  <Badge variant="outline" className="ml-2 text-xs">
                    Pre-filled for quick start
                  </Badge>
                </CardTitle>
                <p className="text-gray-600 text-sm">
                  We've pre-filled these fields with common values. You can customize them or start
                  analyzing immediately.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="job-title">Job Title *</Label>
                  <Input
                    id="job-title"
                    placeholder="e.g., Senior Software Engineer"
                    value={targetJob.title}
                    onChange={(e) => setTargetJob((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="e.g., Google, Microsoft"
                    value={targetJob.company}
                    onChange={(e) => setTargetJob((prev) => ({ ...prev, company: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="keywords">Key Skills/Keywords</Label>
                  <Input
                    id="keywords"
                    placeholder="e.g., React, TypeScript, Node.js, AWS"
                    value={targetJob.keywords}
                    onChange={(e) =>
                      setTargetJob((prev) => ({ ...prev, keywords: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="description">Job Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Paste the job description here for better analysis..."
                    value={targetJob.description}
                    onChange={(e) =>
                      setTargetJob((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="min-h-[120px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analyze Button */}
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-lg text-gray-800">Ready to Analyze!</h3>
                <p className="text-gray-600 text-sm">
                  {resumeText.trim()
                    ? 'Your resume is loaded and job info is pre-filled. Click below to start!'
                    : 'Upload your resume above to get started'}
                </p>
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={!resumeText.trim() || !targetJob.title.trim() || isAnalyzing}
                className="h-14 w-full text-lg bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    Start AI Analysis
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          {analysisResult && (
            <>
              {/* Score Overview */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div
                        className={`font-bold text-3xl ${getScoreColor(analysisResult.overallScore)}`}
                      >
                        {analysisResult.overallScore}%
                      </div>
                      <p className="text-gray-600 text-sm">Overall Score</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div
                        className={`font-bold text-3xl ${getScoreColor(analysisResult.atsScore)}`}
                      >
                        {analysisResult.atsScore}%
                      </div>
                      <p className="text-gray-600 text-sm">ATS Score</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div
                        className={`font-bold text-3xl ${getScoreColor(analysisResult.keywordAnalysis.score)}`}
                      >
                        {analysisResult.keywordAnalysis.score}%
                      </div>
                      <p className="text-gray-600 text-sm">Keywords</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div
                        className={`font-bold text-3xl ${getScoreColor(analysisResult.grammarCheck.score)}`}
                      >
                        {analysisResult.grammarCheck.score}%
                      </div>
                      <p className="text-gray-600 text-sm">Grammar</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Analysis */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Strengths */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisResult.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                          <span className="text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Areas for Improvement */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-700">
                      <AlertCircle className="h-5 w-5" />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisResult.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500" />
                          <span className="text-sm">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Keyword Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Keyword Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="mb-2 font-medium text-green-700">Matched Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.keywordAnalysis.matchedKeywords.map((keyword, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-green-100 text-green-800"
                          >
                            {keyword.keyword} ({keyword.frequency}x)
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-2 font-medium text-red-700">Missing Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.keywordAnalysis.missingKeywords.map((keyword, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="border-red-200 text-red-700"
                          >
                            {keyword.keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Processing Info */}
              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  Analysis completed using {(analysisResult.metadata as any)?.aiModel || 'AI model'}{' '}
                  with advanced parallel processing.
                  {(analysisResult.metadata as any)?.analysisType === 'basic' &&
                    ' (Fallback mode - AI service unavailable)'}
                </AlertDescription>
              </Alert>

              {/* Advanced Analytics Dashboard */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Analytics Dashboard
                  </CardTitle>
                  <p className="text-gray-600 text-sm">
                    Comprehensive performance analytics and improvement insights
                  </p>
                </CardHeader>
                <CardContent>
                  <AdvancedAnalyticsDashboard
                    userId="current_user"
                    timeRange="month"
                    realTime={true}
                    showBenchmarks={true}
                    showInsights={true}
                    allowExport={true}
                    height={600}
                  />
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-6">
          {analysisResult && (
            <>
              {/* Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    AI-Generated Optimization Suggestions
                  </CardTitle>
                  <p className="text-gray-600 text-sm">
                    Prioritized recommendations to improve your resume score
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisResult.suggestions
                      .sort((a, b) => a.priority - b.priority)
                      .map((suggestion) => (
                        <Card key={suggestion.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="mb-2 flex items-center gap-2">
                                  {getSuggestionIcon(suggestion.type)}
                                  <h4 className="font-medium">{suggestion.title}</h4>
                                  <Badge className={getImpactColor(suggestion.impact)}>
                                    {suggestion.impact} impact
                                  </Badge>
                                  <Badge variant="outline">
                                    +{suggestion.estimatedScoreImprovement} points
                                  </Badge>
                                </div>
                                <p className="mb-2 text-gray-600 text-sm">
                                  {suggestion.description}
                                </p>
                                <p className="rounded bg-blue-50 p-2 text-sm">
                                  <strong>Suggestion:</strong> {suggestion.suggestion}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant={
                                  appliedSuggestions.has(suggestion.id) ? 'secondary' : 'default'
                                }
                                onClick={() => handleApplySuggestion(suggestion)}
                                disabled={appliedSuggestions.has(suggestion.id)}
                              >
                                {appliedSuggestions.has(suggestion.id) ? (
                                  <>
                                    <CheckCircle className="mr-1 h-4 w-4" />
                                    Applied
                                  </>
                                ) : (
                                  'Apply'
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Smart Suggestions Engine */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Smart Suggestions Engine
                  </CardTitle>
                  <p className="text-gray-600 text-sm">
                    Real-time AI suggestions with industry-specific recommendations
                  </p>
                </CardHeader>
                <CardContent>
                  <SmartSuggestionsEngine
                    content={resumeText}
                    targetRole={targetJob.title}
                    targetIndustry="Technology" // Could be made configurable
                    experienceLevel="mid" // Could be made configurable
                    enableRealTime={true}
                    enableMLSuggestions={true}
                    onSuggestionGenerated={() => {}}
                    onSuggestionApplied={handleSmartSuggestionApplied}
                    onSuggestionDismissed={handleSmartSuggestionDismissed}
                    onContentUpdate={handleContentUpdate}
                  />
                </CardContent>
              </Card>

              {/* AI Resume Video Generator */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    AI Resume Video Generator
                  </CardTitle>
                  <p className="text-gray-600 text-sm">
                    Transform your optimized resume into a professional video presentation
                  </p>
                </CardHeader>
                <CardContent>
                  <AIResumeVideoGenerator
                    resumeText={analysisResult.optimizedContent || resumeText}
                    onVideoGenerated={handleVideoGenerated}
                  />
                </CardContent>
              </Card>

              {/* Optimized Content Preview */}
              {analysisResult.optimizedContent &&
                analysisResult.optimizedContent !== resumeText && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        AI-Optimized Content Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-96 overflow-y-auto rounded-lg bg-gray-50 p-4">
                        <pre className="whitespace-pre-wrap text-sm">
                          {analysisResult.optimizedContent}
                        </pre>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Download Optimized Resume
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setResumeText(analysisResult.optimizedContent || '')}
                        >
                          Use Optimized Version
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Enhanced Analysis Progress Modal */}
      <EnhancedAnalysisProgress
        isAnalyzing={isAnalyzing}
        onComplete={(actualTime) => {
          console.log('Analysis completed with actual time:', actualTime);
          setActualAnalysisTime(actualTime);
        }}
      />
    </div>
  );
}

export default AIEnhancedResumeOptimizer;
