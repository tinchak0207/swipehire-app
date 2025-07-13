'use client';

import { CheckIcon, DocumentTextIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
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
  onApplyToEditor,
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
      className={`rounded-lg border p-4 transition-all duration-200 ${
        isAdopted
          ? 'border-green-300 bg-green-50'
          : isIgnored
            ? 'border-gray-300 bg-gray-50 opacity-60'
            : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl" title={suggestion.type}>
            {getTypeIcon(suggestion.type)}
          </span>
          <div>
            <h4 className="font-semibold text-gray-800">{suggestion.title}</h4>
            <div className="mt-1 flex items-center gap-2">
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
                <CheckIcon className="h-4 w-4" />
                Adopt
              </button>
              {onApplyToEditor && (
                <button
                  onClick={() => onApplyToEditor(suggestion.id, suggestion)}
                  className="btn btn-primary btn-sm"
                  title="Apply this suggestion to the editor"
                >
                  <DocumentTextIcon className="h-4 w-4" />
                  Apply to Editor
                </button>
              )}
              {onModify && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-outline btn-sm"
                  title="Modify this suggestion"
                >
                  <PencilIcon className="h-4 w-4" />
                  Modify
                </button>
              )}
              <button
                onClick={() => onIgnore(suggestion.id)}
                className="btn btn-ghost btn-sm"
                title="Ignore this suggestion"
              >
                <XMarkIcon className="h-4 w-4" />
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
            <span className="flex items-center font-medium text-green-600 text-sm">
              <CheckIcon className="mr-1 h-4 w-4" />
              Adopted
            </span>
          )}

          {isIgnored && (
            <span className="flex items-center font-medium text-gray-500 text-sm">
              <XMarkIcon className="mr-1 h-4 w-4" />
              Ignored
            </span>
          )}
        </div>
      </div>

      <p className="mb-3 text-gray-600 text-sm">{suggestion.description}</p>

      {isEditing ? (
        <div className="space-y-2">
          <label className="label">
            <span className="label-text font-medium">Edit suggestion:</span>
          </label>
          <textarea
            value={modifiedText}
            onChange={(e) => setModifiedText(e.target.value)}
            className="textarea textarea-bordered h-20 w-full text-sm"
            placeholder="Modify the suggestion text..."
          />
        </div>
      ) : (
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="font-medium text-gray-800 text-sm">{suggestion.suggestion}</p>
        </div>
      )}

      {suggestion.beforeText && suggestion.afterText && !isEditing && (
        <div className="mt-3 space-y-2">
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Before & After
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded border border-red-200 bg-red-50 p-2">
              <div className="mb-1 font-medium text-red-700 text-xs">Before:</div>
              <div className="text-red-800 text-sm">{suggestion.beforeText}</div>
            </div>
            <div className="rounded border border-green-200 bg-green-50 p-2">
              <div className="mb-1 font-medium text-green-700 text-xs">After:</div>
              <div className="text-green-800 text-sm">{suggestion.afterText}</div>
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
