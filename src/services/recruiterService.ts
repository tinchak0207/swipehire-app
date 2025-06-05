
// src/services/recruiterService.ts
'use server';

import type { RecruiterOnboardingData, BackendUser } from '@/lib/types';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';

// Conceptual function to submit company registration data
export async function submitCompanyRegistration(
  mongoDbUserId: string,
  onboardingData: RecruiterOnboardingData
): Promise<{ success: boolean; message: string; companyId?: string; updatedUser?: Partial<BackendUser> }> {
  console.log('[RecruiterService] Attempting to submit company registration for user:', mongoDbUserId);
  console.log('[RecruiterService] Onboarding Data:', onboardingData);

  // TODO: Implement actual file uploads for businessLicense and organizationCode if they are File objects.
  // This would involve sending them as FormData to a separate backend endpoint and getting back URLs or references.
  // For now, we'll assume they are conceptually handled or not files.

  const companyProfilePayload = {
    companyName: onboardingData.companyName,
    companyIndustry: onboardingData.companyIndustry,
    companyScale: onboardingData.companyScale,
    companyAddress: onboardingData.companyAddress,
    companyWebsite: onboardingData.companyWebsite,
    companyDescription: onboardingData.companyDescription, // Assume this might be collected later or is optional in onboarding
    companyCultureHighlights: onboardingData.companyCultureHighlights, // Assume this might be collected later
    // Conceptual: Add URLs from file uploads if implemented
    // companyVerificationDocuments: onboardingData.companyVerificationDocuments,
    companyProfileComplete: true, // Mark profile as complete

    // Update the user's default company info for job postings
    companyNameForJobs: onboardingData.companyName,
    companyIndustryForJobs: onboardingData.companyIndustry,

    // Recruiter's own details within the company context
    name: onboardingData.recruiterFullName, // This updates the User's name
    // We might need specific fields for recruiterJobTitle and recruiterContactPhone on the User model if they are distinct
    // For now, this demo assumes 'name' on User is the recruiter's name.
  };
  
  try {
    const response = await fetch(`${CUSTOM_BACKEND_URL}/api/users/${mongoDbUserId}/profile`, {
      method: 'POST', // Or PUT, depending on your backend API design for profile updates
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(companyProfilePayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to save company profile information.' }));
      console.error('[RecruiterService] Error saving company profile:', errorData);
      throw new Error(errorData.message);
    }

    const result = await response.json();
    console.log('[RecruiterService] Company profile information saved successfully:', result);
    
    return { 
        success: true, 
        message: 'Company registration data submitted successfully (conceptually).',
        updatedUser: result.user // Assuming backend returns the updated user object
    };

  } catch (error: any) {
    console.error('[RecruiterService] Error in submitCompanyRegistration:', error);
    throw error;
  }
}
