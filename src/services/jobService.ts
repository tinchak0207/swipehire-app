
// src/services/jobService.ts
'use server'; 

import type { Company, CompanyJobOpening } from '@/lib/types';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';


export async function postJobToBackend(recruiterUserId: string, jobOpeningData: Omit<CompanyJobOpening, 'companyNameForJob' | 'companyLogoForJob' | 'companyIndustryForJob' | 'postedAt' | '_id'>): Promise<CompanyJobOpening> {
  console.log('[Frontend Service] Attempting to post job.');
  console.log('[Frontend Service] Recruiter User ID:', recruiterUserId);
  console.log('[Frontend Service] Initial Job Opening Data:', JSON.stringify(jobOpeningData, null, 2));
  console.log('[Frontend Service] CUSTOM_BACKEND_URL resolved to:', CUSTOM_BACKEND_URL);

  const targetUrl = `${CUSTOM_BACKEND_URL}/api/users/${recruiterUserId}/jobs`;
  console.log('[Frontend Service] Target Backend URL for POST:', targetUrl);
  
  // Ensure tags are an array, even if it was an empty string or undefined from the form
  const payload = {
    ...jobOpeningData,
    tags: Array.isArray(jobOpeningData.tags) ? jobOpeningData.tags : (jobOpeningData.tags ? (jobOpeningData.tags as unknown as string).split(',').map(tag => tag.trim()).filter(tag => tag) : [])
  };
  console.log('[Frontend Service] Final payload being sent:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log(`[Frontend Service] Backend response status: ${response.status}`);
    let errorDataTextForLog = ''; // For logging non-JSON errors

    if (!response.ok) {
      let errorData;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        errorData = await response.json();
        console.error('[Frontend Service] Backend error response (JSON):', errorData);
      } else {
        errorDataTextForLog = await response.text();
        console.error('[Frontend Service] Backend error response (Non-JSON Text):', errorDataTextForLog);
        errorData = { message: `Failed to post job. Server responded with non-JSON error. Status: ${response.status}. Response body: ${errorDataTextForLog.substring(0, 200)}...` };
      }
      throw new Error(errorData.message || `Failed to post job. Status: ${response.status}`);
    }
    
    const result: { message: string; job: CompanyJobOpening } = await response.json();
    console.log('[Frontend Service] Job posted successfully via backend. Backend message:', result.message);
    return result.job;

  } catch (error: any) {
    console.error("[Frontend Service] Error in postJobToBackend:", error.message);
    console.error("[Frontend Service] Full error object:", error);
    // Re-throw the error so the component can catch it and display an appropriate toast
    throw error;
  }
}


export async function fetchJobsFromBackend(): Promise<{ jobs: Company[]; hasMore: boolean; nextCursor?: string }> {
  console.log('[Frontend Service] Calling fetchJobsFromBackend.');
  console.log('[Frontend Service] CUSTOM_BACKEND_URL for GET /api/jobs resolved to:', CUSTOM_BACKEND_URL);
  // Add a cache-busting query parameter
  const targetUrl = `${CUSTOM_BACKEND_URL}/api/jobs?timestamp=${new Date().getTime()}`;
  console.log('[Frontend Service] Target Backend URL for GET /api/jobs:', targetUrl);

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // 'cache: no-store' is good, but the query parameter is more robust for all intermediaries
    });

    console.log(`[Frontend Service] GET /api/jobs - Backend response status: ${response.status}`);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch jobs. Status: ${response.status}` }));
        console.error('[Frontend Service] GET /api/jobs - Backend error response (JSON):', errorData);
        throw new Error(errorData.message);
    }
    const jobs: Company[] = await response.json();
    
    console.log(`[Frontend Service] Fetched ${jobs.length} jobs from backend.`);
    return { jobs, hasMore: false, nextCursor: undefined }; 
  } catch (error: any) {
    console.error("[Frontend Service] Error in fetchJobsFromBackend service:", error.message);
    console.error("[Frontend Service] Full error object for fetchJobsFromBackend:", error);
    throw error;
  }
}

