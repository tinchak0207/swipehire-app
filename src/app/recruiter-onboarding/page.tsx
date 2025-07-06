'use client';

import { ArrowLeft, ArrowRight, Building2, CheckCircle, Home, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Step1_BasicInfoForm } from '@/components/recruiter-onboarding/Step1_BasicInfoForm';
import { Step2_CompanyVerification } from '@/components/recruiter-onboarding/Step2_CompanyVerification';
import { Step3_AccountSettings } from '@/components/recruiter-onboarding/Step3_AccountSettings';
import { Step4_FeatureIntroduction } from '@/components/recruiter-onboarding/Step4_FeatureIntroduction';
import { StepIndicator } from '@/components/recruiter-onboarding/StepIndicator';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useToast } from '@/hooks/use-toast';
import type { BackendUser, RecruiterOnboardingData } from '@/lib/types';
import { submitCompanyRegistration } from '@/services/recruiterService';

const TOTAL_STEPS = 4;

export default function RecruiterOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<Partial<RecruiterOnboardingData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const {
    mongoDbUserId,
    fullBackendUser,
    fetchAndSetUserPreferences,
    preferences,
    updateFullBackendUserFields,
  } = useUserPreferences();

  useEffect(() => {
    if (!preferences.isLoading) {
      if (
        fullBackendUser?.selectedRole !== 'recruiter' ||
        fullBackendUser?.companyProfileComplete === true
      ) {
        toast({
          title: 'Onboarding Not Needed',
          description: 'Redirecting to dashboard.',
          duration: 3000,
        });
        router.push('/');
      } else if (
        fullBackendUser?.selectedRole === 'recruiter' &&
        fullBackendUser?.companyProfileComplete === false
      ) {
        setOnboardingData((prev) => {
          const updated: Partial<RecruiterOnboardingData> = {
            ...prev,
            companyName: fullBackendUser.companyName || fullBackendUser.companyNameForJobs || '',
            companyIndustry:
              fullBackendUser.companyIndustry || fullBackendUser.companyIndustryForJobs || '',
            companyAddress: fullBackendUser.companyAddress || '',
            companyWebsite: fullBackendUser.companyWebsite || '',
            companyDescription: fullBackendUser.companyDescription || '',
            companyCultureHighlights: fullBackendUser.companyCultureHighlights || [],
            recruiterFullName: fullBackendUser.name || '',
          };

          if (fullBackendUser.companyScale) {
            updated.companyScale = fullBackendUser.companyScale;
          }

          return updated;
        });
      }
    }
  }, [fullBackendUser, preferences.isLoading, router, toast]);

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const updateOnboardingData = (newData: Partial<RecruiterOnboardingData>) => {
    setOnboardingData((prev) => ({ ...prev, ...newData }));
  };

  const handleStep1Submit = (data: Partial<RecruiterOnboardingData>) => {
    updateOnboardingData(data);
    handleNextStep();
  };

  const handleStep2DataUpdateAndProceed = (data: Partial<RecruiterOnboardingData>) => {
    updateOnboardingData(data);
    handleNextStep();
  };

  const handleStep3Submit = (data: Partial<RecruiterOnboardingData>) => {
    updateOnboardingData(data);
    handleNextStep();
  };

  const handleFinishOnboarding = async () => {
    if (!mongoDbUserId) {
      toast({
        title: 'Error',
        description: 'User not identified. Cannot complete onboarding.',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      if (
        !onboardingData.companyName ||
        !onboardingData.businessLicense ||
        !onboardingData.recruiterFullName
      ) {
        toast({
          title: 'Incomplete Information',
          description: 'Please complete all required steps.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      console.log('[RecruiterOnboarding] Starting company registration submission...');
      const result = await submitCompanyRegistration(
        mongoDbUserId,
        onboardingData as RecruiterOnboardingData
      );
      console.log('[RecruiterOnboarding] Company Registration Submitted:', result);

      // Update localStorage flags immediately to prevent redirect loops
      if (typeof window !== 'undefined') {
        localStorage.setItem('recruiterCompanyProfileComplete', 'true');
        // Set a temporary flag to prevent immediate redirect
        sessionStorage.setItem('onboardingJustCompleted', 'true');
      }

      // Update context immediately with the expected state
      if (updateFullBackendUserFields) {
        console.log('[RecruiterOnboarding] Updating context with companyProfileComplete: true');
        const updateData: Partial<BackendUser> = {
          companyProfileComplete: true,
          companyName: onboardingData.companyName || '',
          companyIndustry: onboardingData.companyIndustry || '',
          companyAddress: onboardingData.companyAddress || '',
          companyWebsite: onboardingData.companyWebsite || '',
          companyDescription: onboardingData.companyDescription || '',
          companyCultureHighlights: onboardingData.companyCultureHighlights || [],
          companyNameForJobs: onboardingData.companyName || '',
          companyIndustryForJobs: onboardingData.companyIndustry || '',
          name: onboardingData.recruiterFullName || '',
        };

        if (onboardingData.companyScale) {
          updateData.companyScale = onboardingData.companyScale;
        }

        updateFullBackendUserFields(updateData);
      }

      // Refresh user preferences to get updated backend data with force refresh
      if (fetchAndSetUserPreferences && mongoDbUserId) {
        console.log('[RecruiterOnboarding] Refreshing user preferences with force refresh...');
        await fetchAndSetUserPreferences(mongoDbUserId, true);
        console.log('[RecruiterOnboarding] User preferences refreshed');
      }

      toast({
        title: 'Onboarding Complete!',
        description: 'Your company profile has been set up. You can now post jobs.',
        duration: 5000,
      });

      // Small delay to ensure context is updated before navigation
      setTimeout(() => {
        console.log('[RecruiterOnboarding] Navigating to dashboard...');
        router.push('/');
      }, 100);
    } catch (error: any) {
      console.error('[RecruiterOnboarding] Error finishing onboarding:', error);
      toast({
        title: 'Onboarding Error',
        description: error.message || 'Could not complete company onboarding.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentStepFormId = () => {
    if (currentStep === 1) return 'step1Form';
    if (currentStep === 3) return 'step3Form';
    return undefined;
  };

  const handleFooterNextClick = () => {
    if (currentStep === 2) {
      if (!onboardingData.businessLicense) {
        toast({
          title: 'Missing Document',
          description: 'Please upload a business license for Step 2.',
          variant: 'destructive',
        });
        return;
      }
      const step2DataForSubmission: Partial<RecruiterOnboardingData> = {
        businessLicense: onboardingData.businessLicense,
        companyVerificationDocuments: onboardingData.companyVerificationDocuments || [],
      };
      if (onboardingData.organizationCode) {
        step2DataForSubmission.organizationCode = onboardingData.organizationCode;
      }
      handleStep2DataUpdateAndProceed(step2DataForSubmission); // This now also calls handleNextStep
    }
    // For steps 1 and 3, the button's type="submit" and form attribute handle form submission via RHF.
    // The step component's onSubmit (e.g., handleStep1Submit) then calls handleNextStep itself.
  };

  const isNextButtonDisabled = () => {
    if (isSubmitting) return true;
    if (currentStep === 2 && !onboardingData.businessLicense) return true;
    return false;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1_BasicInfoForm initialData={onboardingData} onSubmit={handleStep1Submit} />;
      case 2:
        // onSubmit for Step2_CompanyVerification now simply updates the parent's data.
        // The actual progression to the next step is handled by handleFooterNextClick.
        return (
          <Step2_CompanyVerification initialData={onboardingData} onSubmit={updateOnboardingData} />
        );
      case 3:
        return <Step3_AccountSettings initialData={onboardingData} onSubmit={handleStep3Submit} />;
      case 4:
        return <Step4_FeatureIntroduction onboardingData={onboardingData} />;
      default:
        return <p>Unknown step</p>;
    }
  };

  const handleSkipToDashboard = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('skippedRecruiterOnboardingOnce', 'true');
    }
    router.push('/');
  };

  if (preferences.isLoading || !fullBackendUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200 p-4 md:p-6">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="bg-gray-50">
          <CardTitle className="flex items-center text-2xl text-primary sm:text-3xl">
            <Building2 className="mr-3 h-8 w-8" />
            Recruiter & Company Onboarding
          </CardTitle>
          <CardDescription>
            Complete these steps to set up your company profile and start hiring.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 py-8">
          <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
          <div className="relative min-h-[300px] p-1">{renderStepContent()}</div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t bg-gray-50 pt-6">
          <Button variant="ghost" onClick={handleSkipToDashboard} disabled={isSubmitting}>
            <Home className="mr-2 h-4 w-4" /> Skip & Go to Dashboard
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              disabled={currentStep === 1 || isSubmitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            {currentStep < TOTAL_STEPS ? (
              <Button
                type={currentStep === 1 || currentStep === 3 ? 'submit' : 'button'}
                form={getCurrentStepFormId()}
                onClick={currentStep === 2 ? handleFooterNextClick : undefined}
                disabled={isNextButtonDisabled()}
              >
                Next Step <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleFinishOnboarding} disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                {isSubmitting ? 'Finalizing...' : 'Complete Onboarding'}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
