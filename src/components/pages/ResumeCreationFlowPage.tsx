'use client';

import { ArrowLeft, ArrowRight, CheckCircle, FileText, Loader2, Lock } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react'; // Added useEffect and useCallback
import type { ResumeProcessorInput, ResumeProcessorOutput } from '@/ai/flows/resume-processor-flow';
import { processResumeAndGenerateScript } from '@/ai/flows/resume-processor-flow';
import { Step1_ResumeInput } from '@/components/resume-creation/Step1_ResumeInput';
import { Step2_ScriptEditor } from '@/components/resume-creation/Step2_ScriptEditor';
import { Step3_PresentationChoice } from '@/components/resume-creation/Step3_PresentationChoice';
import { Step4_ReviewAndFinish } from '@/components/resume-creation/Step4_ReviewAndFinish';
import { StepIndicator } from '@/components/resume-creation/StepIndicator';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUserPreferences } from '@/contexts/UserPreferencesContext'; // Added context
import { useToast } from '@/hooks/use-toast';

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
const LOCAL_STORAGE_KEY = 'swipeHireResumeBuilderProgress_v2';
const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';

interface ResumeCreationFlowPageProps {
  isGuestMode?: boolean;
}

export function ResumeCreationFlowPage({ isGuestMode }: ResumeCreationFlowPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [resumeData, setResumeData] = useState<ResumeData>({});
  const { toast } = useToast();
  const { mongoDbUserId, updateFullBackendUserFields } = useUserPreferences(); // Get user ID and update function

  // Load from localStorage on mount
  useEffect(() => {
    if (isGuestMode || typeof window === 'undefined') return;
    try {
      const savedProgress = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedProgress) {
        const parsedProgress = JSON.parse(savedProgress);
        if (parsedProgress.data) setResumeData(parsedProgress.data);
        if (parsedProgress.step) setCurrentStep(parsedProgress.step);
        console.log('Loaded resume builder progress from localStorage:', parsedProgress);
      }
    } catch (error) {
      console.error('Error loading resume builder progress from localStorage:', error);
      localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted data
    }
  }, [isGuestMode]);

  // Save to localStorage whenever resumeData or currentStep changes
  useEffect(() => {
    if (isGuestMode || typeof window === 'undefined') return;
    try {
      const progressToSave = JSON.stringify({ data: resumeData, step: currentStep });
      localStorage.setItem(LOCAL_STORAGE_KEY, progressToSave);
      console.log('Saved resume builder progress to localStorage:', {
        data: resumeData,
        step: currentStep,
      });
    } catch (error) {
      console.error('Error saving resume builder progress to localStorage:', error);
    }
  }, [resumeData, currentStep, isGuestMode]);

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const updateResumeData = useCallback((newData: Partial<ResumeData>) => {
    setResumeData((prev) => ({ ...prev, ...newData }));
  }, []);

  const handleStep1Submit = async (
    data: Pick<
      ResumeProcessorInput,
      'resumeText' | 'desiredWorkStyle' | 'toneAndStyle' | 'industryTemplate'
    >
  ) => {
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
      toast({
        title: 'Resume Processed!',
        description: 'AI has generated script ideas and suggested skills.',
      });
      handleNextStep();
    } catch (error: any) {
      console.error('Error processing resume:', error);
      toast({
        title: 'Error Processing Resume',
        description: error.message || 'Could not process resume data.',
        variant: 'destructive',
      });
      updateResumeData({ isProcessingResume: false });
    }
  };

  const handleStep2Submit = (finalScript: string) => {
    updateResumeData({ finalScript });
    handleNextStep();
  };

  const handleStep3Submit = (data: {
    presentationMethod: 'video' | 'avatar';
    videoUrl?: string;
    avatarDataUri?: string;
  }) => {
    updateResumeData({
      presentationMethod: data.presentationMethod,
      recordedVideoUrl: data.videoUrl || '',
      avatarDataUri: data.avatarDataUri || '',
    });
    handleNextStep();
  };

  const handleActualFinish = async () => {
    if (isGuestMode || !mongoDbUserId) {
      toast({
        title: 'Sign In Required',
        description: 'Please sign in to save your profile.',
        variant: 'destructive',
      });
      return;
    }
    console.log('Attempting to finish and save resume data:', resumeData);
    updateResumeData({ isProcessingResume: true });

    const payload: Partial<any> = {
      profileFinalScript: resumeData.finalScript,
    };
    if (resumeData.presentationMethod === 'video' && resumeData.recordedVideoUrl) {
      // This assumes the video was ALREADY uploaded in Step 3 and recordedVideoUrl is a persistent URL (e.g., GCS)
      // If recordedVideoUrl is a blob URL from VideoRecorderUI, Step 3 needs to handle the upload
      // and provide a persistent URL to be saved here.
      // For this iteration, we'll assume recordedVideoUrl is the persistent one if available.
      // If it's a local blob, saving it directly here without re-upload is tricky.
      // The VideoRecorderUI already has a "Save Video Resume" button that handles upload.
      // This flow should ideally leverage that by making Step 3 ensure the video is saved to profile first.
      // For now, we'll save what we have.
      payload.profileVideoPortfolioLink = resumeData.recordedVideoUrl;
    }
    if (resumeData.presentationMethod === 'avatar' && resumeData.avatarDataUri) {
      payload.profileAvatarUrl = resumeData.avatarDataUri; // Assuming avatarDataUri can be directly saved or is a URL
      // If it's a base64 data URI, backend might need to handle it.
      // For simplicity, we assume profileAvatarUrl can take it, or Step3 has already uploaded and provided a URL.
    }

    // Add resume text and other relevant fields to be saved on the user's profile
    if (resumeData.resumeText) payload.profileResumeText = resumeData.resumeText;
    if (resumeData.desiredWorkStyle) payload.profileDesiredWorkStyle = resumeData.desiredWorkStyle;
    if (resumeData.suggestedSkills && resumeData.suggestedSkills.length > 0)
      payload.profileSkills = resumeData.suggestedSkills.join(',');

    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/api/users/${mongoDbUserId}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Failed to save resume profile data.' }));
        throw new Error(errorData.message);
      }
      const savedUserData = await response.json();
      if (savedUserData.user) {
        updateFullBackendUserFields(savedUserData.user);
      }

      if (typeof window !== 'undefined') {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
      setResumeData({});
      setCurrentStep(1);
      toast({
        title: 'Resume Profile Saved!',
        description: 'Your key resume elements have been saved to your profile.',
        duration: 5000,
      });
    } catch (error: any) {
      console.error('Error saving resume profile:', error);
      toast({
        title: 'Error Saving Profile',
        description: error.message || 'Could not save resume profile.',
        variant: 'destructive',
      });
    } finally {
      updateResumeData({ isProcessingResume: false });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1_ResumeInput
            initialData={resumeData}
            onSubmit={handleStep1Submit}
            isProcessing={resumeData.isProcessingResume || false}
          />
        );
      case 2:
        return (
          <Step2_ScriptEditor
            initialScript={resumeData.initialScript || ''}
            onSubmit={handleStep2Submit}
          />
        );
      case 3:
        return (
          <Step3_PresentationChoice
            finalScript={resumeData.finalScript || 'Please complete step 2 for your script.'}
            onSubmit={handleStep3Submit}
          />
        );
      case 4:
        return <Step4_ReviewAndFinish resumeData={resumeData} onFinish={handleActualFinish} />; // Changed prop
      default:
        return <p>Unknown step</p>;
    }
  };

  if (isGuestMode) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center bg-background p-6 text-center">
        <Lock className="mb-4 h-16 w-16 text-red-400" />
        <h2 className="mb-2 font-semibold text-2xl text-destructive">Resume Creation Disabled</h2>
        <p className="text-muted-foreground">
          This feature is available for registered users. Please sign in to create your AI-powered
          video resume.
        </p>
      </div>
    );
  }

  const isNextDisabled = () => {
    if (resumeData.isProcessingResume) return true;
    if (currentStep === 1) {
      return !resumeData.initialScript;
    }
    if (currentStep === 2) {
      return !resumeData.finalScript || resumeData.finalScript.trim().length === 0;
    }
    if (currentStep === 3) {
      return (
        !resumeData.presentationMethod ||
        (resumeData.presentationMethod === 'video' && !resumeData.recordedVideoUrl) ||
        (resumeData.presentationMethod === 'avatar' && !resumeData.avatarDataUri)
      );
    }
    return false;
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl sm:text-3xl">
            <FileText className="mr-3 h-7 w-7 text-primary" />
            AI-Powered Video Resume Builder
          </CardTitle>
          <CardDescription>
            Follow the steps to create a compelling video resume that showcases your skills and
            personality.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
          <div className="min-h-[300px] p-1">{renderStepContent()}</div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            disabled={currentStep === 1 || resumeData.isProcessingResume}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          {currentStep < TOTAL_STEPS ? (
            <Button onClick={handleNextStep} disabled={isNextDisabled()}>
              {resumeData.isProcessingResume && currentStep === 1 ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              Next Step
            </Button>
          ) : (
            <Button
              onClick={handleActualFinish}
              disabled={resumeData.isProcessingResume || !mongoDbUserId}
            >
              {resumeData.isProcessingResume ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Finish & Save Profile
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
