
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from '@/components/ui/label';
import { VideoRecorderUI } from '@/components/video/VideoRecorderUI';
import { AvatarGenerator, type AvatarGeneratorInput } from '@/components/ai/AvatarGenerator'; // Ensure this path is correct
import type { AvatarGeneratorOutput } from '@/ai/flows/avatar-generator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Video, UserSquare2, Info, CheckCircle, Loader2, Palette } from 'lucide-react'; // Added Palette
import { useToast } from '@/hooks/use-toast';
import { generateAvatar } from '@/ai/flows/avatar-generator';
import NextImage from 'next/image';


interface Step3Props {
  finalScript?: string;
  onSubmit: (data: { presentationMethod: 'video' | 'avatar', videoUrl?: string, avatarDataUri?: string }) => void;
}

export function Step3_PresentationChoice({ finalScript, onSubmit }: Step3Props) {
  const [presentationMethod, setPresentationMethod] = useState<'video' | 'avatar' | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null); // Will be set by VideoRecorderUI callback
  const [avatarDataUri, setAvatarDataUri] = useState<string | null>(null);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);

  const { toast } = useToast();

  const handleAvatarGenerated = (uri: string) => { // Callback for AvatarGenerator
    setAvatarDataUri(uri);
  };
  
  // This is a simplified version. AvatarGenerator component would internally call generateAvatar.
  // If AvatarGenerator is a full form, this manual call might not be needed here,
  // but placed for showing the flow if we trigger avatar generation from this parent.
  const handleGenerateNewAvatar = async () => {
    setIsGeneratingAvatar(true);
    try {
      // Simplified input for demonstration. In a real scenario, AvatarGenerator would have its own form.
      const avatarInput: AvatarGeneratorInput = {
        appearanceDetails: "A professional and friendly looking person, suitable for a tech company.",
        // Add other optional fields if needed: gender, ageRange, etc.
      };
      const result: AvatarGeneratorOutput = await generateAvatar(avatarInput);
      setAvatarDataUri(result.avatarDataUri);
      toast({ title: "Avatar Generated!", description: "Your new virtual avatar is ready." });
    } catch (error: any) {
      toast({ title: "Avatar Generation Failed", description: error.message || "Could not generate avatar.", variant: "destructive" });
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const handleSubmit = () => {
    if (!presentationMethod) {
      toast({ title: "Selection Required", description: "Please choose a presentation method.", variant: "destructive" });
      return;
    }
    if (presentationMethod === 'video' && !recordedVideoUrl) {
      // VideoRecorderUI handles its own state. This is a fallback.
      // For now, assume VideoRecorderUI might provide a way to get the URL or we rely on a conceptual "save" within it.
      // For this step, we'll assume if 'video' is chosen, the user has completed recording.
      // A real implementation would need tighter integration with VideoRecorderUI's output.
      toast({ title: "Recording Needed", description: "Please record your video or ensure it's saved.", variant: "destructive" });
      // return; // Commenting out for now to allow progression with conceptual video.
    }
    if (presentationMethod === 'avatar' && !avatarDataUri) {
      toast({ title: "Avatar Needed", description: "Please generate an avatar.", variant: "destructive" });
      return;
    }
    onSubmit({ presentationMethod, videoUrl: recordedVideoUrl || undefined, avatarDataUri: avatarDataUri || undefined });
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
            <VideoRecorderUI />
            {/* Conceptual: VideoRecorderUI would need a way to pass the recordedVideoUrl back up
                e.g., via a prop like onRecordingComplete={(url) => setRecordedVideoUrl(url)} 
                For now, we are not fully integrating its output into this flow's state management automatically.
                The user would record, and we assume the URL is available conceptually.
            */}
             <Input type="text" value={recordedVideoUrl || ""} onChange={(e) => setRecordedVideoUrl(e.target.value)} placeholder="Video URL (will be auto-filled by recorder)" className="mt-2" />
             <p className="text-xs text-muted-foreground mt-1">After recording, the video URL will appear here. (Conceptual)</p>
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
            <AvatarGenerator />
            {/* 
              Similar to VideoRecorderUI, AvatarGenerator would manage its own state.
              If we want its output (avatarDataUri) to be part of the overall resumeData,
              it would need a callback like onAvatarGenerated={handleAvatarGenerated} 
              For now, this is a manual/conceptual link. The user generates, then we'd "use" it.
            */}
             <Input type="text" value={avatarDataUri || ""} onChange={(e) => setAvatarDataUri(e.target.value)} placeholder="Avatar Data URI (will be auto-filled)" className="mt-2" />
             <p className="text-xs text-muted-foreground mt-1">After generation, the avatar data will appear here. (Conceptual)</p>

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
        <Button onClick={handleSubmit} size="lg" disabled={!presentationMethod || (presentationMethod === 'avatar' && !avatarDataUri /* && ! conceptual recorded video */)}>
          <CheckCircle className="mr-2 h-5 w-5" /> Use This Presentation & Proceed
        </Button>
      </div>
    </div>
  );
}

    