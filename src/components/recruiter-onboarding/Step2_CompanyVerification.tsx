
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessLicenseFile) {
      toast({ title: "Missing Document", description: "Please upload a business license.", variant: "destructive"});
      return;
    }
    // Conceptual: In a real app, files would be uploaded here, and URLs/references stored.
    const verificationDocuments: CompanyVerificationDocument[] = [];
    if (businessLicenseFile) {
      verificationDocuments.push({ type: 'business_license', fileName: businessLicenseFile.name, uploadedAt: new Date().toISOString() });
    }
    if (organizationCodeFile) {
      verificationDocuments.push({ type: 'organization_code', fileName: organizationCodeFile.name, uploadedAt: new Date().toISOString() });
    }
    
    onSubmit({ 
        businessLicense: businessLicenseFile || undefined, // Pass file object directly for conceptual handling
        organizationCode: organizationCodeFile || undefined,
        companyVerificationDocuments: verificationDocuments // Store metadata
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fadeInPage">
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
        fieldLabel="Business License"
        buttonText="Upload Business License"
        buttonIcon={<UploadCloud className="mr-2 h-4 w-4" />}
        selectedFileName={businessLicenseFile?.name}
        onFileSelected={setBusinessLicenseFile}
        fieldDescription="Max 5MB. PDF, JPG, PNG formats are typically accepted."
        inputProps={{ accept: ".pdf,.jpg,.jpeg,.png" }}
      />

      <CustomFileInput
        id="organizationCodeUpload"
        fieldLabel="Organization Code Certificate (Optional)"
        buttonText="Upload Organization Code"
        buttonIcon={<UploadCloud className="mr-2 h-4 w-4" />}
        selectedFileName={organizationCodeFile?.name}
        onFileSelected={setOrganizationCodeFile}
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
    </form>
  );
}
