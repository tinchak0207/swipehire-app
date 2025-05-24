import { FileVideo2 } from 'lucide-react';
import Link from 'next/link';

export function AppHeader() {
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
        {/* Future navigation items can go here */}
      </div>
    </header>
  );
}
