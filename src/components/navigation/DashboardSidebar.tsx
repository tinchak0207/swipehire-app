'use client';

import {
  Award,
  Briefcase,
  Building2,
  ChevronDown,
  ChevronRight,
  Globe,
  LogIn,
  LogOut,
  Search,
  Settings as SettingsIcon,
  Sparkles,
  Star,
  Target,
  Zap,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';

/**
 * Navigation Item Interface
 * Defines the structure for sidebar navigation items with enhanced features
 */
interface NavigationItem {
  value: string;
  label: string;
  icon: React.ElementType;
  component: JSX.Element;
  badge?: string | number | undefined;
  isNew?: boolean;
  isPro?: boolean;
  description?: string;
  shortcut?: string | undefined;
  subItems?: NavigationSubItem[];
}

/**
 * Sub Navigation Item Interface
 * For nested navigation items within main categories
 */
interface NavigationSubItem {
  value: string;
  label: string;
  icon?: React.ElementType;
  badge?: string | number;
  isNew?: boolean;
  description?: string;
}

/**
 * Dashboard Sidebar Props Interface
 * Comprehensive typing for the enhanced sidebar component
 */
interface DashboardSidebarProps {
  /** Currently active tab/section */
  activeTab: string;
  /** Function to set the active tab */
  setActiveTabAction: (value: string) => void;
  /** Array of navigation items to display */
  tabItems: NavigationItem[];
  /** Current user's role */
  currentUserRole: UserRole | null;
  /** Whether the app is in guest mode */
  isGuestMode: boolean;
  /** User's display name */
  userName?: string | null;
  /** User's profile photo URL */
  userPhotoURL?: string | null;
  /** Optional callback for logout */
  onLogout?: () => void;
  /** Optional callback for profile click */
  onProfileClick?: () => void;
  /** Optional search functionality */
  onSearch?: (query: string) => void;
  /** Optional notification count */
  notificationCount?: number;
  /** Optional completion percentage for profile */
  profileCompletion?: number;
}

/**
 * Enhanced Dashboard Sidebar Component
 *
 * A comprehensive, modern sidebar for the SwipeHire dashboard that provides:
 * - Responsive design with collapsible states
 * - Role-based navigation with dynamic content
 * - Search functionality and quick actions
 * - Progress tracking and notifications
 * - Accessibility features and keyboard navigation
 * - Smooth animations and modern styling
 * - DaisyUI component integration
 * - TypeScript strict typing
 *
 * @example
 * ```tsx
 * <DashboardSidebar
 *   activeTab="findJobs"
 *   setActiveTab={setActiveTab}
 *   tabItems={navigationItems}
 *   currentUserRole="jobseeker"
 *   isGuestMode={false}
 *   userName="John Doe"
 *   userPhotoURL="/avatar.jpg"
 *   onLogout={handleLogout}
 *   profileCompletion={75}
 * />
 * ```
 */
export function DashboardSidebar({
  activeTab,
  setActiveTabAction,
  tabItems,
  currentUserRole,
  isGuestMode,
  userName,
  userPhotoURL,
  onLogout,
  onProfileClick,
  onSearch,
  notificationCount = 0,
  profileCompletion = 0,
}: DashboardSidebarProps): JSX.Element {
  // Sidebar state management
  const { state } = useSidebar();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['primary', 'jobManagement', 'tools', 'analytics', 'settings'])
  );
  const [quickActions, setQuickActions] = useState<NavigationItem[]>([]);

  // Memoized navigation groups for performance
  const navigationGroups = useMemo(() => {
    const primaryItems = tabItems.filter((item) =>
      ['findJobs', 'findTalent', 'myProfile', 'dashboard'].includes(item.value)
    );

    const jobManagementItems = tabItems.filter((item) =>
      ['postJob', 'manageJobs', 'jobAnalytics'].includes(item.value)
    );

    const toolsItems = tabItems.filter((item) =>
      ['aiTools', 'myMatches', 'myDiary', 'careerAI', 'salaryEnquiry', 'resumeOptimizer'].includes(item.value)
    );

    const analyticsItems = tabItems.filter((item) =>
      ['analytics', 'reports', 'insights'].includes(item.value)
    );

    const settingsItems = tabItems.filter((item) => ['settings'].includes(item.value));

    return {
      primary: primaryItems,
      jobManagement: jobManagementItems,
      tools: toolsItems,
      analytics: analyticsItems,
      settings: settingsItems,
    };
  }, [tabItems]);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return tabItems;

    return tabItems.filter(
      (item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tabItems, searchQuery]);

  // Handle search input
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      onSearch?.(query);
    },
    [onSearch]
  );

  // Toggle group expansion
  const toggleGroup = useCallback((groupKey: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  }, []);

  // Set up quick actions based on user role
  useEffect(() => {
    const actions: NavigationItem[] = [];

    if (currentUserRole === 'recruiter') {
      actions.push(...tabItems.filter((item) => ['postJob', 'findTalent'].includes(item.value)));
    } else {
      actions.push(...tabItems.filter((item) => ['findJobs', 'aiTools'].includes(item.value)));
    }

    setQuickActions(actions.slice(0, 2));
  }, [currentUserRole, tabItems]);

  // Render individual menu item
  const renderMenuItem = useCallback(
    (item: NavigationItem) => {
      const isActive = activeTab === item.value;
      const hasSubItems = item.subItems && item.subItems.length > 0;

      // Color coding based on item type
      const getItemColors = () => {
        if (isActive) {
          return {
            bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
            text: 'text-white',
            icon: 'text-white',
            border: 'border-blue-500',
            shadow: 'shadow-lg',
          };
        }

        // Different colors for different item types
        if (item.value.includes('ai') || item.value.includes('career')) {
          return {
            bg: 'bg-white/80 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50',
            text: 'text-gray-700 hover:text-purple-700',
            icon: 'text-purple-600',
            border: 'border-gray-200 hover:border-purple-300',
            shadow: 'hover:shadow-md',
          };
        }

        if (item.value.includes('job') || item.value.includes('talent')) {
          // Special styling for findTalent to match other buttons
          if (item.value === 'findTalent') {
            return {
              bg: 'bg-white/80 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50',
              text: 'text-gray-700 hover:text-blue-700',
              icon: 'text-blue-800', // Navy blue icon
              border: 'border-gray-200 hover:border-blue-300',
              shadow: 'hover:shadow-md',
            };
          }

          // Default styling for other job-related items
          return {
            bg: 'bg-white/80 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50',
            text: 'text-gray-700 hover:text-green-700',
            icon: 'text-green-600',
            border: 'border-gray-200 hover:border-green-300',
            shadow: 'hover:shadow-md',
          };
        }

        return {
          bg: 'bg-white/80 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50',
          text: 'text-gray-700 hover:text-blue-700',
          icon: 'text-blue-600',
          border: 'border-gray-200 hover:border-blue-300',
          shadow: 'hover:shadow-md',
        };
      };

      const colors = getItemColors();

      return (
        <SidebarMenuItem key={item.value}>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMenuButton
                onClick={() => !hasSubItems && setActiveTabAction(item.value)}
                isActive={isActive}
                className={cn(
                  'mb-1 w-full justify-start rounded-xl px-4 py-3 transition-all duration-200',
                  colors.bg,
                  colors.text,
                  colors.border,
                  colors.shadow,
                  'border backdrop-blur-sm',
                  'focus:outline-none focus:ring-2 focus:ring-blue-200',
                  'group relative overflow-hidden',
                  isActive && [
                    'scale-[1.02] transform font-semibold',
                    'before:absolute before:top-0 before:left-0 before:h-full before:w-1',
                    'before:rounded-r-full before:bg-white',
                  ]
                )}
              >
                <div className="flex min-w-0 flex-1 items-center">
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 shrink-0 transition-colors duration-200',
                      isActive ? 'text-white' : colors.icon
                    )}
                  />
                  <span className="truncate font-medium text-sm">{item.label}</span>

                  {/* Badges and indicators */}
                  <div className="ml-auto flex items-center gap-1">
                    {item.isNew && (
                      <Badge
                        variant="secondary"
                        className="border-green-200 bg-green-100 px-2 py-0.5 font-semibold text-green-700 text-xs"
                      >
                        New
                      </Badge>
                    )}
                    {item.isPro && (
                      <Badge
                        variant="secondary"
                        className="border-amber-200 bg-gradient-to-r from-yellow-100 to-amber-100 px-2 py-0.5 font-semibold text-amber-700 text-xs"
                      >
                        <Star className="mr-1 h-3 w-3" />
                        Pro
                      </Badge>
                    )}
                    {item.badge && (
                      <SidebarMenuBadge
                        className={cn(
                          'font-semibold',
                          isActive ? 'bg-white/20 text-white' : 'bg-blue-500 text-white'
                        )}
                      >
                        {item.badge}
                      </SidebarMenuBadge>
                    )}
                    {hasSubItems && (
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-colors duration-200',
                          isActive ? 'text-white/70' : 'text-gray-400'
                        )}
                      />
                    )}
                  </div>
                </div>

                {/* Keyboard shortcut indicator */}
                {item.shortcut && state === 'expanded' && (
                  <kbd className="ml-2 hidden h-5 select-none items-center gap-1 rounded border bg-gray-100 px-1.5 font-medium font-mono text-[10px] text-gray-600 group-hover:inline-flex">
                    {item.shortcut}
                  </kbd>
                )}
              </SidebarMenuButton>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="max-w-xs border-gray-200 bg-white/90 backdrop-blur-sm"
            >
              <div>
                <p className="font-semibold text-gray-800">{item.label}</p>
                {item.description && (
                  <p className="mt-1 text-gray-600 text-xs">{item.description}</p>
                )}
                {item.shortcut && (
                  <p className="mt-1 text-gray-500 text-xs">
                    Shortcut:{' '}
                    <kbd className="rounded bg-gray-100 px-1 text-gray-700">{item.shortcut}</kbd>
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>

          {/* Sub-menu items */}
          {hasSubItems && (
            <SidebarMenuSub className="ml-4 space-y-1">
              {item.subItems?.map((subItem) => (
                <SidebarMenuSubItem key={subItem.value}>
                  <SidebarMenuSubButton
                    onClick={() => setActiveTabAction(subItem.value)}
                    isActive={activeTab === subItem.value}
                    className={cn(
                      'rounded-lg px-3 py-2 text-gray-600 transition-all duration-200 hover:bg-white/60 hover:text-gray-800',
                      activeTab === subItem.value &&
                        'bg-gradient-to-r from-blue-100 to-cyan-100 font-medium text-blue-700'
                    )}
                  >
                    {subItem.icon && <subItem.icon className="mr-2 h-4 w-4" />}
                    <span className="text-sm">{subItem.label}</span>
                    {subItem.badge && (
                      <SidebarMenuBadge className="ml-auto bg-blue-500 text-white">
                        {subItem.badge}
                      </SidebarMenuBadge>
                    )}
                    {subItem.isNew && (
                      <Badge
                        variant="secondary"
                        className="ml-auto bg-green-100 text-green-700 text-xs"
                      >
                        New
                      </Badge>
                    )}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      );
    },
    [activeTab, setActiveTabAction, state]
  );

  // Render navigation group
  const renderNavigationGroup = useCallback(
    (items: NavigationItem[], groupKey: string, groupLabel: string, isCollapsible = true) => {
      if (items.length === 0) return null;

      const isExpanded = expandedGroups.has(groupKey);

      return (
        <SidebarGroup key={groupKey}>
          <Collapsible
            open={isExpanded}
            onOpenChange={() => isCollapsible && toggleGroup(groupKey)}
          >
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel
                className={cn(
                  'group/label mb-3 px-2 font-semibold text-sidebar-foreground/70 text-xs uppercase tracking-wider',
                  'transition-colors duration-200 hover:text-sidebar-foreground',
                  isCollapsible && 'flex cursor-pointer items-center justify-between'
                )}
              >
                <span>{groupLabel}</span>
                {isCollapsible && (
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 transition-transform duration-200',
                      isExpanded && 'rotate-90'
                    )}
                  />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {items.map((item) => renderMenuItem(item))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      );
    },
    [expandedGroups, toggleGroup, renderMenuItem]
  );

  // Get role-specific greeting and stats
  const getRoleInfo = useCallback(() => {
    if (isGuestMode) {
      return {
        greeting: 'Welcome, Guest!',
        subtitle: 'Explore opportunities',
        icon: Globe,
        color: 'text-blue-600',
      };
    }

    switch (currentUserRole) {
      case 'recruiter':
        return {
          greeting: `Welcome back, ${userName?.split(' ')[0] || 'Recruiter'}!`,
          subtitle: 'Find top talent',
          icon: Building2,
          color: 'text-orange-600',
        };
      case 'jobseeker':
        return {
          greeting: `Hi, ${userName?.split(' ')[0] || 'Job Seeker'}!`,
          subtitle: 'Discover opportunities',
          icon: Target,
          color: 'text-blue-600',
        };
      default:
        return {
          greeting: `Welcome, ${userName?.split(' ')[0] || 'User'}!`,
          subtitle: 'Get started',
          icon: Sparkles,
          color: 'text-purple-600',
        };
    }
  }, [isGuestMode, currentUserRole, userName]);

  const roleInfo = getRoleInfo();

  return (
    <Sidebar
      className={cn(
        'border-gray-200 border-r bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/20 shadow-lg backdrop-blur-md',
        'transition-all duration-300 ease-in-out',
        state === 'collapsed' && 'shadow-sm'
      )}
      collapsible="icon"
    >
      {/* Header Section */}
      <SidebarHeader className="border-gray-200/50 border-b bg-white/80 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {/* Logo/Brand */}
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl shadow-lg transition-all duration-200',
              'bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:scale-105 hover:shadow-xl'
            )}
          >
            <Briefcase className="h-6 w-6" />
          </div>

          {/* Brand and user info */}
          {state === 'expanded' && (
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800 text-xl">SwipeHire</span>
                {isGuestMode && (
                  <Badge
                    variant="secondary"
                    className="border-blue-200 bg-blue-100 text-blue-800 text-xs"
                  >
                    <Globe className="mr-1 h-3 w-3" />
                    Guest
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-gray-600 text-xs">
                <roleInfo.icon className={cn('h-3 w-3', roleInfo.color)} />
                <span className="font-medium capitalize">{currentUserRole || 'Explorer'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Search Bar */}
        {state === 'expanded' && onSearch && (
          <div className="mt-4">
            <div className="relative">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
              <SidebarInput
                placeholder="Search navigation..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="rounded-lg border-gray-200 bg-white/60 pl-9 text-black placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
        )}

        {/* Profile completion progress */}
        {state === 'expanded' &&
          !isGuestMode &&
          profileCompletion > 0 &&
          profileCompletion < 100 && (
            <div className="mt-4 rounded-xl border border-blue-200/50 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-gray-800 text-sm">Profile Setup</span>
                </div>
                <span className="font-bold text-blue-600 text-sm">{profileCompletion}%</span>
              </div>
              <Progress value={profileCompletion} className="h-3 bg-blue-100" />
              <p className="mt-2 flex items-center gap-1 text-gray-600 text-xs">
                <Sparkles className="h-3 w-3 text-yellow-500" />
                Complete your profile to unlock all features
              </p>
            </div>
          )}
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent className="space-y-3 px-3 py-4">
        {/* Quick Actions */}
        {state === 'expanded' && quickActions.length > 0 && (
          <div className="px-2">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-700 text-xs uppercase tracking-wider">
              <Zap className="h-4 w-4 text-yellow-500" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Button
                  key={action.value}
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTabAction(action.value)}
                  className={cn(
                    'flex h-auto flex-col items-center gap-2 px-3 py-3 text-xs transition-all duration-200',
                    'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:shadow-md',
                    activeTab === action.value &&
                      'border-blue-500 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                  )}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="truncate font-medium">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Main Navigation Groups */}
        {searchQuery ? (
          // Filtered search results
          <SidebarGroup>
            <SidebarGroupLabel className="mb-3 px-2 font-semibold text-sidebar-foreground/70 text-xs uppercase tracking-wider">
              Search Results ({filteredItems.length})
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {filteredItems.map((item) => renderMenuItem(item))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          // Regular navigation groups
          <>
            {/* Primary Navigation */}
            {renderNavigationGroup(
              navigationGroups.primary,
              'primary',
              currentUserRole === 'recruiter' ? 'Talent & Jobs' : 'Discover',
              false
            )}

            {/* Job Management (Recruiters only) */}
            {navigationGroups.jobManagement.length > 0 && (
              <>
                <SidebarSeparator className="my-1 h-px bg-gray-200/30" />
                {renderNavigationGroup(
                  navigationGroups.jobManagement,
                  'jobManagement',
                  'Job Management'
                )}
              </>
            )}

            {/* Tools & Features */}
            {navigationGroups.tools.length > 0 && (
              <>
                <SidebarSeparator className="my-1 h-px bg-gray-200/30" />
                {renderNavigationGroup(navigationGroups.tools, 'tools', 'Tools & Research')}
              </>
            )}

            {/* Analytics & Reports */}
            {navigationGroups.analytics.length > 0 && (
              <>
                <SidebarSeparator className="my-1 h-px bg-gray-200/30" />
                {renderNavigationGroup(
                  navigationGroups.analytics,
                  'analytics',
                  'Analytics & Insights'
                )}
              </>
            )}

            {/* Settings */}
            {navigationGroups.settings.length > 0 && (
              <>
                <SidebarSeparator className="my-1 h-px bg-gray-200/30" />
                {renderNavigationGroup(navigationGroups.settings, 'settings', 'Account', false)}
              </>
            )}
          </>
        )}
      </SidebarContent>

      {/* Footer Section */}
      <SidebarFooter className="border-gray-200/50 border-t bg-white/80 p-4 backdrop-blur-sm">
        {!isGuestMode && userName && (
          <div className="space-y-4">
            {/* User Profile Section */}
            <div
              className={cn(
                'flex items-center gap-3 rounded-xl border border-gray-200 p-3 transition-all duration-200',
                'bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100',
                'transform cursor-pointer hover:scale-[1.02] hover:shadow-md',
                onProfileClick && 'cursor-pointer'
              )}
              onClick={onProfileClick}
            >
              <Avatar className="h-12 w-12 shadow-md ring-2 ring-blue-200">
                <AvatarImage src={userPhotoURL || undefined} alt={userName} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 font-bold text-lg text-white">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {state === 'expanded' && (
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-bold text-gray-800 text-sm">{userName}</span>
                  <span className="flex items-center gap-1 text-gray-600 text-xs capitalize">
                    <roleInfo.icon className={cn('h-3 w-3', roleInfo.color)} />
                    {currentUserRole || 'User'}
                  </span>
                </div>
              )}

              {state === 'expanded' && notificationCount > 0 && (
                <Badge
                  variant="destructive"
                  className="animate-pulse bg-red-500 text-white text-xs"
                >
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Badge>
              )}
            </div>

            {/* Action Buttons */}
            {state === 'expanded' && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-gray-200 bg-white/80 text-gray-700 transition-all duration-200 hover:border-blue-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-blue-700"
                  onClick={() => setActiveTabAction('settings')}
                >
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Settings
                </Button>

                {onLogout && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-200 bg-white/80 text-gray-700 transition-all duration-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                    onClick={onLogout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Guest Mode Footer */}
        {isGuestMode && state === 'expanded' && (
          <div className="space-y-3 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-800">Guest Mode</span>
            </div>
            <p className="text-gray-600 text-xs">
              Sign in to unlock all features and save your progress
            </p>
            <Button
              size="sm"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg"
              onClick={() => setActiveTabAction('login')}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          </div>
        )}

        {/* App Version & Status */}
        {state === 'expanded' && (
          <div className="border-gray-200/50 border-t pt-3 text-center">
            <div className="mb-1 flex items-center justify-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <p className="font-medium text-gray-500 text-xs">SwipeHire v2.1.0</p>
            </div>
            <p className="text-gray-400 text-xs">All systems operational</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

export default DashboardSidebar;
