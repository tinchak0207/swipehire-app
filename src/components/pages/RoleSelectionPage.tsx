
"use client";

import type { UserRole } from '@/lib/types';
import { Users, Briefcase } from 'lucide-react';

interface RoleSelectionPageProps {
  onRoleSelect: (role: UserRole) => void;
}

export function RoleSelectionPage({ onRoleSelect }: RoleSelectionPageProps) {
  return (
    <div className="dynamic-bg flex min-h-screen items-center justify-center">
      <div className="flex flex-col md:flex-row w-full h-screen">
        {/* Recruiter Section */}
        <div
          className="flex-1 flex flex-col items-center justify-center p-8 text-white text-center cursor-pointer transition-all duration-300 ease-in-out hover:bg-purple-700/60 focus:outline-none focus:ring-4 focus:ring-purple-400/70"
          onClick={() => onRoleSelect('recruiter')}
          onKeyDown={(e) => e.key === 'Enter' && onRoleSelect('recruiter')}
          tabIndex={0}
          role="button"
          aria-label="Select Recruiter Role"
        >
          <Users className="h-20 w-20 sm:h-28 sm:w-28 mb-6 text-white/90" />
          <h2 className="text-3xl sm:text-5xl font-bold mb-3">I'm a Recruiter</h2>
          <p className="text-lg sm:text-2xl">Find top talent for your company.</p>
        </div>

        {/* Divider */}
        <div className="w-full h-0.5 bg-white/50 md:w-1.5 md:h-full"></div>

        {/* Job Seeker Section */}
        <div
          className="flex-1 flex flex-col items-center justify-center p-8 text-white text-center cursor-pointer transition-all duration-300 ease-in-out hover:bg-sky-600/60 focus:outline-none focus:ring-4 focus:ring-sky-300/70"
          onClick={() => onRoleSelect('jobseeker')}
          onKeyDown={(e) => e.key === 'Enter' && onRoleSelect('jobseeker')}
          tabIndex={0}
          role="button"
          aria-label="Select Job Seeker Role"
        >
          <Briefcase className="h-20 w-20 sm:h-28 sm:w-28 mb-6 text-white/90" />
          <h2 className="text-3xl sm:text-5xl font-bold mb-3">I'm a Job Seeker</h2>
          <p className="text-lg sm:text-2xl">Discover your next career opportunity.</p>
        </div>
      </div>
    </div>
  );
}
