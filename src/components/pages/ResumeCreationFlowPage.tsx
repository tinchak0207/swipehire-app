
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
// AvatarGeneratorOutput is not directly used here, but by Step3
// import type { AvatarGeneratorOutput } from '@/ai/flows/avatar-generator';
import { FileText, Loader2, ArrowLeft, ArrowRight, CheckCircle, Lock } from 'lucide-react'; // Added Lock
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
  recordedVideoUrl?: string; 
  avatarDataUri?: string; 
  
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
        finalScript: result.generatedScript, 
        isProcessingResume: false,
      });
      toast({ title: "Resume Processed!", description: "AI has generated script ideas and suggested skills." });
      handleNextStep(); 
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
    updateResumeData({ 
      presentationMethod: data.presentationMethod,
      recordedVideoUrl: data.videoUrl,
      avatarDataUri: data.avatarDataUri,
     });
    handleNextStep();
  };

  const handleFinish = () => {
    console.log("Final Resume Data:", resumeData);
    toast({ title: "Resume Creation Complete!", description: "Your video resume profile elements are ready (conceptual save).", duration: 5000 });
  };


  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1_ResumeInput initialData={resumeData} onSubmit={handleStep1Submit} isProcessing={resumeData.isProcessingResume} />;
      case 2:
        return <Step2_ScriptEditor initialScript={resumeData.initialScript} onSubmit={handleStep2Submit} />;
      case 3:
        return <Step3_PresentationChoice finalScript={resumeData.finalScript || "Please complete step 2 for your script."} onSubmit={handleStep3Submit} />;
      case 4:
        return <Step4_ReviewAndFinish resumeData={resumeData} onFinish={handleFinish} />;
      default:
        return <p>Unknown step</p>;
    }
  };

  if (isGuestMode) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6 bg-background">
            <Lock className="h-16 w-16 text-red-400 mb-4" />
            <h2 className="text-2xl font-semibold text-destructive mb-2">Resume Creation Disabled</h2>
            <p className="text-muted-foreground">This feature is available for registered users. Please sign in to create your AI-powered video resume.</p>
        </div>
    );
  }

  const isNextDisabled = () => {
    if (resumeData.isProcessingResume) return true;
    if (currentStep === 1 && (!resumeData.resumeText || resumeData.resumeText.length < 50 || !resumeData.desiredWorkStyle || !resumeData.initialScript)) return true;
    if (currentStep === 2 && (!resumeData.finalScript || resumeData.finalScript.trim().length === 0)) return true;
    if (currentStep === 3 && !resumeData.presentationMethod) return true;
    // Step 4, the "Next" button is "Finish", always enabled unless processing elsewhere.
    return false;
  };

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
                // This button now acts as a visual cue or a direct "next" if the step's primary action is already done.
                // The primary action (like submitting form in Step 1) is handled by the step component itself.
                if (currentStep === 1 && resumeData.initialScript) handleNextStep(); // Allow next if AI already processed.
                else if (currentStep === 2 && resumeData.finalScript) handleNextStep();
                else if (currentStep === 3 && resumeData.presentationMethod) handleNextStep();
                else if (currentStep === 1 && (!resumeData.resumeText || !resumeData.desiredWorkStyle)) {
                     toast({title: "Missing Information", description: "Please complete Step 1 fields and generate script ideas.", variant: "default"});
                } else if (currentStep === 1 && !resumeData.initialScript) {
                    // This case implies form is filled but AI processing hasn't happened/completed yet.
                    // The form's own submit button should be used. This button can be a no-op or show a hint.
                    toast({title: "Process Resume", description: "Please click 'Generate Script Ideas' in Step 1.", variant: "default"});
                } else if (currentStep === 2 && !resumeData.finalScript) {
                     toast({title: "Finalize Script", description: "Please use the 'Finalize Script' button in Step 2.", variant: "default"});
                } else if (currentStep === 3 && !resumeData.presentationMethod) {
                     toast({title: "Choose Presentation", description: "Please choose and confirm your presentation method in Step 3.", variant: "default"});
                }
              }}
              disabled={isNextDisabled()}
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

    
