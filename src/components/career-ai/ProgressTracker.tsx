'use client'

import { useState, useEffect } from 'react'
import { Goal, CareerReport, SkillAssessment, CareerReminder } from '@/lib/types'
import { generateCareerReport, getSkillAssessments, getCareerReminders } from '@/services/careerService'

interface ProgressTrackerProps {
  goals: Goal[]
  careerStage: string
}

export default function ProgressTracker({ goals, careerStage }: ProgressTrackerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'reports' | 'reminders'>('overview')
  const [skillAssessments, setSkillAssessments] = useState<SkillAssessment[]>([])
  const [reminders, setReminders] = useState<CareerReminder[]>([])
  const [reports, setReports] = useState<CareerReport[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [skillsData, remindersData] = await Promise.all([
        getSkillAssessments(),
        getCareerReminders()
      ])
      setSkillAssessments(skillsData)
      setReminders(remindersData)
    } catch (error) {
      console.error('Failed to load progress data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async (type: 'skills' | 'progress' | 'market' | 'goals') => {
    try {
      setLoading(true)
      const report = await generateCareerReport(type, { goals, skillAssessments, careerStage })
      setReports(prev => [report, ...prev])
      setActiveTab('reports')
    } catch (error) {
      console.error('Failed to generate report:', error)
    } finally {
      setLoading(false)
    }
  }

  const completeReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: true } : r))
  }

  const getGoalStats = () => {
    const total = goals.length
    const completed = goals.filter(g => g.completed).length
    const inProgress = goals.filter(g => !g.completed && g.progress > 0).length
    const overdue = goals.filter(g => 
      g.targetDate && 
      new Date(g.targetDate) < new Date() && 
      !g.completed
    ).length

    return { total, completed, inProgress, overdue }
  }

  const getSkillProgress = () => {
    return skillAssessments.map(skill => ({
      ...skill,
      progressPercentage: Math.round((skill.currentLevel / skill.targetLevel) * 100)
    }))
  }

  const goalStats = getGoalStats()
  const skillProgress = getSkillProgress()

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="tabs tabs-boxed bg-base-200 p-1">
        <button
          className={`tab tab-lg flex-1 ${activeTab === 'overview' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Overview
        </button>
        <button
          className={`tab tab-lg flex-1 ${activeTab === 'skills' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Skills
        </button>
        <button
          className={`tab tab-lg flex-1 ${activeTab === 'reports' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Reports ({reports.length})
        </button>
        <button
          className={`tab tab-lg flex-1 ${activeTab === 'reminders' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('reminders')}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM12 17H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V12" />
          </svg>
          Reminders ({reminders.filter(r => !r.completed).length})
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Goal Statistics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stat bg-base-100 shadow rounded-lg">
              <div className="stat-figure text-primary">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="stat-title">Total Goals</div>
              <div className="stat-value text-primary">{goalStats.total}</div>
              <div className="stat-desc">Career objectives set</div>
            </div>

            <div className="stat bg-base-100 shadow rounded-lg">
              <div className="stat-figure text-success">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="stat-title">Completed</div>
              <div className="stat-value text-success">{goalStats.completed}</div>
              <div className="stat-desc">
                {goalStats.total > 0 ? Math.round((goalStats.completed / goalStats.total) * 100) : 0}% completion rate
              </div>
            </div>

            <div className="stat bg-base-100 shadow rounded-lg">
              <div className="stat-figure text-warning">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="stat-title">In Progress</div>
              <div className="stat-value text-warning">{goalStats.inProgress}</div>
              <div className="stat-desc">Active goals</div>
            </div>

            <div className="stat bg-base-100 shadow rounded-lg">
              <div className="stat-figure text-error">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="stat-title">Overdue</div>
              <div className="stat-value text-error">{goalStats.overdue}</div>
              <div className="stat-desc">Need attention</div>
            </div>
          </div>

          {/* Recent Progress */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title mb-4">Recent Progress</h3>
              {goals.length === 0 ? (
                <p className="text-base-content/60">No goals to track yet. Add some goals to see your progress!</p>
              ) : (
                <div className="space-y-3">
                  {goals.slice(0, 5).map(goal => (
                    <div key={goal.id} className="flex items-center justify-between p-3 bg-base-200 rounded">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{goal.text}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <progress 
                            className="progress progress-primary w-32" 
                            value={goal.progress} 
                            max="100"
                          />
                          <span className="text-xs text-base-content/60">{goal.progress}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`badge badge-sm ${
                          goal.completed ? 'badge-success' : 
                          goal.progress > 0 ? 'badge-warning' : 'badge-ghost'
                        }`}>
                          {goal.completed ? 'Done' : goal.progress > 0 ? 'Active' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Generate Reports */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title mb-4">Generate AI Reports</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={() => generateReport('progress')}
                  disabled={loading}
                  className="btn btn-outline"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Progress Report
                </button>
                <button
                  onClick={() => generateReport('skills')}
                  disabled={loading}
                  className="btn btn-outline"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Skills Analysis
                </button>
                <button
                  onClick={() => generateReport('market')}
                  disabled={loading}
                  className="btn btn-outline"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Market Analysis
                </button>
                <button
                  onClick={() => generateReport('goals')}
                  disabled={loading}
                  className="btn btn-outline"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Goals Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Skills Tab */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title mb-4">Skills Development Tracking</h3>
              {skillProgress.length === 0 ? (
                <p className="text-base-content/60">No skills being tracked yet.</p>
              ) : (
                <div className="space-y-4">
                  {skillProgress.map((skill, index) => (
                    <div key={index} className="p-4 bg-base-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{skill.skill}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`badge badge-sm ${
                            skill.marketDemand === 'high' ? 'badge-success' :
                            skill.marketDemand === 'medium' ? 'badge-warning' : 'badge-info'
                          }`}>
                            {skill.marketDemand} demand
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">Current Level: {skill.currentLevel}/10</span>
                            <span className="text-sm">Target: {skill.targetLevel}/10</span>
                          </div>
                          <progress 
                            className="progress progress-primary w-full" 
                            value={skill.progressPercentage} 
                            max="100"
                          />
                          <div className="text-xs text-base-content/60 mt-1">
                            {skill.progressPercentage}% to target
                          </div>
                        </div>
                      </div>

                      {skill.resources.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Learning Resources:</p>
                          <div className="flex flex-wrap gap-1">
                            {skill.resources.map((resource, i) => (
                              <span key={i} className="badge badge-outline badge-sm">
                                {resource}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {reports.length === 0 ? (
            <div className="alert alert-info">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-bold">No Reports Generated Yet</h3>
                <div className="text-xs">Generate your first AI-powered career report from the Overview tab.</div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map(report => (
                <div key={report.id} className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="card-title">{report.title}</h3>
                      <span className="text-sm text-base-content/60">
                        {new Date(report.generatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {report.data.insights && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Key Insights:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {report.data.insights.map((insight, i) => (
                            <li key={i} className="text-base-content/80">{insight}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {report.data.recommendations && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Recommendations:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {report.data.recommendations.map((rec, i) => (
                            <li key={i} className="text-base-content/80">{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {report.data.metrics && (
                      <div>
                        <h4 className="font-medium mb-2">Metrics:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(report.data.metrics).map(([key, value]) => (
                            <div key={key} className="text-center p-3 bg-base-200 rounded">
                              <div className="text-2xl font-bold text-primary">{value}%</div>
                              <div className="text-xs text-base-content/60 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reminders Tab */}
      {activeTab === 'reminders' && (
        <div className="space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title mb-4">Career Reminders</h3>
              {reminders.length === 0 ? (
                <p className="text-base-content/60">No reminders set up yet.</p>
              ) : (
                <div className="space-y-3">
                  {reminders.map(reminder => (
                    <div key={reminder.id} className={`p-4 rounded-lg border-l-4 ${
                      reminder.completed ? 'bg-base-200 border-success opacity-75' : 
                      new Date(reminder.scheduledFor) < new Date() ? 'bg-error/10 border-error' :
                      'bg-base-200 border-warning'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className={`font-medium ${reminder.completed ? 'line-through' : ''}`}>
                              {reminder.title}
                            </h4>
                            <span className={`badge badge-sm ${
                              reminder.type === 'goal_check' ? 'badge-primary' :
                              reminder.type === 'skill_update' ? 'badge-secondary' :
                              reminder.type === 'market_research' ? 'badge-accent' :
                              'badge-info'
                            }`}>
                              {reminder.type.replace('_', ' ')}
                            </span>
                            {reminder.recurring && (
                              <span className="badge badge-outline badge-xs">
                                {reminder.frequency}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-base-content/70 mb-2">
                            {reminder.description}
                          </p>
                          <div className="text-xs text-base-content/60">
                            Scheduled for: {new Date(reminder.scheduledFor).toLocaleDateString()}
                            {new Date(reminder.scheduledFor) < new Date() && !reminder.completed && (
                              <span className="text-error ml-2 font-medium">OVERDUE</span>
                            )}
                          </div>
                        </div>
                        {!reminder.completed && (
                          <button
                            onClick={() => completeReminder(reminder.id)}
                            className="btn btn-success btn-sm"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-xl">
            <div className="flex items-center space-x-3">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <span>Generating AI insights...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}