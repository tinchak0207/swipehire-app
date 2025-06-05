
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
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, Building2 } from 'lucide-react';

const TOTAL_STEPS = 4;

export default function RecruiterOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<Partial<RecruiterOnboardingData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { mongoDbUserId, fullBackendUser, fetchAndSetUserPreferences } = useUserPreferences();

  useEffect(() => {
    if (fullBackendUser?.companyProfileComplete) {
      toast({ title: "Onboarding Complete", description: "Your company profile is already set up."});
      router.push('/'); 
    }
    // Pre-fill from existing user data if available
    if (fullBackendUser) {
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
            // recruiterJobTitle and recruiterContactPhone are not directly on BackendUser yet
        }));
    }
  }, [fullBackendUser, router, toast]);


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

  const handleStep2Submit = (data: Partial<RecruiterOnboardingData>) => {
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
      // Conceptual submission
      const result = await submitCompanyRegistration(mongoDbUserId, onboardingData as RecruiterOnboardingData);
      console.log("Company Registration Submitted (Conceptual):", result);

      // Update UserPreferencesContext or local storage to mark onboarding as complete
      localStorage.setItem('recruiterCompanyProfileComplete', 'true');
      if (fetchAndSetUserPreferences && mongoDbUserId) {
         // Trigger a refresh of user data, which should now include companyProfileComplete: true
        await fetchAndSetUserPreferences(mongoDbUserId); 
      }

      toast({
        title: "Onboarding Complete!",
        description: "Your company profile has been set up (conceptually). You can now post jobs.",
        duration: 5000,
      });
      router.push('/'); // Redirect to dashboard or main app page
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1_BasicInfoForm initialData={onboardingData} onSubmit={handleStep1Submit} />;
      case 2:
        return <Step2_CompanyVerification initialData={onboardingData} onSubmit={handleStep2Submit} />;
      case 3:
        return <Step3_AccountSettings initialData={onboardingData} onSubmit={handleStep3Submit} />;
      case 4:
        return <Step4_FeatureIntroduction onboardingData={onboardingData} />;
      default:
        return <p>Unknown step</p>;
    }
  };
  
  const isNextDisabled = () => {
    if (currentStep === 1 && (!onboardingData.companyName || !onboardingData.companyIndustry || !onboardingData.companyScale || !onboardingData.companyAddress)) return true;
    // Add more validation for other steps if needed
    if (currentStep === 2 && (!onboardingData.businessLicense || !onboardingData.organizationCode )) return true; // Conceptual check
    if (currentStep === 3 && (!onboardingData.recruiterFullName || !onboardingData.recruiterJobTitle)) return true;
    return false;
  };

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
        <CardFooter className="flex justify-between pt-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            disabled={currentStep === 1 || isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          {currentStep < TOTAL_STEPS ? (
            <Button
              onClick={handleNextStep}
              disabled={isNextDisabled() || isSubmitting}
            >
              Next Step <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleFinishOnboarding} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              {isSubmitting ? "Finalizing..." : "Complete Onboarding"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
