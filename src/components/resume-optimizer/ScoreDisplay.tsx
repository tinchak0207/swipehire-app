'use client';

import type { ScoreDisplayProps } from '@/lib/types/resume-optimizer';

/**
 * Score display component with progress indicator
 */
const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  label,
  maxScore = 100,
  showProgress = true,
  size = 'md',
}) => {
  const getScoreColor = (score: number): string => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number): string => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'bg-green-100';
    if (percentage >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getProgressColor = (score: number): string => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'progress-success';
    if (percentage >= 60) return 'progress-warning';
    return 'progress-error';
  };

  const getSizeClasses = (size: string): { container: string; score: string; label: string } => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-3',
          score: 'text-2xl',
          label: 'text-xs',
        };
      case 'lg':
        return {
          container: 'p-6',
          score: 'text-4xl',
          label: 'text-base',
        };
      default:
        return {
          container: 'p-4',
          score: 'text-3xl',
          label: 'text-sm',
        };
    }
  };

  const sizeClasses = getSizeClasses(size);
  const percentage = Math.round((score / maxScore) * 100);

  return (
    <div className={`rounded-lg text-center ${sizeClasses.container} ${getScoreBgColor(score)}`}>
      <div className={`font-bold ${sizeClasses.score} ${getScoreColor(score)}`}>
        {score}
        {maxScore !== 100 && <span className="text-gray-500">/{maxScore}</span>}
      </div>
      <div className={`font-medium ${sizeClasses.label} mb-2 text-gray-700`}>{label}</div>

      {showProgress && (
        <div className="w-full">
          <progress
            className={`progress h-2 w-full ${getProgressColor(score)}`}
            value={score}
            max={maxScore}
          />
          <div className="mt-1 text-gray-600 text-xs">{percentage}%</div>
        </div>
      )}
    </div>
  );
};

export default ScoreDisplay;
