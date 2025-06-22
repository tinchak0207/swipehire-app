'use client';

import {
  ArrowLeft,
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  Lightbulb,
  MapPin,
  Target,
  TrendingUp,
  User,
} from 'lucide-react';
import type React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import type { CareerStage } from '@/lib/types';
import { cn } from '@/lib/utils';

/**
 * Career Planning Navigation Item Interface
 * Defines the structure for sidebar navigation items
 */
interface CareerNavigationItem {
  value: string;
  label: string;
  icon: React.ElementType;
  description?: string;
  badge?: string | number;
}

/**
 * Career Planning Sidebar Props Interface
 * Comprehensive typing for the sidebar component
 */
interface CareerPlanningSidebarProps {
  /** Currently active tab/section */
  activeTab: string;
  /** Function to handle tab changes */
  setActiveTab: (value: string) => void;
  /** Current career stage of the user */
  careerStage: CareerStage;
  /** User's career data for context */
  userData?: {
    education: string;
    experience: string[];
    skills: string[];
    interests: string[];
    values: string[];
    careerExpectations: string;
  };
  /** Goals count for badge display */
  goalsCount?: number;
  /** Completed goals count */
  completedGoalsCount?: number;
  /** Career paths count */
  careerPathsCount?: number;
  /** Loading state */
  isLoading?: boolean;
  /** Back to questionnaire handler */
  onBackToQuestionnaire?: () => void;
  /** User display name */
  userName?: string | null;
  /** User photo URL */
  userPhotoURL?: string | null;
}

/**
 * Career Planning Sidebar Component
 *
 * A comprehensive sidebar for career planning dashboard that provides:
 * - Navigation between different career planning sections
 * - Visual indicators for progress and completion
 * - Responsive design with collapsible functionality
 * - Accessibility features and keyboard navigation
 * - Integration with existing design system
 *
 * @component
 * @example
 * ```tsx
 * <CareerPlanningSidebar
 *   activeTab="paths"
 *   setActiveTab={setActiveTab}
 *   careerStage="early"
 *   goalsCount={5}
 *   completedGoalsCount={2}
 * />
 * ```
 */
export function CareerPlanningSidebar({
  activeTab,
  setActiveTab,
  careerStage,
  userData,
  goalsCount = 0,
  completedGoalsCount = 0,
  careerPathsCount = 0,
  isLoading = false,
  onBackToQuestionnaire,
  userName,
  userPhotoURL,
}: CareerPlanningSidebarProps) {
  /**
   * Get career stage information with visual indicators
   */
  const getCareerStageInfo = (stage: CareerStage) => {
    const stageInfo = {
      exploration: {
        title: 'Exploration',
        description: 'Discovering your interests and potential career paths',
        color: 'bg-blue-500',
        icon: '🔍',
        progress: 20,
      },
      early: {
        title: 'Early Career',
        description: 'Building foundational skills and gaining experience',
        color: 'bg-green-500',
        icon: '🌱',
        progress: 40,
      },
      mid: {
        title: 'Mid Career',
        description: 'Developing expertise and taking on leadership roles',
        color: 'bg-yellow-500',
        icon: '🚀',
        progress: 60,
      },
      late: {
        title: 'Late Career',
        description: 'Senior leadership and mentoring others',
        color: 'bg-purple-500',
        icon: '👑',
        progress: 80,
      },
      transition: {
        title: 'Career Transition',
        description: 'Changing career paths or industries',
        color: 'bg-orange-500',
        icon: '🔄',
        progress: 50,
      },
    };
    return stageInfo[stage];
  };

  const stageInfo = getCareerStageInfo(careerStage);

  /**
   * Navigation items organized by category
   * Following the established pattern from DashboardSidebar
   */
  const planningItems: CareerNavigationItem[] = [
    {
      value: 'overview',
      label: 'Career Overview',
      icon: BarChart3,
      description: 'Your career journey at a glance',
    },
    {
      value: 'paths',
      label: 'Career Paths',
      icon: MapPin,
      description: 'Explore recommended career directions',
      badge: careerPathsCount > 0 ? careerPathsCount : undefined,
    },
    {
      value: 'goals',
      label: 'Goals & Milestones',
      icon: Target,
      description: 'Set and track your career objectives',
      badge: goalsCount > 0 ? `${completedGoalsCount}/${goalsCount}` : undefined,
    },
  ];

  const developmentItems: CareerNavigationItem[] = [
    {
      value: 'skills',
      label: 'Skills Development',
      icon: Award,
      description: 'Identify and develop key competencies',
    },
    {
      value: 'learning',
      label: 'Learning Resources',
      icon: BookOpen,
      description: 'Courses, certifications, and training',
    },
    {
      value: 'insights',
      label: 'AI Insights',
      icon: Lightbulb,
      description: 'Personalized career recommendations',
    },
  ];

  const trackingItems: CareerNavigationItem[] = [
    {
      value: 'progress',
      label: 'Progress Tracking',
      icon: TrendingUp,
      description: 'Monitor your career advancement',
    },
    {
      value: 'timeline',
      label: 'Career Timeline',
      icon: Calendar,
      description: 'Visualize your career journey',
    },
  ];

  /**
   * Render menu items with consistent styling and accessibility
   */
  const renderMenuItems = (items: CareerNavigationItem[]) => (
    <SidebarMenu className="space-y-1">
      {items.map((item) => (
        <SidebarMenuItem key={item.value}>
          <SidebarMenuButton
            onClick={() => setActiveTab(item.value)}
            isActive={activeTab === item.value}
            disabled={isLoading}
            className={cn(
              'group w-full justify-start rounded-lg px-4 py-3 transition-all duration-200',
              'text-gray-700 hover:bg-white/60 hover:text-gray-900 hover:shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/30',
              'disabled:cursor-not-allowed disabled:opacity-50',
              activeTab === item.value &&
                'bg-blue-600 font-semibold text-white shadow-md hover:bg-blue-700 hover:text-white'
            )}
            aria-label={`Navigate to ${item.label}${item.description ? `: ${item.description}` : ''}`}
          >
            <item.icon
              className={cn(
                'mr-3 h-5 w-5 transition-colors',
                activeTab === item.value ? 'text-white' : 'text-gray-600 group-hover:text-gray-800'
              )}
            />
            <div className="min-w-0 flex-1">
              <span className="truncate font-medium text-base">{item.label}</span>
              {item.description && (
                <p
                  className={cn(
                    'mt-0.5 truncate text-xs transition-colors',
                    activeTab === item.value
                      ? 'text-blue-100'
                      : 'text-gray-500 group-hover:text-gray-600'
                  )}
                >
                  {item.description}
                </p>
              )}
            </div>
            {item.badge && (
              <Badge
                variant={activeTab === item.value ? 'secondary' : 'outline'}
                className={cn(
                  'ml-2 font-semibold text-xs transition-colors',
                  activeTab === item.value
                    ? 'border-white/30 bg-white/20 text-white'
                    : 'border-blue-200 bg-blue-50 text-blue-700'
                )}
              >
                {item.badge}
              </Badge>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar className="relative border-gray-200/60 border-r bg-white/85 shadow-sm backdrop-blur-md">
      {/* Header with Career Stage Info */}
      <SidebarHeader className="border-gray-200/50 border-b p-6">
        {/* Back Button */}
        {onBackToQuestionnaire && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToQuestionnaire}
            className="mb-4 w-fit text-gray-600 transition-colors hover:bg-gray-100/50 hover:text-gray-800"
            aria-label="Back to Career Assessment"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assessment
          </Button>
        )}

        {/* Career Stage Display */}
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl text-white text-xl shadow-sm',
              stageInfo.color
            )}
          >
            {stageInfo.icon}
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-bold text-gray-900 text-lg">Career Planning</span>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={cn('border-0 font-medium text-white text-xs', stageInfo.color)}
              >
                {stageInfo.title}
              </Badge>
              <span className="text-gray-500 text-xs">{stageInfo.progress}% Complete</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={cn(
                'h-2 rounded-full transition-all duration-1000 ease-out',
                stageInfo.color
              )}
              style={{ width: `${stageInfo.progress}%` }}
              role="progressbar"
              aria-valuenow={stageInfo.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Career progress: ${stageInfo.progress}% complete`}
            />
          </div>
          <p className="mt-1 truncate text-gray-600 text-xs">{stageInfo.description}</p>
        </div>
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent className="px-4 py-6">
        {/* Career Planning Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="mb-3 px-2 font-semibold text-gray-800 text-xs uppercase tracking-wider">
            Career Planning
          </SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(planningItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-6 bg-gray-200/60" />

        {/* Development Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="mb-3 px-2 font-semibold text-gray-800 text-xs uppercase tracking-wider">
            Development
          </SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(developmentItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-6 bg-gray-200/60" />

        {/* Tracking Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="mb-3 px-2 font-semibold text-gray-800 text-xs uppercase tracking-wider">
            Tracking & Analytics
          </SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(trackingItems)}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with User Info */}
      <SidebarFooter className="border-gray-200/50 border-t bg-white/70 p-6 backdrop-blur-sm">
        {userName && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 ring-2 ring-blue-200/50">
              {userPhotoURL ? (
                <img
                  src={userPhotoURL}
                  alt={userName}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-semibold text-gray-900">{userName}</span>
              <span className="text-gray-600 text-xs capitalize">{stageInfo.title} Stage</span>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-white/50 p-2 text-center">
            <div className="font-semibold text-gray-900">{goalsCount}</div>
            <div className="text-gray-600">Goals</div>
          </div>
          <div className="rounded-lg bg-white/50 p-2 text-center">
            <div className="font-semibold text-gray-900">{careerPathsCount}</div>
            <div className="text-gray-600">Paths</div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default CareerPlanningSidebar;
