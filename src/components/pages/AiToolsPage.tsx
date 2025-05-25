
"use client";

import { useState } from 'react';
import { VideoScriptGenerator } from "@/components/ai/VideoScriptGenerator";
import { AvatarGenerator } from "@/components/ai/AvatarGenerator";
import { VideoEditor } from "@/components/ai/VideoEditor";
import { VideoRecorderUI } from "@/components/video/VideoRecorderUI";
import { Wand2, UserSquare2, Clapperboard, Camera, Sparkles, ArrowLeft, Gem } from 'lucide-react'; // Added Gem icon
import { Card, CardTitle, CardContent, CardHeader, CardDescription, CardFooter } from '@/components/ui/card'; // Added CardHeader, CardDescription, CardFooter
import { Button } from '@/components/ui/button';
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

export function AiToolsPage() {
  const [selectedToolKey, setSelectedToolKey] = useState<ToolKey | null>(null);
  const [activeBackgroundClass, setActiveBackgroundClass] = useState<string>('');

  const handleToolSelect = (tool: AiTool) => {
    setSelectedToolKey(tool.key);
    setActiveBackgroundClass(tool.bgClass);
  };

  const handleBackToGrid = () => {
    setSelectedToolKey(null);
    setActiveBackgroundClass('');
  };

  const SelectedComponent = selectedToolKey ? aiToolsData.find(tool => tool.key === selectedToolKey)?.Component : null;

  return (
    <div className={cn(
      "p-4 md:p-6 space-y-8 min-h-[calc(100vh-200px)] flex flex-col bg-background relative"
    )}>
      {selectedToolKey && activeBackgroundClass && (
        <AnimatedToolBackground bgClass={activeBackgroundClass} show={!!selectedToolKey} />
      )}

      <div className="relative z-10 flex flex-col flex-grow">
        {!selectedToolKey ? (
          <>
            <div className="text-center mb-6 md:mb-8">
              <Sparkles className="mx-auto h-12 w-12 text-primary mb-3" />
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Ask AI to...</h1>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 max-w-4xl mx-auto w-full">
              {aiToolsData.map((tool) => (
                <Card
                  key={tool.key}
                  onClick={() => handleToolSelect(tool)}
                  className={cn(
                    "cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group text-white rounded-xl flex flex-col justify-center items-center p-8 min-h-[280px] sm:min-h-[320px]",
                    tool.bgClass
                  )}
                >
                  <tool.Icon className="h-16 w-16 sm:h-20 sm:w-20 mb-4 text-white/90 group-hover:scale-110 transition-transform" />
                  <CardTitle className="text-2xl sm:text-3xl font-bold text-center">{tool.title}</CardTitle>
                  <CardContent className="text-center p-0 mt-3">
                    <p className="text-base sm:text-lg text-white/80">{tool.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* New Card for Premium Video Services */}
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
            <div className="flex-grow">
              {SelectedComponent && <SelectedComponent />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
    

    