
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { StepIndicator } from '@/components/recruiter-onboarding/StepIndicator';
import { Step1_BasicInfoForm } from '@/components/recruiter-onboarding/Step1_BasicInfoForm';
import { Step2_CompanyVerification } from '@/components/recruiter-onboarding/Step2_CompanyVerification';
import { Step3_AccountSettings } from '@/components/recruiter-onboarding/Step3_AccountSettings';
import { Step4_FeatureIntroduction } from '@/components/recruiter-onboarding/Step4_FeatureIntroduction';
import type { RecruiterOnboardingData } from '@/lib/types';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useToast } from '@/hooks/use-toast';
import { submitCompanyRegistration } from '@/services/recruiterService';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, Building2, Home } from 'lucide-react';

const TOTAL_STEPS = 4;

export default function RecruiterOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<Partial<RecruiterOnboardingData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { mongoDbUserId, fullBackendUser, fetchAndSetUserPreferences, preferences } = useUserPreferences();

  useEffect(() => {
    if (!preferences.loadingPreferences) {
      if (fullBackendUser?.selectedRole !== 'recruiter' || fullBackendUser?.companyProfileComplete === true) {
        toast({ title: "Onboarding Not Needed", description: "Redirecting to dashboard.", duration: 3000 });
        router.push('/');
      } else if (fullBackendUser?.selectedRole === 'recruiter' && fullBackendUser?.companyProfileComplete === false) {
        setOnboardingData(prev => ({
            ...prev,
            companyName: fullBackendUser.companyName || fullBackendUser.companyNameForJobs || '',
            companyIndustry: fullBackendUser.companyIndustry || fullBackendUser.companyIndustryForJobs || '',
            companyScale: fullBackendUser.companyScale || undefined,
            companyAddress: fullBackendUser.companyAddress || '',
            companyWebsite: fullBackendUser.companyWebsite || '',
            companyDescription: fullBackendUser.companyDescription || '',
            companyCultureHighlights: fullBackendUser.companyCultureHighlights || [],
            recruiterFullName: fullBackendUser.name || '',
        }));
      }
    }
  }, [fullBackendUser, preferences.loadingPreferences, router, toast]);


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
        toast({ title: "Error", description: "User not identified. Cannot complete onboarding.", variant: "destructive"});
        return;
    }
    setIsSubmitting(true);
    try {
      if (!onboardingData.companyName || !onboardingData.businessLicense || !onboardingData.recruiterFullName) {
          toast({ title: "Incomplete Information", description: "Please complete all required steps.", variant: "destructive" });
          setIsSubmitting(false);
          return;
      }

      const result = await submitCompanyRegistration(mongoDbUserId, onboardingData as RecruiterOnboardingData);
      console.log("Company Registration Submitted:", result);

      if (fetchAndSetUserPreferences && mongoDbUserId) {
        await fetchAndSetUserPreferences(mongoDbUserId); // This should update fullBackendUser in context
      }

      // For consistency, also update the localStorage flag that CreateJobPostingPage might initially check
      if (typeof window !== 'undefined') {
        localStorage.setItem('recruiterCompanyProfileComplete', 'true');
      }


      toast({
        title: "Onboarding Complete!",
        description: "Your company profile has been set up. You can now post jobs.",
        duration: 5000,
      });
      router.push('/');
    } catch (error: any) {
      console.error("Error finishing onboarding:", error);
      toast({
        title: "Onboarding Error",
        description: error.message || "Could not complete company onboarding.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentStepFormId = () => {
    if (currentStep === 1) return "step1Form";
    if (currentStep === 3) return "step3Form";
    return undefined;
  };

  const handleFooterNextClick = () => {
    if (currentStep === 2) {
      if (!onboardingData.businessLicense) {
        toast({ title: "Missing Document", description: "Please upload a business license for Step 2.", variant: "destructive"});
        return;
      }
      const step2DataForSubmission = {
        businessLicense: onboardingData.businessLicense,
        organizationCode: onboardingData.organizationCode,
        companyVerificationDocuments: onboardingData.companyVerificationDocuments,
      };
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
        return <Step2_CompanyVerification initialData={onboardingData} onSubmit={updateOnboardingData} />;
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

  if (preferences.loadingPreferences || !fullBackendUser) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200 flex flex-col items-center justify-center p-4 md:p-6">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="bg-gray-50">
          <CardTitle className="flex items-center text-2xl sm:text-3xl text-primary">
            <Building2 className="mr-3 h-8 w-8" />
            Recruiter & Company Onboarding
          </CardTitle>
          <CardDescription>
            Complete these steps to set up your company profile and start hiring.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 py-8">
          <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
          <div className="p-1 min-h-[300px] relative">
            {renderStepContent()}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center pt-6 border-t bg-gray-50">
          <Button
            variant="ghost"
            onClick={handleSkipToDashboard}
            disabled={isSubmitting}
          >
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
                  type={currentStep === 1 || currentStep === 3 ? "submit" : "button"}
                  form={getCurrentStepFormId()}
                  onClick={currentStep === 2 ? handleFooterNextClick : undefined}
                  disabled={isNextButtonDisabled()}
                >
                  Next Step <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            ) : (
                <Button onClick={handleFinishOnboarding} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                {isSubmitting ? "Finalizing..." : "Complete Onboarding"}
                </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
