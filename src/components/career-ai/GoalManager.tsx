'use client'

import { useState, useEffect } from 'react'
import { Goal, ActionStep } from '@/lib/types'
import { generateActionPlan } from '@/services/careerService'

interface GoalManagerProps {
  goals: Goal[]
  onGoalsUpdate: (goals: Goal[]) => void
}

export default function GoalManager({ goals, onGoalsUpdate }: GoalManagerProps) {
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [newGoal, setNewGoal] = useState({
    type: 'short' as 'long' | 'mid' | 'short',
    text: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    targetDate: ''
  })
  const [expandedGoal, setExpandedGoal] = useState<number | null>(null)
  const [loadingActionPlan, setLoadingActionPlan] = useState<number | null>(null)

  const addGoal = async () => {
    if (!newGoal.text.trim()) return

    const goal: Goal = {
      id: Date.now(),
      type: newGoal.type,
      text: newGoal.text.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      targetDate: newGoal.targetDate || undefined,
      actionSteps: [],
      progress: 0,
      priority: newGoal.priority,
      category: newGoal.category || 'General'
    }

    const updatedGoals = [...goals, goal]
    onGoalsUpdate(updatedGoals)
    
    setNewGoal({
      type: 'short',
      text: '',
      category: '',
      priority: 'medium',
      targetDate: ''
    })
    setShowAddGoal(false)

    // Generate action plan
    try {
      setLoadingActionPlan(goal.id)
      const actionSteps = await generateActionPlan(goal)
      const goalsWithActions = updatedGoals.map(g => 
        g.id === goal.id ? { ...g, actionSteps } : g
      )
      onGoalsUpdate(goalsWithActions)
    } catch (error) {
      console.error('Failed to generate action plan:', error)
    } finally {
      setLoadingActionPlan(null)
    }
  }

  const toggleGoalCompletion = (id: number) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === id) {
        const completed = !goal.completed
        const progress = completed ? 100 : calculateProgress(goal.actionSteps)
        return { ...goal, completed, progress }
      }
      return goal
    })
    onGoalsUpdate(updatedGoals)
  }

  const toggleActionStep = (goalId: number, stepId: number) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const updatedSteps = goal.actionSteps.map(step =>
          step.id === stepId ? { ...step, completed: !step.completed } : step
        )
        const progress = calculateProgress(updatedSteps)
        return { ...goal, actionSteps: updatedSteps, progress }
      }
      return goal
    })
    onGoalsUpdate(updatedGoals)
  }

  const removeGoal = (id: number) => {
    onGoalsUpdate(goals.filter(goal => goal.id !== id))
  }

  const calculateProgress = (actionSteps: ActionStep[]): number => {
    if (actionSteps.length === 0) return 0
    const completed = actionSteps.filter(step => step.completed).length
    return Math.round((completed / actionSteps.length) * 100)
  }

  const getGoalTypeInfo = (type: 'long' | 'mid' | 'short') => {
    const typeInfo = {
      short: { 
        label: 'Short Term (3-6 months)', 
        color: 'success',
        icon: '🎯'
      },
      mid: { 
        label: 'Mid Term (6-12 months)', 
        color: 'warning',
        icon: '🚀'
      },
      long: { 
        label: 'Long Term (1+ years)', 
        color: 'primary',
        icon: '🏆'
      }
    }
    return typeInfo[type]
  }

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    const colors = {
      low: 'info',
      medium: 'warning',
      high: 'error'
    }
    return colors[priority]
  }

  const sortedGoals = [...goals].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div className="space-y-6">
      {/* Add Goal Section */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h3 className="card-title">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Goal Management
            </h3>
            <button
              onClick={() => setShowAddGoal(!showAddGoal)}
              className="btn btn-primary btn-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Goal
            </button>
          </div>

          {showAddGoal && (
            <div className="bg-base-200 p-4 rounded-lg space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Goal Type</span>
                  </label>
                  <select
                    value={newGoal.type}
                    onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value as any })}
                    className="select select-bordered w-full"
                  >
                    <option value="short">Short Term (3-6 months)</option>
                    <option value="mid">Mid Term (6-12 months)</option>
                    <option value="long">Long Term (1+ years)</option>
                  </select>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Priority</span>
                  </label>
                  <select
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as any })}
                    className="select select-bordered w-full"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Category</span>
                  </label>
                  <input
                    type="text"
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                    placeholder="e.g., Skills, Leadership, Networking"
                    className="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Target Date (Optional)</span>
                  </label>
                  <input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    className="input input-bordered w-full"
                  />
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Goal Description</span>
                </label>
                <textarea
                  value={newGoal.text}
                  onChange={(e) => setNewGoal({ ...newGoal, text: e.target.value })}
                  placeholder="Describe your goal in detail..."
                  className="textarea textarea-bordered w-full h-24"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={addGoal}
                  disabled={!newGoal.text.trim()}
                  className="btn btn-primary"
                >
                  Create Goal
                </button>
                <button
                  onClick={() => setShowAddGoal(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Goals List */}
      {sortedGoals.length === 0 ? (
        <div className="alert alert-info">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-bold">No Goals Set Yet</h3>
            <div className="text-xs">Start by adding your first career goal using the button above.</div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedGoals.map(goal => {
            const typeInfo = getGoalTypeInfo(goal.type)
            const isExpanded = expandedGoal === goal.id
            const isOverdue = goal.targetDate && new Date(goal.targetDate) < new Date() && !goal.completed

            return (
              <div key={goal.id} className={`card bg-base-100 shadow-md ${goal.completed ? 'opacity-75' : ''} ${isOverdue ? 'border-l-4 border-error' : ''}`}>
                <div className="card-body p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <input
                        type="checkbox"
                        checked={goal.completed}
                        onChange={() => toggleGoalCompletion(goal.id)}
                        className="checkbox checkbox-primary mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`badge badge-${typeInfo.color} badge-sm`}>
                            {typeInfo.icon} {typeInfo.label}
                          </span>
                          <span className={`badge badge-${getPriorityColor(goal.priority)} badge-sm`}>
                            {goal.priority.toUpperCase()}
                          </span>
                          {goal.category && (
                            <span className="badge badge-outline badge-sm">
                              {goal.category}
                            </span>
                          )}
                          {isOverdue && (
                            <span className="badge badge-error badge-sm">
                              OVERDUE
                            </span>
                          )}
                        </div>
                        
                        <h4 className={`font-medium mb-2 ${goal.completed ? 'line-through text-base-content/50' : 'text-base-content'}`}>
                          {goal.text}
                        </h4>

                        <div className="flex items-center space-x-4 text-sm text-base-content/60">
                          <span>Created: {new Date(goal.createdAt).toLocaleDateString()}</span>
                          {goal.targetDate && (
                            <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm">{goal.progress}%</span>
                          </div>
                          <progress 
                            className="progress progress-primary w-full" 
                            value={goal.progress} 
                            max="100"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                        className="btn btn-ghost btn-sm btn-circle"
                        title="View action steps"
                      >
                        <svg 
                          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeGoal(goal.id)}
                        className="btn btn-ghost btn-sm btn-circle text-error hover:bg-error/10"
                        title="Delete goal"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Action Steps */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-base-200">
                      <h5 className="font-medium mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Action Steps
                        {loadingActionPlan === goal.id && (
                          <span className="loading loading-spinner loading-sm ml-2"></span>
                        )}
                      </h5>
                      
                      {goal.actionSteps.length === 0 ? (
                        <p className="text-base-content/60 text-sm">
                          {loadingActionPlan === goal.id 
                            ? 'Generating AI-powered action plan...' 
                            : 'No action steps defined yet.'
                          }
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {goal.actionSteps.map(step => (
                            <div key={step.id} className="flex items-start space-x-3 p-3 bg-base-200 rounded">
                              <input
                                type="checkbox"
                                checked={step.completed}
                                onChange={() => toggleActionStep(goal.id, step.id)}
                                className="checkbox checkbox-sm checkbox-primary mt-1"
                              />
                              <div className="flex-1">
                                <p className={`text-sm ${step.completed ? 'line-through text-base-content/50' : ''}`}>
                                  {step.description}
                                </p>
                                <div className="flex items-center space-x-4 mt-1 text-xs text-base-content/60">
                                  {step.dueDate && (
                                    <span>Due: {new Date(step.dueDate).toLocaleDateString()}</span>
                                  )}
                                  {step.estimatedHours && (
                                    <span>Est. {step.estimatedHours}h</span>
                                  )}
                                </div>
                                {step.resources && step.resources.length > 0 && (
                                  <div className="mt-2">
                                    <div className="flex flex-wrap gap-1">
                                      {step.resources.map((resource, i) => (
                                        <span key={i} className="badge badge-outline badge-xs">
                                          {resource}
                                        </span>
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
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}