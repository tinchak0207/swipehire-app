
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from '@/components/ui/label';
import { VideoRecorderUI } from '@/components/video/VideoRecorderUI';
import { AvatarGenerator } from '@/components/ai/AvatarGenerator'; // No type import needed here
// AvatarGeneratorOutput is not directly used here, but by Step3
// import type { AvatarGeneratorOutput } from '@/ai/flows/avatar-generator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Video, UserSquare2, Info, CheckCircle, Loader2, Palette, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
// generateAvatar and AvatarGeneratorInput are not directly used here after refactor
// import { generateAvatar, type AvatarGeneratorInput } from '@/ai/flows/avatar-generator';
import NextImage from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle as ShadDialogTitle, DialogDescription as ShadDialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { VideoEditor } from '@/components/ai/VideoEditor';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';


interface Step3Props {
  finalScript?: string;
  onSubmit: (data: { presentationMethod: 'video' | 'avatar', videoUrl?: string, avatarDataUri?: string }) => void;
}

export function Step3_PresentationChoice({ finalScript, onSubmit }: Step3Props) {
  const [presentationMethod, setPresentationMethod] = useState<'video' | 'avatar' | null>(null);
  const [flowRecordedVideoUrl, setFlowRecordedVideoUrl] = useState<string | null>(null);
  const [avatarDataUriFromGenerator, setAvatarDataUriFromGenerator] = useState<string | null>(null);
  
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  // isGeneratingAvatar state is now managed within AvatarGenerator component
  // const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);

  const { toast } = useToast();

  const handleRecordingComplete = (videoUrl: string) => {
    setFlowRecordedVideoUrl(videoUrl);
    if (videoUrl) {
      toast({ title: "Recording Complete", description: "You can now analyze or proceed." });
    } else {
      toast({ title: "Recording Reset", description: "Previous recording cleared." });
    }
  };

  const handleAvatarGeneratedByComponent = (uri: string) => {
    setAvatarDataUriFromGenerator(uri);
    toast({ title: "Avatar Ready", description: "Your AI avatar has been generated!"});
  };

  const handleSubmit = () => {
    if (!presentationMethod) {
      toast({ title: "Selection Required", description: "Please choose a presentation method.", variant: "destructive" });
      return;
    }
    if (presentationMethod === 'video' && !flowRecordedVideoUrl) {
      toast({ title: "Recording Needed", description: "Please record your video or ensure it's saved.", variant: "destructive" });
      return; 
    }
    if (presentationMethod === 'avatar' && !avatarDataUriFromGenerator) {
      toast({ title: "Avatar Needed", description: "Please generate an avatar using the tool.", variant: "destructive" });
      return;
    }
    onSubmit({ 
      presentationMethod, 
      videoUrl: presentationMethod === 'video' ? flowRecordedVideoUrl || undefined : undefined, 
      avatarDataUri: presentationMethod === 'avatar' ? avatarDataUriFromGenerator || undefined : undefined 
    });
  };


  return (
    <div className="space-y-6 animate-fadeInPage">
      <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-700">
        <Info className="h-5 w-5 !text-blue-600" />
        <AlertTitle className="font-semibold text-blue-800">Step 3: Choose Your Presentation</AlertTitle>
        <AlertDescription className="text-blue-700/90">
          How would you like to present your video resume? You can record yourself or use an AI-generated virtual avatar with your script.
          Text-to-Speech for avatars is a future enhancement.
        </AlertDescription>
      </Alert>

      <RadioGroup value={presentationMethod || ""} onValueChange={(value) => setPresentationMethod(value as 'video' | 'avatar')} className="space-y-3">
        <Label htmlFor="method-video" className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
          <RadioGroupItem value="video" id="method-video" className="mt-1"/>
          <div className="flex-grow">
            <span className="font-semibold text-md flex items-center"><Video className="mr-2 h-5 w-5 text-primary"/> Record Your Own Video</span>
            <p className="text-sm text-muted-foreground mt-1">Use your webcam to record a personal video message using the script you crafted.</p>
          </div>
        </Label>
        <Label htmlFor="method-avatar" className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
          <RadioGroupItem value="avatar" id="method-avatar" className="mt-1" />
          <div className="flex-grow">
            <span className="font-semibold text-md flex items-center"><UserSquare2 className="mr-2 h-5 w-5 text-primary"/> Use a Virtual Avatar</span>
            <p className="text-sm text-muted-foreground mt-1">Generate an AI avatar to present your script. (Text-to-Speech coming soon!)</p>
          </div>
        </Label>
      </RadioGroup>

      {presentationMethod === 'video' && (
        <Card className="mt-4">
          <CardHeader><CardTitle>Record Video</CardTitle></CardHeader>
          <CardContent>
            <VideoRecorderUI onRecordingComplete={handleRecordingComplete} />
            {flowRecordedVideoUrl && (
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                 <Button onClick={() => setShowAnalysisDialog(true)} variant="outline" className="flex-1">
                    <Wand2 className="mr-2 h-4 w-4" /> Analyze Your Video with AI
                  </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {presentationMethod === 'avatar' && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center"><Palette className="mr-2 h-5 w-5"/>Customize Your Avatar</CardTitle>
            <CardDescription>Use the AI tool below to generate and preview your virtual presenter.</CardDescription>
          </CardHeader>
          <CardContent>
            <AvatarGenerator onAvatarGenerated={handleAvatarGeneratedByComponent} /> 
            
             <Input 
                type="text" 
                value={avatarDataUriFromGenerator || ""} 
                readOnly 
                placeholder="Avatar Data URI (will be auto-filled by generator)" 
                className="mt-4 text-xs bg-muted/50" 
              />
             <p className="text-xs text-muted-foreground mt-1">After generation, the avatar data URI will appear here.</p>

            {finalScript && (
              <div className="mt-4 pt-4 border-t">
                <Label className="block text-md font-semibold mb-1">Script for Avatar:</Label>
                <Textarea value={finalScript} readOnly className="min-h-[100px] bg-muted text-sm" />
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-end mt-6">
        <Button 
          onClick={handleSubmit} 
          size="lg" 
          disabled={!presentationMethod || 
                    (presentationMethod === 'video' && !flowRecordedVideoUrl) ||
                    (presentationMethod === 'avatar' && !avatarDataUriFromGenerator)}
        >
          <CheckCircle className="mr-2 h-5 w-5" /> Use This Presentation & Proceed
        </Button>
      </div>

      {showAnalysisDialog && flowRecordedVideoUrl && (
        <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
          <DialogContent className="sm:max-w-2xl flex flex-col max-h-[90vh]">
            <DialogHeader className="shrink-0">
              <ShadDialogTitle className="flex items-center">
                <Wand2 className="mr-2 h-5 w-5 text-primary"/> AI Video Analysis
              </ShadDialogTitle>
              <ShadDialogDescription>
                Review AI feedback on your recorded video. You can re-record or proceed.
              </ShadDialogDescription>
            </DialogHeader>
            <div className="flex-grow overflow-y-auto min-h-0 pr-2 -mr-4 pl-1">
              <VideoEditor initialVideoDataUri={flowRecordedVideoUrl} />
            </div>
            <DialogFooter className="shrink-0 border-t pt-4 mt-auto">
               <DialogClose asChild>
                 <Button type="button" variant="outline">Close Analysis</Button>
               </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
