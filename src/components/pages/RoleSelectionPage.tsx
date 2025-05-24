
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
          className="flex-1 flex flex-col items-center justify-center p-8 text-white text-center cursor-pointer transition-all duration-300 ease-in-out hover:bg-black/40 focus:outline-none focus:ring-4 focus:ring-white/50"
          onClick={() => onRoleSelect('recruiter')}
          onKeyDown={(e) => e.key === 'Enter' && onRoleSelect('recruiter')}
          tabIndex={0}
          role="button"
          aria-label="Select Recruiter Role"
        >
          <Users className="h-20 w-20 sm:h-24 sm:w-24 mb-6 text-white/90" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">I'm a Recruiter</h2>
          <p className="text-lg sm:text-xl">Find top talent for your company.</p>
        </div>
        
        {/* Divider */}
        <div className="w-full h-px bg-white/20 md:w-px md:h-full"></div>

        {/* Job Seeker Section */}
        <div 
          className="flex-1 flex flex-col items-center justify-center p-8 text-white text-center cursor-pointer transition-all duration-300 ease-in-out hover:bg-black/40 focus:outline-none focus:ring-4 focus:ring-white/50"
          onClick={() => onRoleSelect('jobseeker')}
          onKeyDown={(e) => e.key === 'Enter' && onRoleSelect('jobseeker')}
          tabIndex={0}
          role="button"
          aria-label="Select Job Seeker Role"
        >
          <Briefcase className="h-20 w-20 sm:h-24 sm:w-24 mb-6 text-white/90" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">I'm a Job Seeker</h2>
          <p className="text-lg sm:text-xl">Discover your next career opportunity.</p>
        </div>
      </div>
    </div>
  );
}
