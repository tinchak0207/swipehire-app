'use client';

import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Lightbulb,
  MapPin,
  Plus,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { CandidateProfileForAI, CareerPath, CareerStage, Goal } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getCareerRecommendations } from '@/services/careerService';
import { CareerPlanningSidebar } from './CareerPlanningSidebar';

/**
 * Career Dashboard Props Interface
 * Comprehensive typing for the dashboard component
 */
interface CareerPlanningDashboardProps {
  userData: {
    education: string;
    experience: string[];
    skills: string[];
    interests: string[];
    values: string[];
    careerExpectations: string;
  };
  onBackToQuestionnaire?: () => void;
  userName?: string | null | undefined;
  userPhotoURL?: string | null | undefined;
}

/**
 * Career Recommendation Interface
 * Defines the structure for AI-generated career recommendations
 */
interface CareerRecommendation {
  careerStage: string;
  careerPaths: {
    title: string;
    description: string;
    requiredSkills: string[];
    growthPotential: number;
    salaryRange: string;
    educationRequirements: string[];
  }[];
}

/**
 * Tab Content Type
 * Defines the available dashboard sections
 */
type TabContent =
  | 'overview'
  | 'paths'
  | 'goals'
  | 'skills'
  | 'learning'
  | 'insights'
  | 'progress'
  | 'timeline';

/**
 * Career Planning Dashboard Component
 *
 * A comprehensive career planning dashboard that provides:
 * - Sidebar navigation with progress tracking
 * - Multiple views for career planning (paths, goals, skills, etc.)
 * - AI-powered career recommendations
 * - Progress tracking and analytics
 * - Responsive design with accessibility features
 * - Integration with existing design system
 *
 * Features:
 * - Career stage assessment and visualization
 * - Personalized career path recommendations
 * - Goal setting and tracking system
 * - Skills development planning
 * - Learning resource recommendations
 * - Progress analytics and timeline view
 *
 * @component
 * @example
 * ```tsx
 * <CareerPlanningDashboard
 *   userData={userCareerData}
 *   onBackToQuestionnaire={handleBack}
 *   userName="John Doe"
 * />
 * ```
 */
export default function CareerPlanningDashboard({
  userData,
  onBackToQuestionnaire,
  userName,
  userPhotoURL,
}: CareerPlanningDashboardProps) {
  // State Management
  const [careerStage, setCareerStage] = useState<CareerStage>('early');
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeTab, setActiveTab] = useState<TabContent>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoized computed values for performance
  const completedGoalsCount = useMemo(() => goals.filter((goal) => goal.completed).length, [goals]);

  const goalCompletionRate = useMemo(
    () => (goals.length > 0 ? Math.round((completedGoalsCount / goals.length) * 100) : 0),
    [completedGoalsCount, goals.length]
  );

  /**
   * Fetch career recommendations from AI service
   * Implements error handling and loading states
   */
  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Convert userData to CandidateProfileForAI format
      const candidateProfile: CandidateProfileForAI = {
        id: 'current-user',
        role: userData.careerExpectations || 'Software Engineer',
        experienceSummary: userData.experience.join('\n'),
        skills: userData.skills,
      };

      const recommendations: CareerRecommendation =
        await getCareerRecommendations(candidateProfile);

      // Safely set career stage with type checking
      const validCareerStages: CareerStage[] = [
        'exploration',
        'early',
        'mid',
        'late',
        'transition',
      ];
      const recommendedStage = recommendations.careerStage as CareerStage;
      if (validCareerStages.includes(recommendedStage)) {
        setCareerStage(recommendedStage);
      } else {
        setCareerStage('early'); // fallback
      }

      // Convert recommendation paths to CareerPath format
      const convertedPaths: CareerPath[] = recommendations.careerPaths.map((path) => ({
        title: path.title,
        description: path.description,
        requiredSkills: path.requiredSkills,
        growthPotential: path.growthPotential,
        salaryRange: path.salaryRange,
        educationRequirements: path.educationRequirements,
      }));

      setCareerPaths(convertedPaths);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      setError('Failed to load career recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userData]);

  // Effect to fetch recommendations on component mount
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  /**
   * Goal Management Functions
   */
  const addGoal = useCallback((type: 'long' | 'mid' | 'short') => {
    const goalText = prompt(`Enter your ${type}-term goal:`);
    if (goalText?.trim()) {
      const newGoal: Goal = {
        id: Date.now(),
        type,
        text: goalText.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
        actionSteps: [],
        progress: 0,
        priority: 'medium',
        category:
          type === 'short' ? 'Skills' : type === 'mid' ? 'Career Growth' : 'Long-term Vision',
      };
      setGoals((prev) => [...prev, newGoal]);
    }
  }, []);

  const toggleGoalCompletion = useCallback((id: number) => {
    setGoals((prev) =>
      prev.map((goal) => (goal.id === id ? { ...goal, completed: !goal.completed } : goal))
    );
  }, []);

  const removeGoal = useCallback((id: number) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  }, []);

  /**
   * Get career stage information with visual indicators
   */
  const getCareerStageInfo = useCallback((stage: CareerStage) => {
    const stageInfo = {
      exploration: {
        title: 'Exploration',
        description: 'Discovering your interests and potential career paths',
        color: 'bg-blue-500',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50',
        icon: '🔍',
      },
      early: {
        title: 'Early Career',
        description: 'Building foundational skills and gaining experience',
        color: 'bg-green-500',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50',
        icon: '🌱',
      },
      mid: {
        title: 'Mid Career',
        description: 'Developing expertise and taking on leadership roles',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        icon: '🚀',
      },
      late: {
        title: 'Late Career',
        description: 'Senior leadership and mentoring others',
        color: 'bg-purple-500',
        textColor: 'text-purple-700',
        bgColor: 'bg-purple-50',
        icon: '👑',
      },
      transition: {
        title: 'Career Transition',
        description: 'Changing career paths or industries',
        color: 'bg-orange-500',
        textColor: 'text-orange-700',
        bgColor: 'bg-orange-50',
        icon: '🔄',
      },
    };
    return stageInfo[stage];
  }, []);

  /**
   * Get breadcrumb information for current tab
   */
  const getBreadcrumbInfo = useCallback((tab: TabContent) => {
    const breadcrumbMap = {
      overview: { title: 'Career Overview', description: 'Your career journey at a glance' },
      paths: { title: 'Career Paths', description: 'Explore recommended career directions' },
      goals: { title: 'Goals & Milestones', description: 'Set and track your career objectives' },
      skills: { title: 'Skills Development', description: 'Identify and develop key competencies' },
      learning: {
        title: 'Learning Resources',
        description: 'Courses, certifications, and training',
      },
      insights: { title: 'AI Insights', description: 'Personalized career recommendations' },
      progress: { title: 'Progress Tracking', description: 'Monitor your career advancement' },
      timeline: { title: 'Career Timeline', description: 'Visualize your career journey' },
    };
    return breadcrumbMap[tab];
  }, []);

  const stageInfo = getCareerStageInfo(careerStage);
  const breadcrumbInfo = getBreadcrumbInfo(activeTab);

  /**
   * Loading State Component
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="flex flex-col items-center justify-center py-24">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center space-y-4 p-8">
              <div className="relative">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />
                <div className="animation-delay-150 absolute inset-0 h-12 w-12 animate-spin rounded-full border-4 border-transparent border-t-blue-400" />
              </div>
              <div className="text-center">
                <h3 className="mb-2 font-semibold text-gray-800 text-xl">
                  Loading Career Insights
                </h3>
                <p className="text-gray-600 text-sm">Analyzing your career data...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  /**
   * Error State Component
   */
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="flex flex-col items-center justify-center py-24">
          <Alert className="w-full max-w-md" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Unable to Load Career Data</AlertTitle>
            <AlertDescription className="mt-2">
              {error}
              <Button
                onClick={fetchRecommendations}
                variant="outline"
                size="sm"
                className="mt-3 w-full"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  /**
   * Render Career Overview Tab
   */
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Career Stage Card */}
      <Card className="overflow-hidden">
        <div className={cn('p-6', stageInfo.bgColor)}>
          <div className="flex items-center space-x-4">
            <div
              className={cn(
                'flex h-16 w-16 items-center justify-center rounded-xl text-3xl',
                stageInfo.color
              )}
            >
              {stageInfo.icon}
            </div>
            <div className="flex-1">
              <h2 className={cn('mb-2 font-bold text-2xl', stageInfo.textColor)}>
                {stageInfo.title}
              </h2>
              <p className="text-gray-600">{stageInfo.description}</p>
            </div>
            <div className="text-right">
              <div className="text-gray-500 text-sm">Career Progress</div>
              <div className={cn('font-bold text-3xl', stageInfo.textColor)}>
                {['exploration', 'early', 'mid', 'late', 'transition'].indexOf(careerStage) + 1}/5
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Career Paths</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{careerPaths.length}</div>
            <p className="text-muted-foreground text-xs">Recommended paths available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{goals.length}</div>
            <p className="text-muted-foreground text-xs">{completedGoalsCount} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{goalCompletionRate}%</div>
            <Progress value={goalCompletionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest career planning activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {goals.slice(0, 3).map((goal) => (
              <div key={goal.id} className="flex items-center space-x-4">
                <div
                  className={cn(
                    'h-2 w-2 rounded-full',
                    goal.completed ? 'bg-green-500' : 'bg-yellow-500'
                  )}
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{goal.text}</p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(goal.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={goal.completed ? 'default' : 'secondary'}>
                  {goal.completed ? 'Completed' : 'In Progress'}
                </Badge>
              </div>
            ))}
            {goals.length === 0 && (
              <p className="py-4 text-center text-muted-foreground text-sm">
                No goals set yet. Start by setting your first career goal!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  /**
   * Render Career Paths Tab
   */
  const renderPathsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl">Recommended Career Paths</h2>
          <p className="text-muted-foreground">Based on your skills, experience, and interests</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {careerPaths.length} paths available
        </Badge>
      </div>

      {careerPaths.length === 0 ? (
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>No Career Paths Available</AlertTitle>
          <AlertDescription>
            Complete your profile to get personalized career recommendations.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {careerPaths.map((path, index) => (
            <Card key={index} className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      {path.title}
                    </CardTitle>
                    <CardDescription className="mt-2">{path.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 flex items-center font-semibold text-sm">
                    <Award className="mr-1 h-4 w-4" />
                    Required Skills
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {path.requiredSkills.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-muted-foreground text-xs">Growth Potential</span>
                    <div className="flex items-center gap-2">
                      <Progress value={path.growthPotential * 10} className="h-2 w-16" />
                      <span className="font-semibold text-sm">{path.growthPotential}/10</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground text-xs">Salary Range</span>
                    <div className="font-semibold text-green-600">{path.salaryRange}</div>
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Explore Path
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  /**
   * Render Goals Tab
   */
  const renderGoalsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl">Career Goals & Milestones</h2>
          <p className="text-muted-foreground">Set and track your career objectives</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => addGoal('short')} size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Short Term
          </Button>
          <Button onClick={() => addGoal('mid')} size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Mid Term
          </Button>
          <Button onClick={() => addGoal('long')} size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Long Term
          </Button>
        </div>
      </div>

      {goals.length === 0 ? (
        <Alert>
          <Target className="h-4 w-4" />
          <AlertTitle>No Goals Set Yet</AlertTitle>
          <AlertDescription>
            Start by adding your career goals using the buttons above.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const goalTypeColors = {
              short: 'bg-green-500 text-white',
              mid: 'bg-yellow-500 text-white',
              long: 'bg-blue-500 text-white',
            };
            const goalTypeLabels = {
              short: 'Short Term',
              mid: 'Mid Term',
              long: 'Long Term',
            };

            return (
              <Card
                key={goal.id}
                className={cn(
                  'transition-all duration-200',
                  goal.completed && 'bg-green-50/50 opacity-75'
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-1 items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleGoalCompletion(goal.id)}
                        className="h-auto p-0"
                      >
                        {goal.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                        )}
                      </Button>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center space-x-2">
                          <Badge className={goalTypeColors[goal.type]}>
                            {goalTypeLabels[goal.type]}
                          </Badge>
                          <span className="text-muted-foreground text-xs">
                            {new Date(goal.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span
                          className={cn(
                            'text-sm',
                            goal.completed
                              ? 'text-muted-foreground line-through'
                              : 'text-foreground'
                          )}
                        >
                          {goal.text}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => removeGoal(goal.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-50 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  /**
   * Render placeholder for other tabs
   */
  const renderPlaceholderTab = (title: string, description: string, icon: React.ElementType) => {
    const Icon = icon;
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <Icon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold text-xl">{title}</h3>
            <p className="mb-4 text-muted-foreground">{description}</p>
            <Badge variant="secondary">Coming Soon</Badge>
          </CardContent>
        </Card>
      </div>
    );
  };

  /**
   * Render tab content based on active tab
   */
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'paths':
        return renderPathsTab();
      case 'goals':
        return renderGoalsTab();
      case 'skills':
        return renderPlaceholderTab(
          'Skills Development',
          'Identify and develop key competencies',
          Award
        );
      case 'learning':
        return renderPlaceholderTab(
          'Learning Resources',
          'Courses, certifications, and training',
          BookOpen
        );
      case 'insights':
        return renderPlaceholderTab(
          'AI Insights',
          'Personalized career recommendations',
          Lightbulb
        );
      case 'progress':
        return renderPlaceholderTab(
          'Progress Tracking',
          'Monitor your career advancement',
          TrendingUp
        );
      case 'timeline':
        return renderPlaceholderTab('Career Timeline', 'Visualize your career journey', Calendar);
      default:
        return renderOverviewTab();
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <CareerPlanningSidebar
          activeTab={activeTab}
          setActiveTab={(value) => setActiveTab(value as TabContent)}
          careerStage={careerStage}
          userData={userData}
          goalsCount={goals.length}
          completedGoalsCount={completedGoalsCount}
          careerPathsCount={careerPaths.length}
          isLoading={loading}
          onBackToQuestionnaire={onBackToQuestionnaire ?? (() => {})}
          userName={userName}
          userPhotoURL={userPhotoURL ?? null}
        />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white/80 px-4 backdrop-blur-sm">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Career Planning</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{breadcrumbInfo.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <main className="flex-1 p-6">
            <div className="mx-auto max-w-6xl">{renderTabContent()}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
