
"use client";

import { useState, useEffect } from 'react';
import { VideoScriptGenerator } from "@/components/ai/VideoScriptGenerator";
import { AvatarGenerator } from "@/components/ai/AvatarGenerator";
import { VideoEditor } from "@/components/ai/VideoEditor";
import { VideoRecorderUI } from "@/components/video/VideoRecorderUI";
import { Wand2, UserSquare2, Clapperboard, Camera, Sparkles, ArrowLeft, Gem, Lock, Info, X as CloseIcon } from 'lucide-react';
import { Card, CardTitle, CardContent, CardHeader, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from '@/lib/utils';

type ToolKey = 'script' | 'avatar' | 'recorder' | 'editor';

interface AiTool {
  key: ToolKey;
  title: string;
  Icon: React.ElementType;
  Component: React.ElementType;
  bgClass: string;
  description: string;
}

const aiToolsData: AiTool[] = [
  {
    key: 'script',
    title: 'Write a Video Script',
    Icon: Wand2,
    Component: VideoScriptGenerator,
    bgClass: 'ai-tool-bg-script',
    description: "Get a tailored script for your video resume.",
  },
  {
    key: 'avatar',
    title: 'Generate an Avatar',
    Icon: UserSquare2,
    Component: AvatarGenerator,
    bgClass: 'ai-tool-bg-avatar',
    description: "Create a professional virtual avatar.",
  },
  {
    key: 'recorder',
    title: 'Record Your Video',
    Icon: Camera,
    Component: VideoRecorderUI,
    bgClass: 'ai-tool-bg-recorder',
    description: "Use our interface to record your video resume.",
  },
  {
    key: 'editor',
    title: 'Rate Your Video',
    Icon: Clapperboard,
    Component: VideoEditor,
    bgClass: 'ai-tool-bg-editor',
    description: "Get AI feedback and suggestions on your video.",
  },
];

const AnimatedToolBackground = ({ bgClass, show }: { bgClass: string; show: boolean }) => {
  return (
    <div
      className={cn(
        "fixed inset-0 transition-opacity duration-500 ease-in-out",
        bgClass,
        show ? "opacity-100" : "opacity-0 pointer-events-none",
        "z-0"
      )}
    />
  );
};

interface AiToolsPageProps {
  isGuestMode?: boolean;
}

const AI_TOOLS_GUIDE_SEEN_KEY = 'swipehire_ai_tools_guide_seen';

export function AiToolsPage({ isGuestMode }: AiToolsPageProps) {
  const [selectedToolKey, setSelectedToolKey] = useState<ToolKey | null>(null);
  const [activeBackgroundClass, setActiveBackgroundClass] = useState<string>('');
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
    setSelectedToolKey(tool.key);
    setActiveBackgroundClass(tool.bgClass);
  };

  const handleBackToGrid = () => {
    setSelectedToolKey(null);
    setActiveBackgroundClass('');
  };

  const handleDismissGuide = () => {
    setShowGuide(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(AI_TOOLS_GUIDE_SEEN_KEY, 'true');
    }
  };

  const SelectedComponent = selectedToolKey ? aiToolsData.find(tool => tool.key === selectedToolKey)?.Component : null;

  const GuestLockOverlay = ({ message = "Sign In to Use This Tool" }: { message?: string }) => (
    <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex flex-col items-center justify-center rounded-xl z-20 backdrop-blur-sm p-4">
      <Lock className="h-10 w-10 sm:h-12 sm:w-12 text-red-600 mb-2" />
      <span className="font-bold text-lg sm:text-xl text-red-600 text-center">{message}</span>
    </div>
  );

  return (
    <div className={cn(
      "p-4 md:p-6 space-y-8 min-h-[calc(100vh-200px)] flex flex-col bg-background relative"
    )}>
      {selectedToolKey && activeBackgroundClass && !isGuestMode && (
        <AnimatedToolBackground bgClass={activeBackgroundClass} show={!!selectedToolKey} />
      )}

      <div className="relative z-10 flex flex-col flex-grow">
        {showGuide && !isGuestMode && (
          <Alert className="mb-6 border-primary/50 bg-primary/5 relative shadow-md">
            <Info className="h-5 w-5 text-primary" />
            <AlertTitle className="font-semibold text-lg text-primary">Welcome to Your AI Video Resume Toolkit!</AlertTitle>
            <AlertDescription className="text-foreground/80 space-y-1.5">
              <p>New to AI-powered resume tools? Here’s a quick guide to get you started:</p>
              <ul className="list-disc list-inside pl-4 space-y-1 text-sm">
                <li><strong>Write Script:</strong> Let AI help you craft a compelling video script.</li>
                <li><strong>Generate Avatar:</strong> Create a professional virtual avatar if you prefer not to be on camera.</li>
                <li><strong>Record Video:</strong> Easily record your video resume using our interface.</li>
                <li><strong>Rate Video:</strong> Get AI feedback on your recorded video to improve its impact.</li>
              </ul>
              <p>Select any tool below to begin!</p>
            </AlertDescription>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismissGuide}
              className="absolute top-2 right-2 h-7 w-7 text-primary/70 hover:text-primary hover:bg-primary/10"
              aria-label="Dismiss guide"
            >
              <CloseIcon className="h-4 w-4" />
            </Button>
          </Alert>
        )}

        {!selectedToolKey || (isGuestMode && selectedToolKey) ? ( 
          <>
            <div className="text-center mb-6 md:mb-8">
              <Sparkles className="mx-auto h-12 w-12 text-primary mb-3" />
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Ask AI to...</h1>
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
                      >
                        {isGuestMode && <GuestLockOverlay />}
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
                  Premium AI Video Optimization Services
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Elevate your video resumes with our professional AI-powered optimization packages. (Future Offering)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-lg text-foreground">Basic Optimization Package ($199/time)</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-1 pl-4">
                    <li>Automatic editing and rhythm adjustment</li>
                    <li>Basic visual beautification (lighting, color)</li>
                    <li>Standard subtitle generation</li>
                    <li>Basic quality scoring</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-foreground">Professional Optimization Package ($499/session)</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-1 pl-4">
                    <li>Advanced editing and effects</li>
                    <li>Professional voice-overs and background music</li>
                    <li>Multi-language subtitle support</li>
                    <li>Industry-specific template application</li>
                    <li>A/B testing of different versions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-foreground">Enterprise Customization Package ($1,299/time)</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-1 pl-4">
                    <li>Fully customized production</li>
                    <li>Professional photography guidance</li>
                    <li>Branding elements integration</li>
                    <li>Multi-platform format output</li>
                    <li>Professional production team support</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button disabled className="w-full sm:w-auto">
                  Contact Sales for Premium Services (Coming Soon)
                </Button>
              </CardFooter>
            </Card>
          </>
        ) : (
          <div className="w-full flex-grow flex flex-col">
            <Button
              onClick={handleBackToGrid}
              variant="outline"
              className={cn(
                  "mb-6 text-sm self-start",
                  "bg-white/20 hover:bg-white/30 border-white/50 text-white backdrop-blur-sm focus:ring-white/50 focus:ring-offset-0"
              )}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to AI Tools
            </Button>
            <div className="flex-grow relative">
              {isGuestMode && SelectedComponent && <GuestLockOverlay message="Sign In to Use This AI Tool." />}
              {SelectedComponent && <SelectedComponent />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
