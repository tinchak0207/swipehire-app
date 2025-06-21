'use client'

import React from 'react'
import { 
  Target, 
  TrendingUp, 
  BookOpen, 
  Award, 
  BarChart3, 
  Lightbulb,
  MapPin,
  Calendar,
  CheckCircle2,
  Settings as SettingsIcon,
  User,
  ArrowLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CareerStage } from '@/lib/types'

/**
 * Career Planning Navigation Item Interface
 * Defines the structure for sidebar navigation items
 */
interface CareerNavigationItem {
  value: string
  label: string
  icon: React.ElementType
  description?: string
  badge?: string | number
}

/**
 * Career Planning Sidebar Props Interface
 * Comprehensive typing for the sidebar component
 */
interface CareerPlanningSidebarProps {
  /** Currently active tab/section */
  activeTab: string
  /** Function to handle tab changes */
  setActiveTab: (value: string) => void
  /** Current career stage of the user */
  careerStage: CareerStage
  /** User's career data for context */
  userData?: {
    education: string
    experience: string[]
    skills: string[]
    interests: string[]
    values: string[]
    careerExpectations: string
  }
  /** Goals count for badge display */
  goalsCount?: number
  /** Completed goals count */
  completedGoalsCount?: number
  /** Career paths count */
  careerPathsCount?: number
  /** Loading state */
  isLoading?: boolean
  /** Back to questionnaire handler */
  onBackToQuestionnaire?: () => void
  /** User display name */
  userName?: string | null
  /** User photo URL */
  userPhotoURL?: string | null
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
  userPhotoURL
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
        progress: 20
      },
      early: { 
        title: 'Early Career', 
        description: 'Building foundational skills and gaining experience',
        color: 'bg-green-500',
        icon: '🌱',
        progress: 40
      },
      mid: { 
        title: 'Mid Career', 
        description: 'Developing expertise and taking on leadership roles',
        color: 'bg-yellow-500',
        icon: '🚀',
        progress: 60
      },
      late: { 
        title: 'Late Career', 
        description: 'Senior leadership and mentoring others',
        color: 'bg-purple-500',
        icon: '👑',
        progress: 80
      },
      transition: { 
        title: 'Career Transition', 
        description: 'Changing career paths or industries',
        color: 'bg-orange-500',
        icon: '🔄',
        progress: 50
      }
    }
    return stageInfo[stage]
  }

  const stageInfo = getCareerStageInfo(careerStage)

  /**
   * Navigation items organized by category
   * Following the established pattern from DashboardSidebar
   */
  const planningItems: CareerNavigationItem[] = [
    {
      value: 'overview',
      label: 'Career Overview',
      icon: BarChart3,
      description: 'Your career journey at a glance'
    },
    {
      value: 'paths',
      label: 'Career Paths',
      icon: MapPin,
      description: 'Explore recommended career directions',
      badge: careerPathsCount > 0 ? careerPathsCount : undefined
    },
    {
      value: 'goals',
      label: 'Goals & Milestones',
      icon: Target,
      description: 'Set and track your career objectives',
      badge: goalsCount > 0 ? `${completedGoalsCount}/${goalsCount}` : undefined
    }
  ]

  const developmentItems: CareerNavigationItem[] = [
    {
      value: 'skills',
      label: 'Skills Development',
      icon: Award,
      description: 'Identify and develop key competencies'
    },
    {
      value: 'learning',
      label: 'Learning Resources',
      icon: BookOpen,
      description: 'Courses, certifications, and training'
    },
    {
      value: 'insights',
      label: 'AI Insights',
      icon: Lightbulb,
      description: 'Personalized career recommendations'
    }
  ]

  const trackingItems: CareerNavigationItem[] = [
    {
      value: 'progress',
      label: 'Progress Tracking',
      icon: TrendingUp,
      description: 'Monitor your career advancement'
    },
    {
      value: 'timeline',
      label: 'Career Timeline',
      icon: Calendar,
      description: 'Visualize your career journey'
    }
  ]

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
              "w-full justify-start transition-all duration-200 rounded-lg px-4 py-3 group",
              "text-gray-700 hover:bg-white/60 hover:text-gray-900 hover:shadow-sm",
              "focus:ring-2 focus:ring-blue-500/30 focus:outline-none",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              activeTab === item.value && 
                "bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 hover:text-white"
            )}
            aria-label={`Navigate to ${item.label}${item.description ? `: ${item.description}` : ''}`}
          >
            <item.icon className={cn(
              "h-5 w-5 mr-3 transition-colors",
              activeTab === item.value ? "text-white" : "text-gray-600 group-hover:text-gray-800"
            )} />
            <div className="flex-1 min-w-0">
              <span className="text-base font-medium truncate">{item.label}</span>
              {item.description && (
                <p className={cn(
                  "text-xs mt-0.5 truncate transition-colors",
                  activeTab === item.value ? "text-blue-100" : "text-gray-500 group-hover:text-gray-600"
                )}>
                  {item.description}
                </p>
              )}
            </div>
            {item.badge && (
              <Badge 
                variant={activeTab === item.value ? "secondary" : "outline"}
                className={cn(
                  "ml-2 text-xs font-semibold transition-colors",
                  activeTab === item.value 
                    ? "bg-white/20 text-white border-white/30" 
                    : "bg-blue-50 text-blue-700 border-blue-200"
                )}
              >
                {item.badge}
              </Badge>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )

  return (
    <Sidebar className="border-r border-gray-200/60 bg-white/85 backdrop-blur-md shadow-sm relative">
      {/* Header with Career Stage Info */}
      <SidebarHeader className="border-b border-gray-200/50 p-6">
        {/* Back Button */}
        {onBackToQuestionnaire && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToQuestionnaire}
            className="mb-4 w-fit text-gray-600 hover:text-gray-800 hover:bg-gray-100/50 transition-colors"
            aria-label="Back to Career Assessment"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assessment
          </Button>
        )}

        {/* Career Stage Display */}
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm text-xl",
            stageInfo.color
          )}>
            {stageInfo.icon}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-lg font-bold text-gray-900 truncate">
              Career Planning
            </span>
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs font-medium text-white border-0",
                  stageInfo.color
                )}
              >
                {stageInfo.title}
              </Badge>
              <span className="text-xs text-gray-500">
                {stageInfo.progress}% Complete
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className={cn("h-2 rounded-full transition-all duration-1000 ease-out", stageInfo.color)}
              style={{ width: `${stageInfo.progress}%` }}
              role="progressbar"
              aria-valuenow={stageInfo.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Career progress: ${stageInfo.progress}% complete`}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1 truncate">
            {stageInfo.description}
          </p>
        </div>
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent className="px-4 py-6">
        {/* Career Planning Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-3 px-2">
            Career Planning
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(planningItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-6 bg-gray-200/60" />

        {/* Development Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-3 px-2">
            Development
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(developmentItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-6 bg-gray-200/60" />

        {/* Tracking Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-3 px-2">
            Tracking & Analytics
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(trackingItems)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with User Info */}
      <SidebarFooter className="border-t border-gray-200/50 p-6 bg-white/70 backdrop-blur-sm">
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
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-semibold text-gray-900 truncate">{userName}</span>
              <span className="text-xs text-gray-600 capitalize">
                {stageInfo.title} Stage
              </span>
            </div>
          </div>
        )}
        
        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white/50 rounded-lg p-2 text-center">
            <div className="font-semibold text-gray-900">{goalsCount}</div>
            <div className="text-gray-600">Goals</div>
          </div>
          <div className="bg-white/50 rounded-lg p-2 text-center">
            <div className="font-semibold text-gray-900">{careerPathsCount}</div>
            <div className="text-gray-600">Paths</div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export default CareerPlanningSidebar