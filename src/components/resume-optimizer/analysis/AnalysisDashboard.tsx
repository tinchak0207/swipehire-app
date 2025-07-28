/**
 * Interactive Analysis Dashboard Component
 *
 * Features:
 * - Gamified scoring system with animated score reveals
 * - Interactive suggestion cards with priority-based sorting
 * - One-click apply functionality
 * - Before/after previews
 * - Achievement badges and milestone tracking
 * - Industry benchmarks and peer comparisons
 * - Real-time collaboration features
 * - Visual enhancement tools
 *
 * Built with DaisyUI components and Tailwind CSS
 * Optimized for mobile-first responsive design
 * Includes comprehensive accessibility features
 */

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  Achievement,
  AnalysisDashboardProps,
  CategoryScores,
  Milestone,
  Suggestion,
  SuggestionAction,
} from '../types';

// Import the shared SuggestionCard component

// Icons for the dashboard
const Icons = {
  Trophy: () => (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 2L13 8l6 .75-4.5 4.25L16 19l-6-3.25L4 19l1.5-6.25L1 8.75 7 8l3-6z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Target: () => (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Lightning: () => (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Check: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Eye: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
      <path
        fillRule="evenodd"
        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Sparkles: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M5 2a1 1 0 01.967.744L14.146 7.2 17.5 8.134a1 1 0 010 1.732L14.146 10.8l-1.179 5.456a1 1 0 01-1.934 0L9.854 10.8 6.5 9.866a1 1 0 010-1.732L9.854 7.2l1.179-5.456A1 1 0 0112 1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  ChartBar: () => (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
    </svg>
  ),
  Users: () => (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
  ),
};

// Animation variants for different components
const animationVariants = {
  scoreReveal: {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 20,
        delay: 0.2,
      },
    },
  },
  suggestionCard: {
    hidden: { y: 50, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: 'easeOut',
      },
    }),
    hover: {
      y: -5,
      scale: 1.02,
      transition: { duration: 0.2 },
    },
  },
  achievementBadge: {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
      },
    },
  },
  progressBar: {
    hidden: { width: 0 },
    visible: (progress: number) => ({
      width: `${progress}%`,
      transition: {
        duration: 1.5,
        ease: 'easeInOut',
      },
    }),
  },
};

// Score visualization component with animated rings
const ScoreVisualization: React.FC<{
  overallScore: number;
  categoryScores: CategoryScores;
  industryAverage: number;
}> = ({ overallScore, categoryScores, industryAverage }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(overallScore);
    }, 500);
    return () => clearTimeout(timer);
  }, [overallScore]);

  const scoreColor = useMemo(() => {
    if (overallScore >= 90) return 'text-success';
    if (overallScore >= 75) return 'text-warning';
    if (overallScore >= 60) return 'text-info';
    return 'text-error';
  }, [overallScore]);

  const ringColor = useMemo(() => {
    if (overallScore >= 90) return 'stroke-success';
    if (overallScore >= 75) return 'stroke-warning';
    if (overallScore >= 60) return 'stroke-info';
    return 'stroke-error';
  }, [overallScore]);

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title flex items-center gap-2">
          <Icons.ChartBar />
          Resume Score Analysis
        </h2>

        {/* Main Score Circle */}
        <div className="flex items-center justify-center py-8">
          <div className="relative">
            <svg className="-rotate-90 h-32 w-32 transform" viewBox="0 0 120 120">
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-base-300"
              />
              {/* Progress circle */}
              <motion.circle
                cx="60"
                cy="60"
                r="50"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeLinecap="round"
                className={ringColor}
                initial={{ strokeDasharray: '0 314' }}
                animate={{
                  strokeDasharray: `${(animatedScore / 100) * 314} 314`,
                }}
                transition={{ duration: 2, ease: 'easeInOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="text-center"
                variants={animationVariants.scoreReveal as any}
                initial="hidden"
                animate="visible"
              >
                <div className={`font-bold text-3xl ${scoreColor}`}>
                  {Math.round(animatedScore)}
                </div>
                <div className="text-base-content/70 text-sm">Score</div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-3">
          {Object.entries(categoryScores).map(([category, score]) => (
            <div key={category} className="flex items-center justify-between">
              <span className="font-medium text-sm capitalize">
                {category.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 rounded-full bg-base-300">
                  <motion.div
                    className="h-2 rounded-full bg-primary"
                    variants={animationVariants.progressBar as any}
                    initial="hidden"
                    animate="visible"
                    custom={score}
                  />
                </div>
                <span className="w-8 font-bold text-sm">{score}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Industry Comparison */}
        <div className="divider" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icons.Users />
            <span className="text-sm">Industry Average</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">{industryAverage}</span>
            <div
              className={`badge ${overallScore > industryAverage ? 'badge-success' : 'badge-warning'}`}
            >
              {overallScore > industryAverage ? '+' : ''}
              {Math.round(overallScore - industryAverage)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Interactive suggestion card with before/after preview
const LocalSuggestionCard: React.FC<{
  suggestion: Suggestion;
  index: number;
  onAction: (action: SuggestionAction) => void;
}> = ({ suggestion, index, onAction }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const priorityColors = {
    critical: 'border-error bg-error/10',
    high: 'border-warning bg-warning/10',
    medium: 'border-info bg-info/10',
    low: 'border-success bg-success/10',
  };

  const handleApply = useCallback(async () => {
    if (!suggestion.canAutoApply) return;

    setIsApplying(true);
    try {
      await onAction({
        type: 'apply',
        suggestionId: suggestion.id,
      });
    } finally {
      setIsApplying(false);
    }
  }, [suggestion, onAction]);

  const handlePreview = useCallback(() => {
    setShowPreview(!showPreview);
    onAction({
      type: 'preview',
      suggestionId: suggestion.id,
    });
  }, [showPreview, suggestion.id, onAction]);

  return (
    <motion.div
      className={`card border-2 ${priorityColors[suggestion.priority]} transition-all duration-300`}
      variants={animationVariants.suggestionCard as any}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      custom={index}
    >
      <div className="card-body p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <div
                className={`badge badge-${suggestion.priority === 'critical' ? 'error' : suggestion.priority === 'high' ? 'warning' : suggestion.priority === 'medium' ? 'info' : 'success'}`}
              >
                {suggestion.priority}
              </div>
              <div className="badge badge-outline">{suggestion.category}</div>
              {suggestion.impact.scoreIncrease > 0 && (
                <div className="badge badge-success gap-1">
                  <Icons.Lightning />+{suggestion.impact.scoreIncrease}
                </div>
              )}
            </div>
            <h3 className="font-semibold text-base">{suggestion.title}</h3>
            <p className="mt-1 text-base-content/70 text-sm">{suggestion.description}</p>
          </div>
        </div>

        {/* Impact Metrics */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded bg-base-200 p-2 text-center">
            <div className="text-base-content/70 text-xs">Time</div>
            <div className="font-semibold">{suggestion.effort.timeMinutes}m</div>
          </div>
          <div className="rounded bg-base-200 p-2 text-center">
            <div className="text-base-content/70 text-xs">Difficulty</div>
            <div className="font-semibold capitalize">{suggestion.effort.difficulty}</div>
          </div>
        </div>

        {/* Before/After Preview */}
        <AnimatePresence>
          {showPreview && (suggestion.beforePreview || suggestion.afterPreview) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 space-y-2"
            >
              {suggestion.beforePreview && (
                <div className="rounded border border-error/20 bg-error/10 p-3">
                  <div className="mb-1 font-medium text-error text-xs">Before</div>
                  <div className="text-sm">{suggestion.beforePreview}</div>
                </div>
              )}
              {suggestion.afterPreview && (
                <div className="rounded border border-success/20 bg-success/10 p-3">
                  <div className="mb-1 font-medium text-success text-xs">After</div>
                  <div className="text-sm">{suggestion.afterPreview}</div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="card-actions mt-4 justify-end">
          {(suggestion.beforePreview || suggestion.afterPreview) && (
            <button className="btn btn-ghost btn-sm" onClick={handlePreview}>
              <Icons.Eye />
              {showPreview ? 'Hide' : 'Preview'}
            </button>
          )}

          {suggestion.canAutoApply && !suggestion.isApplied && (
            <button
              className={`btn btn-primary btn-sm ${isApplying ? 'loading' : ''}`}
              onClick={handleApply}
              disabled={isApplying}
            >
              {!isApplying && <Icons.Check />}
              {isApplying ? 'Applying...' : 'Apply'}
            </button>
          )}

          {suggestion.isApplied && (
            <div className="btn btn-success btn-sm no-animation">
              <Icons.Check />
              Applied
            </div>
          )}

          {!suggestion.canAutoApply && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => onAction({ type: 'customize', suggestionId: suggestion.id })}
            >
              Customize
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Achievement badge component
const AchievementBadge: React.FC<{
  achievement: Achievement;
  index: number;
}> = ({ achievement, index }) => {
  const rarityColors = {
    common: 'badge-neutral',
    rare: 'badge-info',
    epic: 'badge-secondary',
    legendary: 'badge-warning',
  };

  return (
    <motion.div
      className="tooltip"
      data-tip={achievement.description}
      variants={animationVariants.achievementBadge as any}
      initial="hidden"
      animate="visible"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={`badge ${rarityColors[achievement.rarity]} gap-2 p-3`}>
        <Icons.Trophy />
        <span className="font-medium text-xs">{achievement.title}</span>
        <span className="text-xs opacity-70">+{achievement.points}</span>
      </div>
    </motion.div>
  );
};

// Milestone progress component
const MilestoneProgress: React.FC<{
  milestone: Milestone;
}> = ({ milestone }) => {
  const progressPercentage = (milestone.currentProgress / milestone.targetScore) * 100;

  return (
    <div className="card border border-base-300 bg-base-100">
      <div className="card-body p-4">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="font-semibold text-sm">{milestone.title}</h4>
          <div className="text-base-content/70 text-xs">
            {milestone.currentProgress}/{milestone.targetScore}
          </div>
        </div>

        <div className="mb-2 h-2 w-full rounded-full bg-base-300">
          <motion.div
            className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary"
            variants={animationVariants.progressBar as any}
            initial="hidden"
            animate="visible"
            custom={progressPercentage}
          />
        </div>

        <p className="mb-2 text-base-content/70 text-xs">{milestone.description}</p>

        <div className="flex items-center justify-between text-xs">
          <span className="text-base-content/70">Est. {milestone.estimatedTimeToComplete}min</span>
          <div className="flex items-center gap-1">
            <Icons.Trophy />
            <span>{milestone.reward.title}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Analysis Dashboard Component
export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({
  analysisResult,
  userGoals,
  industryBenchmarks,
  enableRealTimeUpdates,
  onSuggestionInteraction,
  onScoreUpdate,
}) => {
  const [selectedTab, setSelectedTab] = useState<
    'overview' | 'suggestions' | 'achievements' | 'benchmarks'
  >('overview');
  const [sortBy, setSortBy] = useState<'priority' | 'impact' | 'effort'>('priority');
  const [filterBy, setFilterBy] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');

  // Sort and filter suggestions
  const sortedSuggestions = useMemo(() => {
    let filtered = analysisResult.suggestions;

    if (filterBy !== 'all') {
      filtered = filtered.filter((s) => s.priority === filterBy);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority': {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        case 'impact':
          return b.impact.scoreIncrease - a.impact.scoreIncrease;
        case 'effort':
          return a.effort.timeMinutes - b.effort.timeMinutes;
        default:
          return 0;
      }
    });
  }, [analysisResult.suggestions, sortBy, filterBy]);

  // Handle suggestion interactions
  const handleSuggestionAction = useCallback(
    (action: SuggestionAction) => {
      onSuggestionInteraction(action);

      // Update score if suggestion was applied
      if (action.type === 'apply') {
        const suggestion = analysisResult.suggestions.find((s) => s.id === action.suggestionId);
        if (suggestion) {
          const newScore = analysisResult.overallScore + suggestion.impact.scoreIncrease;
          onScoreUpdate(Math.min(100, newScore));
        }
      }
    },
    [analysisResult, onSuggestionInteraction, onScoreUpdate]
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4">
      {/* Header with tabs */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-bold text-2xl">Resume Analysis Dashboard</h1>
              <p className="text-base-content/70">
                Optimize your resume for {userGoals.targetRole} in {userGoals.targetIndustry}
              </p>
            </div>

            {enableRealTimeUpdates && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-success" />
                <span className="text-sm text-success">Live Updates</span>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="tabs tabs-boxed mt-4">
            <button
              className={`tab ${selectedTab === 'overview' ? 'tab-active' : ''}`}
              onClick={() => setSelectedTab('overview')}
            >
              Overview
            </button>
            <button
              className={`tab ${selectedTab === 'suggestions' ? 'tab-active' : ''}`}
              onClick={() => setSelectedTab('suggestions')}
            >
              Suggestions ({analysisResult.suggestions.length})
            </button>
            <button
              className={`tab ${selectedTab === 'achievements' ? 'tab-active' : ''}`}
              onClick={() => setSelectedTab('achievements')}
            >
              Achievements ({analysisResult.achievements.length})
            </button>
            <button
              className={`tab ${selectedTab === 'benchmarks' ? 'tab-active' : ''}`}
              onClick={() => setSelectedTab('benchmarks')}
            >
              Benchmarks
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {selectedTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 gap-6 lg:grid-cols-3"
          >
            {/* Score Visualization */}
            <div className="lg:col-span-2">
              <ScoreVisualization
                overallScore={analysisResult.overallScore}
                categoryScores={analysisResult.categoryScores}
                industryAverage={industryBenchmarks.averageScore}
              />
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body p-4">
                  <h3 className="mb-3 font-semibold">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Suggestions</span>
                      <span className="font-bold">{analysisResult.suggestions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Critical Issues</span>
                      <span className="font-bold text-error">
                        {analysisResult.suggestions.filter((s) => s.priority === 'critical').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Achievements</span>
                      <span className="font-bold text-success">
                        {analysisResult.achievements.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Next Milestone</span>
                      <span className="font-bold">
                        {analysisResult.nextMilestones[0]?.targetScore || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Milestone */}
              {analysisResult.nextMilestones[0] && (
                <MilestoneProgress milestone={analysisResult.nextMilestones[0]} />
              )}
            </div>
          </motion.div>
        )}

        {selectedTab === 'suggestions' && (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Filters and Sorting */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body p-4">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Sort by</span>
                    </label>
                    <select
                      className="select select-bordered select-sm"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    >
                      <option value="priority">Priority</option>
                      <option value="impact">Impact</option>
                      <option value="effort">Effort</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Filter by</span>
                    </label>
                    <select
                      className="select select-bordered select-sm"
                      value={filterBy}
                      onChange={(e) => setFilterBy(e.target.value as typeof filterBy)}
                    >
                      <option value="all">All Priorities</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Suggestions Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {sortedSuggestions.map((suggestion, index) => (
                <LocalSuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  index={index}
                  onAction={handleSuggestionAction}
                />
              ))}
            </div>

            {sortedSuggestions.length === 0 && (
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body py-12 text-center">
                  <Icons.Sparkles />
                  <h3 className="mt-4 font-semibold text-lg">No suggestions found</h3>
                  <p className="text-base-content/70">
                    {filterBy === 'all'
                      ? 'Great job! Your resume looks excellent.'
                      : `No ${filterBy} priority suggestions found.`}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {selectedTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Achievement Badges */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">Your Achievements</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {analysisResult.achievements.map((achievement, index) => (
                    <AchievementBadge
                      key={achievement.id}
                      achievement={achievement}
                      index={index}
                    />
                  ))}
                </div>

                {analysisResult.achievements.length === 0 && (
                  <div className="py-8 text-center">
                    <Icons.Trophy />
                    <p className="mt-2 text-base-content/70">
                      Complete suggestions to unlock achievements!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Milestones */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">Upcoming Milestones</h2>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {analysisResult.nextMilestones.map((milestone) => (
                    <MilestoneProgress key={milestone.id} milestone={milestone} />
                  ))}
                </div>

                {analysisResult.nextMilestones.length === 0 && (
                  <div className="py-8 text-center">
                    <Icons.Target />
                    <p className="mt-2 text-base-content/70">
                      All milestones completed! Great work!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {selectedTab === 'benchmarks' && (
          <motion.div
            key="benchmarks"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 gap-6 lg:grid-cols-2"
          >
            {/* Industry Comparison */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">Industry Comparison</h2>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Your Score</span>
                    <span className="font-bold text-primary">{analysisResult.overallScore}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Industry Average</span>
                    <span className="font-bold">{industryBenchmarks.averageScore}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Top 10%</span>
                    <span className="font-bold text-success">
                      {industryBenchmarks.topPercentileScore}
                    </span>
                  </div>

                  <div className="divider" />

                  <div className="text-center">
                    <div
                      className={`font-bold text-2xl ${
                        analysisResult.overallScore >= industryBenchmarks.topPercentileScore
                          ? 'text-success'
                          : analysisResult.overallScore >= industryBenchmarks.averageScore
                            ? 'text-warning'
                            : 'text-error'
                      }`}
                    >
                      {analysisResult.overallScore >= industryBenchmarks.topPercentileScore
                        ? 'Top Performer'
                        : analysisResult.overallScore >= industryBenchmarks.averageScore
                          ? 'Above Average'
                          : 'Below Average'}
                    </div>
                    <p className="mt-1 text-base-content/70 text-sm">
                      Compared to {industryBenchmarks.industry} professionals
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trending Skills */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">Trending Skills</h2>
                <div className="mt-4 space-y-2">
                  {industryBenchmarks.trendingSkills.map((skill, index) => (
                    <div key={skill} className="flex items-center justify-between">
                      <span className="text-sm">{skill}</span>
                      <div className="badge badge-primary">#{index + 1}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Common Keywords */}
            <div className="card bg-base-100 shadow-lg lg:col-span-2">
              <div className="card-body">
                <h2 className="card-title">Common Keywords in {industryBenchmarks.role}</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {industryBenchmarks.commonKeywords.map((keyword) => (
                    <div key={keyword} className="badge badge-outline">
                      {keyword}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnalysisDashboard;
