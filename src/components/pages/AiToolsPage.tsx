
"use client";

import { useState } from 'react';
import { VideoScriptGenerator } from "@/components/ai/VideoScriptGenerator";
import { AvatarGenerator } from "@/components/ai/AvatarGenerator";
import { VideoEditor } from "@/components/ai/VideoEditor";
import { VideoRecorderUI } from "@/components/video/VideoRecorderUI";
import { Wand2, UserSquare2, Clapperboard, Camera, Sparkles, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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

export function AiToolsPage() {
  const [selectedToolKey, setSelectedToolKey] = useState<ToolKey | null>(null);
  const [activeBackgroundClass, setActiveBackgroundClass] = useState<string>('bg-background');

  const handleToolSelect = (tool: AiTool) => {
    setSelectedToolKey(tool.key);
    setActiveBackgroundClass(tool.bgClass);
  };

  const handleBackToGrid = () => {
    setSelectedToolKey(null);
    setActiveBackgroundClass('bg-background'); // Reset to default background
  };

  const SelectedComponent = selectedToolKey ? aiToolsData.find(tool => tool.key === selectedToolKey)?.Component : null;

  return (
    <div className={cn(
      "p-4 md:p-6 space-y-8 min-h-[calc(100vh-180px)] transition-all duration-500 ease-in-out flex flex-col",
      selectedToolKey ? activeBackgroundClass : 'bg-background'
    )}>
      {!selectedToolKey ? (
        <>
          <div className="text-center mb-6 md:mb-8">
            <Sparkles className="mx-auto h-12 w-12 text-primary mb-3" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Ask AI to...</h1>
            {/* Subtitle removed for simplification */}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 max-w-4xl mx-auto w-full"> {/* Reduced gap, increased max-w */}
            {aiToolsData.map((tool) => (
              <Card
                key={tool.key}
                onClick={() => handleToolSelect(tool)}
                className={cn(
                  "cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group text-white rounded-xl flex flex-col justify-center items-center p-8 min-h-[280px] sm:min-h-[320px]", // Increased min-h and padding
                  tool.bgClass 
                )}
              >
                <tool.Icon className="h-16 w-16 sm:h-20 sm:w-20 mb-4 text-white/90 group-hover:scale-110 transition-transform" /> {/* Increased icon size and margin */}
                <CardTitle className="text-2xl sm:text-3xl font-bold text-center">{tool.title}</CardTitle> {/* Increased title size and made bold */}
                <CardContent className="text-center p-0 mt-3">
                  <p className="text-base sm:text-lg text-white/80">{tool.description}</p> {/* Increased description size */}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className={cn(
          "rounded-lg w-full flex-grow flex flex-col", 
          selectedToolKey && activeBackgroundClass !== 'bg-background' ? 'bg-card/5 backdrop-blur-sm p-4 md:p-6' : 'p-0'
          )}>
          <Button
            onClick={handleBackToGrid}
            variant="outline"
            className={cn(
                "mb-6 text-sm self-start", 
                activeBackgroundClass !== 'bg-background' ? "bg-white/20 hover:bg-white/30 border-white/50 text-white" : "bg-card text-card-foreground"
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
  );
}
