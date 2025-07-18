import { useState } from 'react';
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
  onUpdate: onUpdateAction,
  onNext: onNextAction,
  onBack: onBackAction,
  isLoading,
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
        : ['Hire 3 developers', 'Improve hiring process', 'Build employer brand'],
    },
    {
      key: 'midTerm',
      label: 'Mid-term Goals',
      description: 'Goals for the next 6-12 months',
      icon: '📈',
      color: 'info',
      examples: isJobSeeker
        ? ['Get promoted', 'Switch career paths', 'Build professional network']
        : ['Expand team by 50%', 'Launch new product', 'Enter new market'],
    },
    {
      key: 'longTerm',
      label: 'Long-term Goals',
      description: 'Goals for 1+ years',
      icon: '🚀',
      color: 'primary',
      examples: isJobSeeker
        ? ['Become team lead', 'Start own business', 'Achieve work-life balance']
        : ['Scale to 100+ employees', 'Go public', 'Become industry leader'],
    },
    {
      key: 'skillDevelopment',
      label: 'Skill Development',
      description: 'Skills you want to develop',
      icon: '🧠',
      color: 'warning',
      examples: isJobSeeker
        ? ['Learn React', 'Improve leadership', 'Master data analysis']
        : ['Improve interviewing', 'Learn talent analytics', 'Develop coaching skills'],
    },
  ];

  const addGoal = (type: string) => {
    if (!newGoal.text.trim()) return;

    const updatedGoals = {
      ...goals,
      [type]: [...(goals[type as keyof typeof goals] || []), newGoal.text.trim()],
    };

    setGoals(updatedGoals);
    onUpdateAction({ goals: updatedGoals });
    setNewGoal({ type, text: '' });
  };

  const removeGoal = (type: string, index: number) => {
    const updatedGoals = {
      ...goals,
      [type]: (goals[type as keyof typeof goals] || []).filter((_, i) => i !== index),
    };

    setGoals(updatedGoals);
    onUpdateAction({ goals: updatedGoals });
  };

  const addExampleGoal = (type: string, example: string) => {
    const currentGoals = goals[type as keyof typeof goals] || [];
    if (currentGoals.includes(example)) return;

    const updatedGoals = {
      ...goals,
      [type]: [...currentGoals, example],
    };

    setGoals(updatedGoals);
    onUpdateAction({ goals: updatedGoals });
  };

  const totalGoals = Object.values(goals).flat().length;

  return (
    <div className="mx-auto max-w-3xl animate-fade-in rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 p-8 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-12 text-center">
        <h2 className="mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold text-4xl text-transparent">
          Set Your Goals
        </h2>
        <p className="mx-auto max-w-lg text-gray-600 text-lg">
          {isJobSeeker
            ? 'Define your career aspirations and skill development targets'
            : 'Outline your hiring objectives and team growth plans'}
        </p>
      </div>

      {/* Goal Categories */}
      <div className="space-y-8">
        {goalTypes.map((goalType) => {
          const currentGoals = goals[goalType.key as keyof typeof goals] || [];

          return (
            <div
              key={goalType.key}
              className="card rounded-xl border-0 bg-white/90 shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <div className="card-body text-black">
                <div className="mb-4 flex items-center space-x-3">
                  <span className="text-2xl">{goalType.icon}</span>
                  <div>
                    <h3 className="font-bold text-xl">{goalType.label}</h3>
                    <p className="text-base-content/60 text-sm">{goalType.description}</p>
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
                            className="btn btn-ghost btn-xs h-4 min-h-0 w-4 p-0"
                          >
                            <svg
                              className="h-3 w-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Goal */}
                <div className="mb-4 flex gap-2">
                  <input
                    type="text"
                    placeholder={`Add a ${goalType.label.toLowerCase().slice(0, -1)}...`}
                    className="input input-lg flex-1 border-2 border-gray-300 bg-white text-gray-800 placeholder-gray-400 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                    className={`btn btn-lg ${
                      !newGoal.text.trim() || newGoal.type !== goalType.key
                        ? 'cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md transition-all hover:from-blue-600 hover:to-purple-700 hover:shadow-lg'
                    } rounded-lg`}
                  >
                    Add
                  </button>
                </div>

                {/* Example Goals */}
                <div>
                  <p className="mb-2 text-base-content/60 text-sm">Quick add examples:</p>
                  <div className="flex flex-wrap gap-2">
                    {goalType.examples.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => addExampleGoal(goalType.key, example)}
                        disabled={currentGoals.includes(example)}
                        className={`btn btn-outline btn-xs ${
                          currentGoals.includes(example)
                            ? 'btn-disabled opacity-50'
                            : `btn-${goalType.color}`
                        } `}
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
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="font-bold">Great start!</h3>
            <div className="text-sm">
              You've set {totalGoals} goal{totalGoals !== 1 ? 's' : ''}.
              {isJobSeeker
                ? ' These will help guide your career development and job search.'
                : ' These will help focus your hiring strategy and team building efforts.'}
            </div>
          </div>
        </div>
      )}

      {/* Integration Info */}
      <div className="card mt-8 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="card-body text-black">
          <div className="flex items-start space-x-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-info/20">
              <svg
                className="h-5 w-5 text-info"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h4 className="mb-2 font-semibold text-info">
                {isJobSeeker ? 'Career Dashboard Integration' : 'Hiring Dashboard Integration'}
              </h4>
              <p className="text-base-content/70 text-sm">
                {isJobSeeker
                  ? 'Your goals will be integrated with your Career Dashboard, where you can track progress, get AI-powered recommendations, and receive personalized action steps.'
                  : 'Your goals will be integrated with your Hiring Dashboard, where you can track recruitment progress, get candidate recommendations, and monitor team growth metrics.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Skip Option */}
      {totalGoals === 0 && (
        <div className="mt-8 text-center">
          <p className="mb-4 text-base-content/60">
            Don't worry if you're not sure about your goals yet. You can always add them later in
            your dashboard.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex items-center justify-between">
        <button onClick={onBackAction} className="btn btn-ghost" disabled={isLoading}>
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 17l-5-5m0 0l5-5m-5 5h12"
            />
          </svg>
          Back
        </button>

        <button onClick={onNextAction} disabled={isLoading} className="btn btn-primary btn-lg">
          {isLoading ? (
            <>
              <span className="loading loading-spinner loading-sm" />
              Saving...
            </>
          ) : (
            <>
              Complete Setup
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
