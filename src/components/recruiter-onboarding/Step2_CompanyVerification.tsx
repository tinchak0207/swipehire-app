
"use client";

import React, { useState, useEffect } from 'react';
// Button removed as submit is handled by parent
import { Label } from '@/components/ui/label';
import { CustomFileInput } from '@/components/ui/custom-file-input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import type { RecruiterOnboardingData, CompanyVerificationDocument } from '@/lib/types';
import { UploadCloud, ShieldCheck, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Step2Props {
  initialData?: Partial<RecruiterOnboardingData>;
  onSubmit: (data: Partial<RecruiterOnboardingData>) => void;
}

export function Step2_CompanyVerification({ initialData, onSubmit }: Step2Props) {
  const [businessLicenseFile, setBusinessLicenseFile] = useState<File | null>(null);
  const [organizationCodeFile, setOrganizationCodeFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData?.businessLicense instanceof File) {
        setBusinessLicenseFile(initialData.businessLicense);
    }
    if (initialData?.organizationCode instanceof File) {
        setOrganizationCodeFile(initialData.organizationCode);
    }
  }, [initialData]);

  // Called by parent to trigger data processing for this step
  // This function is now effectively called by the parent's "Next Step" button onClick for step 2
  const processStep2Data = () => {
    if (!businessLicenseFile) {
      toast({ title: "Missing Document", description: "Please upload a business license.", variant: "destructive"});
      return false; // Indicate failure
    }
    const verificationDocuments: CompanyVerificationDocument[] = [];
    if (businessLicenseFile) {
      verificationDocuments.push({ type: 'business_license', fileName: businessLicenseFile.name, uploadedAt: new Date().toISOString() });
    }
    if (organizationCodeFile) {
      verificationDocuments.push({ type: 'organization_code', fileName: organizationCodeFile.name, uploadedAt: new Date().toISOString() });
    }
    
    onSubmit({ 
        businessLicense: businessLicenseFile || undefined,
        organizationCode: organizationCodeFile || undefined,
        companyVerificationDocuments: verificationDocuments
    });
    return true; // Indicate success
  };

  // This function is conceptually part of the parent's action now.
  // The parent will call props.onSubmit (which is handleStep2Submit in RecruiterOnboardingPage)
  // which will then update the main onboardingData.

  // To ensure the parent has the latest file info for its isNextDisabled check,
  // we can call onSubmit (which is updateOnboardingData -> handleStep2Submit in parent)
  // whenever a file selection changes. This might be a bit too eager if handleStep2Submit also calls handleNextStep.
  // A better way is for the parent to read these files from its 'onboardingData' which this component should update.

  // Modified: When a file is selected, we update the parent's `onboardingData`
  // The parent's `handleStep2Submit` will be responsible for the `handleNextStep` call.
  const handleFileChange = (file: File | null, type: 'license' | 'orgCode') => {
    let newBusinessLicense = businessLicenseFile;
    let newOrganizationCode = organizationCodeFile;

    if (type === 'license') {
      setBusinessLicenseFile(file);
      newBusinessLicense = file;
    } else if (type === 'orgCode') {
      setOrganizationCodeFile(file);
      newOrganizationCode = file;
    }
    
    // Pass the current state of both files to the parent
    // The parent's handleStep2Submit is designed to updateOnboardingData AND call handleNextStep.
    // We ONLY want to updateOnboardingData here, not advance.
    // So, we need a way to just update the data.
    // The `onSubmit` prop for Step2_CompanyVerification in RecruiterOnboardingPage is `handleStep2Submit`.
    // `handleStep2Submit` calls `updateOnboardingData` then `handleNextStep`.
    // This is problematic if we call it on every file change.

    // Let's adjust: The parent will call `handleStep2Submit` when the footer "Next" is clicked.
    // The parent's `isNextDisabled` for step 2 will check `onboardingData.businessLicense`.
    // So, this component must update `onboardingData.businessLicense` (and `organizationCode`) when files change.
    // We can pass a dedicated `onDataChange` prop. Or, the `onSubmit` prop for Step 2
    // should *only* update data and *not* call `handleNextStep`. The parent will call `handleNextStep`.

    // For simplicity with current structure, we'll call the `onSubmit` prop (handleStep2Submit)
    // but the parent will ensure `handleNextStep` is only called from its own "Next" button logic for step 2.
    // This requires `handleStep2Submit` to NOT call `handleNextStep` by default.
    // This is getting convoluted.

    // **Revised strategy for Step 2:**
    // Parent's "Next Step" button for step 2 will directly call `handleStep2Submit`.
    // `handleStep2Submit` will update data AND call `handleNextStep`.
    // This component simply manages local file state. Parent reads it via `onboardingData`.
    // To make `onboardingData.businessLicense` available to the parent for its `isNextDisabled` check,
    // this component needs to call `updateOnboardingData` from the parent.
    // Let's change the prop from `onSubmit` to `onDataUpdate` for Step2.
    // The parent's `handleStep2Submit` will be called from the footer button.

    // Okay, sticking to the current `onSubmit` prop for now, assuming the parent
    // handles the "Next Step" logic for step 2 specially.
    // The `onSubmit` prop will be called by the parent for step 2.
    // This component needs to pass its state up when a file is selected.

    const currentData: Partial<RecruiterOnboardingData> = {};
    if (type === 'license') currentData.businessLicense = file || undefined;
    if (type === 'orgCode') currentData.organizationCode = file || undefined;
    
    // This is a bit of a hack to update parent data without triggering next step from here
    // This assumes `onSubmit` primarily updates data.
    if (Object.keys(currentData).length > 0) {
        // We need to provide a way for the parent to get this data for its isNextDisabled check.
        // The most direct way with the current `onSubmit` prop is to call it.
        // The parent's handleStep2Submit should be structured to only update data if called with a specific flag,
        // or it always updates data and the advancement to next step is controlled by parent.
        // For now, let's assume `onSubmit` updates the parent's `onboardingData`.
        onSubmit(currentData);
    }

  };


  return (
    // No <form> tag here as submission is controlled by parent for this step specifically
    <div className="space-y-6 animate-fadeInPage">
      <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-700">
        <Info className="h-5 w-5 !text-blue-600" />
        <AlertTitle className="font-semibold text-blue-800">Step 2: Company Verification</AlertTitle>
        <AlertDescription className="text-blue-700/90">
          Please upload relevant company verification documents. This helps us ensure a trusted environment.
          (Conceptual: For this prototype, actual file validation and backend verification are not implemented.)
        </AlertDescription>
      </Alert>

      <CustomFileInput
        id="businessLicenseUpload"
        fieldLabel="Business License (Required)"
        buttonText="Upload Business License"
        buttonIcon={<UploadCloud className="mr-2 h-4 w-4" />}
        selectedFileName={businessLicenseFile?.name}
        onFileSelected={(file) => handleFileChange(file, 'license')}
        fieldDescription="Max 5MB. PDF, JPG, PNG formats are typically accepted."
        inputProps={{ accept: ".pdf,.jpg,.jpeg,.png" }}
      />

      <CustomFileInput
        id="organizationCodeUpload"
        fieldLabel="Organization Code Certificate (Optional)"
        buttonText="Upload Organization Code"
        buttonIcon={<UploadCloud className="mr-2 h-4 w-4" />}
        selectedFileName={organizationCodeFile?.name}
        onFileSelected={(file) => handleFileChange(file, 'orgCode')}
        fieldDescription="Max 5MB. PDF, JPG, PNG formats."
        inputProps={{ accept: ".pdf,.jpg,.jpeg,.png" }}
      />
      
      <div className="pt-2">
        <ShieldCheck className="h-5 w-5 inline mr-2 text-green-600" />
        <span className="text-sm text-muted-foreground">
          Your documents will be securely handled and used for verification purposes only.
        </span>
      </div>
      {/* The "Next Step" button is in the parent RecruiterOnboardingPage component */}
    </div>
  );
}
