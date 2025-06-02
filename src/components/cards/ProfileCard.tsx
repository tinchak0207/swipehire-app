
"use client";

import React from 'react';
import type { Candidate } from '@/lib/types';
import Image from 'next/image';
import { MapPin, Briefcase, BarChart3, ThumbsDown, Eye, ThumbsUp, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';

interface ProfileCardProps {
  candidate: Candidate;
  onAction: (candidateId: string, action: 'like' | 'pass' | 'details' | 'share') => void;
  isLiked?: boolean; // Optional: to style the like button if already liked
}

const ProfileCard = ({ candidate, onAction, isLiked }: ProfileCardProps) => {
  const avatarDisplayUrl = candidate.avatarUrl
    ? candidate.avatarUrl.startsWith('/uploads/')
      ? `${CUSTOM_BACKEND_URL}${candidate.avatarUrl}`
      : candidate.avatarUrl
    : `https://placehold.co/100x100.png?text=${encodeURIComponent(candidate.name?.[0] || 'P')}`;

  return (
    <div className="max-w-sm w-full mx-auto bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-100 rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-3xl">
      {/* Header Section with Profile Image */}
      <div className="relative pt-8 pb-6 bg-gradient-to-r from-violet-500 via-purple-500 to-blue-500">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full ring-4 ring-white/50 overflow-hidden shadow-xl">
              <Image 
                src={avatarDisplayUrl} 
                alt={candidate.name || "Candidate Avatar"}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                data-ai-hint={candidate.dataAiHint || "person portrait"}
                unoptimized={avatarDisplayUrl.startsWith(CUSTOM_BACKEND_URL) || avatarDisplayUrl.startsWith('http://localhost')}
              />
            </div>
            {/* Optional: Online status indicator if needed later */}
            {/* <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full ring-2 ring-white"></div> */}
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="px-6 py-6 space-y-4">
        {/* Name and Title */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{candidate.name || "N/A"}</h2>
          <p className="text-indigo-600 font-medium text-sm uppercase tracking-wide">{candidate.role || "Role not specified"}</p>
        </div>

        {/* Info Cards */}
        <div className="space-y-3">
          {candidate.location && (
            <div className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
              <MapPin className="w-4 h-4 text-indigo-500" />
              <span className="text-gray-700 text-sm font-medium">{candidate.location}</span>
            </div>
          )}
          
          {candidate.workExperienceLevel && candidate.workExperienceLevel !== "unspecified" && (
            <div className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
              <Briefcase className="w-4 h-4 text-indigo-500" />
              <span className="text-gray-700 text-sm font-medium">{candidate.workExperienceLevel}</span>
            </div>
          )}
          
          {candidate.profileStrength !== undefined && (
            <div className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
              <BarChart3 className="w-4 h-4 text-indigo-500" />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-700 text-sm font-medium">Profile Strength</span>
                  <span className="text-indigo-600 text-sm font-bold">{candidate.profileStrength}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${candidate.profileStrength}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Experience */}
        {candidate.experienceSummary && (
          <div className="p-4 bg-white/40 backdrop-blur-sm rounded-xl border border-white/20">
            <p className="text-gray-600 text-sm leading-relaxed italic line-clamp-3">
              {candidate.experienceSummary}
            </p>
          </div>
        )}

        {/* Skills */}
        {candidate.skills && candidate.skills.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Top Skills</h3>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.slice(0, 5).map(skill => ( // Show up to 5 skills
                <Badge 
                  key={skill} 
                  variant="secondary" 
                  className="bg-gradient-to-r from-blue-100 to-indigo-200 text-indigo-700 border-indigo-300 hover:from-blue-200 hover:to-indigo-300 transition-all duration-200"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-2 pt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex flex-col items-center gap-1 p-2 sm:p-3 h-auto bg-white/60 backdrop-blur-sm border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
            onClick={() => onAction(candidate.id, 'pass')}
          >
            <ThumbsDown className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs">Pass</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex flex-col items-center gap-1 p-2 sm:p-3 h-auto bg-white/60 backdrop-blur-sm border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
            onClick={() => onAction(candidate.id, 'details')}
          >
            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs">Profile</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              "flex flex-col items-center gap-1 p-2 sm:p-3 h-auto bg-white/60 backdrop-blur-sm border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 transition-all duration-200",
              isLiked && "bg-green-100 border-green-400"
            )}
            onClick={() => onAction(candidate.id, 'like')}
          >
            <ThumbsUp className={cn("w-4 h-4 sm:w-5 sm:h-5", isLiked && "fill-green-500")} />
            <span className="text-xs">Like</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex flex-col items-center gap-1 p-2 sm:p-3 h-auto bg-white/60 backdrop-blur-sm border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
            onClick={() => onAction(candidate.id, 'share')}
          >
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs">Share</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
