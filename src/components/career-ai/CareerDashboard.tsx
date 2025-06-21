'use client'

import { useState, useEffect } from 'react'
import { CareerStage, CareerPath, Goal, CandidateProfileForAI } from '@/lib/types'
import { getCareerRecommendations } from '@/services/careerService'

interface CareerDashboardProps {
  userData: {
    education: string
    experience: string[]
    skills: string[]
    interests: string[]
    values: string[]
    careerExpectations: string
  }
  onBackToQuestionnaire?: () => void
}

interface CareerRecommendation {
  careerStage: string
  careerPaths: {
    title: string
    description: string
    requiredSkills: string[]
    growthPotential: number
    salaryRange: string
    educationRequirements: string[]
  }[]
}

export default function CareerDashboard({ userData, onBackToQuestionnaire }: CareerDashboardProps) {
  const [careerStage, setCareerStage] = useState<CareerStage>('early')
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [activeTab, setActiveTab] = useState<'paths' | 'goals' | 'progress'>('paths')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true)
        setError(null)
        
        // Convert userData to CandidateProfileForAI format
        const candidateProfile: CandidateProfileForAI = {
          id: 'current-user', // This should come from actual user ID
          role: userData.careerExpectations || 'Software Engineer',
          experienceSummary: userData.experience.join('\n'),
          skills: userData.skills,
          // Map other available fields as needed
        }
        
        const recommendations: CareerRecommendation = await getCareerRecommendations(candidateProfile)
        
        // Safely set career stage with type checking
        const validCareerStages: CareerStage[] = ['exploration', 'early', 'mid', 'late', 'transition']
        const recommendedStage = recommendations.careerStage as CareerStage
        if (validCareerStages.includes(recommendedStage)) {
          setCareerStage(recommendedStage)
        } else {
          setCareerStage('early') // fallback
        }
        
        // Convert recommendation paths to CareerPath format
        const convertedPaths: CareerPath[] = recommendations.careerPaths.map(path => ({
          title: path.title,
          description: path.description,
          requiredSkills: path.requiredSkills,
          growthPotential: path.growthPotential,
          salaryRange: path.salaryRange,
          educationRequirements: path.educationRequirements,
        }))
        
        setCareerPaths(convertedPaths)
      } catch (error) {
        console.error('Failed to fetch recommendations:', error)
        setError('Failed to load career recommendations. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchRecommendations()
  }, [userData])

  const addGoal = (type: 'long' | 'mid' | 'short') => {
    const goalText = prompt(`Enter your ${type}-term goal:`)
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
        category: type === 'short' ? 'Skills' : type === 'mid' ? 'Career Growth' : 'Long-term Vision'
      }
      setGoals([...goals, newGoal])
    }
  }

  const toggleGoalCompletion = (id: number) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ))
  }

  const removeGoal = (id: number) => {
    setGoals(goals.filter(goal => goal.id !== id))
  }

  const getCareerStageInfo = (stage: CareerStage) => {
    const stageInfo = {
      exploration: { 
        title: 'Exploration', 
        description: 'Discovering your interests and potential career paths',
        color: 'info',
        icon: '🔍'
      },
      early: { 
        title: 'Early Career', 
        description: 'Building foundational skills and gaining experience',
        color: 'success',
        icon: '🌱'
      },
      mid: { 
        title: 'Mid Career', 
        description: 'Developing expertise and taking on leadership roles',
        color: 'warning',
        icon: '🚀'
      },
      late: { 
        title: 'Late Career', 
        description: 'Senior leadership and mentoring others',
        color: 'primary',
        icon: '👑'
      },
      transition: { 
        title: 'Career Transition', 
        description: 'Changing career paths or industries',
        color: 'secondary',
        icon: '🔄'
      }
    }
    return stageInfo[stage]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/20 max-w-md">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDelay: '150ms' }}></div>
                <div className="absolute inset-2 w-12 h-12 border-4 border-transparent border-t-purple-400 rounded-full animate-spin" style={{ animationDelay: '300ms' }}></div>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Loading Career Insights</h3>
                <p className="text-sm text-gray-600 mb-4">Analyzing your career data with AI...</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-red-200/50 max-w-lg">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Career Data</h3>
                <p className="text-sm text-gray-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const stageInfo = getCareerStageInfo(careerStage)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Dashboard Header with Back Button */}
        {onBackToQuestionnaire && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <button
                onClick={onBackToQuestionnaire}
                className="group flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 transition-all duration-300 rounded-lg hover:bg-blue-50/50"
              >
                <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-medium">Back to Assessment</span>
              </button>
              <div className="flex items-center px-3 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-full border border-blue-200/50">
                <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-blue-700">Using Default Profile Data</span>
              </div>
            </div>
          </div>
        )}

        {/* Career Assessment Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 p-8">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-4xl">👑</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">
                    Career Stage: {stageInfo.title}
                  </h1>
                  <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                    <span className="text-sm font-semibold text-white">{stageInfo.icon}</span>
                  </div>
                </div>
                <p className="text-yellow-100 text-lg mb-4">{stageInfo.description}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    <span className="text-white/90 text-sm font-medium">AI-Powered Analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-white/90 text-sm font-medium">Personalized Insights</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-white/80 text-sm font-medium mb-1">Career Progress</div>
                  <div className="text-3xl font-bold text-white">
                    {['exploration', 'early', 'mid', 'late', 'transition'].indexOf(careerStage) + 1}/5
                  </div>
                  <div className="text-white/70 text-xs">Stages Complete</div>
                </div>
                <div className="w-3 h-20 bg-white/20 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="bg-gradient-to-t from-white to-yellow-200 rounded-full transition-all duration-1000 ease-out shadow-sm"
                    style={{ 
                      height: `${(((['exploration', 'early', 'mid', 'late', 'transition'].indexOf(careerStage) + 1) / 5) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Navigation Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/20">
          <div className="flex space-x-3">
            <button
              className={`flex-1 flex items-center justify-center px-6 py-4 rounded-xl transition-all duration-300 font-semibold ${
                activeTab === 'paths' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-[1.02]' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:shadow-md'
              }`}
              onClick={() => setActiveTab('paths')}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span className="font-semibold">Career Paths</span>
              <div className={`ml-2 w-2 h-2 rounded-full ${
                activeTab === 'paths' ? 'bg-white/40' : 'bg-blue-500'
              }`}></div>
            </button>
            <button
              className={`flex-1 flex items-center justify-center px-6 py-4 rounded-xl transition-all duration-300 font-semibold ${
                activeTab === 'goals' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-[1.02]' 
                  : 'text-gray-700 hover:text-green-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:shadow-md'
              }`}
              onClick={() => setActiveTab('goals')}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">Goals</span>
              {goals.length > 0 && (
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
                  activeTab === 'goals' ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
                }`}>
                  {goals.length}
                </span>
              )}
            </button>
            <button
              className={`flex-1 flex items-center justify-center px-6 py-4 rounded-xl transition-all duration-300 font-semibold ${
                activeTab === 'progress' 
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg transform scale-[1.02]' 
                  : 'text-gray-700 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:shadow-md'
              }`}
              onClick={() => setActiveTab('progress')}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="font-semibold">Progress</span>
              <div className={`ml-2 w-2 h-2 rounded-full ${
                activeTab === 'progress' ? 'bg-white/40' : 'bg-purple-500'
              }`}></div>
            </button>
          </div>
        </div>

      {/* Career Paths Tab */}
      
        <div className="space-y-4">
        </div>
          {careerPaths.length === 0 ? (
            <div className="alert alert-info bg-white border border-blue-200 text-blue-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-bold text-blue-800">No Career Paths Available</h3>
                <div className="text-xs text-blue-600">Complete your profile to get personalized career recommendations.</div>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {careerPaths.map((path, index) => (
                <div key={index} className="card bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-gray-200">
                  <div className="card-body">
                    <h3 className="card-title text-xl mb-3 flex items-center text-gray-800">
                      <span className="badge badge-primary badge-sm mr-2 bg-blue-500 text-white border-blue-500">{index + 1}</span>
                      {path.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{path.description}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center text-gray-700">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          Required Skills
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {path.requiredSkills.map((skill, i) => (
                            <span key={i} className="badge badge-outline badge-sm bg-white text-gray-700 border-gray-300">{skill}</span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-xs text-gray-500">Growth Potential</span>
                          <div className="flex items-center">
                            <progress 
                              className="progress progress-success w-16 h-2" 
                              value={path.growthPotential} 
                              max="10"
                            />
                            <span className="text-xs ml-2 font-semibold text-gray-700">{path.growthPotential}/10</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-500">Salary Range</span>
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
          <div className="card bg-white shadow-xl border border-gray-200">
            <div className="card-body">
              <h3 className="card-title mb-4 text-gray-800">Add New Goals</h3>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => addGoal('short')}
                  className="btn btn-success btn-sm bg-green-500 text-white border-green-500 hover:bg-green-600"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Short Term (3-6 months)
                </button>
                <button 
                  onClick={() => addGoal('mid')}
                  className="btn btn-warning btn-sm bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Mid Term (6-12 months)
                </button>
                <button 
                  onClick={() => addGoal('long')}
                  className="btn btn-primary btn-sm bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Long Term (1+ years)
                </button>
              </div>
            </div>
          </div>

          {/* Goals List */}
          {goals.length === 0 ? (
            <div className="alert alert-info bg-white border border-blue-200 text-blue-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-bold text-blue-800">No Goals Set Yet</h3>
                <div className="text-xs text-blue-600">Start by adding your career goals using the buttons above.</div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {goals.map(goal => {
                const goalTypeColors = {
                  short: 'bg-green-500 text-white',
                  mid: 'bg-yellow-500 text-white', 
                  long: 'bg-blue-500 text-white'
                }
                const goalTypeLabels = {
                  short: 'Short Term',
                  mid: 'Mid Term',
                  long: 'Long Term'
                }
                
                return (
                  <div key={goal.id} className={`card bg-white shadow-md border border-gray-200 ${goal.completed ? 'opacity-75' : ''}`}>
                    <div className="card-body p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <input
                            type="checkbox"
                            checked={goal.completed}
                            onChange={() => toggleGoalCompletion(goal.id)}
                            className="checkbox checkbox-primary"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`badge badge-sm ${goalTypeColors[goal.type]}`}>
                                {goalTypeLabels[goal.type]}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(goal.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <span className={`${goal.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                              {goal.text}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeGoal(goal.id)}
                          className="btn btn-ghost btn-sm btn-circle text-red-500 hover:bg-red-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Progress Tab */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Goals Progress */}
            <div className="card bg-white shadow-xl border border-gray-200">
              <div className="card-body">
                <h3 className="card-title mb-4 text-gray-800">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Goals Progress
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Completed Goals</span>
                    <span className="font-bold text-2xl text-green-600">
                      {goals.filter(g => g.completed).length} / {goals.length}
                    </span>
                  </div>
                  {goals.length > 0 && (
                    <progress 
                      className="progress progress-success w-full" 
                      value={goals.filter(g => g.completed).length} 
                      max={goals.length}
                    />
                  )}
                  <div className="text-sm text-gray-500">
                    {goals.length === 0 
                      ? 'No goals set yet'
                      : `${Math.round((goals.filter(g => g.completed).length / goals.length) * 100)}% completion rate`
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Development */}
            <div className="card bg-white shadow-xl border border-gray-200">
              <div className="card-body">
                <h3 className="card-title mb-4 text-gray-800">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Skills to Develop
                </h3>
                {careerPaths.length === 0 ? (
                  <p className="text-gray-500 text-sm">Complete your profile to see skill recommendations.</p>
                ) : (
                  <div className="space-y-2">
                    {careerPaths.flatMap(p => p.requiredSkills)
                      .filter((skill, i, arr) => arr.indexOf(skill) === i)
                      .slice(0, 8) // Show top 8 skills
                      .map((skill, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                          <span className="text-sm text-gray-700">{skill}</span>
                          <span className="badge badge-outline badge-xs bg-white text-gray-600 border-gray-300">Recommended</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Career Stage Progress */}
          <div className="card bg-white shadow-xl border border-gray-200">
            <div className="card-body">
              <h3 className="card-title mb-4 text-gray-800">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Career Development Journey
              </h3>
              <div className="steps steps-horizontal w-full">
                {(['exploration', 'early', 'mid', 'late', 'transition'] as CareerStage[]).map((stage, index) => {
                  const stageData = getCareerStageInfo(stage)
                  const isCurrentStage = stage === careerStage
                  const isPastStage = ['exploration', 'early', 'mid', 'late', 'transition'].indexOf(careerStage) > index
                  
                  return (
                    <div 
                      key={stage} 
                      className={`step ${isCurrentStage ? 'step-primary' : isPastStage ? 'step-success' : ''}`}
                      data-content={stageData.icon}
                    >
                      <div className="text-xs font-medium text-gray-700">{stageData.title}</div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  You are currently in the <strong className="text-gray-800">{stageInfo.title}</strong> stage
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
