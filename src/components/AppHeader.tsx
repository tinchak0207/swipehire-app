
import { FileVideo2, LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface AppHeaderProps {
  isAuthenticated: boolean;
  onLoginRequest: () => void;
  onLogout: () => void;
}

export function AppHeader({ isAuthenticated, onLoginRequest, onLogout }: AppHeaderProps) {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <FileVideo2 className="h-8 w-8 sm:h-10 sm:w-10 text-accent" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">SwipeHire</h1>
            <p className="text-xs sm:text-sm text-primary-foreground/80 hidden sm:block">
              Recruit Smarter, Not Harder.
            </p>
          </div>
        </Link>
        
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
