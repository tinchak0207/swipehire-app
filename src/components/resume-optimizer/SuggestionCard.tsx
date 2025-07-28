'use client';

import {
  ArrowPathIcon,
  CheckIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useMemo, useState } from 'react';
import type { SuggestionCardProps } from '@/lib/types/resume-optimizer';

/**
 * Enhanced unified suggestion card component for displaying optimization suggestions
 * Consolidates functionality from multiple implementations across the codebase
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [modifiedText, setModifiedText] = useState(suggestion.suggestion);

  // Animation variants
  const animationVariants = {
    card: {
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
      hover: { y: -2, scale: 1.01, transition: { duration: 0.2 } },
    },
    expandedContent: {
      hidden: { height: 0, opacity: 0 },
      visible: { height: 'auto', opacity: 1, transition: { duration: 0.3 } },
    },
  };

  // Enhanced confidence color calculation
  const confidenceColor = useMemo(() => {
    const score = suggestion.estimatedScoreImprovement;
    if (score >= 8) return 'text-success';
    if (score >= 5) return 'text-warning';
    if (score >= 2) return 'text-info';
    return 'text-base-content';
  }, [suggestion.estimatedScoreImprovement]);

  // Priority colors with enhanced styling
  const priorityColors = useMemo(() => {
    switch (suggestion.impact) {
      case 'high':
        return 'border-error bg-error/10';
      case 'medium':
        return 'border-warning bg-warning/10';
      case 'low':
        return 'border-success bg-success/10';
      default:
        return 'border-base-300 bg-base-100';
    }
  }, [suggestion.impact]);

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

  const handleModify = useCallback((): void => {
    if (onModify) {
      onModify(suggestion.id, modifiedText);
      setIsEditing(false);
    }
  }, [onModify, suggestion.id, modifiedText]);

  const handleCancelEdit = useCallback((): void => {
    setModifiedText(suggestion.suggestion);
    setIsEditing(false);
  }, [suggestion.suggestion]);

  const handleApply = useCallback(async (): Promise<void> => {
    if (!onApplyToEditor) return;

    setIsApplying(true);
    try {
      await onApplyToEditor(suggestion.id, suggestion);
      onAdopt(suggestion.id);
    } finally {
      setIsApplying(false);
    }
  }, [onApplyToEditor, suggestion, onAdopt]);

  const handlePreview = useCallback((): void => {
    setShowPreview(!showPreview);
  }, [showPreview]);

  return (
    <motion.div
      className={`rounded-lg border-2 p-4 transition-all duration-300 hover:shadow-lg ${priorityColors} ${
        isAdopted
          ? 'border-green-300 bg-green-50'
          : isIgnored
            ? 'border-gray-300 bg-gray-50 opacity-60'
            : 'hover:border-gray-300'
      }`}
      variants={animationVariants.card}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      layout
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl" title={suggestion.type}>
            {getTypeIcon(suggestion.type)}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-800">{suggestion.title}</h4>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="btn btn-ghost btn-xs"
                title={isExpanded ? 'Show less' : 'Show more'}
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className={`badge badge-sm ${getImpactColor(suggestion.impact)}`}>
                {suggestion.impact} impact
              </span>
              {suggestion.estimatedScoreImprovement > 0 && (
                <span className={`badge badge-sm badge-outline ${confidenceColor}`}>
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
                  onClick={handleApply}
                  className={`btn btn-primary btn-sm ${isApplying ? 'loading' : ''}`}
                  title="Apply this suggestion to the editor"
                  disabled={isApplying}
                >
                  {!isApplying && <DocumentTextIcon className="h-4 w-4" />}
                  {isApplying ? 'Applying...' : 'Apply to Editor'}
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
              {(suggestion.beforeText || suggestion.afterText) && (
                <button
                  onClick={handlePreview}
                  className="btn btn-ghost btn-sm"
                  title="Preview changes"
                >
                  <EyeIcon className="h-4 w-4" />
                  {showPreview ? 'Hide' : 'Preview'}
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

      {/* Editing Interface */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            className="mb-3 space-y-2"
            variants={animationVariants.expandedContent}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <label className="label">
              <span className="label-text font-medium">Edit suggestion:</span>
            </label>
            <textarea
              value={modifiedText}
              onChange={(e) => setModifiedText(e.target.value)}
              className="textarea textarea-bordered h-20 w-full text-sm"
              placeholder="Modify the suggestion text..."
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestion Content */}
      {!isEditing && (
        <div className="rounded-lg bg-gray-50 p-3 mb-3">
          <p className="font-medium text-gray-800 text-sm">{suggestion.suggestion}</p>
        </div>
      )}

      {/* Before/After Preview */}
      <AnimatePresence>
        {(showPreview || isExpanded) &&
          suggestion.beforeText &&
          suggestion.afterText &&
          !isEditing && (
            <motion.div
              className="mt-3 space-y-2"
              variants={animationVariants.expandedContent}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
                Before & After
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded border border-red-200 bg-red-50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-medium text-red-700 text-xs">Before:</div>
                    <span className="badge badge-xs badge-error">ORIGINAL</span>
                  </div>
                  <div className="text-red-800 text-sm whitespace-pre-wrap">
                    {suggestion.beforeText}
                  </div>
                </div>
                <div className="rounded border border-green-200 bg-green-50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-medium text-green-700 text-xs">After:</div>
                    <span className="badge badge-xs badge-success">IMPROVED</span>
                  </div>
                  <div className="text-green-800 text-sm whitespace-pre-wrap">
                    {suggestion.afterText}
                  </div>
                </div>
              </div>
              {onApplyToEditor && (
                <div className="mt-3 flex justify-center">
                  <button
                    onClick={handleApply}
                    className={`btn btn-primary btn-sm ${isApplying ? 'loading' : ''}`}
                    title="Apply this change to your resume"
                    disabled={isApplying}
                  >
                    {!isApplying && <ArrowPathIcon className="h-4 w-4" />}
                    {isApplying ? 'Applying...' : 'One-Click Apply Change'}
                  </button>
                </div>
              )}
            </motion.div>
          )}
      </AnimatePresence>

      {/* Extended Information for Expanded View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="mt-4 space-y-3"
            variants={animationVariants.expandedContent}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {/* Impact Metrics */}
            <div className="rounded bg-base-200 p-3">
              <div className="mb-2 font-medium text-xs">Expected Impact</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span>Score Improvement:</span>
                  <span className={`font-medium ${confidenceColor}`}>
                    +{suggestion.estimatedScoreImprovement}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Priority:</span>
                  <span className="font-medium capitalize">{suggestion.priority}</span>
                </div>
              </div>
            </div>

            {/* Context Information */}
            {suggestion.section && (
              <div className="text-base-content/70 text-xs">
                <div className="font-medium">Context:</div>
                <div>Section: {suggestion.section}</div>
                <div>Type: {suggestion.type}</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section Badge */}
      {suggestion.section && (
        <div className="mt-2">
          <span className="badge badge-outline badge-xs">Section: {suggestion.section}</span>
        </div>
      )}
    </motion.div>
  );
};

export default SuggestionCard;
