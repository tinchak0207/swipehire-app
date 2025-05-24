
"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { VideoScriptGenerator } from "@/components/ai/VideoScriptGenerator";
import { AvatarGenerator } from "@/components/ai/AvatarGenerator";
import { VideoEditor } from "@/components/ai/VideoEditor";
import { VideoRecorderUI } from "@/components/video/VideoRecorderUI"; // New Import
import { Wand2, UserSquare2, Clapperboard, Sparkles, Camera } from 'lucide-react'; // Added Camera icon

export function AiToolsPage() {
  return (
    <div className="p-4 md:p-6 space-y-8">
      <div className="text-center mb-8">
        <Sparkles className="mx-auto h-12 w-12 text-primary mb-3" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">AI Resume Enhancement Suite</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Craft the perfect first impression with our AI-powered tools.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto" defaultValue="item-1">
        <AccordionItem value="item-1" className="border-b-0 mb-6 bg-card rounded-lg shadow-md overflow-hidden">
          <AccordionTrigger className="p-6 text-xl hover:no-underline font-semibold text-primary hover:bg-primary/5 transition-colors">
            <div className="flex items-center">
              <Wand2 className="mr-3 h-6 w-6" />
              AI Video Script Assistant
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
            <VideoScriptGenerator />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2" className="border-b-0 mb-6 bg-card rounded-lg shadow-md overflow-hidden">
          <AccordionTrigger className="p-6 text-xl hover:no-underline font-semibold text-primary hover:bg-primary/5 transition-colors">
             <div className="flex items-center">
              <UserSquare2 className="mr-3 h-6 w-6" />
              AI Virtual Avatar Generator
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
            <AvatarGenerator />
          </AccordionContent>
        </AccordionItem>

        {/* New AccordionItem for Video Recorder UI */}
        <AccordionItem value="item-4" className="border-b-0 mb-6 bg-card rounded-lg shadow-md overflow-hidden">
          <AccordionTrigger className="p-6 text-xl hover:no-underline font-semibold text-primary hover:bg-primary/5 transition-colors">
            <div className="flex items-center">
              <Camera className="mr-3 h-6 w-6" />
              Video Resume Recorder UI
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
            <VideoRecorderUI />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3" className="border-b-0 bg-card rounded-lg shadow-md overflow-hidden">
          <AccordionTrigger className="p-6 text-xl hover:no-underline font-semibold text-primary hover:bg-primary/5 transition-colors">
            <div className="flex items-center">
              <Clapperboard className="mr-3 h-6 w-6" />
              AI Video Editor (Upload & Analyze)
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
            <VideoEditor />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
