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
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      examples: isJobSeeker
        ? ['Land a new job', 'Complete certification', 'Update portfolio']
        : ['Hire 3 developers', 'Improve hiring process', 'Build employer brand'],
    },
    {
      key: 'midTerm',
      label: 'Mid-term Goals',
      description: 'Goals for the next 6-12 months',
      icon: '📈',
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      examples: isJobSeeker
        ? ['Get promoted', 'Switch career paths', 'Build professional network']
        : ['Expand team by 50%', 'Launch new product', 'Enter new market'],
    },
    {
      key: 'longTerm',
      label: 'Long-term Goals',
      description: 'Goals for 1+ years',
      icon: '🚀',
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      examples: isJobSeeker
        ? ['Become team lead', 'Start own business', 'Achieve work-life balance']
        : ['Scale to 100+ employees', 'Go public', 'Become industry leader'],
    },
    {
      key: 'skillDevelopment',
      label: 'Skill Development',
      description: 'Skills you want to develop',
      icon: '🧠',
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
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
    <div className="mx-auto max-w-3xl animate-fade-in rounded-2xl bg-gradient-to-br from-blue-50 to-white p-8 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-12 text-center">
        <h2 className="mb-3 font-bold text-4xl text-gray-900">Set Your Goals</h2>
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
              className={`rounded-xl border-2 ${goalType.borderColor} ${goalType.bgColor} overflow-hidden shadow-sm`}
            >
              <div className="p-6">
                <div className="mb-4 flex items-center space-x-3">
                  <span className="text-3xl">{goalType.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-xl">{goalType.label}</h3>
                    <p className="text-gray-600 text-sm">{goalType.description}</p>
                  </div>
                </div>

                {/* Current Goals */}
                {currentGoals.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {currentGoals.map((goal, index) => (
                        <div
                          key={index}
                          className={
                            'badge badge-lg gap-2 border border-gray-300 bg-white px-3 py-2 text-gray-700'
                          }
                        >
                          {goal}
                          <button
                            onClick={() => removeGoal(goalType.key, index)}
                            className="btn btn-ghost btn-xs h-4 min-h-0 w-4 rounded-full p-0 hover:bg-gray-200"
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
                <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    placeholder={`Add a ${goalType.label.toLowerCase().slice(0, -1)}...`}
                    className="input input-lg flex-1 rounded-lg border-2 border-gray-300 bg-white text-gray-800 placeholder-gray-400 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                    className={`btn btn-lg h-12 min-h-0 rounded-lg ${
                      !newGoal.text.trim() || newGoal.type !== goalType.key
                        ? 'cursor-not-allowed opacity-50'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    } shadow-sm transition-all hover:shadow`}
                  >
                    Add Goal
                  </button>
                </div>

                {/* Example Goals */}
                <div>
                  <p className="mb-2 font-medium text-gray-600 text-sm">Quick add examples:</p>
                  <div className="flex flex-wrap gap-2">
                    {goalType.examples.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => addExampleGoal(goalType.key, example)}
                        disabled={currentGoals.includes(example)}
                        className={`btn btn-sm rounded-full ${
                          currentGoals.includes(example)
                            ? 'btn-disabled opacity-50'
                            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                        } transition-all`}
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
        <div className="alert mt-8 rounded-lg border border-blue-200 bg-blue-50 shadow-sm">
          <svg
            className="h-6 w-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="font-semibold text-blue-800">Great start!</h3>
            <div className="text-blue-700 text-sm">
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
        <div className="card-body p-6">
          <div className="flex items-start space-x-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
              <svg
                className="h-6 w-6 text-blue-600"
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
              <h4 className="mb-2 font-semibold text-blue-700">
                {isJobSeeker ? 'Career Dashboard Integration' : 'Hiring Dashboard Integration'}
              </h4>
              <p className="text-gray-600 text-sm">
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
          <p className="mb-4 text-gray-600">
            Don't worry if you're not sure about your goals yet. You can always add them later in
            your dashboard.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-10 flex items-center justify-between">
        <button
          onClick={onBackAction}
          className="flex items-center font-medium text-gray-600 transition-colors duration-200 hover:text-gray-800"
          disabled={isLoading}
        >
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

        <button
          onClick={onNextAction}
          disabled={isLoading}
          className={`rounded-xl px-8 py-4 font-bold text-lg shadow-lg transition-all duration-300 hover:shadow-xl ${
            !isLoading
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:scale-105 hover:from-blue-600 hover:to-blue-700'
              : 'cursor-not-allowed bg-gray-200 text-gray-400'
          }`}
        >
          {isLoading ? (
            <>
              <span className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-white border-b-2" />
              Saving...
            </>
          ) : (
            <>
              Complete Setup
              <svg
                className="ml-2 inline h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
