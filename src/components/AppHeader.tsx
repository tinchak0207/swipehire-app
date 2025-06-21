
import { FileVideo2, LogIn, LogOut, Search, X, Eye } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge'; 
import { UserAvatar } from '@/components/ui/user-avatar';
import { useState } from 'react';
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
  className 
}: AppHeaderProps): JSX.Element {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState<boolean>(false);

  const handleMobileSearchToggle = (): void => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onSearchTermChange(e.target.value);
  };

  return (
    <header className={cn("bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40", className)}>
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4 sm:gap-6">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <FileVideo2 className="h-8 w-8 sm:h-10 sm:w-10 text-black" />
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-bold text-black">SwipeHire</h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden md:block">
                Recruit Smarter, Not Harder.
              </p>
            </div>
            {isGuestMode && (
              <Badge variant="secondary" className="ml-3 text-xs bg-blue-100 text-blue-800 border-blue-200">
                <Eye className="h-3 w-3 mr-1 text-black" /> 
                <span className="text-black">Guest Mode</span>
              </Badge>
            )}
          </Link>

          {/* Desktop Search Bar */}
          <div className="flex-1 max-w-2xl hidden sm:block mx-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search jobs, companies, talent..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 text-black placeholder:text-gray-500 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          {/* Right Section - User Info & Actions */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Mobile Search Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="sm:hidden text-black hover:bg-gray-100 hover:text-black p-2"
              onClick={handleMobileSearchToggle}
              aria-label="Open search"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* User Avatar & Name (Desktop) */}
            {isAuthenticated && userName && !isGuestMode && (
              <div className="hidden sm:flex items-center gap-3">
                <UserAvatar
                  src={userPhotoURL}
                  alt={userName || "User"}
                  fallbackText={userName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  size="sm"
                  className="border-2 border-gray-200"
                  showFallbackIcon={false}
                />
                <span className="text-sm font-medium text-black truncate max-w-[120px]">
                  {userName}
                </span>
              </div>
            )}

            {/* Mobile Avatar Only */}
            {isAuthenticated && userName && !isGuestMode && (
              <div className="sm:hidden">
                <UserAvatar
                  src={userPhotoURL}
                  alt={userName || "User"}
                  fallbackText={userName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
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
                className="text-black border-gray-300 hover:bg-gray-50 hover:text-black hover:border-gray-400 px-3 sm:px-4 py-2 transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-0 sm:mr-2" />
                <span className="hidden sm:inline font-medium">Logout</span>
              </Button>
            ) : (
              <Button 
                variant="default" 
                onClick={onLoginRequest} 
                className="bg-blue-600 text-white hover:bg-blue-700 border-0 px-3 sm:px-4 py-2 transition-all duration-200"
              >
                <LogIn className="h-4 w-4 mr-0 sm:mr-2" />
                <span className="hidden sm:inline font-medium">
                  {isGuestMode ? "Sign In" : "Login"}
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="sm:hidden absolute top-0 left-0 w-full h-full bg-white border-b border-gray-200 p-4 z-50 flex items-center gap-3 animate-slideDown">
          <Search className="h-5 w-5 text-gray-400 shrink-0" />
          <Input
            type="search"
            placeholder="Search jobs, companies, talent..."
            className="flex-1 pl-3 pr-4 py-2.5 rounded-lg bg-gray-50 text-black placeholder:text-gray-500 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            value={searchTerm}
            onChange={handleSearchChange}
            autoFocus
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-black hover:bg-gray-100 hover:text-black p-2 shrink-0"
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
