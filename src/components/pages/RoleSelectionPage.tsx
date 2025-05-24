
"use client";

import { useState } from 'react';
import type { UserRole } from '@/lib/types';
import { Users, Briefcase } from 'lucide-react';

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
    <div className="flex flex-col min-h-screen items-center justify-center overflow-hidden">
      <div className="my-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">Welcome to SwipeHire</h1>
        <p className="text-lg md:text-xl text-muted-foreground">Choose your path to connect and succeed.</p>
      </div>

      <div className="flex flex-col md:flex-row w-full flex-grow relative">
        {/* Recruiter Section */}
        <div
          className={`recruiter-role-bg flex-1 flex flex-col items-center justify-center p-8 text-white text-center cursor-pointer transition-all duration-300 ease-in-out hover:opacity-90 hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-400/70 relative overflow-hidden group ${selectedRoleVisual === 'recruiter' ? 'animate-pulse-selection' : ''}`}
          onClick={() => handleSelect('recruiter')}
          onKeyDown={(e) => e.key === 'Enter' && handleSelect('recruiter')}
          tabIndex={0}
          role="button"
          aria-label="I'm hiring"
        >
          <div 
            className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-orange-500/20 rounded-full blur-3xl animate-pulse-slow opacity-60 group-hover:opacity-80"
            style={{ animationDuration: '7s' }}
          />
          <Users className="h-28 w-28 sm:h-36 sm:w-36 mb-6 text-white/95 drop-shadow-lg" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-2 drop-shadow-md">I'm Hiring</h2>
          <p className="text-lg sm:text-xl drop-shadow-sm">Post jobs, discover talent.</p>
        </div>

        {/* Custom SVG Divider */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <svg 
            viewBox="0 0 50 600" 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-[110%] w-auto stroke-current text-black/70 hidden md:block mx-auto" 
            style={{ filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.2))', transform: 'rotate(-5deg)' }}
          >
            <path 
              d="M25 5 Q 15 100, 35 150 T 20 250 Q 30 350, 15 400 T 25 500 Q 20 550, 25 595" 
              strokeWidth="6" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <div className="w-full h-1 bg-black/60 md:hidden shadow-md my-4"></div>
        </div>

        {/* Job Seeker Section */}
        <div
          className={`jobseeker-role-bg flex-1 flex flex-col items-center justify-center p-8 text-white text-center cursor-pointer transition-all duration-300 ease-in-out hover:opacity-90 hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-300/70 relative overflow-hidden group ${selectedRoleVisual === 'jobseeker' ? 'animate-pulse-selection' : ''}`}
          onClick={() => handleSelect('jobseeker')}
          onKeyDown={(e) => e.key === 'Enter' && handleSelect('jobseeker')}
          tabIndex={0}
          role="button"
          aria-label="I'm job hunting"
        >
          <div 
            className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-green-500/20 rounded-full blur-3xl animate-pulse-slow opacity-60 group-hover:opacity-80"
            style={{ animationDelay: '1.5s', animationDuration: '8s' }}
          />
          <Briefcase className="h-28 w-28 sm:h-36 sm:w-36 mb-6 text-white/95 drop-shadow-lg" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-2 drop-shadow-md">I'm Job Hunting</h2>
          <p className="text-lg sm:text-xl drop-shadow-sm">Find roles, showcase skills.</p>
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
