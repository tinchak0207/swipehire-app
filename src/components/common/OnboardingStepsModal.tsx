'use client';

import {
  ArrowRight,
  BellRing,
  BookOpenText,
  Briefcase,
  HeartHandshake,
  UserCircle,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface OnboardingStepsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const onboardingSteps = [
  {
    Icon: UserCircle,
    title: 'Complete Your Profile',
    description: 'Fill out your profile details to get noticed and receive relevant matches.',
    color: 'text-blue-500',
  },
  {
    Icon: Wand2,
    title: 'Explore AI Resume Tools',
    description: 'Craft a standout video resume with our AI Script Writer and Avatar Generator.',
    color: 'text-purple-500',
  },
  {
    Icon: Briefcase,
    title: 'Start Swiping for Opportunities',
    description:
      'Discover jobs tailored to you or find top talent with our intuitive swipe interface.',
    color: 'text-green-500',
  },
  {
    Icon: HeartHandshake,
    title: 'Check Your Mutual Matches',
    description:
      "Connect and chat directly once there's a mutual interest. Meaningful connections start here!",
    color: 'text-red-500',
  },
  {
    Icon: BellRing,
    title: 'Customize Notifications',
    description:
      'Stay updated on important activities by tailoring your notification preferences in Settings.',
    color: 'text-yellow-500',
  },
  {
    Icon: BookOpenText,
    title: 'Engage with the Staff Diary',
    description: 'Share your insights, learn from peers, and join the professional community.',
    color: 'text-indigo-500',
  },
];

const ConfettiPiece = ({ className }: { className?: string }) => (
  <div className={cn('absolute h-2 w-2 opacity-70', className)} />
);

export function OnboardingStepsModal({ isOpen, onClose }: OnboardingStepsModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="overflow-hidden rounded-2xl border-primary/20 p-0 shadow-2xl sm:max-w-3xl">
        <div className="relative h-24 w-full overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-100 sm:h-32">
          {/* Simplified Confetti - more elaborate would need SVG/JS */}
          <ConfettiPiece className="top-5 left-10 h-3 w-3 rotate-12 rounded-sm bg-red-400" />
          <ConfettiPiece className="-rotate-6 top-10 left-1/4 rounded-full bg-blue-400" />
          <ConfettiPiece className="top-8 left-1/2 h-2.5 w-2.5 rotate-45 rounded-sm bg-green-400" />
          <ConfettiPiece className="top-3 left-3/4 rotate-[30deg] rounded-full bg-yellow-400" />
          <ConfettiPiece className="-rotate-12 top-12 left-[85%] h-3 w-3 rounded-sm bg-purple-400" />
          <ConfettiPiece className="top-6 left-[5%] rounded-full bg-pink-400" />
          <ConfettiPiece className="top-14 left-[40%] rotate-[-20deg] rounded-sm bg-teal-400" />
          <ConfettiPiece className="top-4 left-[60%] rotate-[15deg] rounded-full bg-orange-400" />
        </div>

        <div className="grid items-center gap-6 p-6 sm:gap-8 sm:p-8 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-4 text-center md:pr-6 md:text-left">
            <h2 className="-mt-4 md:-mt-2 font-extrabold text-5xl text-primary sm:text-6xl">
              Welcome <span className="text-accent">1!</span>
            </h2>
            <DialogTitle className="font-bold text-2xl text-foreground leading-tight sm:text-3xl">
              Unlock the Full Power of SwipeHire
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground leading-relaxed">
              Experience how our features seamlessly integrate to keep you organized, while speeding
              up your job search or talent acquisition.
            </DialogDescription>
            <Button onClick={onClose} size="lg" className="mt-4 w-full text-base md:w-auto">
              Let's Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Right Column - Steps */}
          <div className="space-y-4 sm:space-y-5">
            {onboardingSteps.map((step, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="mt-1.5 flex-shrink-0">
                  <div
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full border-2',
                      step.color.replace('text-', 'border-')
                    )}
                  >
                    {/* Placeholder for checkbox - not interactive here */}
                  </div>
                </div>
                <div>
                  <h4 className={cn('font-semibold text-md', step.color)}>{step.title}</h4>
                  <p className="text-muted-foreground text-xs leading-snug">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
