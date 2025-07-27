'use client';

import {
  Briefcase,
  ChevronRight,
  LogOut,
  Menu,
  Search,
  Settings as SettingsIcon,
  User,
  UserCircle,
  UserCog,
  Users,
  Wand2,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';

/**
 * Navigation Item Interface for Mobile
 */
interface MobileNavigationItem {
  value: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  isNew?: boolean;
  isPro?: boolean;
  description?: string;
  category?: 'discovery' | 'management' | 'tools' | 'profile' | 'settings';
}

/**
 * Mobile Optimized Navigation Props
 */
interface MobileOptimizedNavigationProps {
  /** Currently active tab/section */
  activeTab: string;
  /** Function to set the active tab */
  setActiveTab: (value: string) => void;
  /** Array of navigation items to display */
  tabItems: MobileNavigationItem[];
  /** Current user's role */
  currentUserRole: UserRole | null;
  /** Whether the app is in guest mode */
  isGuestMode: boolean;
  /** User's display name */
  userName?: string | null | undefined;
  /** User's profile photo URL */
  userPhotoURL?: string | null | undefined;
  /** Optional callback for logout */
  onLogout?: (() => void) | undefined;
  /** Optional callback for profile click */
  onProfileClick?: (() => void) | undefined;
  /** Optional search functionality */
  onSearch?: ((query: string) => void) | undefined;
  /** Optional notification count */
  notificationCount?: number | undefined;
  /** Optional completion percentage for profile */
  profileCompletion?: number | undefined;
}

/**
 * Mobile-First Navigation Component
 *
 * Provides an optimized mobile navigation experience with:
 * - Bottom navigation bar for primary actions
 * - Slide-out drawer for secondary navigation
 * - Touch-optimized interface elements
 * - Gesture-friendly interactions
 * - Proper mobile accessibility
 *
 * @example
 * ```tsx
 * <MobileOptimizedNavigation
 *   activeTab="findJobs"
 *   setActiveTab={setActiveTab}
 *   tabItems={navigationItems}
 *   currentUserRole="jobseeker"
 *   isGuestMode={false}
 *   userName="John Doe"
 *   userPhotoURL="/avatar.jpg"
 *   onLogout={handleLogout}
 * />
 * ```
 */
export function MobileOptimizedNavigation({
  activeTab,
  setActiveTab,
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
}: MobileOptimizedNavigationProps): JSX.Element {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['discovery']));

  // Categorize navigation items
  const categorizedItems = {
    discovery: tabItems.filter((item) =>
      ['findJobs', 'findTalent', 'myMatches'].includes(item.value)
    ),
    management: tabItems.filter((item) =>
      ['postJob', 'manageJobs', 'myDiary'].includes(item.value)
    ),
    tools: tabItems.filter((item) =>
      ['aiTools', 'resumeOptimizer', 'salaryEnquiry', 'interviewGuide', 'workflows'].includes(
        item.value
      )
    ),
    profile: tabItems.filter((item) =>
      ['myProfile', 'myPortfolio', 'industryEvents', 'followupReminders'].includes(item.value)
    ),
    settings: tabItems.filter((item) => ['settings'].includes(item.value)),
  };

  // Primary navigation items for bottom bar (most used)
  const primaryNavItems = [
    currentUserRole === 'recruiter'
      ? tabItems.find((item) => item.value === 'findTalent')
      : tabItems.find((item) => item.value === 'findJobs'),
    tabItems.find((item) => item.value === 'myMatches'),
    tabItems.find((item) => item.value === 'aiTools'),
    tabItems.find(
      (item) => item.value === (currentUserRole === 'recruiter' ? 'postJob' : 'myProfile')
    ),
  ].filter(Boolean) as MobileNavigationItem[];

  // Handle search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      onSearch?.(query);
    },
    [onSearch]
  );

  // Toggle category expansion
  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }, []);

  // Handle navigation item click
  const handleNavClick = useCallback(
    (value: string) => {
      setActiveTab(value);
      setIsDrawerOpen(false);
    },
    [setActiveTab]
  );

  // Get role-specific greeting
  const getRoleGreeting = () => {
    if (isGuestMode) return 'Welcome, Guest!';

    switch (currentUserRole) {
      case 'recruiter':
        return `Hi, ${userName?.split(' ')[0] || 'Recruiter'}!`;
      case 'jobseeker':
        return `Hello, ${userName?.split(' ')[0] || 'Job Seeker'}!`;
      default:
        return `Welcome, ${userName?.split(' ')[0] || 'User'}!`;
    }
  };

  // Render category section
  const renderCategorySection = (
    items: MobileNavigationItem[],
    categoryKey: string,
    categoryLabel: string,
    categoryIcon: React.ElementType
  ) => {
    if (items.length === 0) return null;

    const isExpanded = expandedCategories.has(categoryKey);
    const CategoryIcon = categoryIcon;

    return (
      <div key={categoryKey} className="mb-4">
        <Button
          variant="ghost"
          onClick={() => toggleCategory(categoryKey)}
          className="h-auto w-full justify-between p-3 text-left"
        >
          <div className="flex items-center gap-3">
            <CategoryIcon className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">{categoryLabel}</span>
          </div>
          <ChevronRight
            className={cn('h-4 w-4 transition-transform duration-200', isExpanded && 'rotate-90')}
          />
        </Button>

        {isExpanded && (
          <div className="ml-4 space-y-1">
            {items.map((item) => (
              <Button
                key={item.value}
                variant={activeTab === item.value ? 'default' : 'ghost'}
                onClick={() => handleNavClick(item.value)}
                className={cn(
                  'h-auto w-full justify-start p-3 text-left',
                  activeTab === item.value && 'bg-primary text-primary-foreground'
                )}
              >
                <div className="flex w-full items-center gap-3">
                  <item.icon className="h-5 w-5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{item.label}</span>
                      {item.isNew && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                          New
                        </Badge>
                      )}
                      {item.isPro && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                          Pro
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="mt-1 line-clamp-1 text-muted-foreground text-xs">
                        {item.description}
                      </p>
                    )}
                  </div>
                  {item.badge && (
                    <Badge variant="default" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed right-0 bottom-0 left-0 z-50 border-border border-t bg-background shadow-lg md:hidden">
        <div className="safe-area-pb flex items-center justify-around px-2 py-2">
          {primaryNavItems.map((item) => {
            const isActive = activeTab === item.value;
            return (
              <Button
                key={item.value}
                variant="ghost"
                onClick={() => handleNavClick(item.value)}
                className={cn(
                  'flex h-auto min-h-[60px] flex-1 flex-col items-center gap-1 rounded-lg p-2',
                  'touch-manipulation', // Optimize for touch
                  isActive && 'bg-primary/10 text-primary'
                )}
              >
                <div className="relative">
                  <item.icon
                    className={cn('h-6 w-6', isActive ? 'text-primary' : 'text-muted-foreground')}
                  />
                  {item.badge && (
                    <Badge
                      variant="destructive"
                      className="-top-2 -right-2 absolute flex h-5 w-5 items-center justify-center p-0 text-xs"
                    >
                      {typeof item.badge === 'number' && item.badge > 9 ? '9+' : item.badge}
                    </Badge>
                  )}
                </div>
                <span
                  className={cn(
                    'max-w-full truncate font-medium text-xs',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </span>
              </Button>
            );
          })}

          {/* Menu Button */}
          <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="flex h-auto min-h-[60px] flex-1 touch-manipulation flex-col items-center gap-1 rounded-lg p-2"
              >
                <Menu className="h-6 w-6 text-muted-foreground" />
                <span className="font-medium text-muted-foreground text-xs">Menu</span>
              </Button>
            </SheetTrigger>

            {/* Mobile Navigation Drawer */}
            <SheetContent side="right" className="flex w-full flex-col p-0 sm:w-80">
              <SheetHeader className="border-b p-6 pb-4">
                <div className="flex items-center gap-3">
                  {/* User Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={userPhotoURL || undefined} alt={userName || 'User'} />
                    <AvatarFallback className="bg-primary font-bold text-primary-foreground">
                      {userName?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="min-w-0 flex-1">
                    <SheetTitle className="truncate text-left font-bold text-lg">
                      {getRoleGreeting()}
                    </SheetTitle>
                    <p className="text-muted-foreground text-sm capitalize">
                      {isGuestMode ? 'Guest Mode' : currentUserRole || 'User'}
                    </p>
                  </div>

                  {/* Notifications */}
                  {notificationCount > 0 && (
                    <Badge variant="destructive" className="animate-pulse">
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </Badge>
                  )}
                </div>

                {/* Profile Completion Progress */}
                {!isGuestMode && profileCompletion > 0 && profileCompletion < 100 && (
                  <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium text-sm">Profile Setup</span>
                      <span className="font-bold text-primary text-sm">{profileCompletion}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-primary/20">
                      <div
                        className="h-2 rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${profileCompletion}%` }}
                      />
                    </div>
                  </div>
                )}
              </SheetHeader>

              {/* Search Bar */}
              {onSearch && (
                <div className="border-b p-4">
                  <div className="relative">
                    <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
                    <Input
                      placeholder="Search navigation..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="h-12 pl-10 text-base" // Larger for mobile
                    />
                  </div>
                </div>
              )}

              {/* Navigation Content */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-2">
                  {/* Discovery & Connections */}
                  {renderCategorySection(
                    categorizedItems.discovery,
                    'discovery',
                    currentUserRole === 'recruiter' ? 'Find Talent' : 'Discover Jobs',
                    currentUserRole === 'recruiter' ? Users : Briefcase
                  )}

                  {/* Management */}
                  {categorizedItems.management.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      {renderCategorySection(
                        categorizedItems.management,
                        'management',
                        'Management',
                        SettingsIcon
                      )}
                    </>
                  )}

                  {/* Tools */}
                  {categorizedItems.tools.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      {renderCategorySection(
                        categorizedItems.tools,
                        'tools',
                        'AI Tools & Career',
                        Wand2
                      )}
                    </>
                  )}

                  {/* Profile & Portfolio */}
                  {categorizedItems.profile.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      {renderCategorySection(
                        categorizedItems.profile,
                        'profile',
                        'Profile & Portfolio',
                        User
                      )}
                    </>
                  )}

                  {/* Settings */}
                  {categorizedItems.settings.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      {renderCategorySection(
                        categorizedItems.settings,
                        'settings',
                        'Settings',
                        UserCog
                      )}
                    </>
                  )}
                </div>
              </ScrollArea>

              {/* Footer Actions */}
              <div className="border-t bg-muted/30 p-4">
                {!isGuestMode && onProfileClick && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      onProfileClick();
                      setIsDrawerOpen(false);
                    }}
                    className="mb-3 h-12 w-full text-base"
                  >
                    <UserCircle className="mr-2 h-5 w-5" />
                    View Profile
                  </Button>
                )}

                {onLogout && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      onLogout();
                      setIsDrawerOpen(false);
                    }}
                    className="h-12 w-full text-base"
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    {isGuestMode ? 'Exit Guest Mode' : 'Sign Out'}
                  </Button>
                )}

                {/* App Version */}
                <div className="mt-4 text-center">
                  <p className="text-muted-foreground text-xs">SwipeHire v2.1.0</p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Bottom padding to prevent content from being hidden behind bottom nav */}
      <div className="h-20 md:hidden" />
    </>
  );
}

export default MobileOptimizedNavigation;
