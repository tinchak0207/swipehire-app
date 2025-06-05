
"use client";

import { useState, useEffect } from 'react';
import type { UserRole } from '@/lib/types'; 
import { Wand2, UserSquare2, Clapperboard, Camera, Sparkles, ArrowLeft, Gem, Lock, Info, X as CloseIcon, Construction, PlayCircle, Star as StarIcon } from 'lucide-react'; // Added StarIcon
import { Card, CardTitle, CardContent, CardHeader, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge"; 
import { cn } from '@/lib/utils';
import { ResumeCreationFlowPage } from '@/components/pages/ResumeCreationFlowPage';

type ToolKey = 'script' | 'avatar' | 'recorder' | 'editor';

interface AiTool {
  key: ToolKey;
  title: string;
  Icon: React.ElementType;
  bgClass: string;
  description: string;
}

const aiToolsData: AiTool[] = [
  {
    key: 'script',
    title: 'Write a Video Script',
    Icon: Wand2,
    bgClass: 'ai-tool-bg-script',
    description: "Get a tailored script for your video resume.",
  },
  {
    key: 'avatar',
    title: 'Generate an Avatar',
    Icon: UserSquare2,
    bgClass: 'ai-tool-bg-avatar',
    description: "Create a professional virtual avatar.",
  },
  {
    key: 'recorder',
    title: 'Record Your Video',
    Icon: Camera,
    bgClass: 'ai-tool-bg-recorder',
    description: "Use our interface to record your video resume.",
  },
  {
    key: 'editor',
    title: 'Rate Your Video',
    Icon: Clapperboard,
    bgClass: 'ai-tool-bg-editor',
    description: "Get AI feedback and suggestions on your video.",
  },
];

interface AiToolsPageProps {
  isGuestMode?: boolean;
  currentUserRole?: UserRole | null; 
}

export function AiToolsPage({ isGuestMode, currentUserRole }: AiToolsPageProps) {
  const [showResumeCreationFlow, setShowResumeCreationFlow] = useState<boolean>(false);
  // Removed showGuide and related logic, as guidance is now integrated into the permanent job seeker alert.

  const handleLaunchFlow = () => {
    if (isGuestMode) return; 
    setShowResumeCreationFlow(true);
  };

  const handleBackToGrid = () => {
    setShowResumeCreationFlow(false);
  };

  const GuestLockOverlay = ({ message = "Sign In to Use This Tool" }: { message?: string }) => (
    <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex flex-col items-center justify-center rounded-xl z-20 backdrop-blur-sm p-4">
      <Lock className="h-10 w-10 sm:h-12 sm:w-12 text-red-600 mb-2" />
      <span className="font-bold text-lg sm:text-xl text-red-600 text-center">{message}</span>
    </div>
  );
  

  return (
    <div className={cn("p-4 md:p-6 space-y-8 min-h-[calc(100vh-200px)] flex flex-col bg-background relative")}>
      <div className="relative z-10 flex flex-col flex-grow">
        {currentUserRole === 'jobseeker' && !isGuestMode && !showResumeCreationFlow && (
          <Alert variant="default" className="mb-6 bg-green-50 border-green-500 text-green-700">
            <StarIcon className="h-5 w-5 !text-green-600" />
            <AlertTitle className="font-semibold text-green-800 text-lg">Your AI Career Co-Pilot - Completely Free!</AlertTitle>
            <AlertDescription className="text-green-700/90 space-y-2 mt-1">
              <p>As a job seeker, all AI tools on SwipeHire are here to help you shine, <strong>for free!</strong></p>
              <p>Follow these steps to create a standout video profile:</p>
              <ul className="list-decimal list-inside pl-5 space-y-1 text-sm">
                <li><strong>Start the Flow:</strong> Click the "Start Your AI-Powered Video Resume" button below.</li>
                <li><strong>AI Scripting:</strong> Our AI will help you craft a compelling script from your experience.</li>
                <li><strong>Present Yourself:</strong> Choose to record your video or generate a professional AI avatar.</li>
                <li><strong>Get Feedback:</strong> Let AI rate your video and provide improvement tips.</li>
              </ul>
              <p className="font-medium pt-1">The tool cards below illustrate these capabilities. Launch the guided flow to get started!</p>
            </AlertDescription>
          </Alert>
        )}
         {currentUserRole === 'recruiter' && !isGuestMode && !showResumeCreationFlow && (
            <Alert variant="default" className="mb-6 bg-blue-50 border-blue-500 text-blue-700">
                <Info className="h-5 w-5 !text-blue-600" />
                <AlertTitle className="font-semibold text-blue-800 text-lg">Recruiter AI Tool Preview</AlertTitle>
                <AlertDescription className="text-blue-700/90">
                    As a recruiter, you can explore the AI tools job seekers use to create their video profiles. More AI-powered tools specifically for recruiters are coming soon to help you find top talent even faster!
                </AlertDescription>
            </Alert>
        )}


        {showResumeCreationFlow && !isGuestMode ? (
           <div className="w-full flex-grow flex flex-col">
            <Button
              onClick={handleBackToGrid}
              variant="outline"
              className={cn("mb-6 text-sm self-start")} 
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to AI Tools Overview
            </Button>
            <div className="flex-grow relative">
                <ResumeCreationFlowPage isGuestMode={isGuestMode} />
            </div>
          </div>
        ) : ( 
          <>
            <div className="text-center mb-6 md:mb-8">
              <Sparkles className="mx-auto h-12 w-12 text-primary mb-3" />
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                {currentUserRole === 'jobseeker' ? "Create Your Standout Video Profile" : 
                 currentUserRole === 'recruiter' ? "Explore Candidate AI Tools" : 
                 "AI Video & Profile Tools"}
              </h1>
              <p className="text-md text-muted-foreground mt-2 max-w-2xl mx-auto">
                {currentUserRole === 'jobseeker' ? "Use our guided flow to craft a compelling video resume using the tools showcased below." : "These are the tools job seekers use. Recruiters, your specialized tools are coming soon!"}
              </p>
            </div>

            <div className="my-8 text-center">
              <Button 
                onClick={handleLaunchFlow} 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-3 subtle-button-hover shadow-lg"
                disabled={isGuestMode}
              >
                {isGuestMode ? <Lock className="mr-2 h-5 w-5" /> : <PlayCircle className="mr-2 h-5 w-5" />}
                {isGuestMode ? "Sign In to Create" : "Start Your AI-Powered Video Resume"}
              </Button>
              {isGuestMode && (
                <p className="text-sm text-red-500 mt-2 font-semibold">
                  The Resume Creation Flow is locked in Guest Mode.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 max-w-4xl mx-auto w-full">
              {aiToolsData.map((tool) => (
                <Card
                  key={tool.key}
                  className={cn(
                    "transition-all duration-300 overflow-hidden group text-white rounded-xl flex flex-col justify-center items-center p-6 sm:p-8 min-h-[280px] sm:min-h-[320px] relative",
                    tool.bgClass,
                    isGuestMode && "opacity-60 border-2 border-red-400 cursor-default",
                    !isGuestMode && "hover:shadow-2xl hover:-translate-y-1" 
                  )}
                >
                  {isGuestMode && <GuestLockOverlay message="Tool Preview (Sign In to Use)" />}
                  <tool.Icon className="h-16 w-16 sm:h-20 sm:w-20 mb-3 sm:mb-4 text-white/90 group-hover:scale-110 transition-transform" />
                  <CardTitle className="text-xl sm:text-2xl font-bold text-center">{tool.title}</CardTitle>
                  <CardContent className="text-center p-0 mt-2 sm:mt-3">
                    <p className="text-sm sm:text-base text-white/80">{tool.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-10 col-span-1 sm:col-span-2 shadow-lg max-w-4xl mx-auto w-full bg-card border">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-primary">
                  <StarIcon className="mr-3 h-6 w-6 text-yellow-500 fill-yellow-400" />
                  All AI Tools: Absolutely Free!
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  At SwipeHire, we believe in empowering everyone. All our current and upcoming AI-powered tools are provided to you completely free of charge.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>We're committed to helping you succeed, whether you're a job seeker crafting the perfect video resume or a recruiter looking for the ideal candidate. Explore our full suite of AI tools without worrying about subscriptions or hidden fees.</p>
                <ul className="list-disc list-inside pl-4 space-y-1 text-sm">
                    <li>Video Script Generation</li>
                    <li>AI Avatar Creation</li>
                    <li>Video Recording Interface</li>
                    <li>AI Video Analysis & Feedback</li>
                    <li>And more to come!</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button onClick={handleLaunchFlow} disabled={isGuestMode} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
                  {isGuestMode ? <Lock className="mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  {isGuestMode ? "Sign In to Access Tools" : "Explore Free AI Tools Now"}
                </Button>
              </CardFooter>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

