'use client';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export default function ProgressIndicator({
  currentStep,
  totalSteps,
  stepTitles,
}: ProgressIndicatorProps) {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-base-content/60 text-sm">
          <span>
            Step {currentStep} of {totalSteps}
          </span>
          <span>{Math.round(progressPercentage)}% Complete</span>
        </div>
        <div className="h-2 w-full rounded-full bg-base-200">
          <div
            className="h-2 rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="mb-8 hidden items-center justify-between md:flex">
        {stepTitles.map((title, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const _isUpcoming = stepNumber > currentStep;

          return (
            <div key={stepNumber} className="flex flex-1 flex-col items-center">
              {/* Step Circle */}
              <div
                className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full font-semibold text-sm transition-all duration-300 ${
                  isCompleted
                    ? 'bg-primary text-primary-content'
                    : isCurrent
                      ? 'bg-primary text-primary-content ring-4 ring-primary/20'
                      : 'bg-base-200 text-base-content/60'
                } `}
              >
                {isCompleted ? (
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>

              {/* Step Title */}
              <span
                className={`text-center font-medium text-xs transition-colors duration-300 ${
                  isCurrent
                    ? 'text-primary'
                    : isCompleted
                      ? 'text-base-content'
                      : 'text-base-content/60'
                } `}
              >
                {title}
              </span>

              {/* Connector Line */}
              {index < stepTitles.length - 1 && (
                <div
                  className={`-z-10 absolute top-5 left-1/2 h-0.5 w-full transition-colors duration-300 ${isCompleted ? 'bg-primary' : 'bg-base-200'} `}
                  style={{
                    transform: 'translateX(50%)',
                    width: `calc(100% / ${stepTitles.length} - 2.5rem)`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Step Indicator */}
      <div className="mb-8 flex justify-center space-x-2 md:hidden">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={stepNumber}
              className={`h-3 w-3 rounded-full transition-all duration-300 ${
                isCompleted
                  ? 'bg-primary'
                  : isCurrent
                    ? 'bg-primary ring-2 ring-primary/30'
                    : 'bg-base-200'
              } `}
            />
          );
        })}
      </div>

      {/* Current Step Title for Mobile */}
      <div className="mb-6 text-center md:hidden">
        <h2 className="font-bold text-base-content text-xl">{stepTitles[currentStep - 1]}</h2>
      </div>
    </div>
  );
}
