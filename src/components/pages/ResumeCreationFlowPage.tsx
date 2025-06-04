
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StepIndicator } from '@/components/resume-creation/StepIndicator';
import { Step1_ResumeInput } from '@/components/resume-creation/Step1_ResumeInput';
import { Step2_ScriptEditor } from '@/components/resume-creation/Step2_ScriptEditor';
import { Step3_PresentationChoice } from '@/components/resume-creation/Step3_PresentationChoice';
import { Step4_ReviewAndFinish } from '@/components/resume-creation/Step4_ReviewAndFinish';
import type { ResumeProcessorInput, ResumeProcessorOutput } from '@/ai/flows/resume-processor-flow';
import type { AvatarGeneratorOutput } from '@/ai/flows/avatar-generator';
import { FileText, Loader2, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { processResumeAndGenerateScript } from '@/ai/flows/resume-processor-flow';


export interface ResumeData {
  resumeText?: string;
  desiredWorkStyle?: string;
  toneAndStyle?: ResumeProcessorInput['toneAndStyle'];
  industryTemplate?: ResumeProcessorInput['industryTemplate'];
  
  suggestedSkills?: string[];
  experienceSummaryForScript?: string;
  initialScript?: string;
  
  finalScript?: string;
  presentationMethod?: 'video' | 'avatar';
  recordedVideoUrl?: string; // from VideoRecorderUI
  avatarDataUri?: string; // from AvatarGenerator
  
  // For Step 1 AI processing state
  isProcessingResume?: boolean;
}

const TOTAL_STEPS = 4;

interface ResumeCreationFlowPageProps {
  isGuestMode?: boolean;
}

export function ResumeCreationFlowPage({ isGuestMode }: ResumeCreationFlowPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [resumeData, setResumeData] = useState<ResumeData>({});
  const { toast } = useToast();

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const updateResumeData = (newData: Partial<ResumeData>) => {
    setResumeData((prev) => ({ ...prev, ...newData }));
  };

  const handleStep1Submit = async (data: Pick<ResumeProcessorInput, 'resumeText' | 'desiredWorkStyle' | 'toneAndStyle' | 'industryTemplate'>) => {
    updateResumeData({ isProcessingResume: true, ...data });
    try {
      const result: ResumeProcessorOutput = await processResumeAndGenerateScript(data);
      updateResumeData({
        suggestedSkills: result.suggestedSkills,
        experienceSummaryForScript: result.experienceSummaryForScript,
        initialScript: result.generatedScript,
        finalScript: result.generatedScript, // Initialize finalScript with generated one
        isProcessingResume: false,
      });
      toast({ title: "Resume Processed!", description: "AI has generated script ideas and suggested skills." });
      handleNextStep(); // Move to step 2
    } catch (error: any) {
      console.error("Error processing resume:", error);
      toast({ title: "Error Processing Resume", description: error.message || "Could not process resume data.", variant: "destructive" });
      updateResumeData({ isProcessingResume: false });
    }
  };

  const handleStep2Submit = (finalScript: string) => {
    updateResumeData({ finalScript });
    handleNextStep();
  };
  
  const handleStep3Submit = (data: { presentationMethod: 'video' | 'avatar', videoUrl?: string, avatarDataUri?: string }) => {
    updateResumeData(data);
    handleNextStep();
  };

  const handleFinish = () => {
    // Here you would typically save the complete resumeData to your backend
    console.log("Final Resume Data:", resumeData);
    toast({ title: "Resume Creation Complete!", description: "Your video resume profile elements are ready (conceptual save).", duration: 5000 });
    // Potentially reset state or navigate away
    // setCurrentStep(1); 
    // setResumeData({});
  };


  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1_ResumeInput initialData={resumeData} onSubmit={handleStep1Submit} isProcessing={resumeData.isProcessingResume} />;
      case 2:
        return <Step2_ScriptEditor initialScript={resumeData.initialScript} onSubmit={handleStep2Submit} />;
      case 3:
        return <Step3_PresentationChoice finalScript={resumeData.finalScript} onSubmit={handleStep3Submit} />;
      case 4:
        return <Step4_ReviewAndFinish resumeData={resumeData} onFinish={handleFinish} />;
      default:
        return <p>Unknown step</p>;
    }
  };

  if (isGuestMode) {
    // You might want a more elaborate guest mode message here
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold text-destructive mb-2">Resume Creation Disabled</h2>
            <p className="text-muted-foreground">This feature is available for registered users. Please sign in to create your AI-powered video resume.</p>
        </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl sm:text-3xl">
            <FileText className="mr-3 h-7 w-7 text-primary" />
            AI-Powered Video Resume Builder
          </CardTitle>
          <CardDescription>
            Follow the steps to create a compelling video resume that showcases your skills and personality.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
          <div className="p-1 min-h-[300px]">
            {renderStepContent()}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            disabled={currentStep === 1 || resumeData.isProcessingResume}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          {currentStep < TOTAL_STEPS ? (
            <Button
              onClick={() => {
                // For steps before the final one, "Next" might trigger submission for the current step component
                // This is handled by individual step components calling their onSubmit which then calls handleNextStep
                // This button is a fallback or can be used if a step doesn't have its own submit
                // For now, let's assume step components handle their own "next" logic that calls `handleNextStep`
                // If the current step's submit button is separate, this one might not be needed or could be a generic "Next"
                // For simplicity, this button will be active but rely on step components to trigger progression.
                // It will be disabled if current step is processing.
                // If on step 1, its primary action is handled by Step1_ResumeInput's own submit.
                // If on step 2 or 3, their primary action is handled by their own submit buttons.
                // So, this "Next" button primarily acts as a visual cue, with actual progression tied to step-specific actions.
                // We can disable it if the step requires a specific action to proceed.
                if (currentStep === 1 && !resumeData.isProcessingResume && (!resumeData.resumeText || !resumeData.desiredWorkStyle)) {
                     toast({title: "Missing Information", description: "Please complete Step 1 fields before proceeding.", variant: "default"});
                     return;
                }
                 if (currentStep === 2 && !resumeData.finalScript) {
                     toast({title: "Script Needed", description: "Please finalize your script in Step 2.", variant: "default"});
                     return;
                }
                 if (currentStep === 3 && !resumeData.presentationMethod) {
                     toast({title: "Presentation Method Needed", description: "Please choose video or avatar in Step 3.", variant: "default"});
                     return;
                }
                // If conditions pass or not applicable, this button becomes a generic visual next:
                // For Step 1, the form's submit button is primary.
                // For Step 2 & 3, their "Save/Use This" buttons are primary.
                // This generic Next is more of a fallback.
              }}
              disabled={resumeData.isProcessingResume || (currentStep === 1 && !resumeData.initialScript) || (currentStep === 2 && !resumeData.finalScript) || (currentStep === 3 && !resumeData.presentationMethod)}
            >
              {resumeData.isProcessingResume && currentStep === 1 ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              Next Step
            </Button>
          ) : (
            <Button onClick={handleFinish} disabled={resumeData.isProcessingResume}>
              <CheckCircle className="mr-2 h-4 w-4" /> Finish & Review
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

    