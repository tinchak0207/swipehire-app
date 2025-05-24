
"use client";

import type { UserRole } from '@/lib/types';
import { Users, Briefcase } from 'lucide-react';

interface RoleSelectionPageProps {
  onRoleSelect: (role: UserRole) => void;
}

export function RoleSelectionPage({ onRoleSelect }: RoleSelectionPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden">
      <div className="flex flex-col md:flex-row w-full h-screen relative">
        {/* Recruiter Section */}
        <div
          className="recruiter-role-bg flex-1 flex flex-col items-center justify-center p-8 text-white text-center cursor-pointer transition-all duration-300 ease-in-out hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-pink-400/70 relative overflow-hidden"
          onClick={() => onRoleSelect('recruiter')}
          onKeyDown={(e) => e.key === 'Enter' && onRoleSelect('recruiter')}
          tabIndex={0}
          role="button"
          aria-label="Select Recruiter Role"
        >
          {/* Decorative Blob 1 (Reddish) */}
          <div 
            className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-destructive/30 rounded-full blur-3xl animate-pulse-slow opacity-70"
            style={{ animationDuration: '7s' }}
          />
          <Users className="h-24 w-24 sm:h-32 sm:w-32 mb-6 text-white/95 drop-shadow-lg" />
          <h2 className="text-4xl sm:text-5xl font-bold mb-3 drop-shadow-md">I'm a Recruiter</h2>
          <p className="text-xl sm:text-2xl drop-shadow-sm">Find top talent.</p>
        </div>

        {/* Custom SVG Divider - Tilted, Bold, Drawn */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Desktop Divider */}
          <svg 
            viewBox="0 0 50 600" 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-[110%] w-auto stroke-current text-black hidden md:block mx-auto" // Increased height for tilt visibility
            style={{ filter: 'drop-shadow(3px 3px 3px rgba(0,0,0,0.3))', transform: 'rotate(-5deg)' }}
          >
            <path 
              d="M25 5 Q 15 100, 35 150 T 20 250 Q 30 350, 15 400 T 25 500 Q 20 550, 25 595" 
              strokeWidth="8" // Bolder line
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          {/* Mobile Divider */}
          <div className="w-full h-1.5 bg-black/80 md:hidden shadow-md" style={{ transform: 'rotate(0deg)' }}></div>
        </div>


        {/* Job Seeker Section */}
        <div
          className="jobseeker-role-bg flex-1 flex flex-col items-center justify-center p-8 text-white text-center cursor-pointer transition-all duration-300 ease-in-out hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-blue-300/70 relative overflow-hidden"
          onClick={() => onRoleSelect('jobseeker')}
          onKeyDown={(e) => e.key === 'Enter' && onRoleSelect('jobseeker')}
          tabIndex={0}
          role="button"
          aria-label="Select Job Seeker Role"
        >
           {/* Decorative Blob 2 (Blueish) */}
          <div 
            className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-accent/30 rounded-full blur-3xl animate-pulse-slow opacity-70"
            style={{ animationDelay: '1.5s', animationDuration: '8s' }}
          />
          <Briefcase className="h-24 w-24 sm:h-32 sm:w-32 mb-6 text-white/95 drop-shadow-lg" />
          <h2 className="text-4xl sm:text-5xl font-bold mb-3 drop-shadow-md">I'm a Job Seeker</h2>
          <p className="text-xl sm:text-2xl drop-shadow-sm">Discover opportunities.</p>
        </div>
      </div>
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.15); opacity: 0.5; }
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
