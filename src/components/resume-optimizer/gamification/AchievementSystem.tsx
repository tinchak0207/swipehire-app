/**
 * Achievement System Component
 *
 * Features:
 * - Badge collection and display system
 * - Milestone tracking with progress visualization
 * - Streak counters for consistent usage
 * - Leaderboards and peer comparison
 * - Daily challenges and rewards
 * - Experience points and level progression
 *
 * Built with DaisyUI components and Tailwind CSS
 * Includes smooth animations and haptic feedback
 * Comprehensive accessibility features
 */

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  Achievement,
  AchievementSystem as AchievementSystemType,
  Challenge,
  LeaderboardEntry,
  Milestone,
  StreakData,
} from '../types';

// Achievement rarity colors and effects
const rarityConfig = {
  common: {
    color: 'badge-neutral',
    glow: 'shadow-md',
    animation: 'animate-none',
  },
  rare: {
    color: 'badge-info',
    glow: 'shadow-lg shadow-info/25',
    animation: 'animate-pulse',
  },
  epic: {
    color: 'badge-secondary',
    glow: 'shadow-xl shadow-secondary/30',
    animation: 'animate-bounce',
  },
  legendary: {
    color: 'badge-warning',
    glow: 'shadow-2xl shadow-warning/40',
    animation: 'animate-ping',
  },
};

// Icons for different achievement categories
const CategoryIcons = {
  'first-steps': () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
        clipRule="evenodd"
      />
    </svg>
  ),
  'optimization-master': () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
        clipRule="evenodd"
      />
    </svg>
  ),
  consistency: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
        clipRule="evenodd"
      />
    </svg>
  ),
  collaboration: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
  ),
  expertise: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

// Challenge type icons
const ChallengeIcons = {
  daily: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
        clipRule="evenodd"
      />
    </svg>
  ),
  weekly: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
        clipRule="evenodd"
      />
    </svg>
  ),
  monthly: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
        clipRule="evenodd"
      />
    </svg>
  ),
  special: () => (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M5 2a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0V6H3a1 1 0 110-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 1a1 1 0 01.967.744L14.146 7.2 17.5 8.134a1 1 0 010 1.732L14.146 10.8l-1.179 5.456a1 1 0 01-1.934 0L9.854 10.8 6.5 9.866a1 1 0 010-1.732L9.854 7.2l1.179-5.456A1 1 0 0112 1z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

// Achievement badge component with unlock animation
const AchievementBadge: React.FC<{
  achievement: Achievement;
  isNew?: boolean;
  onClick?: () => void;
}> = ({ achievement, isNew = false, onClick }) => {
  const [showDetails, setShowDetails] = useState(false);
  const rarity = rarityConfig[achievement.rarity];

  const handleClick = useCallback(() => {
    setShowDetails(!showDetails);
    onClick?.();

    // Haptic feedback for rare achievements
    if (achievement.rarity !== 'common' && 'vibrate' in navigator) {
      navigator.vibrate([50, 100, 50]);
    }
  }, [showDetails, onClick, achievement.rarity]);

  return (
    <motion.div
      className="relative"
      initial={isNew ? { scale: 0, rotate: -180 } : false}
      animate={isNew ? { scale: 1, rotate: 0 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <motion.button
        className={`badge ${rarity.color} ${rarity.glow} cursor-pointer gap-2 p-3 transition-all duration-300 hover:scale-105 ${
          isNew ? rarity.animation : ''
        }`}
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {CategoryIcons[achievement.category]()}
        <span className="font-medium text-xs">{achievement.title}</span>
        <span className="text-xs opacity-70">+{achievement.points}</span>
      </motion.button>

      {/* Achievement details tooltip */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            className="-translate-x-1/2 absolute bottom-full left-1/2 z-50 mb-2 transform"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
          >
            <div className="max-w-xs rounded-lg border border-base-300 bg-base-100 p-3 shadow-xl">
              <div className="mb-2 flex items-center gap-2">
                {CategoryIcons[achievement.category]()}
                <span className="font-semibold text-sm">{achievement.title}</span>
                <div className={`badge ${rarity.color} badge-xs`}>{achievement.rarity}</div>
              </div>
              <p className="mb-2 text-base-content/70 text-xs">{achievement.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-base-content/50">
                  {new Date(achievement.unlockedAt).toLocaleDateString()}
                </span>
                <span className="font-bold text-primary">+{achievement.points} XP</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New achievement indicator */}
      {isNew && (
        <motion.div
          className="-top-1 -right-1 absolute h-3 w-3 rounded-full bg-error"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
        />
      )}
    </motion.div>
  );
};

// Milestone progress component with animated progress bar
const MilestoneCard: React.FC<{
  milestone: Milestone;
  onClaim?: () => void;
}> = ({ milestone, onClaim }) => {
  const progressPercentage = (milestone.currentProgress / milestone.targetScore) * 100;
  const isComplete = milestone.currentProgress >= milestone.targetScore;

  return (
    <motion.div
      className={`card border-2 transition-all duration-300 ${
        isComplete
          ? 'border-success bg-success/10 shadow-lg shadow-success/25'
          : 'border-base-300 bg-base-100'
      }`}
      whileHover={{ scale: 1.02 }}
    >
      <div className="card-body p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            <h4 className="mb-1 font-semibold text-sm">{milestone.title}</h4>
            <p className="mb-2 text-base-content/70 text-xs">{milestone.description}</p>
          </div>
          {isComplete && (
            <motion.div
              className="badge badge-success gap-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Complete
            </motion.div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="mb-1 flex justify-between text-xs">
            <span>
              {milestone.currentProgress}/{milestone.targetScore}
            </span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-base-300">
            <motion.div
              className={`h-2 rounded-full ${isComplete ? 'bg-success' : 'bg-primary'}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />
          </div>
        </div>

        {/* Reward and action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <svg className="h-4 w-4 text-warning" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 2L13 8l6 .75-4.5 4.25L16 19l-6-3.25L4 19l1.5-6.25L1 8.75 7 8l3-6z"
                clipRule="evenodd"
              />
            </svg>
            <span>{milestone.reward.title}</span>
            <span className="text-base-content/50">(~{milestone.estimatedTimeToComplete}min)</span>
          </div>

          {isComplete && onClaim && (
            <button className="btn btn-success btn-xs" onClick={onClaim}>
              Claim
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Streak counter with fire animation
const StreakCounter: React.FC<{
  streakData: StreakData;
}> = ({ streakData }) => {
  const isActive = useMemo(() => {
    const today = new Date();
    const lastActivity = new Date(streakData.lastActivity);
    const diffTime = Math.abs(today.getTime() - lastActivity.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 1;
  }, [streakData.lastActivity]);

  return (
    <div className="card bg-gradient-to-br from-orange-500 to-red-600 text-white">
      <div className="card-body p-4 text-center">
        <motion.div
          className="mb-2 text-3xl"
          animate={isActive ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🔥
        </motion.div>
        <div className="font-bold text-2xl">{streakData.current}</div>
        <div className="text-sm opacity-90">Day Streak</div>
        <div className="mt-1 text-xs opacity-75">Best: {streakData.longest} days</div>
        {!isActive && <div className="badge badge-warning badge-sm mt-2">Streak at risk!</div>}
      </div>
    </div>
  );
};

// Challenge card with progress and timer
const ChallengeCard: React.FC<{
  challenge: Challenge;
  onStart?: () => void;
}> = ({ challenge, onStart }) => {
  const [timeRemaining, setTimeRemaining] = useState('');
  const progressPercentage = (challenge.progress / challenge.target) * 100;
  const isComplete = challenge.progress >= challenge.target;

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const expires = new Date(challenge.expiresAt);
      const diff = expires.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeRemaining(`${days}d ${hours % 24}h`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${minutes}m`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [challenge.expiresAt]);

  const typeColors = {
    daily: 'border-info bg-info/10',
    weekly: 'border-warning bg-warning/10',
    monthly: 'border-secondary bg-secondary/10',
    special: 'border-accent bg-accent/10',
  };

  return (
    <motion.div
      className={`card border-2 ${typeColors[challenge.type]} transition-all duration-300`}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="card-body p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            {ChallengeIcons[challenge.type]()}
            <div>
              <h4 className="font-semibold text-sm">{challenge.title}</h4>
              <div className="mt-1 flex items-center gap-2">
                <div
                  className={`badge badge-${challenge.type === 'daily' ? 'info' : challenge.type === 'weekly' ? 'warning' : challenge.type === 'monthly' ? 'secondary' : 'accent'} badge-xs`}
                >
                  {challenge.type}
                </div>
                <span className="text-base-content/50 text-xs">{timeRemaining}</span>
              </div>
            </div>
          </div>

          {isComplete && (
            <motion.div
              className="badge badge-success"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              ✓
            </motion.div>
          )}
        </div>

        <p className="mb-3 text-base-content/70 text-xs">{challenge.description}</p>

        {/* Progress */}
        <div className="mb-3">
          <div className="mb-1 flex justify-between text-xs">
            <span>Progress</span>
            <span>
              {challenge.progress}/{challenge.target}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-base-300">
            <motion.div
              className={`h-2 rounded-full ${isComplete ? 'bg-success' : 'bg-primary'}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            />
          </div>
        </div>

        {/* Reward and action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <svg className="h-4 w-4 text-warning" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 2L13 8l6 .75-4.5 4.25L16 19l-6-3.25L4 19l1.5-6.25L1 8.75 7 8l3-6z"
                clipRule="evenodd"
              />
            </svg>
            <span>{challenge.reward.title}</span>
          </div>

          {!isComplete && onStart && (
            <button className="btn btn-primary btn-xs" onClick={onStart}>
              Start
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Leaderboard component
const Leaderboard: React.FC<{
  entries: readonly LeaderboardEntry[];
  currentUserId: string | undefined;
}> = ({ entries, currentUserId }) => {
  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body p-4">
        <h3 className="card-title mb-4 text-lg">Leaderboard</h3>
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <motion.div
              key={entry.userId}
              className={`flex items-center justify-between rounded-lg p-3 transition-all duration-200 ${
                currentUserId && entry.userId === currentUserId
                  ? 'border border-primary/20 bg-primary/10'
                  : 'bg-base-200 hover:bg-base-300'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm ${
                    entry.rank === 1
                      ? 'bg-warning text-warning-content'
                      : entry.rank === 2
                        ? 'bg-base-300 text-base-content'
                        : entry.rank === 3
                          ? 'bg-accent text-accent-content'
                          : 'bg-base-200 text-base-content'
                  }`}
                >
                  {entry.rank}
                </div>
                <div>
                  <div className="font-medium text-sm">
                    {entry.username}
                    {currentUserId && entry.userId === currentUserId && (
                      <span className="ml-2 text-primary text-xs">(You)</span>
                    )}
                  </div>
                  <div className="text-base-content/70 text-xs">
                    {entry.achievements} achievements
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-primary">{entry.score}</div>
                <div className="text-base-content/50 text-xs">points</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Achievement System component
export const AchievementSystem: React.FC<{
  data: AchievementSystemType;
  currentUserId?: string;
  onAchievementClick?: (achievement: Achievement) => void;
  onMilestoneClaim?: (milestone: Milestone) => void;
  onChallengeStart?: (challenge: Challenge) => void;
}> = ({ data, currentUserId, onAchievementClick, onMilestoneClaim, onChallengeStart }) => {
  const [selectedTab, setSelectedTab] = useState<
    'achievements' | 'milestones' | 'challenges' | 'leaderboard'
  >('achievements');
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  // Calculate total experience points
  const totalXP = useMemo(() => {
    return data.badges.reduce((sum, achievement) => sum + achievement.points, 0);
  }, [data.badges]);

  // Calculate current level based on XP
  const currentLevel = useMemo(() => {
    return Math.floor(totalXP / 1000) + 1;
  }, [totalXP]);

  // Handle new achievement notifications
  useEffect(() => {
    const recentAchievements = data.badges.filter((achievement) => {
      const unlockTime = new Date(achievement.unlockedAt).getTime();
      const now = Date.now();
      return now - unlockTime < 24 * 60 * 60 * 1000; // Last 24 hours
    });

    setNewAchievements(recentAchievements.map((a) => a.id));
  }, [data.badges]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Header with level and XP */}
      <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content">
        <div className="card-body p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-2xl">Level {currentLevel}</h1>
              <p className="opacity-90">
                {totalXP} XP • {data.badges.length} Achievements
              </p>
            </div>
            <div className="text-right">
              <div className="font-bold text-3xl">{totalXP}</div>
              <div className="text-sm opacity-90">Experience Points</div>
            </div>
          </div>

          {/* XP Progress to next level */}
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-sm">
              <span>Progress to Level {currentLevel + 1}</span>
              <span>{totalXP % 1000}/1000 XP</span>
            </div>
            <div className="h-2 w-full rounded-full bg-primary-content/20">
              <motion.div
                className="h-2 rounded-full bg-primary-content"
                initial={{ width: 0 }}
                animate={{ width: `${(totalXP % 1000) / 10}%` }}
                transition={{ duration: 2, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Streak counter */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StreakCounter streakData={data.streaks} />

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 md:col-span-3">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body p-4 text-center">
              <div className="font-bold text-2xl text-primary">{data.badges.length}</div>
              <div className="text-base-content/70 text-sm">Achievements</div>
            </div>
          </div>
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body p-4 text-center">
              <div className="font-bold text-2xl text-secondary">{data.milestones.length}</div>
              <div className="text-base-content/70 text-sm">Milestones</div>
            </div>
          </div>
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body p-4 text-center">
              <div className="font-bold text-2xl text-accent">{data.challenges.length}</div>
              <div className="text-base-content/70 text-sm">Active Challenges</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body p-4">
          <div className="tabs tabs-boxed">
            <button
              className={`tab ${selectedTab === 'achievements' ? 'tab-active' : ''}`}
              onClick={() => setSelectedTab('achievements')}
            >
              Achievements ({data.badges.length})
            </button>
            <button
              className={`tab ${selectedTab === 'milestones' ? 'tab-active' : ''}`}
              onClick={() => setSelectedTab('milestones')}
            >
              Milestones ({data.milestones.length})
            </button>
            <button
              className={`tab ${selectedTab === 'challenges' ? 'tab-active' : ''}`}
              onClick={() => setSelectedTab('challenges')}
            >
              Challenges ({data.challenges.length})
            </button>
            <button
              className={`tab ${selectedTab === 'leaderboard' ? 'tab-active' : ''}`}
              onClick={() => setSelectedTab('leaderboard')}
            >
              Leaderboard
            </button>
          </div>
        </div>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {selectedTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body p-6">
                <h2 className="card-title mb-4">Your Achievements</h2>
                <div className="flex flex-wrap gap-3">
                  {data.badges.map((achievement) => (
                    <AchievementBadge
                      key={achievement.id}
                      achievement={achievement}
                      isNew={newAchievements.includes(achievement.id)}
                      onClick={() => onAchievementClick?.(achievement)}
                    />
                  ))}
                </div>

                {data.badges.length === 0 && (
                  <div className="py-12 text-center">
                    <svg
                      className="mx-auto mb-4 h-16 w-16 text-base-content/30"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 2L13 8l6 .75-4.5 4.25L16 19l-6-3.25L4 19l1.5-6.25L1 8.75 7 8l3-6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <h3 className="mb-2 font-semibold text-lg">No achievements yet</h3>
                    <p className="text-base-content/70">
                      Complete tasks and optimize your resume to unlock achievements!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {selectedTab === 'milestones' && (
          <motion.div
            key="milestones"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            {data.milestones.map((milestone) => (
              <MilestoneCard
                key={milestone.id}
                milestone={milestone}
                onClaim={() => onMilestoneClaim?.(milestone)}
              />
            ))}

            {data.milestones.length === 0 && (
              <div className="card bg-base-100 shadow-lg md:col-span-2">
                <div className="card-body py-12 text-center">
                  <svg
                    className="mx-auto mb-4 h-16 w-16 text-base-content/30"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <h3 className="mb-2 font-semibold text-lg">All milestones completed!</h3>
                  <p className="text-base-content/70">
                    Great work! Check back later for new milestones.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {selectedTab === 'challenges' && (
          <motion.div
            key="challenges"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {data.challenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onStart={() => onChallengeStart?.(challenge)}
              />
            ))}

            {data.challenges.length === 0 && (
              <div className="card bg-base-100 shadow-lg md:col-span-2 lg:col-span-3">
                <div className="card-body py-12 text-center">
                  <svg
                    className="mx-auto mb-4 h-16 w-16 text-base-content/30"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <h3 className="mb-2 font-semibold text-lg">No active challenges</h3>
                  <p className="text-base-content/70">
                    New challenges will appear here. Check back tomorrow!
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {selectedTab === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Leaderboard entries={data.leaderboards} currentUserId={currentUserId} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AchievementSystem;
