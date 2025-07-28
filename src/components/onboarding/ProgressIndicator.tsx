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

  // Step-specific colors

  const getCurrentStepGradient = () => {
    switch (currentStep) {
      case 1:
        return 'bg-gradient-to-r from-blue-400 to-blue-600';
      case 2:
        return 'bg-gradient-to-r from-green-400 to-green-600';
      case 3:
        return 'bg-gradient-to-r from-purple-400 to-purple-600';
      case 4:
        return 'bg-gradient-to-r from-orange-400 to-orange-600';
      case 5:
        return 'bg-gradient-to-r from-pink-400 to-pink-600';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="w-full">
      {/* Progress Bar with glassmorphism effect */}
      <div className="mb-8 rounded-2xl border border-white/30 bg-white/20 p-4 shadow-lg backdrop-blur-xl">
        <div className="mb-3 flex justify-between font-medium text-gray-800 text-sm">
          <span>
            Step {currentStep} of {totalSteps}
          </span>
          <span>{Math.round(progressPercentage)}% Complete</span>
        </div>
        <div className="h-3 w-full rounded-full bg-white/30 shadow-inner backdrop-blur-sm">
          <div
            className={`h-3 rounded-full shadow-sm transition-all duration-700 ease-out ${getCurrentStepGradient()}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Step Indicators with glassmorphism effect */}
      <div className="mb-8 hidden items-center justify-between rounded-2xl border border-white/30 bg-white/20 p-4 shadow-lg backdrop-blur-xl md:flex">
        {stepTitles.map((title, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={stepNumber} className="flex flex-1 flex-col items-center">
              {/* Step Circle */}
              <div
                className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full font-semibold text-sm transition-all duration-300 ${
                  isCompleted
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    : isCurrent
                      ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white ring-4 ring-blue-400/30'
                      : 'bg-white/30 text-gray-700 backdrop-blur-sm'
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
                    ? 'text-gray-800 font-bold'
                    : isCompleted
                      ? 'text-gray-700'
                      : 'text-gray-600'
                } `}
              >
                {title}
              </span>

              {/* Connector Line */}
              {index < stepTitles.length - 1 && (
                <div
                  className={`absolute top-5 h-0.5 w-full transition-colors duration-300 ${isCompleted ? 'bg-blue-500' : 'bg-white/30'} `}
                  style={{
                    left: '50%',
                    transform: 'translateX(50%)',
                    width: `calc(100% / ${stepTitles.length} - 2.5rem)`,
                    zIndex: -1,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Step Indicator with glassmorphism effect */}
      <div className="mb-8 flex justify-center space-x-2 rounded-2xl border border-white/30 bg-white/20 p-4 shadow-lg backdrop-blur-xl md:hidden">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={stepNumber}
              className={`h-3 w-3 rounded-full transition-all duration-300 ${
                isCompleted
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                  : isCurrent
                    ? 'bg-gradient-to-r from-blue-400 to-blue-500 ring-2 ring-blue-400/30'
                    : 'bg-white/30'
              } `}
            />
          );
        })}
      </div>

      {/* Current Step Title for Mobile */}
      <div className="mb-6 text-center md:hidden">
        <h2 className="font-bold text-gray-800 text-xl">{stepTitles[currentStep - 1]}</h2>
      </div>
    </div>
  );
}