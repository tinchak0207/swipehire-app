
// src/services/jobService.ts
'use server'; 

import type { Company, CompanyJobOpening } from '@/lib/types';
// mockCompanies import removed as we fetch from backend now

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';


export async function postJobToBackend(recruiterUserId: string, jobOpeningData: Omit<CompanyJobOpening, 'companyNameForJob' | 'companyLogoForJob' | 'companyIndustryForJob' | 'postedAt'>): Promise<CompanyJobOpening> {
  console.log('Frontend: Calling postJobToBackend for recruiter:', recruiterUserId, 'with jobData:', jobOpeningData);
  
  try {
    const response = await fetch(`${CUSTOM_BACKEND_URL}/api/users/${recruiterUserId}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobOpeningData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Failed to post job. Status: ${response.status}` }));
      throw new Error(errorData.message || `Failed to post job. Status: ${response.status}`);
    }
    const result: { message: string; job: CompanyJobOpening } = await response.json();
    return result.job;
  } catch (error) {
    console.error("Error calling postJobToBackend:", error);
    throw error;
  }
}


export async function fetchJobsFromBackend(): Promise<{ jobs: Company[]; hasMore: boolean; nextCursor?: string }> {
  console.log('Frontend: Calling fetchJobsFromBackend.');

  try {
    const response = await fetch(`${CUSTOM_BACKEND_URL}/api/jobs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Ensure fresh data
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch jobs. Status: ${response.status}` }));
        throw new Error(errorData.message);
    }
    const jobs: Company[] = await response.json();
    
    // Since the backend currently returns all jobs, pagination is handled client-side or effectively not paginated from backend.
    // For a true paginated backend, `hasMore` and `nextCursor` would come from the API response.
    console.log(`Frontend: Fetched ${jobs.length} jobs from backend.`);
    return { jobs, hasMore: false, nextCursor: undefined }; // No backend pagination in this fetch
  } catch (error) {
    console.error("Error in fetchJobsFromBackend service:", error);
    throw error;
  }
}

