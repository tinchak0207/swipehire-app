'use client';

import {
  ArrowLeft,
  Brain,
  Camera,
  Clapperboard,
  Info,
  Lock,
  PlayCircle,
  Sparkles,
  Star as StarIcon,
  UserSquare2,
  Wand2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ResumeCreationFlowPage } from '@/components/pages/ResumeCreationFlowPage';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';

type ToolKey = 'script' | 'avatar' | 'recorder' | 'editor' | 'prepHub' | 'career';

interface AiTool {
  key: ToolKey;
  title: string;
  Icon: React.ElementType;
  bgClass?: string;
  description: string;
  isPlaceholder?: boolean;
  onClick?: () => void;
}

interface AiToolsPageProps {
  isGuestMode?: boolean;
  currentUserRole?: UserRole | null;
}

export function AiToolsPage({ isGuestMode, currentUserRole }: AiToolsPageProps) {
  const router = useRouter();
  const [showResumeCreationFlow, setShowResumeCreationFlow] = useState(false);
  const { toast } = useToast();

  const aiToolsData: AiTool[] = [
    {
      key: 'career',
      title: 'Career Planning AI',
      Icon: Brain,
      bgClass: 'bg-gradient-to-br from-purple-500 to-pink-600',
      description: 'Get personalized career guidance and roadmap from our AI assistant.',
      onClick: () => router.push('/career-ai'),
    },
    {
      key: 'script',
      title: 'Write a Video Script',
      Icon: Wand2,
      bgClass: 'ai-tool-bg-script',
      description: 'Get a tailored script for your video resume.',
    },
    {
      key: 'avatar',
      title: 'Generate an Avatar',
      Icon: UserSquare2,
      bgClass: 'ai-tool-bg-avatar',
      description: 'Create a professional virtual avatar.',
    },
    {
      key: 'recorder',
      title: 'Record Your Video',
      Icon: Camera,
      bgClass: 'ai-tool-bg-recorder',
      description: 'Use our interface to record your video resume.',
    },
    {
      key: 'editor',
      title: 'Rate Your Video',
      Icon: Clapperboard,
      bgClass: 'ai-tool-bg-editor',
      description: 'Get AI feedback and suggestions on your video.',
    },
    {
      key: 'prepHub',
      title: 'Interview Prep Hub',
      Icon: Brain,
      bgClass: 'bg-gradient-to-br from-teal-500 to-cyan-600',
      description:
        'Access common questions, prep tips, and company insights to ace your next interview.',
      isPlaceholder: true,
    },
  ];

  const handleLaunchFlow = () => {
    if (isGuestMode) return;
    setShowResumeCreationFlow(true);
  };

  const handleBackToGrid = () => {
    setShowResumeCreationFlow(false);
  };

  const handlePlaceholderToolClick = (toolTitle: string) => {
    if (isGuestMode) {
      toast({
        title: 'Feature Locked',
        description: 'Please sign in to use AI tools.',
        variant: 'default',
      });
      return;
    }
    toast({
      title: `${toolTitle} (Coming Soon!)`,
      description:
        'This feature is currently under development and will be available soon. Stay tuned!',
      variant: 'default',
      duration: 5000,
    });
  };

  const GuestLockOverlay = ({ message = 'Sign In to Use This Tool' }: { message?: string }) => (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-red-500 bg-opacity-20 p-4 backdrop-blur-sm">
      <Lock className="mb-2 h-10 w-10 text-red-600 sm:h-12 sm:w-12" />
      <span className="text-center font-bold text-lg text-red-600 sm:text-xl">{message}</span>
    </div>
  );

  if (showResumeCreationFlow && !isGuestMode) {
    return (
      <div className="relative flex min-h-[calc(100vh-200px)] flex-col space-y-8 bg-background p-4 md:p-6">
        <div className="relative z-10 flex flex-grow flex-col">
          <div className="flex w-full flex-grow flex-col">
            <Button
              onClick={handleBackToGrid}
              variant="outline"
              className="mb-6 self-start text-sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to AI Tools Overview
            </Button>
            <div className="relative flex-grow">
              <ResumeCreationFlowPage isGuestMode={isGuestMode} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100vh-200px)] flex-col space-y-8 bg-background p-4 md:p-6">
      <div className="relative z-10 flex flex-grow flex-col">
        {currentUserRole === 'recruiter' && !isGuestMode && (
          <Alert variant="default" className="mb-6 border-blue-500 bg-blue-50 text-blue-700">
            <Info className="!text-blue-600 h-5 w-5" />
            <AlertTitle className="font-semibold text-blue-800 text-lg">
              Recruiter AI Tool Preview
            </AlertTitle>
            <AlertDescription className="text-blue-700/90">
              As a recruiter, you can explore the AI tools job seekers use to create their video
              profiles.
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-6 text-center md:mb-8">
          <Sparkles className="mx-auto mb-3 h-12 w-12 text-primary" />
          <h1 className="font-bold text-3xl text-foreground tracking-tight md:text-4xl">
            {currentUserRole === 'jobseeker'
              ? 'Create Your Standout Video Profile'
              : currentUserRole === 'recruiter'
                ? 'Explore Candidate AI Tools'
                : 'AI Video & Profile Tools'}
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-md text-muted-foreground">
            {currentUserRole === 'jobseeker'
              ? 'Use our guided flow to craft a compelling video resume.'
              : 'These are the tools job seekers use.'}
          </p>
        </div>

        <div className="my-8 text-center">
          <Button
            onClick={handleLaunchFlow}
            size="lg"
            className="subtle-button-hover bg-primary px-8 py-3 text-lg text-primary-foreground shadow-lg hover:bg-primary/90"
            disabled={isGuestMode}
          >
            {isGuestMode ? (
              <Lock className="mr-2 h-5 w-5" />
            ) : (
              <PlayCircle className="mr-2 h-5 w-5" />
            )}
            {isGuestMode ? 'Sign In to Create' : 'Start Your AI-Powered Video Resume'}
          </Button>
        </div>

        <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
          {aiToolsData.map((tool) => (
            <Card
              key={tool.key}
              className={cn(
                'group relative flex min-h-[280px] flex-col items-center justify-center overflow-hidden rounded-xl p-6 text-white transition-all duration-300 sm:min-h-[320px] sm:p-8',
                tool.bgClass,
                isGuestMode && 'cursor-default border-2 border-red-400 opacity-60',
                !isGuestMode && tool.isPlaceholder && 'cursor-pointer hover:opacity-90',
                !isGuestMode && !tool.isPlaceholder && 'hover:-translate-y-1 hover:shadow-2xl'
              )}
              onClick={
                tool.isPlaceholder ? () => handlePlaceholderToolClick(tool.title) : tool.onClick
              }
            >
              {isGuestMode && <GuestLockOverlay message="Tool Preview (Sign In to Use)" />}
              <tool.Icon className="mb-3 h-16 w-16 text-white/90 transition-transform group-hover:scale-110 sm:mb-4 sm:h-20 sm:w-20" />
              <CardTitle className="text-center font-bold text-xl sm:text-2xl">
                {tool.title}
              </CardTitle>
              <CardContent className="mt-2 p-0 text-center sm:mt-3">
                <p className="text-sm text-white/80 sm:text-base">{tool.description}</p>
              </CardContent>
              {tool.isPlaceholder && !isGuestMode && (
                <Badge
                  variant="outline"
                  className="absolute top-3 right-3 bg-yellow-400 px-2 py-1 font-semibold text-black text-xs"
                >
                  Coming Soon
                </Badge>
              )}
            </Card>
          ))}
        </div>

        <Card className="col-span-1 mx-auto mt-10 w-full max-w-4xl border bg-card shadow-lg sm:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-primary">
              <StarIcon className="mr-3 h-6 w-6 fill-yellow-400 text-yellow-500" />
              All AI Tools: Absolutely Free!
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              At SwipeHire, we believe in empowering everyone. All our current and upcoming
              AI-powered tools are provided to you completely free of charge.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground text-sm">
            <p>
              We're committed to helping you succeed, whether you're a job seeker crafting the
              perfect video resume or a recruiter looking for the ideal candidate.
            </p>
            <ul className="list-inside list-disc space-y-1 pl-4 text-sm">
              <li>Video Script Generation</li>
              <li>AI Avatar Creation</li>
              <li>Video Recording Interface</li>
              <li>AI Video Analysis & Feedback</li>
              <li>Career Planning AI Assistant</li>
              <li>Interview Preparation Hub (Coming Soon!)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
