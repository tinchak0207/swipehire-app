'use client';

import { useEffect, useState } from 'react';
import type { CandidateProfileForAI, CareerPath, CareerStage, Goal } from '@/lib/types';
import { getCareerRecommendations } from '@/services/careerService';

interface CareerDashboardProps {
  userData: {
    education: string;
    experience: string[];
    skills: string[];
    interests: string[];
    values: string[];
    careerExpectations: string;
  };
  onBackToQuestionnaire?: (() => void) | undefined;
  userName?: string | null;
  userPhotoURL?: string | null;
}

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

export default function CareerDashboard({ userData, onBackToQuestionnaire }: CareerDashboardProps) {
  const [careerStage, setCareerStage] = useState<CareerStage>('early');
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeTab, setActiveTab] = useState<'paths' | 'goals' | 'progress'>('paths');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true);
        setError(null);

        // Convert userData to CandidateProfileForAI format
        const candidateProfile: CandidateProfileForAI = {
          id: 'current-user', // This should come from actual user ID
          role: userData.careerExpectations || 'Software Engineer',
          experienceSummary: userData.experience.join('\n'),
          skills: userData.skills,
          // Map other available fields as needed
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
    }

    fetchRecommendations();
  }, [userData]);

  const addGoal = (type: 'long' | 'mid' | 'short') => {
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
      setGoals([...goals, newGoal]);
    }
  };

  const toggleGoalCompletion = (id: number) => {
    setGoals(
      goals.map((goal) => (goal.id === id ? { ...goal, completed: !goal.completed } : goal))
    );
  };

  const removeGoal = (id: number) => {
    setGoals(goals.filter((goal) => goal.id !== id));
  };

  const getCareerStageInfo = (stage: CareerStage) => {
    const stageInfo = {
      exploration: {
        title: 'Exploration',
        description: 'Discovering your interests and potential career paths',
        color: 'info',
        icon: '🔍',
      },
      early: {
        title: 'Early Career',
        description: 'Building foundational skills and gaining experience',
        color: 'success',
        icon: '🌱',
      },
      mid: {
        title: 'Mid Career',
        description: 'Developing expertise and taking on leadership roles',
        color: 'warning',
        icon: '🚀',
      },
      late: {
        title: 'Late Career',
        description: 'Senior leadership and mentoring others',
        color: 'primary',
        icon: '👑',
      },
      transition: {
        title: 'Career Transition',
        description: 'Changing career paths or industries',
        color: 'secondary',
        icon: '🔄',
      },
    };
    return stageInfo[stage];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="max-w-md rounded-xl border border-white/20 bg-white/80 p-8 shadow-lg backdrop-blur-sm">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />
                <div
                  className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-blue-400"
                  style={{ animationDelay: '150ms' }}
                />
                <div
                  className="absolute inset-2 h-12 w-12 animate-spin rounded-full border-4 border-transparent border-t-purple-400"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
              <div className="text-center">
                <h3 className="mb-2 font-bold text-2xl text-gray-800">Loading Career Insights</h3>
                <p className="mb-4 text-gray-600 text-sm">Analyzing your career data with AI...</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500" />
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
                    style={{ animationDelay: '100ms' }}
                  />
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
                    style={{ animationDelay: '200ms' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="max-w-lg rounded-xl border border-red-200/50 bg-white/80 p-8 shadow-lg backdrop-blur-sm">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-100 to-red-200 shadow-md">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="mb-2 font-bold text-gray-800 text-xl">Unable to Load Career Data</h3>
                <p className="mb-4 text-gray-600 text-sm">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-2 font-semibold text-sm text-white shadow-md transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stageInfo = getCareerStageInfo(careerStage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        {/* Dashboard Header with Back Button */}
        {onBackToQuestionnaire && (
          <div className="rounded-xl border border-white/20 bg-white/80 p-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <button
                onClick={onBackToQuestionnaire}
                className="group flex items-center rounded-lg px-4 py-2 text-gray-700 transition-all duration-300 hover:bg-blue-50/50 hover:text-blue-600"
              >
                <svg
                  className="group-hover:-translate-x-1 mr-2 h-4 w-4 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span className="font-medium">Back to Assessment</span>
              </button>
              <div className="flex items-center rounded-full border border-blue-200/50 bg-gradient-to-r from-blue-50 to-cyan-50 px-3 py-1">
                <svg
                  className="mr-2 h-4 w-4 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium text-blue-700 text-sm">
                  Using Default Profile Data
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Career Assessment Card */}
        <div className="overflow-hidden rounded-xl border border-white/20 bg-white/80 shadow-lg backdrop-blur-sm">
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 p-8">
            <div className="flex items-center space-x-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white/20 shadow-lg backdrop-blur-sm">
                <span className="text-4xl">👑</span>
              </div>
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <h1 className="font-bold text-3xl text-white">Career Stage: {stageInfo.title}</h1>
                  <div className="rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
                    <span className="font-semibold text-sm text-white">{stageInfo.icon}</span>
                  </div>
                </div>
                <p className="mb-4 text-lg text-yellow-100">{stageInfo.description}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 animate-pulse rounded-full bg-white" />
                    <span className="font-medium text-sm text-white/90">AI-Powered Analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                    <span className="font-medium text-sm text-white/90">Personalized Insights</span>
                  </div>
                </div>
              </div>
              <div className="hidden items-center space-x-4 md:flex">
                <div className="text-right">
                  <div className="mb-1 font-medium text-sm text-white/80">Career Progress</div>
                  <div className="font-bold text-3xl text-white">
                    {['exploration', 'early', 'mid', 'late', 'transition'].indexOf(careerStage) + 1}
                    /5
                  </div>
                  <div className="text-white/70 text-xs">Stages Complete</div>
                </div>
                <div className="h-20 w-3 overflow-hidden rounded-full bg-white/20 shadow-inner">
                  <div
                    className="rounded-full bg-gradient-to-t from-white to-yellow-200 shadow-sm transition-all duration-1000 ease-out"
                    style={{
                      height: `${((['exploration', 'early', 'mid', 'late', 'transition'].indexOf(careerStage) + 1) / 5) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="rounded-xl border border-white/20 bg-white/80 p-3 shadow-lg backdrop-blur-sm">
          <div className="flex space-x-3">
            <button
              className={`flex flex-1 items-center justify-center rounded-xl px-6 py-4 font-semibold transition-all duration-300 ${
                activeTab === 'paths'
                  ? 'scale-[1.02] transform bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-blue-600 hover:shadow-md'
              }`}
              onClick={() => setActiveTab('paths')}
            >
              <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              <span className="font-semibold">Career Paths</span>
              <div
                className={`ml-2 h-2 w-2 rounded-full ${
                  activeTab === 'paths' ? 'bg-white/40' : 'bg-blue-500'
                }`}
              />
            </button>
            <button
              className={`flex flex-1 items-center justify-center rounded-xl px-6 py-4 font-semibold transition-all duration-300 ${
                activeTab === 'goals'
                  ? 'scale-[1.02] transform bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-600 hover:shadow-md'
              }`}
              onClick={() => setActiveTab('goals')}
            >
              <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-semibold">Goals</span>
              {goals.length > 0 && (
                <span
                  className={`ml-2 rounded-full px-2 py-1 font-bold text-xs ${
                    activeTab === 'goals' ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
                  }`}
                >
                  {goals.length}
                </span>
              )}
            </button>
            <button
              className={`flex flex-1 items-center justify-center rounded-xl px-6 py-4 font-semibold transition-all duration-300 ${
                activeTab === 'progress'
                  ? 'scale-[1.02] transform bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:text-purple-600 hover:shadow-md'
              }`}
              onClick={() => setActiveTab('progress')}
            >
              <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span className="font-semibold">Progress</span>
              <div
                className={`ml-2 h-2 w-2 rounded-full ${
                  activeTab === 'progress' ? 'bg-white/40' : 'bg-purple-500'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Career Paths Tab */}

        <div className="space-y-4" />
        {careerPaths.length === 0 ? (
          <div className="alert alert-info border border-blue-200 bg-white text-blue-800">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-bold text-blue-800">No Career Paths Available</h3>
              <div className="text-blue-600 text-xs">
                Complete your profile to get personalized career recommendations.
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {careerPaths.map((path, index) => (
              <div
                key={index}
                className="card border border-gray-200 bg-white shadow-xl transition-shadow duration-300 hover:shadow-2xl"
              >
                <div className="card-body">
                  <h3 className="card-title mb-3 flex items-center text-gray-800 text-xl">
                    <span className="badge badge-primary badge-sm mr-2 border-blue-500 bg-blue-500 text-white">
                      {index + 1}
                    </span>
                    {path.title}
                  </h3>
                  <p className="mb-4 text-gray-600">{path.description}</p>

                  <div className="space-y-3">
                    <div>
                      <h4 className="mb-2 flex items-center font-semibold text-gray-700 text-sm">
                        <svg
                          className="mr-1 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                        Required Skills
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {path.requiredSkills.map((skill, i) => (
                          <span
                            key={i}
                            className="badge badge-outline badge-sm border-gray-300 bg-white text-gray-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-gray-500 text-xs">Growth Potential</span>
                        <div className="flex items-center">
                          <progress
                            className="progress progress-success h-2 w-16"
                            value={path.growthPotential}
                            max="10"
                          />
                          <span className="ml-2 font-semibold text-gray-700 text-xs">
                            {path.growthPotential}/10
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-500 text-xs">Salary Range</span>
                        <div className="font-semibold text-green-600">{path.salaryRange}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          {/* Add Goal Buttons */}
          <div className="card border border-gray-200 bg-white shadow-xl">
            <div className="card-body">
              <h3 className="card-title mb-4 text-gray-800">Add New Goals</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => addGoal('short')}
                  className="btn btn-success btn-sm border-green-500 bg-green-500 text-white hover:bg-green-600"
                >
                  <svg
                    className="mr-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Short Term (3-6 months)
                </button>
                <button
                  onClick={() => addGoal('mid')}
                  className="btn btn-warning btn-sm border-yellow-500 bg-yellow-500 text-white hover:bg-yellow-600"
                >
                  <svg
                    className="mr-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Mid Term (6-12 months)
                </button>
                <button
                  onClick={() => addGoal('long')}
                  className="btn btn-primary btn-sm border-blue-500 bg-blue-500 text-white hover:bg-blue-600"
                >
                  <svg
                    className="mr-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Long Term (1+ years)
                </button>
              </div>
            </div>
          </div>

          {/* Goals List */}
          {goals.length === 0 ? (
            <div className="alert alert-info border border-blue-200 bg-white text-blue-800">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="font-bold text-blue-800">No Goals Set Yet</h3>
                <div className="text-blue-600 text-xs">
                  Start by adding your career goals using the buttons above.
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
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
                  <div
                    key={goal.id}
                    className={`card border border-gray-200 bg-white shadow-md ${goal.completed ? 'opacity-75' : ''}`}
                  >
                    <div className="card-body p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-1 items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={goal.completed}
                            onChange={() => toggleGoalCompletion(goal.id)}
                            className="checkbox checkbox-primary"
                          />
                          <div className="flex-1">
                            <div className="mb-1 flex items-center space-x-2">
                              <span className={`badge badge-sm ${goalTypeColors[goal.type]}`}>
                                {goalTypeLabels[goal.type]}
                              </span>
                              <span className="text-gray-500 text-xs">
                                {new Date(goal.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <span
                              className={`${goal.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}
                            >
                              {goal.text}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeGoal(goal.id)}
                          className="btn btn-ghost btn-sm btn-circle text-red-500 hover:bg-red-50"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Progress Tab */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Goals Progress */}
            <div className="card border border-gray-200 bg-white shadow-xl">
              <div className="card-body">
                <h3 className="card-title mb-4 text-gray-800">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Goals Progress
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Completed Goals</span>
                    <span className="font-bold text-2xl text-green-600">
                      {goals.filter((g) => g.completed).length} / {goals.length}
                    </span>
                  </div>
                  {goals.length > 0 && (
                    <progress
                      className="progress progress-success w-full"
                      value={goals.filter((g) => g.completed).length}
                      max={goals.length}
                    />
                  )}
                  <div className="text-gray-500 text-sm">
                    {goals.length === 0
                      ? 'No goals set yet'
                      : `${Math.round((goals.filter((g) => g.completed).length / goals.length) * 100)}% completion rate`}
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Development */}
            <div className="card border border-gray-200 bg-white shadow-xl">
              <div className="card-body">
                <h3 className="card-title mb-4 text-gray-800">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  Skills to Develop
                </h3>
                {careerPaths.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    Complete your profile to see skill recommendations.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {careerPaths
                      .flatMap((p) => p.requiredSkills)
                      .filter((skill, i, arr) => arr.indexOf(skill) === i)
                      .slice(0, 8) // Show top 8 skills
                      .map((skill, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 p-2"
                        >
                          <span className="text-gray-700 text-sm">{skill}</span>
                          <span className="badge badge-outline badge-xs border-gray-300 bg-white text-gray-600">
                            Recommended
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Career Stage Progress */}
          <div className="card border border-gray-200 bg-white shadow-xl">
            <div className="card-body">
              <h3 className="card-title mb-4 text-gray-800">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Career Development Journey
              </h3>
              <div className="steps steps-horizontal w-full">
                {(['exploration', 'early', 'mid', 'late', 'transition'] as CareerStage[]).map(
                  (stage, index) => {
                    const stageData = getCareerStageInfo(stage);
                    const isCurrentStage = stage === careerStage;
                    const isPastStage =
                      ['exploration', 'early', 'mid', 'late', 'transition'].indexOf(careerStage) >
                      index;

                    return (
                      <div
                        key={stage}
                        className={`step ${isCurrentStage ? 'step-primary' : isPastStage ? 'step-success' : ''}`}
                        data-content={stageData.icon}
                      >
                        <div className="font-medium text-gray-700 text-xs">{stageData.title}</div>
                      </div>
                    );
                  }
                )}
              </div>
              <div className="mt-4 text-center">
                <p className="text-gray-600 text-sm">
                  You are currently in the{' '}
                  <strong className="text-gray-800">{stageInfo.title}</strong> stage
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
