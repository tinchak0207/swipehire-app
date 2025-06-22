'use client';

import { Briefcase, Users } from 'lucide-react';
import { useState } from 'react';
import type { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils'; // Ensure cn is imported if used

interface RoleSelectionPageProps {
  onRoleSelect: (role: UserRole) => void;
}

export function RoleSelectionPage({ onRoleSelect }: RoleSelectionPageProps) {
  const [selectedRoleVisual, setSelectedRoleVisual] = useState<UserRole | null>(null);

  const handleSelect = (role: UserRole) => {
    setSelectedRoleVisual(role);
    // The animation will play, then after a short delay, proceed with actual role selection.
    setTimeout(() => {
      onRoleSelect(role);
    }, 700); // Match animation duration or slightly longer
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <div className="my-8 px-4 text-center">
        {/* Removed animate-text-glow from h1 */}
        <h1 className="mb-2 font-bold text-4xl text-primary md:text-5xl">Welcome to SwipeHire</h1>
        <p className="text-lg text-muted-foreground md:text-xl">
          Choose your path to connect and succeed.
        </p>
      </div>

      {/* Changed to flex-col for mobile, md:flex-row for medium screens and up */}
      <div className="relative flex w-full flex-grow flex-col md:flex-row">
        {/* Recruiter Section */}
        <div
          className={cn(
            'recruiter-role-bg group relative flex flex-1 cursor-pointer flex-col items-center justify-center overflow-hidden p-8 text-center text-white transition-all duration-300 ease-in-out hover:scale-105 hover:opacity-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-400/70',
            selectedRoleVisual === 'recruiter' ? 'animate-pulse-selection' : ''
          )}
          onClick={() => handleSelect('recruiter')}
          onKeyDown={(e) => e.key === 'Enter' && handleSelect('recruiter')}
          tabIndex={0}
          role="button"
          aria-label="I'm hiring"
        >
          <div
            className="-top-1/4 -left-1/4 absolute h-1/2 w-1/2 animate-pulse-slow rounded-full bg-orange-500/20 opacity-60 blur-3xl group-hover:opacity-80"
            style={{ animationDuration: '7s' }}
          />
          <Users className="mb-4 h-20 w-20 text-white/95 drop-shadow-lg sm:h-28 sm:w-28" />
          <h2 className="mb-1 font-bold text-2xl drop-shadow-md sm:text-3xl">I'm Hiring</h2>
          <p className="text-md opacity-90 drop-shadow-sm sm:text-lg">
            Post jobs, discover talent, and build your dream team.
          </p>
        </div>

        {/* Custom SVG Divider - remains for md screens */}
        <div className="pointer-events-none absolute inset-0 z-10 hidden items-center justify-center md:flex">
          <svg
            viewBox="0 0 50 600"
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-[110%] w-auto stroke-current text-black/70"
            style={{
              filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.2))',
              transform: 'rotate(-5deg)',
            }}
          >
            <path
              d="M25 5 Q 15 100, 35 150 T 20 250 Q 30 350, 15 400 T 25 500 Q 20 550, 25 595"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
        {/* Simple divider for mobile screens */}
        <div className="my-0 h-1 w-full bg-black/60 shadow-md md:hidden" />

        {/* Job Seeker Section */}
        <div
          className={cn(
            'jobseeker-role-bg group relative flex flex-1 cursor-pointer flex-col items-center justify-center overflow-hidden p-8 text-center text-white transition-all duration-300 ease-in-out hover:scale-105 hover:opacity-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-300/70',
            selectedRoleVisual === 'jobseeker' ? 'animate-pulse-selection' : ''
          )}
          onClick={() => handleSelect('jobseeker')}
          onKeyDown={(e) => e.key === 'Enter' && handleSelect('jobseeker')}
          tabIndex={0}
          role="button"
          aria-label="I'm job hunting"
        >
          <div
            className="-bottom-1/4 -right-1/4 absolute h-1/2 w-1/2 animate-pulse-slow rounded-full bg-green-500/20 opacity-60 blur-3xl group-hover:opacity-80"
            style={{ animationDelay: '1.5s', animationDuration: '8s' }}
          />
          <Briefcase className="mb-4 h-20 w-20 text-white/95 drop-shadow-lg sm:h-28 sm:w-28" />
          <h2 className="mb-1 font-bold text-2xl drop-shadow-md sm:text-3xl">I'm Job Hunting</h2>
          <p className="text-md opacity-90 drop-shadow-sm sm:text-lg">
            Find exciting roles, showcase your skills, and land your next career move.
          </p>
        </div>
      </div>
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 0.4; }
        }
        .animate-pulse-slow {
          animation-name: pulse-slow;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
}
