
"use client";

import { useState, useEffect } from 'react';
import type { UserRole } from '@/lib/types'; 
import { Wand2, UserSquare2, Clapperboard, Camera, Sparkles, ArrowLeft, Gem, Lock, Info, X as CloseIcon, Construction } from 'lucide-react';
import { Card, CardTitle, CardContent, CardHeader, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge"; 
import { cn } from '@/lib/utils';
import { ResumeCreationFlowPage } from '@/components/pages/ResumeCreationFlowPage'; // Import the flow page

type ToolKey = 'script' | 'avatar' | 'recorder' | 'editor';

interface AiTool {
  key: ToolKey;
  title: string;
  Icon: React.ElementType;
  // Component: React.ElementType; // Removed as we launch the flow page
  bgClass: string;
  description: string;
}

const aiToolsData: AiTool[] = [
  {
    key: 'script',
    title: 'Write a Video Script',
    Icon: Wand2,
    // Component: VideoScriptGenerator, // Removed
    bgClass: 'ai-tool-bg-script',
    description: "Get a tailored script for your video resume.",
  },
  {
    key: 'avatar',
    title: 'Generate an Avatar',
    Icon: UserSquare2,
    // Component: AvatarGenerator, // Removed
    bgClass: 'ai-tool-bg-avatar',
    description: "Create a professional virtual avatar.",
  },
  {
    key: 'recorder',
    title: 'Record Your Video',
    Icon: Camera,
    // Component: VideoRecorderUI, // Removed
    bgClass: 'ai-tool-bg-recorder',
    description: "Use our interface to record your video resume.",
  },
  {
    key: 'editor',
    title: 'Rate Your Video',
    Icon: Clapperboard,
    // Component: VideoEditor, // Removed
    bgClass: 'ai-tool-bg-editor',
    description: "Get AI feedback and suggestions on your video.",
  },
];

interface AiToolsPageProps {
  isGuestMode?: boolean;
  currentUserRole?: UserRole | null; 
}

const AI_TOOLS_GUIDE_SEEN_KEY = 'swipehire_ai_tools_guide_v2'; 

export function AiToolsPage({ isGuestMode, currentUserRole }: AiToolsPageProps) {
  const [showResumeCreationFlow, setShowResumeCreationFlow] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !isGuestMode) {
      const guideSeen = localStorage.getItem(AI_TOOLS_GUIDE_SEEN_KEY);
      if (guideSeen !== 'true') {
        setShowGuide(true);
      }
    }
  }, [isGuestMode]);

  const handleToolSelect = (tool: AiTool) => {
    if (isGuestMode) return; 
    setShowResumeCreationFlow(true);
    // Potentially pass tool.key or tool.title to ResumeCreationFlowPage if it needs to know the entry point
  };

  const handleBackToGrid = () => {
    setShowResumeCreationFlow(false);
  };

  const handleDismissGuide = () => {
    setShowGuide(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(AI_TOOLS_GUIDE_SEEN_KEY, 'true');
    }
  };

  const GuestLockOverlay = ({ message = "Sign In to Use This Tool" }: { message?: string }) => (
    <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex flex-col items-center justify-center rounded-xl z-20 backdrop-blur-sm p-4">
      <Lock className="h-10 w-10 sm:h-12 sm:w-12 text-red-600 mb-2" />
      <span className="font-bold text-lg sm:text-xl text-red-600 text-center">{message}</span>
    </div>
  );
  
  const getGuideContent = () => {
    if (currentUserRole === 'jobseeker') {
      return (
        <>
          <p>As a <strong className="text-primary">Job Seeker</strong>, these AI tools are your personal career co-pilot:</p>
          <ul className="list-disc list-inside pl-4 space-y-1.5 text-sm">
            <li><strong>Write Script:</strong> Overcome writer's block! Let AI help you craft a compelling script for your video resume, tailored to your experience and desired work style.</li>
            <li><strong>Generate Avatar:</strong> Prefer not to be on camera, or want a unique professional look? Create a custom virtual avatar to represent you.</li>
            <li><strong>Record Video:</strong> Our built-in recorder makes it easy to capture your video resume. Practice and re-record until you're happy.</li>
            <li><strong>Rate Video:</strong> Get instant AI feedback on your recorded video. Improve your delivery, presentation, and overall impact.</li>
          </ul>
          <p className="mt-2">Select any tool below to begin crafting a standout video profile!</p>
        </>
      );
    } else if (currentUserRole === 'recruiter') {
      return (
        <>
          <p>As a <strong className="text-primary">Recruiter</strong>, explore these tools to understand what candidates can create:</p>
          <ul className="list-disc list-inside pl-4 space-y-1.5 text-sm">
            <li><strong>Video Script Writer:</strong> See how candidates can generate scripts for their introductions.</li>
            <li><strong>Avatar Generator:</strong> Understand the virtual avatars candidates might use.</li>
            <li><strong>Video Recorder & Rater:</strong> Familiarize yourself with the tools candidates use to produce and refine their video resumes.</li>
          </ul>
          <p className="mt-2">More AI-powered tools specifically for recruiters are planned for the future to help you find top talent even faster!</p>
        </>
      );
    }
    // Default or no role
    return (
      <>
        <p>Explore our AI-powered tools to enhance your SwipeHire experience:</p>
        <ul className="list-disc list-inside pl-4 space-y-1.5 text-sm">
          <li><strong>Write Script:</strong> Get help crafting compelling video scripts.</li>
          <li><strong>Generate Avatar:</strong> Create unique virtual avatars.</li>
          <li><strong>Record Video:</strong> Easily record videos using our interface.</li>
          <li><strong>Rate Video:</strong> Get AI feedback on your recordings.</li>
        </ul>
        <p className="mt-2">Click any tool card below to start the guided Resume Creation Flow!</p>
      </>
    );
  };


  return (
    <div className={cn("p-4 md:p-6 space-y-8 min-h-[calc(100vh-200px)] flex flex-col bg-background relative")}>
      <div className="relative z-10 flex flex-col flex-grow">
        {showGuide && !isGuestMode && (
          <Alert className="mb-6 border-primary/50 bg-primary/5 relative shadow-md">
            <Info className="h-5 w-5 text-primary" />
            <AlertTitle className="font-semibold text-lg text-primary">
                Welcome to Your AI Toolkit, {currentUserRole === 'jobseeker' ? "Job Seeker" : currentUserRole === 'recruiter' ? "Recruiter" : "User"}!
            </AlertTitle>
            <AlertDescription className="text-foreground/80 space-y-1.5">
              {getGuideContent()}
            </AlertDescription>
            <Button
              variant="ghost"
              size="sm" 
              onClick={handleDismissGuide}
              className="absolute top-3 right-3 h-8 w-auto px-3 text-primary/80 hover:text-primary hover:bg-primary/10"
              aria-label="Dismiss guide"
            >
              Got it! <CloseIcon className="h-4 w-4 ml-2" />
            </Button>
          </Alert>
        )}

        {showResumeCreationFlow && !isGuestMode ? (
           <div className="w-full flex-grow flex flex-col">
            <Button
              onClick={handleBackToGrid}
              variant="outline"
              className={cn("mb-6 text-sm self-start")} // Standard outline button
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to AI Tools
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
                {currentUserRole === 'jobseeker' ? "Click any tool to start the guided Resume Creation Flow." : "Explore the tools candidates use to create their profiles."}
              </p>
              {isGuestMode && (
                <p className="text-md text-red-500 mt-2 font-semibold">
                  AI Tools are locked in Guest Mode. Please sign in or register to use them.
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 max-w-4xl mx-auto w-full">
              {aiToolsData.map((tool) => (
                <TooltipProvider key={tool.key}>
                  <Tooltip delayDuration={isGuestMode ? 0 : 300}>
                    <TooltipTrigger asChild>
                      <Card
                        onClick={() => handleToolSelect(tool)}
                        className={cn(
                          "cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group text-white rounded-xl flex flex-col justify-center items-center p-6 sm:p-8 min-h-[280px] sm:min-h-[320px] relative",
                          tool.bgClass,
                          isGuestMode && "opacity-60 border-2 border-red-400 cursor-not-allowed hover:transform-none"
                        )}
                        aria-disabled={isGuestMode}
                        tabIndex={isGuestMode ? -1 : 0}
                      >
                        {isGuestMode && <GuestLockOverlay message="Sign In to Use This Tool" />}
                        <tool.Icon className="h-16 w-16 sm:h-20 sm:w-20 mb-3 sm:mb-4 text-white/90 group-hover:scale-110 transition-transform" />
                        <CardTitle className="text-xl sm:text-2xl font-bold text-center">{tool.title}</CardTitle>
                        <CardContent className="text-center p-0 mt-2 sm:mt-3">
                          <p className="text-sm sm:text-base text-white/80">{tool.description}</p>
                        </CardContent>
                      </Card>
                    </TooltipTrigger>
                    {isGuestMode && (
                      <TooltipContent side="top" className="bg-red-500 text-white border-red-600">
                        <p>Sign in to unlock this AI tool</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>

            <Card className="mt-10 col-span-1 sm:col-span-2 shadow-lg max-w-4xl mx-auto w-full bg-card border">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-primary">
                  <Gem className="mr-3 h-6 w-6" />
                  Premium AI Services (Future Offerings)
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Elevate your video resumes and profiles with our upcoming professional AI-powered optimization packages.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="p-3 border rounded-md bg-muted/30 relative">
                  <Badge variant="outline" className="absolute top-2 right-2 text-xs border-amber-500 text-amber-600 bg-amber-500/10">Coming Soon</Badge>
                  <h4 className="font-semibold text-md text-foreground mb-1">Basic Optimization Package</h4>
                  <ul className="list-disc list-inside pl-2 space-y-0.5">
                    <li>Automatic editing & rhythm adjustment</li>
                    <li>Basic visual beautification (lighting, color)</li>
                    <li>Standard subtitle generation & quality scoring</li>
                  </ul>
                </div>
                <div className="p-3 border rounded-md bg-muted/30 relative">
                  <Badge variant="outline" className="absolute top-2 right-2 text-xs border-amber-500 text-amber-600 bg-amber-500/10">Coming Soon</Badge>
                  <h4 className="font-semibold text-md text-foreground mb-1">Professional Enhancement Package</h4>
                  <ul className="list-disc list-inside pl-2 space-y-0.5">
                    <li>Advanced editing effects & transitions</li>
                    <li>Professional voice-over options & background music</li>
                    <li>Multi-language subtitle support</li>
                    <li>Industry-specific template application</li>
                  </ul>
                </div>
                 <div className="p-3 border rounded-md bg-muted/30 relative">
                  <Badge variant="outline" className="absolute top-2 right-2 text-xs border-amber-500 text-amber-600 bg-amber-500/10">Coming Soon</Badge>
                  <h4 className="font-semibold text-md text-foreground mb-1">Enterprise Customization</h4>
                  <ul className="list-disc list-inside pl-2 space-y-0.5">
                    <li>Fully customized production & branding</li>
                    <li>Professional coaching & photography guidance</li>
                    <li>Multi-platform output & A/B testing</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button disabled className="w-full sm:w-auto">
                  <Construction className="mr-2 h-4 w-4" /> Stay Tuned for Updates!
                </Button>
              </CardFooter>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

