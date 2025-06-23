'use client';

import { CheckIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import type { SuggestionCardProps } from '@/lib/types/resume-optimizer';

/**
 * Suggestion card component for displaying optimization suggestions
 */
const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  isAdopted,
  isIgnored,
  onAdopt,
  onIgnore,
  onModify,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [modifiedText, setModifiedText] = useState(suggestion.suggestion);

  const getImpactColor = (impact: string): string => {
    switch (impact) {
      case 'high':
        return 'badge-error';
      case 'medium':
        return 'badge-warning';
      case 'low':
        return 'badge-info';
      default:
        return 'badge-neutral';
    }
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'keyword':
        return '🎯';
      case 'grammar':
        return '✏️';
      case 'format':
        return '📄';
      case 'achievement':
        return '🏆';
      case 'structure':
        return '🏗️';
      case 'ats':
        return '🤖';
      default:
        return '💡';
    }
  };

  const handleModify = (): void => {
    if (onModify) {
      onModify(suggestion.id, modifiedText);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = (): void => {
    setModifiedText(suggestion.suggestion);
    setIsEditing(false);
  };

  return (
    <div
      className={`border rounded-lg p-4 transition-all duration-200 ${
        isAdopted
          ? 'border-green-300 bg-green-50'
          : isIgnored
            ? 'border-gray-300 bg-gray-50 opacity-60'
            : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-xl" title={suggestion.type}>
            {getTypeIcon(suggestion.type)}
          </span>
          <div>
            <h4 className="font-semibold text-gray-800">{suggestion.title}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={`badge badge-sm ${getImpactColor(suggestion.impact)}`}>
                {suggestion.impact} impact
              </span>
              {suggestion.estimatedScoreImprovement > 0 && (
                <span className="badge badge-sm badge-outline">
                  +{suggestion.estimatedScoreImprovement} pts
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {!isAdopted && !isIgnored && !isEditing && (
            <>
              <button
                onClick={() => onAdopt(suggestion.id)}
                className="btn btn-success btn-sm"
                title="Adopt this suggestion"
              >
                <CheckIcon className="w-4 h-4" />
                Adopt
              </button>
              {onModify && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-outline btn-sm"
                  title="Modify this suggestion"
                >
                  <PencilIcon className="w-4 h-4" />
                  Modify
                </button>
              )}
              <button
                onClick={() => onIgnore(suggestion.id)}
                className="btn btn-ghost btn-sm"
                title="Ignore this suggestion"
              >
                <XMarkIcon className="w-4 h-4" />
                Ignore
              </button>
            </>
          )}

          {isEditing && (
            <>
              <button onClick={handleModify} className="btn btn-primary btn-sm">
                Save
              </button>
              <button onClick={handleCancelEdit} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </>
          )}

          {isAdopted && (
            <span className="text-green-600 text-sm font-medium flex items-center">
              <CheckIcon className="w-4 h-4 mr-1" />
              Adopted
            </span>
          )}

          {isIgnored && (
            <span className="text-gray-500 text-sm font-medium flex items-center">
              <XMarkIcon className="w-4 h-4 mr-1" />
              Ignored
            </span>
          )}
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-3">{suggestion.description}</p>

      {isEditing ? (
        <div className="space-y-2">
          <label className="label">
            <span className="label-text font-medium">Edit suggestion:</span>
          </label>
          <textarea
            value={modifiedText}
            onChange={(e) => setModifiedText(e.target.value)}
            className="textarea textarea-bordered w-full h-20 text-sm"
            placeholder="Modify the suggestion text..."
          />
        </div>
      ) : (
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-800 text-sm font-medium">{suggestion.suggestion}</p>
        </div>
      )}

      {suggestion.beforeText && suggestion.afterText && !isEditing && (
        <div className="mt-3 space-y-2">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Before & After
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-red-50 border border-red-200 p-2 rounded">
              <div className="text-xs font-medium text-red-700 mb-1">Before:</div>
              <div className="text-sm text-red-800">{suggestion.beforeText}</div>
            </div>
            <div className="bg-green-50 border border-green-200 p-2 rounded">
              <div className="text-xs font-medium text-green-700 mb-1">After:</div>
              <div className="text-sm text-green-800">{suggestion.afterText}</div>
            </div>
          </div>
        </div>
      )}

      {suggestion.section && (
        <div className="mt-2">
          <span className="badge badge-outline badge-xs">Section: {suggestion.section}</span>
        </div>
      )}
    </div>
  );
};

export default SuggestionCard;
