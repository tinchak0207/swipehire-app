'use client';

import { CheckCircle, FileText, Info, Loader2, UserSquare2, Video } from 'lucide-react'; // Added Loader2
import NextImage from 'next/image';
import type { ResumeData } from '@/components/pages/ResumeCreationFlowPage';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Step4Props {
  resumeData: ResumeData;
  onFinish: () => void; // This will now call handleActualFinish
}

export function Step4_ReviewAndFinish({ resumeData, onFinish }: Step4Props) {
  return (
    <div className="animate-fadeInPage space-y-6">
      <Alert variant="default" className="border-green-200 bg-green-50 text-green-700">
        <Info className="!text-green-600 h-5 w-5" />
        <AlertTitle className="font-semibold text-green-800">Step 4: Review & Finish</AlertTitle>
        <AlertDescription className="text-green-700/90">
          Almost there! Review your selections below. If everything looks good, click "Finish & Save
          Profile" to complete your AI-powered resume profile elements. This will save your script
          and presentation choice to your SwipeHire profile.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Your Resume Elements</CardTitle>
          <CardDescription>Here's a summary of what you've created.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="mb-1 flex items-center font-semibold text-md">
              <FileText className="mr-2 h-5 w-5 text-primary" />
              Final Script:
            </h4>
            <div className="max-h-40 overflow-y-auto rounded-md bg-muted p-3 text-sm">
              <pre className="whitespace-pre-wrap ">
                {resumeData.finalScript || 'No script finalized.'}
              </pre>
            </div>
          </div>

          <div>
            <h4 className="mb-1 font-semibold text-md">Presentation Method:</h4>
            <p className="font-medium text-primary text-sm capitalize">
              {resumeData.presentationMethod || 'Not selected'}
              {resumeData.presentationMethod === 'video' && (
                <Video className="ml-2 inline h-5 w-5" />
              )}
              {resumeData.presentationMethod === 'avatar' && (
                <UserSquare2 className="ml-2 inline h-5 w-5" />
              )}
            </p>
          </div>

          {resumeData.presentationMethod === 'video' && resumeData.recordedVideoUrl && (
            <div>
              <h4 className="mb-1 font-semibold text-md">Your Recorded Video Link:</h4>
              {/* Displaying the link as text instead of video player for review, or a small thumbnail if it's an image-like URL */}
              {resumeData.recordedVideoUrl.startsWith('blob:') ? (
                <p className="text-muted-foreground text-sm italic">
                  Video recorded. Link will be processed on save.
                </p>
              ) : (
                <a
                  href={resumeData.recordedVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-blue-600 text-sm hover:underline"
                >
                  {resumeData.recordedVideoUrl}
                </a>
              )}
            </div>
          )}

          {resumeData.presentationMethod === 'avatar' && resumeData.avatarDataUri && (
            <div>
              <h4 className="mb-1 font-semibold text-md">Your Generated Avatar:</h4>
              <div className="relative h-32 w-32 overflow-hidden rounded-md border shadow-md">
                <NextImage
                  src={resumeData.avatarDataUri}
                  alt="Generated Avatar"
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint="generated avatar"
                />
              </div>
            </div>
          )}

          {resumeData.suggestedSkills && resumeData.suggestedSkills.length > 0 && (
            <div>
              <h4 className="mb-1 font-semibold text-md">AI Suggested Skills (from Step 1):</h4>
              <div className="flex flex-wrap gap-1.5">
                {resumeData.suggestedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <p className="mt-1 text-muted-foreground text-xs">
                These will be added to your profile skills if not already present.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end">
        <Button onClick={onFinish} size="lg" disabled={resumeData.isProcessingResume}>
          {resumeData.isProcessingResume ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <CheckCircle className="mr-2 h-5 w-5" />
          )}
          {resumeData.isProcessingResume ? 'Saving Profile...' : 'Finish & Save Profile'}
        </Button>
      </div>
    </div>
  );
}
