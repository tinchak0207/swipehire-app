
"use client";

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, UserCircle, Wand2, Briefcase, HeartHandshake, BellRing, BookOpenText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingStepsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const onboardingSteps = [
  {
    Icon: UserCircle,
    title: "Complete Your Profile",
    description: "Fill out your profile details to get noticed and receive relevant matches.",
    color: "text-blue-500",
  },
  {
    Icon: Wand2,
    title: "Explore AI Resume Tools",
    description: "Craft a standout video resume with our AI Script Writer and Avatar Generator.",
    color: "text-purple-500",
  },
  {
    Icon: Briefcase,
    title: "Start Swiping for Opportunities",
    description: "Discover jobs tailored to you or find top talent with our intuitive swipe interface.",
    color: "text-green-500",
  },
  {
    Icon: HeartHandshake,
    title: "Check Your Mutual Matches",
    description: "Connect and chat directly once there's a mutual interest. Meaningful connections start here!",
    color: "text-red-500",
  },
  {
    Icon: BellRing,
    title: "Customize Notifications",
    description: "Stay updated on important activities by tailoring your notification preferences in Settings.",
    color: "text-yellow-500",
  },
  {
    Icon: BookOpenText,
    title: "Engage with the Staff Diary",
    description: "Share your insights, learn from peers, and join the professional community.",
    color: "text-indigo-500",
  },
];

const ConfettiPiece = ({ className }: { className?: string }) => (
  <div className={cn("absolute w-2 h-2 opacity-70", className)}></div>
);

export function OnboardingStepsModal({ isOpen, onClose }: OnboardingStepsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden shadow-2xl rounded-2xl border-primary/20">
        <div className="relative w-full h-24 sm:h-32 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-100 overflow-hidden">
          {/* Simplified Confetti - more elaborate would need SVG/JS */}
          <ConfettiPiece className="bg-red-400 rounded-sm top-5 left-10 rotate-12 w-3 h-3" />
          <ConfettiPiece className="bg-blue-400 rounded-full top-10 left-1/4 -rotate-6" />
          <ConfettiPiece className="bg-green-400 rounded-sm top-8 left-1/2 rotate-45 w-2.5 h-2.5" />
          <ConfettiPiece className="bg-yellow-400 rounded-full top-3 left-3/4 rotate-[30deg]" />
          <ConfettiPiece className="bg-purple-400 rounded-sm top-12 left-[85%] -rotate-12 w-3 h-3" />
          <ConfettiPiece className="bg-pink-400 rounded-full top-6 left-[5%]" />
          <ConfettiPiece className="bg-teal-400 rounded-sm top-14 left-[40%] rotate-[-20deg]" />
          <ConfettiPiece className="bg-orange-400 rounded-full top-4 left-[60%] rotate-[15deg]" />
        </div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 p-6 sm:p-8 items-center">
          {/* Left Column */}
          <div className="text-center md:text-left space-y-4 md:pr-6">
            <h2 className="text-primary text-5xl sm:text-6xl font-extrabold -mt-4 md:-mt-2">
              Welcome <span className="text-accent">1!</span>
            </h2>
            <DialogTitle className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
              Unlock the Full Power of SwipeHire
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground leading-relaxed">
              Experience how our features seamlessly integrate to keep you organized, while speeding up your job search or talent acquisition.
            </DialogDescription>
            <Button onClick={onClose} size="lg" className="w-full md:w-auto mt-4 text-base">
              Let's Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Right Column - Steps */}
          <div className="space-y-4 sm:space-y-5">
            {onboardingSteps.map((step, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1.5">
                  <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", step.color.replace("text-", "border-"))}>
                     {/* Placeholder for checkbox - not interactive here */}
                  </div>
                </div>
                <div>
                  <h4 className={cn("font-semibold text-md", step.color)}>{step.title}</h4>
                  <p className="text-xs text-muted-foreground leading-snug">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
