'use client';

import { Bell, ChevronLeft, Search, Settings, User, X } from 'lucide-react';
import type React from 'react';
import { useCallback, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';

/**
 * Mobile Header Props Interface
 */
interface MobileOptimizedHeaderProps {
  /** Current page title */
  title?: string | undefined;
  /** Whether to show back button */
  showBackButton?: boolean | undefined;
  /** Back button callback */
  onBackClick?: (() => void) | undefined;
  /** Whether to show search */
  showSearch?: boolean | undefined;
  /** Search query */
  searchQuery?: string | undefined;
  /** Search callback */
  onSearchChange?: ((query: string) => void) | undefined;
  /** Whether to show notifications */
  showNotifications?: boolean | undefined;
  /** Notification count */
  notificationCount?: number | undefined;
  /** Notification click callback */
  onNotificationClick?: (() => void) | undefined;
  /** Whether to show user menu */
  showUserMenu?: boolean | undefined;
  /** User name */
  userName?: string | null | undefined;
  /** User photo URL */
  userPhotoURL?: string | null | undefined;
  /** User role */
  userRole?: UserRole | null | undefined;
  /** Whether in guest mode */
  isGuestMode?: boolean | undefined;
  /** Profile click callback */
  onProfileClick?: (() => void) | undefined;
  /** Settings click callback */
  onSettingsClick?: (() => void) | undefined;
  /** Logout callback */
  onLogout?: (() => void) | undefined;
  /** Additional actions */
  actions?: React.ReactNode | undefined;
  /** Custom className */
  className?: string | undefined;
}

/**
 * Mobile-Optimized Header Component
 *
 * Provides a responsive, touch-friendly header for mobile devices with:
 * - Adaptive layout based on screen size
 * - Touch-optimized interactive elements
 * - Contextual navigation controls
 * - Search functionality
 * - User menu and notifications
 * - Proper accessibility support
 *
 * @example
 * ```tsx
 * <MobileOptimizedHeader
 *   title="Find Jobs"
 *   showSearch={true}
 *   searchQuery={searchTerm}
 *   onSearchChange={setSearchTerm}
 *   showNotifications={true}
 *   notificationCount={5}
 *   userName="John Doe"
 *   userPhotoURL="/avatar.jpg"
 *   onProfileClick={handleProfileClick}
 * />
 * ```
 */
export function MobileOptimizedHeader({
  title,
  showBackButton = false,
  onBackClick,
  showSearch = false,
  searchQuery = '',
  onSearchChange,
  showNotifications = false,
  notificationCount = 0,
  onNotificationClick,
  showUserMenu = false,
  userName,
  userPhotoURL,
  userRole,
  isGuestMode = false,
  onProfileClick,
  onSettingsClick,
  onLogout,
  actions,
  className,
}: MobileOptimizedHeaderProps): JSX.Element {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Handle search toggle
  const handleSearchToggle = useCallback(() => {
    setIsSearchExpanded(!isSearchExpanded);
    if (isSearchExpanded && onSearchChange) {
      onSearchChange('');
    }
  }, [isSearchExpanded, onSearchChange]);

  // Handle search input
  const handleSearchInput = useCallback(
    (value: string) => {
      onSearchChange?.(value);
    },
    [onSearchChange]
  );

  // Get user initials
  const getUserInitials = () => {
    if (!userName) return 'U';
    return userName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get role display
  const getRoleDisplay = () => {
    if (isGuestMode) return 'Guest';
    return userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'User';
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <div className="flex h-16 items-center gap-2 px-4">
        {/* Left Section */}
        <div className="flex items-center gap-2">
          {/* Back Button */}
          {showBackButton && onBackClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackClick}
              className="h-10 w-10 touch-manipulation p-0"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}

          {/* Title */}
          {title && !isSearchExpanded && (
            <h1 className="truncate font-semibold text-lg">{title}</h1>
          )}
        </div>

        {/* Center Section - Search */}
        {showSearch && (
          <div
            className={cn(
              'flex-1 transition-all duration-200',
              isSearchExpanded ? 'mx-2' : 'max-w-0 overflow-hidden md:mx-4 md:max-w-none'
            )}
          >
            {isSearchExpanded || window.innerWidth >= 768 ? (
              <div className="relative">
                <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  className="h-10 bg-muted/50 pl-10 text-base"
                  autoFocus={isSearchExpanded}
                />
                {isSearchExpanded && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSearchToggle}
                    className="-translate-y-1/2 absolute top-1/2 right-1 h-8 w-8 transform p-0"
                    aria-label="Close search"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* Right Section */}
        <div className="ml-auto flex items-center gap-2">
          {/* Search Toggle (Mobile) */}
          {showSearch && !isSearchExpanded && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSearchToggle}
              className="h-10 w-10 touch-manipulation p-0 md:hidden"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}

          {/* Notifications */}
          {showNotifications && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onNotificationClick}
              className="relative h-10 w-10 touch-manipulation p-0"
              aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount})` : ''}`}
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge
                  variant="destructive"
                  className="-top-1 -right-1 absolute flex h-5 w-5 animate-pulse items-center justify-center p-0 text-xs"
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Badge>
              )}
            </Button>
          )}

          {/* Custom Actions */}
          {actions}

          {/* User Menu */}
          {showUserMenu && (
            <Sheet open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 w-10 touch-manipulation p-0"
                  aria-label="User menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userPhotoURL || undefined} alt={userName || 'User'} />
                    <AvatarFallback className="bg-primary font-bold text-primary-foreground text-sm">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-80">
                <SheetHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={userPhotoURL || undefined} alt={userName || 'User'} />
                      <AvatarFallback className="bg-primary font-bold text-primary-foreground">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <SheetTitle className="text-lg">{userName || 'User'}</SheetTitle>
                      <p className="text-muted-foreground text-sm">{getRoleDisplay()}</p>
                    </div>
                  </div>
                </SheetHeader>

                <div className="space-y-2 py-4">
                  {onProfileClick && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        onProfileClick();
                        setIsUserMenuOpen(false);
                      }}
                      className="h-12 w-full justify-start text-base"
                    >
                      <User className="mr-3 h-5 w-5" />
                      View Profile
                    </Button>
                  )}

                  {onSettingsClick && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        onSettingsClick();
                        setIsUserMenuOpen(false);
                      }}
                      className="h-12 w-full justify-start text-base"
                    >
                      <Settings className="mr-3 h-5 w-5" />
                      Settings
                    </Button>
                  )}

                  {onLogout && (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        onLogout();
                        setIsUserMenuOpen(false);
                      }}
                      className="mt-4 h-12 w-full justify-start text-base"
                    >
                      <ChevronLeft className="mr-3 h-5 w-5" />
                      {isGuestMode ? 'Exit Guest Mode' : 'Sign Out'}
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}

export default MobileOptimizedHeader;
