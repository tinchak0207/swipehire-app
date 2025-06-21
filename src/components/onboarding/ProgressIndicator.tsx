'use client';

import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export default function ProgressIndicator({ 
  currentStep, 
  totalSteps, 
  stepTitles 
}: ProgressIndicatorProps) {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-base-content/60 mb-2">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round(progressPercentage)}% Complete</span>
        </div>
        <div className="w-full bg-base-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="hidden md:flex justify-between items-center mb-8">
        {stepTitles.map((title, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={stepNumber} className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold mb-2 transition-all duration-300
                ${isCompleted 
                  ? 'bg-primary text-primary-content' 
                  : isCurrent 
                    ? 'bg-primary text-primary-content ring-4 ring-primary/20' 
                    : 'bg-base-200 text-base-content/60'
                }
              `}>
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>

              {/* Step Title */}
              <span className={`
                text-xs text-center font-medium transition-colors duration-300
                ${isCurrent 
                  ? 'text-primary' 
                  : isCompleted 
                    ? 'text-base-content' 
                    : 'text-base-content/60'
                }
              `}>
                {title}
              </span>

              {/* Connector Line */}
              {index < stepTitles.length - 1 && (
                <div className={`
                  absolute top-5 left-1/2 w-full h-0.5 -z-10 transition-colors duration-300
                  ${isCompleted ? 'bg-primary' : 'bg-base-200'}
                `} 
                style={{ 
                  transform: 'translateX(50%)',
                  width: `calc(100% / ${stepTitles.length} - 2.5rem)`
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Step Indicator */}
      <div className="md:hidden flex justify-center space-x-2 mb-8">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={stepNumber}
              className={`
                w-3 h-3 rounded-full transition-all duration-300
                ${isCompleted 
                  ? 'bg-primary' 
                  : isCurrent 
                    ? 'bg-primary ring-2 ring-primary/30' 
                    : 'bg-base-200'
                }
              `}
            />
          );
        })}
      </div>

      {/* Current Step Title for Mobile */}
      <div className="md:hidden text-center mb-6">
        <h2 className="text-xl font-bold text-base-content">
          {stepTitles[currentStep - 1]}
        </h2>
      </div>
    </div>
  );
}