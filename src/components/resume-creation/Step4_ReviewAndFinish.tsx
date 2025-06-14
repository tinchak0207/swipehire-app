
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ResumeData } from '@/components/pages/ResumeCreationFlowPage';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Video, UserSquare2, Info, FileText, Loader2 } from 'lucide-react'; // Added Loader2
import NextImage from 'next/image';

interface Step4Props {
  resumeData: ResumeData;
  onFinish: () => void; // This will now call handleActualFinish
}

export function Step4_ReviewAndFinish({ resumeData, onFinish }: Step4Props) {
  return (
    <div className="space-y-6 animate-fadeInPage">
      <Alert variant="default" className="bg-green-50 border-green-200 text-green-700">
        <Info className="h-5 w-5 !text-green-600" />
        <AlertTitle className="font-semibold text-green-800">Step 4: Review & Finish</AlertTitle>
        <AlertDescription className="text-green-700/90">
          Almost there! Review your selections below. If everything looks good, click "Finish & Save Profile" to complete your AI-powered resume profile elements.
          This will save your script and presentation choice to your SwipeHire profile.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Your Resume Elements</CardTitle>
          <CardDescription>Here's a summary of what you've created.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-md font-semibold mb-1 flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" />Final Script:</h4>
            <div className="p-3 bg-muted rounded-md max-h-40 overflow-y-auto text-sm">
              <pre className="whitespace-pre-wrap ">{resumeData.finalScript || "No script finalized."}</pre>
            </div>
          </div>

          <div>
            <h4 className="text-md font-semibold mb-1">Presentation Method:</h4>
            <p className="text-sm capitalize text-primary font-medium">
                {resumeData.presentationMethod || "Not selected"}
                {resumeData.presentationMethod === 'video' && <Video className="inline ml-2 h-5 w-5" />}
                {resumeData.presentationMethod === 'avatar' && <UserSquare2 className="inline ml-2 h-5 w-5" />}
            </p>
          </div>

          {resumeData.presentationMethod === 'video' && resumeData.recordedVideoUrl && (
            <div>
              <h4 className="text-md font-semibold mb-1">Your Recorded Video Link:</h4>
              {/* Displaying the link as text instead of video player for review, or a small thumbnail if it's an image-like URL */}
              {resumeData.recordedVideoUrl.startsWith('blob:') ? (
                 <p className="text-sm text-muted-foreground italic">Video recorded. Link will be processed on save.</p>
              ) : (
                <a href={resumeData.recordedVideoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                    {resumeData.recordedVideoUrl}
                </a>
              )}
            </div>
          )}

          {resumeData.presentationMethod === 'avatar' && resumeData.avatarDataUri && (
            <div>
              <h4 className="text-md font-semibold mb-1">Your Generated Avatar:</h4>
              <div className="w-32 h-32 relative border rounded-md overflow-hidden shadow-md">
                 <NextImage src={resumeData.avatarDataUri} alt="Generated Avatar" layout="fill" objectFit="cover" data-ai-hint="generated avatar" />
              </div>
            </div>
          )}
          
          {resumeData.suggestedSkills && resumeData.suggestedSkills.length > 0 && (
            <div>
                <h4 className="text-md font-semibold mb-1">AI Suggested Skills (from Step 1):</h4>
                <div className="flex flex-wrap gap-1.5">
                    {resumeData.suggestedSkills.map(skill => (
                        <span key={skill} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{skill}</span>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">These will be added to your profile skills if not already present.</p>
            </div>
           )}

        </CardContent>
      </Card>

      <div className="flex justify-end mt-6">
        <Button onClick={onFinish} size="lg" disabled={resumeData.isProcessingResume}>
          {resumeData.isProcessingResume ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" />}
          {resumeData.isProcessingResume ? "Saving Profile..." : "Finish & Save Profile"}
        </Button>
      </div>
    </div>
  );
}

    