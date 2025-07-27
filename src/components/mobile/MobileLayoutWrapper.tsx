'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { useMobileOptimizations } from '@/hooks/use-mobile-optimizations';
import type { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';
import { MobileOptimizedHeader } from './MobileOptimizedHeader';
import { MobileOptimizedNavigation } from './MobileOptimizedNavigation';

/**
 * Mobile Layout Wrapper Props
 */
interface MobileLayoutWrapperProps {
  /** Page content */
  children: React.ReactNode;
  /** Page title */
  title?: string;
  /** Whether to show back button */
  showBackButton?: boolean;
  /** Back button callback */
  onBackClick?: () => void;
  /** Whether to show search */
  showSearch?: boolean;
  /** Search query */
  searchQuery?: string;
  /** Search callback */
  onSearchChange?: (query: string) => void;
  /** Navigation props */
  navigation: {
    activeTab: string;
    setActiveTab: (value: string) => void;
    tabItems: any[];
    currentUserRole: UserRole | null;
    isGuestMode: boolean;
    userName?: string | null;
    userPhotoURL?: string | null;
    onLogout?: () => void;
    onProfileClick?: () => void;
    notificationCount?: number;
    profileCompletion?: number;
  };
  /** Custom className */
  className?: string;
  /** Whether to use mobile layout */
  forceMobileLayout?: boolean;
  /** Header actions */
  headerActions?: React.ReactNode;
  /** Whether to show notifications in header */
  showNotifications?: boolean;
  /** Notification click callback */
  onNotificationClick?: () => void;
}

/**
 * Mobile Layout Wrapper Component
 *
 * Provides a responsive layout wrapper that automatically switches between
 * mobile and desktop layouts based on device capabilities and screen size.
 *
 * Features:
 * - Automatic mobile/desktop layout detection
 * - Mobile-optimized header and navigation
 * - Safe area support for modern mobile devices
 * - Performance optimizations for mobile devices
 * - Accessibility features
 *
 * @example
 * ```tsx
 * <MobileLayoutWrapper
 *   title="Find Jobs"
 *   showSearch={true}
 *   searchQuery={searchTerm}
 *   onSearchChange={setSearchTerm}
 *   navigation={{
 *     activeTab,
 *     setActiveTab,
 *     tabItems,
 *     currentUserRole,
 *     isGuestMode,
 *     userName,
 *     userPhotoURL,
 *     onLogout,
 *   }}
 * >
 *   <YourPageContent />
 * </MobileLayoutWrapper>
 * ```
 */
export function MobileLayoutWrapper({
  children,
  title,
  showBackButton = false,
  onBackClick,
  showSearch = false,
  searchQuery = '',
  onSearchChange,
  navigation,
  className,
  forceMobileLayout = false,
  headerActions,
  showNotifications = false,
  onNotificationClick,
}: MobileLayoutWrapperProps): JSX.Element {
  const {
    isMobile,
    isTablet,
    touchCapabilities,
    safeAreaInsets,
    prefersReducedMotion,
    isSlowConnection,
  } = useMobileOptimizations();

  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Determine if we should use mobile layout
  const shouldUseMobileLayout =
    forceMobileLayout || isMobile || (isTablet && touchCapabilities.hasTouch);

  // Don't render until hydrated to prevent layout shift
  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Mobile Layout
  if (shouldUseMobileLayout) {
    return (
      <div
        className={cn(
          'flex min-h-screen flex-col bg-background',
          'touch-manipulation', // Optimize for touch
          prefersReducedMotion && 'motion-reduce:transition-none',
          className
        )}
        style={{
          paddingTop: safeAreaInsets.top,
          paddingLeft: safeAreaInsets.left,
          paddingRight: safeAreaInsets.right,
        }}
      >
        {/* Mobile Header */}
        <MobileOptimizedHeader
          title={title}
          showBackButton={showBackButton}
          onBackClick={onBackClick}
          showSearch={showSearch}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          showNotifications={showNotifications}
          notificationCount={navigation.notificationCount}
          onNotificationClick={onNotificationClick}
          showUserMenu={true}
          userName={navigation.userName}
          userPhotoURL={navigation.userPhotoURL}
          userRole={navigation.currentUserRole}
          isGuestMode={navigation.isGuestMode}
          onProfileClick={navigation.onProfileClick}
          onSettingsClick={() => navigation.setActiveTab('settings')}
          onLogout={navigation.onLogout}
          actions={headerActions}
        />

        {/* Main Content */}
        <main
          className={cn(
            'flex-1 overflow-auto',
            'pb-20', // Space for bottom navigation
            isSlowConnection && 'will-change-auto' // Optimize for slow connections
          )}
          style={{
            paddingBottom: safeAreaInsets.bottom + 80, // 80px for bottom nav + safe area
          }}
        >
          {children}
        </main>

        {/* Mobile Navigation */}
        <MobileOptimizedNavigation
          activeTab={navigation.activeTab}
          setActiveTab={navigation.setActiveTab}
          tabItems={navigation.tabItems}
          currentUserRole={navigation.currentUserRole}
          isGuestMode={navigation.isGuestMode}
          userName={navigation.userName}
          userPhotoURL={navigation.userPhotoURL}
          onLogout={navigation.onLogout}
          onProfileClick={navigation.onProfileClick}
          onSearch={onSearchChange}
          notificationCount={navigation.notificationCount}
          profileCompletion={navigation.profileCompletion}
        />
      </div>
    );
  }

  // Desktop Layout (fallback to existing layout)
  return <div className={cn('min-h-screen bg-background', className)}>{children}</div>;
}

export default MobileLayoutWrapper;
