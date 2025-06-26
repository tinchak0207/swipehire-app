import { Eye, FileVideo2, LogIn, LogOut, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserAvatar } from '@/components/ui/user-avatar';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  readonly isAuthenticated: boolean;
  readonly isGuestMode: boolean;
  readonly onLoginRequest: () => void;
  readonly onLogout: () => void;
  readonly searchTerm: string;
  readonly onSearchTermChange: (term: string) => void;
  readonly userName?: string | null;
  readonly userPhotoURL?: string | null;
  readonly className?: string;
}

export function AppHeader({
  isAuthenticated,
  isGuestMode,
  onLoginRequest,
  onLogout,
  searchTerm,
  onSearchTermChange,
  userName,
  userPhotoURL,
  className,
}: AppHeaderProps): JSX.Element {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState<boolean>(false);

  const handleMobileSearchToggle = (): void => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onSearchTermChange(e.target.value);
  };

  return (
    <header
      className={cn('sticky top-0 z-40 w-full border-gray-200 border-b bg-white shadow-sm', className)}
    >
      <div className="w-full px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Logo Section - Left */}
          <div className="flex shrink-0 items-center">
            <Link href="/" className="flex shrink-0 items-center gap-3">
              <FileVideo2 className="h-8 w-8 text-black sm:h-10 sm:w-10" />
              <div className="flex flex-col">
                <h1 className="font-bold text-black text-xl sm:text-2xl">SwipeHire</h1>
                <p className="hidden text-gray-600 text-xs sm:text-sm lg:block">
                  Recruit Smarter, Not Harder.
                </p>
              </div>
              {isGuestMode && (
                <Badge
                  variant="secondary"
                  className="ml-3 border-blue-200 bg-blue-100 text-blue-800 text-xs"
                >
                  <Eye className="mr-1 h-3 w-3 text-black" />
                  <span className="text-black">Guest Mode</span>
                </Badge>
              )}
            </Link>
          </div>

          {/* Desktop Search Bar - Center (Optimized) */}
          <div className="mx-4 hidden flex-1 justify-center sm:flex lg:mx-8">
            <div className="relative w-full max-w-2xl">
              <Search className="-translate-y-1/2 absolute top-1/2 left-4 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search jobs, companies, talent..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-6 pl-12 text-black text-base transition-all duration-200 placeholder:text-gray-500 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 focus:shadow-lg sm:py-3.5 lg:py-4"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          {/* Right Section - User Info & Actions */}
          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="p-2 text-black hover:bg-gray-100 hover:text-black sm:hidden"
              onClick={handleMobileSearchToggle}
              aria-label="Open search"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* User Avatar & Name (Desktop) */}
            {isAuthenticated && userName && !isGuestMode && (
              <div className="hidden items-center gap-3 sm:flex">
                <UserAvatar
                  src={userPhotoURL || null}
                  alt={userName || 'User'}
                  fallbackText={userName
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                  size="sm"
                  className="border-2 border-gray-200"
                  showFallbackIcon={false}
                />
                <span className="max-w-[120px] truncate font-medium text-black text-sm">
                  {userName}
                </span>
              </div>
            )}

            {/* Mobile Avatar Only */}
            {isAuthenticated && userName && !isGuestMode && (
              <div className="sm:hidden">
                <UserAvatar
                  src={userPhotoURL || null}
                  alt={userName || 'User'}
                  fallbackText={userName
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                  size="sm"
                  className="border-2 border-gray-200"
                  showFallbackIcon={false}
                />
              </div>
            )}

            {/* Auth Buttons */}
            {isAuthenticated && !isGuestMode ? (
              <Button
                variant="outline"
                onClick={onLogout}
                className="border-gray-300 px-3 py-2 text-black transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 hover:text-black sm:px-4"
              >
                <LogOut className="mr-0 h-4 w-4 sm:mr-2" />
                <span className="hidden font-medium sm:inline">Logout</span>
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={onLoginRequest}
                className="border-0 bg-blue-600 px-3 py-2 text-white transition-all duration-200 hover:bg-blue-700 sm:px-4"
              >
                <LogIn className="mr-0 h-4 w-4 sm:mr-2" />
                <span className="hidden font-medium sm:inline">
                  {isGuestMode ? 'Sign In' : 'Login'}
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="absolute top-0 left-0 z-50 flex h-full w-full animate-slideDown items-center gap-3 border-gray-200 border-b bg-white p-4 sm:hidden">
          <Search className="h-5 w-5 shrink-0 text-gray-400" />
          <Input
            type="search"
            placeholder="Search jobs, companies, talent..."
            className="flex-1 rounded-lg border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-3 text-black placeholder:text-gray-500 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
            value={searchTerm}
            onChange={handleSearchChange}
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 p-2 text-black hover:bg-gray-100 hover:text-black"
            onClick={handleMobileSearchToggle}
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from { 
            transform: translateY(-100%); 
            opacity: 0; 
          }
          to { 
            transform: translateY(0); 
            opacity: 1; 
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </header>
  );
}
