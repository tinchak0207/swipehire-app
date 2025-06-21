
import { FileVideo2, LogIn, LogOut, Search, UserCircle, X, Eye } from 'lucide-react'; // Added Eye
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge'; 
import { UserAvatar } from '@/components/ui/user-avatar';
import { useState } from 'react';

interface AppHeaderProps {
  isAuthenticated: boolean;
  isGuestMode: boolean; 
  onLoginRequest: () => void;
  onLogout: () => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  userName?: string | null;
  userPhotoURL?: string | null; // Added prop for PFP URL
}

export function AppHeader({ isAuthenticated, isGuestMode, onLoginRequest, onLogout, searchTerm, onSearchTermChange, userName, userPhotoURL }: AppHeaderProps) {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <FileVideo2 className="h-8 w-8 sm:h-10 sm:w-10 text-accent" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">SwipeHire</h1>
            <p className="text-xs sm:text-sm text-primary-foreground/80 hidden md:block">
              Recruit Smarter, Not Harder.
            </p>
          </div>
           {isGuestMode && (
            <Badge variant="secondary" className="ml-2 text-xs bg-blue-500 text-white border-blue-500">
              <Eye className="h-3 w-3 mr-1" /> Guest Mode
            </Badge>
          )}
        </Link>

        {/* Desktop Search */}
        <div className="flex-grow max-w-xl hidden sm:flex items-center relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search jobs, companies, talent..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/70 border-none focus:bg-primary-foreground/20 focus:ring-accent"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        </div>

        {/* Mobile Search Trigger & User Info/Auth Buttons */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="sm:hidden text-primary-foreground hover:bg-primary/80 hover:text-accent-foreground"
            onClick={() => setIsMobileSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Mobile Avatar - Show only avatar */}
          {isAuthenticated && userName && !isGuestMode && (
            <div className="sm:hidden">
              <UserAvatar
                src={userPhotoURL}
                alt={userName || "User"}
                fallbackText={userName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                size="sm"
                className="border border-primary-foreground/20"
                showFallbackIcon={false}
              />
            </div>
          )}

          {/* Desktop Avatar with Name */}
          {isAuthenticated && userName && !isGuestMode && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-primary-foreground/90">
              <UserAvatar
                src={userPhotoURL}
                alt={userName || "User"}
                fallbackText={userName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                size="sm"
                className="border border-primary-foreground/20"
                showFallbackIcon={false}
              />
              <span className="truncate max-w-[100px]">{userName}</span>
            </div>
          )}
          {isAuthenticated && !isGuestMode ? (
            <Button variant="ghost" onClick={onLogout} className="text-primary-foreground hover:bg-primary/80 hover:text-accent-foreground px-2 sm:px-3">
              <LogOut className="mr-0 sm:mr-2 h-5 w-5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          ) : (
            <Button variant="ghost" onClick={onLoginRequest} className="text-primary-foreground hover:bg-primary/80 hover:text-accent-foreground px-2 sm:px-3">
              <LogIn className="mr-0 sm:mr-2 h-5 w-5" />
               <span className="hidden sm:inline">{isGuestMode ? "Sign In / Register" : "Login"}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Search Input - Full Width */}
      {isMobileSearchOpen && (
        <div className="sm:hidden absolute top-0 left-0 w-full h-full bg-primary p-3 z-50 flex items-center gap-2 animate-slideDown">
          <Search className="h-5 w-5 text-primary-foreground/70 shrink-0" />
          <Input
            type="search"
            placeholder="Search..."
            className="flex-grow pl-2 pr-4 py-2 rounded-lg bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/70 border-none focus:bg-primary-foreground/20 focus:ring-accent"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            autoFocus
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary-foreground hover:bg-primary/80 hover:text-accent-foreground"
            onClick={() => setIsMobileSearchOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
          <style jsx>{`
            @keyframes slideDown {
              from { transform: translateY(-100%); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            .animate-slideDown {
              animation: slideDown 0.3s ease-out forwards;
            }
          `}</style>
        </div>
      )}
    </header>
  );
}
