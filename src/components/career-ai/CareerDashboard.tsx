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

export default function CareerDashboard({ userData }: CareerDashboardProps) {
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
      setGoals([...goals, { 
        id: Date.now(), 
        type, 
        text: goalText.trim(), 
        completed: false,
        createdAt: new Date().toISOString(),
        actionSteps: []
      }])
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
      <div className="flex flex-col items-center justify-center py-12">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="mt-4 text-base-content/60">Loading your career insights...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <div>
          <h3 className="font-bold">Error Loading Career Data</h3>
          <div className="text-xs">{error}</div>
        </div>
      </div>
    )
  }

  const stageInfo = getCareerStageInfo(careerStage)

  return (
    <div className="space-y-6">
      {/* Career Stage Card */}
      <div className={`card bg-base-100 shadow-xl border-l-4 border-${stageInfo.color}`}>
        <div className="card-body">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{stageInfo.icon}</span>
            <div>
              <h2 className="card-title text-2xl">
                Your Current Career Stage: {stageInfo.title}
              </h2>
              <p className="text-base-content/70">{stageInfo.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs tabs-boxed bg-base-200 p-1">
        <button
          className={`tab tab-lg flex-1 ${activeTab === 'paths' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('paths')}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Career Paths
        </button>
        <button
          className={`tab tab-lg flex-1 ${activeTab === 'goals' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Goals ({goals.length})
        </button>
        <button
          className={`tab tab-lg flex-1 ${activeTab === 'progress' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Progress
        </button>
      </div>

      {/* Career Paths Tab */}
      {activeTab === 'paths' && (
        <div className="space-y-4">
          {careerPaths.length === 0 ? (
            <div className="alert alert-info">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-bold">No Career Paths Available</h3>
                <div className="text-xs">Complete your profile to get personalized career recommendations.</div>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {careerPaths.map((path, index) => (
                <div key={index} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  <div className="card-body">
                    <h3 className="card-title text-xl mb-3 flex items-center">
                      <span className="badge badge-primary badge-sm mr-2">{index + 1}</span>
                      {path.title}
                    </h3>
                    <p className="text-base-content/70 mb-4">{path.description}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          Required Skills
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {path.requiredSkills.map((skill, i) => (
                            <span key={i} className="badge badge-outline badge-sm">{skill}</span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-xs text-base-content/60">Growth Potential</span>
                          <div className="flex items-center">
                            <progress 
                              className="progress progress-success w-16 h-2" 
                              value={path.growthPotential} 
                              max="10"
                            />
                            <span className="text-xs ml-2 font-semibold">{path.growthPotential}/10</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-base-content/60">Salary Range</span>
                          <div className="font-semibold text-success">{path.salaryRange}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          {/* Add Goal Buttons */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title mb-4">Add New Goals</h3>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => addGoal('short')}
                  className="btn btn-success btn-sm"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Short Term (3-6 months)
                </button>
                <button 
                  onClick={() => addGoal('mid')}
                  className="btn btn-warning btn-sm"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Mid Term (6-12 months)
                </button>
                <button 
                  onClick={() => addGoal('long')}
                  className="btn btn-primary btn-sm"
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
            <div className="alert alert-info">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-bold">No Goals Set Yet</h3>
                <div className="text-xs">Start by adding your career goals using the buttons above.</div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {goals.map(goal => {
                const goalTypeColors = {
                  short: 'success',
                  mid: 'warning', 
                  long: 'primary'
                }
                const goalTypeLabels = {
                  short: 'Short Term',
                  mid: 'Mid Term',
                  long: 'Long Term'
                }
                
                return (
                  <div key={goal.id} className={`card bg-base-100 shadow-md ${goal.completed ? 'opacity-75' : ''}`}>
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
                              <span className={`badge badge-${goalTypeColors[goal.type]} badge-sm`}>
                                {goalTypeLabels[goal.type]}
                              </span>
                              <span className="text-xs text-base-content/60">
                                {new Date(goal.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <span className={`${goal.completed ? 'line-through text-base-content/50' : 'text-base-content'}`}>
                              {goal.text}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeGoal(goal.id)}
                          className="btn btn-ghost btn-sm btn-circle text-error hover:bg-error/10"
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
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Goals Progress
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Completed Goals</span>
                    <span className="font-bold text-2xl text-success">
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
                  <div className="text-sm text-base-content/60">
                    {goals.length === 0 
                      ? 'No goals set yet'
                      : `${Math.round((goals.filter(g => g.completed).length / goals.length) * 100)}% completion rate`
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Development */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Skills to Develop
                </h3>
                {careerPaths.length === 0 ? (
                  <p className="text-base-content/60 text-sm">Complete your profile to see skill recommendations.</p>
                ) : (
                  <div className="space-y-2">
                    {careerPaths.flatMap(p => p.requiredSkills)
                      .filter((skill, i, arr) => arr.indexOf(skill) === i)
                      .slice(0, 8) // Show top 8 skills
                      .map((skill, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-base-200 rounded">
                          <span className="text-sm">{skill}</span>
                          <span className="badge badge-outline badge-xs">Recommended</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Career Stage Progress */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title mb-4">
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
                      <div className="text-xs font-medium">{stageData.title}</div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-base-content/70">
                  You are currently in the <strong>{stageInfo.title}</strong> stage
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
