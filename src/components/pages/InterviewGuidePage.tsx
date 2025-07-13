'use client';

import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  Building2,
  Calendar,
  CheckCircle2,
  FileText,
  Lightbulb,
  Lock,
  MessageSquare,
  Play,
  Search,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { CompanyResearch } from '@/components/interview/CompanyResearch';
import { JobAnalysisComponent } from '@/components/interview/JobAnalysis';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import type {
  InterviewCalendar,
  InterviewPhase,
  InterviewProgress,
  InterviewQuestion,
  PreparationTip,
  UserInterviewProfile,
  UserRole,
} from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  fetchInterviewQuestions,
  getInterviewCalendar,
  getInterviewProgress,
  getPreparationTips,
  getUserInterviewProfile,
} from '@/services/interviewService';

interface InterviewGuidePageProps {
  isGuestMode?: boolean;
  currentUserRole?: UserRole | null;
}

type FeatureKey = 'research' | 'preparation' | 'practice' | 'calendar' | 'followup' | 'analytics';
type ViewState =
  | 'overview'
  | 'research'
  | 'jobAnalysis'
  | 'practice'
  | 'calendar'
  | 'followup'
  | 'analytics';

interface InterviewFeature {
  key: FeatureKey;
  title: string;
  Icon: React.ElementType;
  bgClass: string;
  description: string;
  phase: InterviewPhase;
  isLocked?: boolean;
  onClick?: () => void;
}

export function InterviewGuidePage({ isGuestMode, currentUserRole }: InterviewGuidePageProps) {
  const [activeTab, setActiveTab] = useState<InterviewPhase>('pre_interview');
  const [currentView, setCurrentView] = useState<ViewState>('overview');
  const [_userProfile, setUserProfile] = useState<UserInterviewProfile | null>(null);
  const [progress, setProgress] = useState<InterviewProgress | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [tips, setTips] = useState<PreparationTip[]>([]);
  const [calendar, setCalendar] = useState<InterviewCalendar[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const interviewFeatures: InterviewFeature[] = [
    {
      key: 'research',
      title: 'Company Research',
      Icon: Building2,
      bgClass: 'bg-gradient-to-br from-blue-500 to-blue-700',
      description: 'Deep dive into company insights, culture, and recent news.',
      phase: 'pre_interview',
      onClick: () => setCurrentView('research'),
    },
    {
      key: 'preparation',
      title: 'Job Analysis',
      Icon: FileText,
      bgClass: 'bg-gradient-to-br from-green-500 to-green-700',
      description: 'Analyze job descriptions and predict likely questions.',
      phase: 'pre_interview',
      onClick: () => setCurrentView('jobAnalysis'),
    },
    {
      key: 'practice',
      title: 'Mock Interviews',
      Icon: MessageSquare,
      bgClass: 'bg-gradient-to-br from-purple-500 to-purple-700',
      description: 'Practice with AI-powered behavioral and technical questions.',
      phase: 'interview',
      onClick: () => handleFeatureClick('practice'),
    },
    {
      key: 'calendar',
      title: 'Interview Calendar',
      Icon: Calendar,
      bgClass: 'bg-gradient-to-br from-orange-500 to-orange-700',
      description: 'Schedule and track your upcoming interviews.',
      phase: 'interview',
      onClick: () => handleFeatureClick('calendar'),
    },
    {
      key: 'followup',
      title: 'Thank You Notes',
      Icon: MessageSquare,
      bgClass: 'bg-gradient-to-br from-teal-500 to-teal-700',
      description: 'Generate personalized thank you messages and follow-ups.',
      phase: 'post_interview',
      onClick: () => handleFeatureClick('followup'),
    },
    {
      key: 'analytics',
      title: 'Performance Analytics',
      Icon: TrendingUp,
      bgClass: 'bg-gradient-to-br from-pink-500 to-pink-700',
      description: 'Track your progress and identify improvement areas.',
      phase: 'post_interview',
      onClick: () => handleFeatureClick('analytics'),
    },
  ];

  useEffect(() => {
    if (!isGuestMode) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, [isGuestMode, loadUserData]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      // In a real implementation, we'd get the actual user ID
      const userId = 'current-user-id';

      const [profileData, progressData, questionsData, tipsData, calendarData] = await Promise.all([
        getUserInterviewProfile(userId),
        getInterviewProgress(userId),
        fetchInterviewQuestions({ limit: 10 }),
        getPreparationTips(),
        getInterviewCalendar(userId),
      ]);

      setUserProfile(profileData);
      setProgress(progressData);
      setQuestions(questionsData.questions);
      setTips(tipsData);
      setCalendar(calendarData);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load interview data. Using offline mode.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureClick = (featureKey: FeatureKey) => {
    if (isGuestMode && !['research', 'preparation'].includes(featureKey)) {
      toast({
        title: 'Feature Locked',
        description: 'Please sign in to access Interview Guide features.',
        variant: 'default',
      });
      return;
    }

    if (!['research', 'preparation'].includes(featureKey)) {
      toast({
        title: `${featureKey} (Coming Soon!)`,
        description: 'This feature is currently under development and will be available soon.',
        variant: 'default',
        duration: 5000,
      });
    }
  };

  const handleBackToOverview = () => {
    setCurrentView('overview');
  };

  const getTabItems = () => [
    {
      value: 'pre_interview',
      label: 'Pre-Interview',
      icon: Search,
      description: 'Research and preparation',
    },
    {
      value: 'interview',
      label: 'Interview',
      icon: MessageSquare,
      description: 'Practice and execution',
    },
    {
      value: 'post_interview',
      label: 'Post-Interview',
      icon: CheckCircle2,
      description: 'Follow-up and analysis',
    },
  ];

  const getCurrentPhaseFeatures = () => {
    return interviewFeatures.filter((feature) => feature.phase === activeTab);
  };

  const getProgressPercentage = () => {
    if (!progress) return 0;
    return progress.progressPercentage || 0;
  };

  const GuestLockOverlay = ({ message = 'Sign In to Use This Feature' }: { message?: string }) => (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-red-500 bg-opacity-20 p-4 backdrop-blur-sm">
      <Lock className="mb-2 h-10 w-10 text-red-600 sm:h-12 sm:w-12" />
      <span className="text-center font-bold text-lg text-red-600 sm:text-xl">{message}</span>
    </div>
  );

  // Render specific feature views
  if (currentView === 'research') {
    return <CompanyResearch onBack={handleBackToOverview} isGuestMode={isGuestMode} />;
  }

  if (currentView === 'jobAnalysis') {
    return <JobAnalysisComponent onBack={handleBackToOverview} isGuestMode={isGuestMode} />;
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center">
          <Brain className="mx-auto h-12 w-12 animate-pulse text-primary" />
          <p className="mt-4 text-muted-foreground">Loading Interview Guide...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100vh-200px)] flex-col space-y-8 bg-background p-4 md:p-6">
      <div className="relative z-10 flex flex-grow flex-col">
        {/* Header Section */}
        <div className="mb-6 text-center md:mb-8">
          <Brain className="mx-auto mb-3 h-12 w-12 text-primary" />
          <h1 className="font-bold text-3xl text-foreground tracking-tight md:text-4xl">
            Interview Skills Guide
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-md text-muted-foreground">
            Your comprehensive companion for interview preparation, practice, and follow-up
          </p>
        </div>

        {/* Guest Mode Alert */}
        {isGuestMode && (
          <Alert variant="default" className="mb-6 border-amber-500 bg-amber-50 text-amber-700">
            <Lock className="!text-amber-600 h-5 w-5" />
            <AlertTitle className="font-semibold text-amber-800 text-lg">
              Interview Guide Preview
            </AlertTitle>
            <AlertDescription className="text-amber-700/90">
              Sign in to access personalized interview preparation, track your progress, and get
              AI-powered feedback.
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Overview */}
        {!isGuestMode && progress && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Your Interview Journey
              </CardTitle>
              <CardDescription>Track your preparation progress and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{getProgressPercentage()}%</span>
                  </div>
                  <Progress value={getProgressPercentage()} className="mt-2" />
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="text-center">
                    <div className="font-bold text-2xl text-primary">
                      {progress.completedSteps.length}
                    </div>
                    <div className="text-muted-foreground text-sm">Steps Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-2xl text-green-600">
                      {progress.goals?.length || 0}
                    </div>
                    <div className="text-muted-foreground text-sm">Active Goals</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-2xl text-blue-600">{calendar.length}</div>
                    <div className="text-muted-foreground text-sm">Scheduled</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-2xl text-purple-600">
                      {progress.achievements?.length || 0}
                    </div>
                    <div className="text-muted-foreground text-sm">Achievements</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs Interface */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as InterviewPhase)}>
          <TabsList className="grid w-full grid-cols-3">
            {getTabItems().map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center space-x-2"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split('-')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="font-semibold text-2xl">
                  {getTabItems().find((tab) => tab.value === activeTab)?.label} Phase
                </h2>
                <p className="text-muted-foreground">
                  {getTabItems().find((tab) => tab.value === activeTab)?.description}
                </p>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getCurrentPhaseFeatures().map((feature) => (
                  <Card
                    key={feature.key}
                    className={cn(
                      'group relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl p-6 text-white transition-all duration-300',
                      feature.bgClass,
                      isGuestMode &&
                        !['research', 'preparation'].includes(feature.key) &&
                        'cursor-default border-2 border-amber-400 opacity-60',
                      'hover:-translate-y-1 hover:shadow-2xl'
                    )}
                    onClick={feature.onClick}
                  >
                    {isGuestMode && !['research', 'preparation'].includes(feature.key) && (
                      <GuestLockOverlay />
                    )}
                    <feature.Icon className="mb-3 h-12 w-12 text-white/90 transition-transform group-hover:scale-110" />
                    <CardTitle className="text-center font-bold text-xl">{feature.title}</CardTitle>
                    <CardContent className="mt-2 p-0 text-center">
                      <p className="text-sm text-white/80">{feature.description}</p>
                    </CardContent>
                    {(!isGuestMode || ['research', 'preparation'].includes(feature.key)) && (
                      <ArrowRight className="absolute right-4 bottom-4 h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100" />
                    )}
                  </Card>
                ))}
              </div>

              {/* Phase-specific content */}
              {activeTab === 'pre_interview' && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Lightbulb className="mr-2 h-5 w-5" />
                        Quick Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {tips.slice(0, 3).map((tip, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                            <div>
                              <p className="font-medium text-sm">{tip.title}</p>
                              <p className="text-muted-foreground text-xs">{tip.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BookOpen className="mr-2 h-5 w-5" />
                        Common Questions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {questions.slice(0, 3).map((question, _index) => (
                          <div key={question.id} className="space-y-2">
                            <p className="font-medium text-sm">{question.question}</p>
                            <div className="flex space-x-2">
                              <Badge
                                variant={
                                  question.difficulty === 'easy'
                                    ? 'default'
                                    : question.difficulty === 'medium'
                                      ? 'secondary'
                                      : 'destructive'
                                }
                              >
                                {question.difficulty}
                              </Badge>
                              <Badge variant="outline">{question.category}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'interview' && !isGuestMode && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Play className="mr-2 h-5 w-5" />
                      Quick Start
                    </CardTitle>
                    <CardDescription>
                      Jump into practice or schedule your next interview
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={() => handleFeatureClick('practice')}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Start Mock Interview
                      </Button>
                      <Button variant="outline" onClick={() => handleFeatureClick('calendar')}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule Interview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'post_interview' && !isGuestMode && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="mr-2 h-5 w-5" />
                      Recent Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-muted-foreground">
                      <Award className="mx-auto h-12 w-12 opacity-50" />
                      <p className="mt-2">Complete interviews to unlock achievements</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Success Metrics Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-primary">
              <Target className="mr-3 h-6 w-6" />
              Interview Success Metrics
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              See how our comprehensive approach helps candidates succeed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="font-bold text-3xl text-green-600">94%</div>
                <div className="text-muted-foreground text-sm">User Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-3xl text-blue-600">45%</div>
                <div className="text-muted-foreground text-sm">Adoption Rate</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-3xl text-purple-600">15min</div>
                <div className="text-muted-foreground text-sm">Avg Session</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-3xl text-orange-600">+15%</div>
                <div className="text-muted-foreground text-sm">Success Rate</div>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Join thousands of candidates who have improved their interview skills with our
              comprehensive preparation platform.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
