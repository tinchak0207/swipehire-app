
import { FileVideo2, LogIn, LogOut, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AppHeaderProps {
  isAuthenticated: boolean;
  onLoginRequest: () => void;
  onLogout: () => void;
}

export function AppHeader({ isAuthenticated, onLoginRequest, onLogout }: AppHeaderProps) {
  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <FileVideo2 className="h-8 w-8 sm:h-10 sm:w-10 text-accent" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">SwipeHire</h1>
            <p className="text-xs sm:text-sm text-primary-foreground/80 hidden md:block">
              Recruit Smarter, Not Harder.
            </p>
          </div>
        </Link>

        <div className="flex-grow max-w-xl hidden sm:flex items-center relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search jobs, companies, or talent..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/70 border-none focus:bg-primary-foreground/20 focus:ring-accent"
          />
        </div>
        
        <div>
          {isAuthenticated ? (
            <Button variant="ghost" onClick={onLogout} className="text-primary-foreground hover:bg-primary/80 hover:text-accent-foreground">
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          ) : (
            <Button variant="ghost" onClick={onLoginRequest} className="text-primary-foreground hover:bg-primary/80 hover:text-accent-foreground">
              <LogIn className="mr-2 h-5 w-5" />
              Login / Sign Up
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
