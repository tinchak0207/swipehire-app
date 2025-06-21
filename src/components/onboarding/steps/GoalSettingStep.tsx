'use client';

import React, { useState } from 'react';
import type { WizardData } from '../WizardContainer';

interface GoalSettingStepProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export default function GoalSettingStep({ 
  data, 
  onUpdate, 
  onNext, 
  onBack, 
  isLoading 
}: GoalSettingStepProps) {
  const [goals, setGoals] = useState(data.goals);
  const [newGoal, setNewGoal] = useState({ type: 'short', text: '' });

  const isJobSeeker = data.userType === 'jobseeker';

  const goalTypes = [
    {
      key: 'shortTerm',
      label: 'Short-term Goals',
      description: 'Goals for the next 3-6 months',
      icon: '🎯',
      color: 'success',
      examples: isJobSeeker 
        ? ['Land a new job', 'Complete certification', 'Update portfolio']
        : ['Hire 3 developers', 'Improve hiring process', 'Build employer brand']
    },
    {
      key: 'midTerm',
      label: 'Mid-term Goals',
      description: 'Goals for the next 6-12 months',
      icon: '📈',
      color: 'info',
      examples: isJobSeeker
        ? ['Get promoted', 'Switch career paths', 'Build professional network']
        : ['Expand team by 50%', 'Launch new product', 'Enter new market']
    },
    {
      key: 'longTerm',
      label: 'Long-term Goals',
      description: 'Goals for 1+ years',
      icon: '🚀',
      color: 'primary',
      examples: isJobSeeker
        ? ['Become team lead', 'Start own business', 'Achieve work-life balance']
        : ['Scale to 100+ employees', 'Go public', 'Become industry leader']
    },
    {
      key: 'skillDevelopment',
      label: 'Skill Development',
      description: 'Skills you want to develop',
      icon: '🧠',
      color: 'warning',
      examples: isJobSeeker
        ? ['Learn React', 'Improve leadership', 'Master data analysis']
        : ['Improve interviewing', 'Learn talent analytics', 'Develop coaching skills']
    }
  ];

  const addGoal = (type: string) => {
    if (!newGoal.text.trim()) return;

    const updatedGoals = {
      ...goals,
      [type]: [...(goals[type as keyof typeof goals] || []), newGoal.text.trim()]
    };
    
    setGoals(updatedGoals);
    onUpdate({ goals: updatedGoals });
    setNewGoal({ type, text: '' });
  };

  const removeGoal = (type: string, index: number) => {
    const updatedGoals = {
      ...goals,
      [type]: (goals[type as keyof typeof goals] || []).filter((_, i) => i !== index)
    };
    
    setGoals(updatedGoals);
    onUpdate({ goals: updatedGoals });
  };

  const addExampleGoal = (type: string, example: string) => {
    const currentGoals = goals[type as keyof typeof goals] || [];
    if (currentGoals.includes(example)) return;

    const updatedGoals = {
      ...goals,
      [type]: [...currentGoals, example]
    };
    
    setGoals(updatedGoals);
    onUpdate({ goals: updatedGoals });
  };

  const totalGoals = Object.values(goals).flat().length;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-base-content mb-2">
          Set Your Goals
        </h2>
        <p className="text-base-content/60">
          {isJobSeeker 
            ? 'Define your career aspirations and skill development targets'
            : 'Outline your hiring objectives and team growth plans'
          }
        </p>
      </div>

      {/* Goal Categories */}
      <div className="space-y-8">
        {goalTypes.map((goalType) => {
          const currentGoals = goals[goalType.key as keyof typeof goals] || [];
          
          return (
            <div key={goalType.key} className="card bg-base-200">
              <div className="card-body">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-2xl">{goalType.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold">{goalType.label}</h3>
                    <p className="text-sm text-base-content/60">{goalType.description}</p>
                  </div>
                </div>

                {/* Current Goals */}
                {currentGoals.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {currentGoals.map((goal, index) => (
                        <div key={index} className={`badge badge-${goalType.color} badge-lg gap-2`}>
                          {goal}
                          <button
                            onClick={() => removeGoal(goalType.key, index)}
                            className="btn btn-ghost btn-xs p-0 min-h-0 h-4 w-4"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Goal */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder={`Add a ${goalType.label.toLowerCase().slice(0, -1)}...`}
                    className="input input-bordered flex-1"
                    value={newGoal.type === goalType.key ? newGoal.text : ''}
                    onChange={(e) => setNewGoal({ type: goalType.key, text: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addGoal(goalType.key);
                      }
                    }}
                  />
                  <button
                    onClick={() => addGoal(goalType.key)}
                    disabled={!newGoal.text.trim() || newGoal.type !== goalType.key}
                    className={`btn btn-${goalType.color}`}
                  >
                    Add
                  </button>
                </div>

                {/* Example Goals */}
                <div>
                  <p className="text-sm text-base-content/60 mb-2">Quick add examples:</p>
                  <div className="flex flex-wrap gap-2">
                    {goalType.examples.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => addExampleGoal(goalType.key, example)}
                        disabled={currentGoals.includes(example)}
                        className={`
                          btn btn-outline btn-xs
                          ${currentGoals.includes(example) 
                            ? 'btn-disabled opacity-50' 
                            : `btn-${goalType.color}`
                          }
                        `}
                      >
                        + {example}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Goal Summary */}
      {totalGoals > 0 && (
        <div className="alert alert-success mt-8">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-bold">Great start!</h3>
            <div className="text-sm">
              You've set {totalGoals} goal{totalGoals !== 1 ? 's' : ''}. 
              {isJobSeeker 
                ? ' These will help guide your career development and job search.'
                : ' These will help focus your hiring strategy and team building efforts.'
              }
            </div>
          </div>
        </div>
      )}

      {/* Integration Info */}
      <div className="card bg-info/10 mt-8">
        <div className="card-body">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-info/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-info mb-2">
                {isJobSeeker ? 'Career Dashboard Integration' : 'Hiring Dashboard Integration'}
              </h4>
              <p className="text-sm text-base-content/70">
                {isJobSeeker 
                  ? 'Your goals will be integrated with your Career Dashboard, where you can track progress, get AI-powered recommendations, and receive personalized action steps.'
                  : 'Your goals will be integrated with your Hiring Dashboard, where you can track recruitment progress, get candidate recommendations, and monitor team growth metrics.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Skip Option */}
      {totalGoals === 0 && (
        <div className="text-center mt-8">
          <p className="text-base-content/60 mb-4">
            Don't worry if you're not sure about your goals yet. You can always add them later in your dashboard.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={onBack}
          className="btn btn-ghost"
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Back
        </button>

        <button
          onClick={onNext}
          disabled={isLoading}
          className="btn btn-primary btn-lg"
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Saving...
            </>
          ) : (
            <>
              Complete Setup
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}