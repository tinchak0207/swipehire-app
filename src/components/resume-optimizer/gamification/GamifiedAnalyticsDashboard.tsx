'use client';

import {
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  ClockIcon,
  FireIcon,
  LightBulbIcon,
  StarIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import type { ResumeAnalysisResponse } from '@/lib/types/resume-optimizer';
import { AdvancedAnalyticsDashboard } from '../analytics/AdvancedAnalyticsDashboard';

interface GamifiedAnalyticsDashboardProps {
  userId?: string;
  analysisData?: ResumeAnalysisResponse | null;
  timeRange?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  realTime?: boolean;
  showBenchmarks?: boolean;
  showInsights?: boolean;
  allowExport?: boolean;
  theme?: 'light' | 'dark';
  height?: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  progress?: number;
  target?: number;
}

interface Streak {
  current: number;
  best: number;
  lastActivity: Date;
}

interface GamificationMetrics {
  points: number;
  level: number;
  nextLevelPoints: number;
  achievements: Achievement[];
  streak: Streak;
  rank: number;
}

export function GamifiedAnalyticsDashboard({
  userId,
  analysisData,
  timeRange = 'month',
  realTime = true,
  showBenchmarks = true,
  showInsights = true,
  allowExport = true,
  theme = 'light',
  height = 800,
}: GamifiedAnalyticsDashboardProps) {
  const [gamificationData, setGamificationData] = useState<GamificationMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize gamification data
  useEffect(() => {
    const initializeGamificationData = () => {
      // In a real implementation, this would come from an API or local storage
      const mockData: GamificationMetrics = {
        points: analysisData ? Math.min(1000, Math.floor(analysisData.overallScore * 10)) : 0,
        level: analysisData
          ? Math.floor(Math.min(1000, Math.floor(analysisData.overallScore * 10)) / 100) + 1
          : 1,
        nextLevelPoints: analysisData
          ? 100 - (Math.min(1000, Math.floor(analysisData.overallScore * 10)) % 100)
          : 100,
        streak: {
          current: 3,
          best: 7,
          lastActivity: new Date(),
        },
        rank: 142,
        achievements: [
          {
            id: 'first_analysis',
            title: 'First Analysis',
            description: 'Complete your first resume analysis',
            icon: 'academic-cap',
            earned: true,
          },
          {
            id: 'score_80',
            title: 'High Achiever',
            description: 'Achieve a score of 80 or higher',
            icon: 'trophy',
            earned: analysisData ? analysisData.overallScore >= 80 : false,
            progress: analysisData ? Math.min(100, analysisData.overallScore) : 0,
            target: 80,
          },
          {
            id: 'five_analyses',
            title: 'Analysis Enthusiast',
            description: 'Complete 5 resume analyses',
            icon: 'chart-bar',
            earned: false,
            progress: 3,
            target: 5,
          },
          {
            id: 'perfect_ats',
            title: 'ATS Master',
            description: 'Achieve a perfect ATS score',
            icon: 'arrow-trending-up',
            earned: analysisData ? analysisData.atsScore === 100 : false,
          },
          {
            id: 'streak_7',
            title: 'Week Streak',
            description: 'Use the optimizer for 7 consecutive days',
            icon: 'fire',
            earned: false,
            progress: 3,
            target: 7,
          },
        ],
      };

      setGamificationData(mockData);
      setIsLoading(false);
    };

    initializeGamificationData();
  }, [analysisData]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-blue-500 border-b-2" />
      </div>
    );
  }

  const getLevelProgress = () => {
    if (!gamificationData) return 0;
    return gamificationData.points % 100;
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'trophy':
        return <TrophyIcon className="h-6 w-6" />;
      case 'fire':
        return <FireIcon className="h-6 w-6" />;
      case 'chart-bar':
        return <ChartBarIcon className="h-6 w-6" />;
      case 'academic-cap':
        return <AcademicCapIcon className="h-6 w-6" />;
      case 'arrow-trending-up':
        return <ArrowTrendingUpIcon className="h-6 w-6" />;
      case 'clock':
        return <ClockIcon className="h-6 w-6" />;
      case 'light-bulb':
        return <LightBulbIcon className="h-6 w-6" />;
      case 'star':
        return <StarIcon className="h-6 w-6" />;
      default:
        return <StarIcon className="h-6 w-6" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Gamification Header */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* Points Card */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Points</p>
              <p className="font-bold text-3xl">{gamificationData?.points || 0}</p>
            </div>
            <StarIcon className="h-10 w-10 text-blue-200" />
          </div>
        </div>

        {/* Level Card */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Level</p>
              <p className="font-bold text-3xl">{gamificationData?.level || 1}</p>
              <p className="mt-1 text-purple-100 text-sm">
                {gamificationData?.nextLevelPoints || 0} pts to next level
              </p>
            </div>
            <AcademicCapIcon className="h-10 w-10 text-purple-200" />
          </div>

          {/* Level Progress Bar */}
          <div className="mt-4">
            <div className="h-2 w-full rounded-full bg-purple-300">
              <div
                className="h-2 rounded-full bg-white"
                style={{ width: `${getLevelProgress()}%` }}
              />
            </div>
          </div>
        </div>

        {/* Streak Card */}
        <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Current Streak</p>
              <p className="font-bold text-3xl">{gamificationData?.streak.current || 0} days</p>
              <p className="mt-1 text-orange-100 text-sm">
                Best: {gamificationData?.streak.best || 0} days
              </p>
            </div>
            <FireIcon className="h-10 w-10 text-orange-200" />
          </div>
        </div>

        {/* Rank Card */}
        <div className="rounded-2xl bg-gradient-to-r from-green-500 to-teal-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Global Rank</p>
              <p className="font-bold text-3xl">#{gamificationData?.rank || 0}</p>
            </div>
            <TrophyIcon className="h-10 w-10 text-green-200" />
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-xl">Achievements</h2>
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 font-medium text-blue-800 text-xs">
            {gamificationData?.achievements.filter((a) => a.earned).length || 0} of{' '}
            {gamificationData?.achievements.length || 0} earned
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {gamificationData?.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`rounded-xl border p-4 transition-all duration-200 ${
                achievement.earned
                  ? 'border-green-200 bg-green-50 hover:bg-green-100'
                  : 'border-gray-200 bg-gray-50 opacity-75'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`rounded-lg p-2 ${
                    achievement.earned ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {getIconComponent(achievement.icon)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                  <p className="mt-1 text-gray-600 text-sm">{achievement.description}</p>

                  {achievement.progress !== undefined && achievement.target && (
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-gray-500 text-xs">
                        <span>Progress</span>
                        <span>
                          {achievement.progress} / {achievement.target}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className={`h-2 rounded-full ${
                            achievement.earned ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{
                            width: `${Math.min(100, (achievement.progress / achievement.target) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {achievement.earned && (
                    <div className="mt-2 flex items-center text-green-600 text-sm">
                      <CheckCircleIcon className="mr-1 h-4 w-4" />
                      Earned
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Analytics */}
      {userId && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 font-bold text-gray-900 text-xl">Detailed Analytics</h2>
          <AdvancedAnalyticsDashboard
            userId={userId}
            timeRange={timeRange}
            realTime={realTime}
            showBenchmarks={showBenchmarks}
            showInsights={showInsights}
            allowExport={allowExport}
            theme={theme}
            height={height}
          />
        </div>
      )}
    </div>
  );
}
