'use client';

import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Brain,
  CheckCircle2,
  FileText,
  Loader2,
  Star,
  Target,
  TrendingUp,
  Upload,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  type Industry,
  InterviewDifficulty,
  type InterviewType,
  type JobAnalysis,
  type WorkExperienceLevel,
} from '@/lib/types';
import { analyzeJob } from '@/services/interviewService';

interface JobAnalysisProps {
  onBack: () => void;
  isGuestMode?: boolean;
}

export function JobAnalysisComponent({ onBack, isGuestMode }: JobAnalysisProps) {
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<JobAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!jobTitle.trim() || !jobDescription.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in the job title and description.',
        variant: 'destructive',
      });
      return;
    }

    if (isGuestMode) {
      // Show demo data for guest mode
      setAnalysisResult(getMockJobAnalysis());
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await analyzeJob({
        jobTitle,
        jobDescription,
        companyName: companyName || 'Company',
        userSkills: ['JavaScript', 'React', 'Node.js'], // In real app, get from user profile
      });
      setAnalysisResult(result);
      toast({
        title: 'Analysis Complete',
        description: `Successfully analyzed the ${jobTitle} position`,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to analyze job');
      setAnalysisResult(getMockJobAnalysis()); // Fallback to demo data
      toast({
        title: 'Using Demo Data',
        description: 'Analysis service unavailable, showing sample data.',
        variant: 'default',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setJobDescription(text);
      };
      reader.readAsText(file);
    } else {
      toast({
        title: 'Invalid File',
        description: 'Please upload a text file containing the job description.',
        variant: 'destructive',
      });
    }
  };

  const getMockJobAnalysis = (): JobAnalysis => ({
    id: 'mock-analysis-1',
    jobTitle: jobTitle || 'Software Engineer',
    jobDescription: jobDescription || 'We are looking for a talented software engineer...',
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Git'],
    preferredSkills: ['Python', 'Docker', 'AWS', 'GraphQL'],
    experienceLevel: 'MID_LEVEL' as WorkExperienceLevel,
    salaryRange: '$80,000 - $120,000',
    keyResponsibilities: [
      'Develop and maintain web applications',
      'Collaborate with cross-functional teams',
      'Write clean, maintainable code',
      'Participate in code reviews',
      'Troubleshoot and debug applications',
    ],
    qualifications: [
      "Bachelor's degree in Computer Science or related field",
      '3+ years of experience in software development',
      'Strong knowledge of JavaScript and React',
      'Experience with version control systems',
      'Excellent problem-solving skills',
    ],
    companyName: companyName || 'TechCorp',
    industry: 'TECHNOLOGY' as Industry,
    location: 'San Francisco, CA',
    remotePolicy: 'Hybrid (3 days in office)',
    predictedQuestions: [
      {
        id: 'q1',
        category: 'TECHNICAL' as InterviewType,
        question: 'Explain the difference between let, const, and var in JavaScript.',
        difficulty: 'MEDIUM' as InterviewDifficulty,
        tags: ['javascript', 'fundamentals'],
        keywords: ['variables', 'scope', 'hoisting'],
        scoringCriteria: [],
      },
      {
        id: 'q2',
        category: 'BEHAVIORAL' as InterviewType,
        question: 'Tell me about a challenging bug you had to fix.',
        difficulty: 'MEDIUM' as InterviewDifficulty,
        tags: ['problem-solving', 'debugging'],
        keywords: ['debugging', 'problem-solving', 'persistence'],
        scoringCriteria: [],
      },
      {
        id: 'q3',
        category: 'TECHNICAL' as InterviewType,
        question: 'How would you optimize the performance of a React application?',
        difficulty: 'HARD' as InterviewDifficulty,
        tags: ['react', 'performance', 'optimization'],
        keywords: ['performance', 'optimization', 'react'],
        scoringCriteria: [],
      },
    ],
    skillGapAnalysis: [
      {
        skill: 'JavaScript',
        required: true,
        userLevel: 8,
        requiredLevel: 7,
        gap: 0,
        improvementResources: [],
      },
      {
        skill: 'React',
        required: true,
        userLevel: 7,
        requiredLevel: 8,
        gap: 1,
        improvementResources: ['React Documentation', 'Advanced React Patterns Course'],
      },
      {
        skill: 'TypeScript',
        required: true,
        userLevel: 5,
        requiredLevel: 7,
        gap: 2,
        improvementResources: ['TypeScript Handbook', 'TypeScript Deep Dive'],
      },
      {
        skill: 'AWS',
        required: false,
        userLevel: 3,
        requiredLevel: 6,
        gap: 3,
        improvementResources: ['AWS Free Tier', 'Cloud Practitioner Certification'],
      },
    ],
    fitScore: 85,
    recommendations: [
      'Focus on strengthening TypeScript skills',
      'Practice advanced React patterns and hooks',
      'Build a project showcasing full-stack development',
      'Get familiar with AWS services',
    ],
    analysisDate: new Date().toISOString(),
  });

  const getSkillGapColor = (gap: number) => {
    if (gap <= 0) return 'text-green-600';
    if (gap <= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSkillGapIcon = (gap: number) => {
    if (gap <= 0) return CheckCircle2;
    if (gap <= 2) return AlertTriangle;
    return AlertTriangle;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h2 className="font-bold text-2xl">Job Description Analysis</h2>
          <p className="text-muted-foreground">
            Analyze job requirements and get personalized preparation insights
          </p>
        </div>
      </div>

      {/* Analysis Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Job Information
          </CardTitle>
          <CardDescription>
            Enter the job details to get AI-powered analysis and interview preparation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="job-title">Job Title *</Label>
              <Input
                id="job-title"
                placeholder="e.g., Software Engineer, Product Manager"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                placeholder="e.g., Google, Microsoft"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-description">Job Description *</Label>
            <Textarea
              id="job-description"
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={8}
            />
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </Button>
              <span className="text-muted-foreground text-sm">Or upload a text file</span>
            </div>
          </div>

          <Button onClick={handleAnalyze} disabled={loading} className="w-full">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Brain className="mr-2 h-4 w-4" />
            )}
            Analyze Job Description
          </Button>

          {isGuestMode && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Demo Mode</AlertTitle>
              <AlertDescription>
                Sign in to get personalized job analysis based on your skills and experience.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Analysis Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Fit Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Job Fit Analysis
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      analysisResult.fitScore >= 80
                        ? 'default'
                        : analysisResult.fitScore >= 60
                          ? 'secondary'
                          : 'destructive'
                    }
                    className="px-3 py-1 text-lg"
                  >
                    {analysisResult.fitScore}% Match
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={analysisResult.fitScore} className="mb-4" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 font-medium">Required Skills Match</h4>
                  <div className="space-y-1">
                    {analysisResult.requiredSkills.slice(0, 5).map((skill, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{skill}</span>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Experience Level</h4>
                  <p className="text-muted-foreground text-sm">
                    Position requires: {analysisResult.experienceLevel.replace('_', ' ')}
                  </p>
                  <p className="text-sm">✓ Matches your experience level</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skill Gap Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Skill Gap Analysis
              </CardTitle>
              <CardDescription>See how your skills match the job requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisResult.skillGapAnalysis.map((skill, index) => {
                  const Icon = getSkillGapIcon(skill.gap);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`h-5 w-5 ${getSkillGapColor(skill.gap)}`} />
                        <div>
                          <div className="font-medium">{skill.skill}</div>
                          <div className="text-muted-foreground text-sm">
                            Your level: {skill.userLevel}/10 | Required: {skill.requiredLevel}/10
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {skill.gap <= 0 ? (
                          <Badge variant="default">Strong</Badge>
                        ) : skill.gap <= 2 ? (
                          <Badge variant="secondary">Gap: {skill.gap}</Badge>
                        ) : (
                          <Badge variant="destructive">Gap: {skill.gap}</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Predicted Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="mr-2 h-5 w-5" />
                Likely Interview Questions
              </CardTitle>
              <CardDescription>
                Questions you might be asked based on the job requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisResult.predictedQuestions.map((question, _index) => (
                  <div key={question.id} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <p className="font-medium">{question.question}</p>
                      <div className="flex space-x-2">
                        <Badge variant="outline">{question.category}</Badge>
                        <Badge
                          variant={
                            question.difficulty === InterviewDifficulty.EASY
                              ? 'default'
                              : question.difficulty === InterviewDifficulty.MEDIUM
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {question.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {question.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Preparation Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysisResult.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Star className="mt-1 h-4 w-4 text-yellow-500" />
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Job Details Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Position Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 font-medium">Key Responsibilities</h4>
                  <ul className="list-inside list-disc space-y-1 text-sm">
                    {analysisResult.keyResponsibilities.map((resp, index) => (
                      <li key={index}>{resp}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Qualifications</h4>
                  <ul className="list-inside list-disc space-y-1 text-sm">
                    {analysisResult.qualifications.map((qual, index) => (
                      <li key={index}>{qual}</li>
                    ))}
                  </ul>
                </div>
              </div>
              {analysisResult.salaryRange && (
                <div className="mt-4 rounded-lg bg-muted p-3">
                  <p className="text-sm">
                    <strong>Salary Range:</strong> {analysisResult.salaryRange}
                  </p>
                  <p className="text-sm">
                    <strong>Location:</strong> {analysisResult.location}
                  </p>
                  {analysisResult.remotePolicy && (
                    <p className="text-sm">
                      <strong>Remote Policy:</strong> {analysisResult.remotePolicy}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
