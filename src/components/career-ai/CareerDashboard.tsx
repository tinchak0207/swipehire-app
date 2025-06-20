  'use client'

import { useState, useEffect } from 'react'
import { CareerStage, CareerPath, Goal } from '@/lib/types'
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

export default function CareerDashboard({ userData }: CareerDashboardProps) {
  const [careerStage, setCareerStage] = useState<CareerStage>('early')
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [activeTab, setActiveTab] = useState<'paths' | 'goals' | 'progress'>('paths')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        // TODO: Convert userData to proper format and call AI service
        const recommendations = await getCareerRecommendations({
          education: userData.education,
          skills: userData.skills,
          experience: userData.experience.join('\n'),
          interests: userData.interests,
          values: userData.values
        })
        
        setCareerStage(recommendations.careerStage)
        setCareerPaths(recommendations.careerPaths)
      } catch (error) {
        console.error('Failed to fetch recommendations:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchRecommendations()
  }, [userData])

  const addGoal = (type: 'long' | 'mid' | 'short', text: string) => {
    setGoals([...goals, { 
      id: Date.now(), 
      type, 
      text, 
      completed: false,
      createdAt: new Date().toISOString(),
      actionSteps: []
    }])
  }

  const toggleGoalCompletion = (id: number) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ))
  }

  if (loading) {
    return <div className="text-center py-8">Loading career recommendations...</div>
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Your Current Career Stage</h2>
        <div className="text-lg">
          Based on your profile, you're in the <span className="font-semibold">{careerStage}</span> stage of your career.
        </div>
      </div>

      <div className="flex border-b">
        <button
          className={`px-4 py-2 ${activeTab === 'paths' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('paths')}
        >
          Career Paths
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'goals' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          Goals
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'progress' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          Progress
        </button>
      </div>

      {activeTab === 'paths' && (
        <div className="grid md:grid-cols-3 gap-4">
          {careerPaths.map((path, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-2">{path.title}</h3>
              <p className="text-gray-600 mb-4">{path.description}</p>
              <div className="space-y-2">
                <h4 className="font-semibold">Required Skills:</h4>
                <ul className="list-disc pl-5">
                  {path.requiredSkills.map((skill, i) => (
                    <li key={i}>{skill}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="space-y-4">
          <div className="flex space-x-4">
            <button 
              onClick={() => addGoal('long', '')}
              className="px-4 py-2 bg-blue-100 text-blue-800 rounded"
            >
              + Long Term
            </button>
            <button 
              onClick={() => addGoal('mid', '')}
              className="px-4 py-2 bg-green-100 text-green-800 rounded"
            >
              + Mid Term
            </button>
            <button 
              onClick={() => addGoal('short', '')}
              className="px-4 py-2 bg-purple-100 text-purple-800 rounded"
            >
              + Short Term
            </button>
          </div>

          {goals.map(goal => (
            <div key={goal.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={goal.completed}
                  onChange={() => toggleGoalCompletion(goal.id)}
                  className="mr-2"
                />
                <span className={`${goal.completed ? 'line-through text-gray-500' : ''}`}>
                  {goal.text}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Your Progress</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Completed Goals</h3>
              <p>{goals.filter(g => g.completed).length} / {goals.length}</p>
            </div>
            <div>
              <h3 className="font-semibold">Skills to Develop</h3>
              <ul className="list-disc pl-5">
                {careerPaths.flatMap(p => p.requiredSkills)
                  .filter((skill, i, arr) => arr.indexOf(skill) === i)
                  .map((skill, i) => (
                    <li key={i}>{skill}</li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
