// src/services/recruiterService.ts
import type { BackendUser, RecruiterOnboardingData } from '@/lib/types';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';

// Conceptual function to submit company registration data
export async function submitCompanyRegistration(
  mongoDbUserId: string,
  onboardingData: RecruiterOnboardingData
): Promise<{
  success: boolean;
  message: string;
  companyId?: string;
  updatedUser?: Partial<BackendUser>;
}> {
  console.log(
    '[RecruiterService] Attempting to submit company registration for user:',
    mongoDbUserId
  );
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
    console.log(
      `[RecruiterService] Making request to: ${CUSTOM_BACKEND_URL}/api/users/${mongoDbUserId}/profile`
    );
    console.log(
      '[RecruiterService] Request payload:',
      JSON.stringify(companyProfilePayload, null, 2)
    );

    const response = await fetch(`${CUSTOM_BACKEND_URL}/api/users/${mongoDbUserId}/profile`, {
      method: 'POST', // Or PUT, depending on your backend API design for profile updates
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(companyProfilePayload),
    });

    console.log(`[RecruiterService] Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        console.error('[RecruiterService] Failed to parse error response:', parseError);
        errorData = {
          message: `Server responded with ${response.status}: ${response.statusText}`,
          status: response.status,
        };
      }

      console.error('[RecruiterService] Error saving company profile:', errorData);

      // Provide more specific error messages based on status code
      let errorMessage = errorData.message || 'Failed to save company profile information.';
      if (response.status === 400) {
        errorMessage =
          errorData.message || 'Invalid data provided. Please check all required fields.';
      } else if (response.status === 404) {
        errorMessage = 'User not found. Please try logging out and back in.';
      } else if (response.status === 500) {
        errorMessage = 'Server error occurred. Please try again later.';
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('[RecruiterService] Company profile information saved successfully:', result);

    return {
      success: true,
      message: 'Company registration data submitted successfully.',
      updatedUser: result.user, // Assuming backend returns the updated user object
    };
  } catch (error: any) {
    console.error('[RecruiterService] Error in submitCompanyRegistration:', error);

    // If it's a network error, provide a more user-friendly message
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(
        'Unable to connect to the server. Please check your internet connection and try again.'
      );
    }

    throw error;
  }
}
