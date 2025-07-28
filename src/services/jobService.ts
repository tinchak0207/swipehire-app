// src/services/jobService.ts
// 'use server'; // Removed this directive

import type { Company, CompanyJobOpening } from '../lib/types';
import { EducationLevel, JobType, LocationPreference, WorkExperienceLevel } from '../lib/types';

const CUSTOM_BACKEND_URL = process.env['NEXT_PUBLIC_CUSTOM_BACKEND_URL'] || 'http://localhost:5000';

interface JobOpeningPayload
  extends Omit<
    CompanyJobOpening,
    | 'companyNameForJob'
    | 'companyLogoForJob'
    | 'companyIndustryForJob'
    | 'postedAt'
    | '_id'
    | 'videoOrImageUrl'
    | 'dataAiHint'
    | 'actualTags'
  > {
  actualTags?: string[]; // This comes from the form's derived state
  videoOrImageUrl?: string; // This might be a URL string if no file
  dataAiHint?: string;
}

export async function postJobToBackend(
  recruiterUserId: string,
  jobOpeningData: JobOpeningPayload,
  mediaFile?: File
): Promise<CompanyJobOpening> {
  console.log('[Frontend Service] Attempting to post job.');
  console.log('[Frontend Service] Recruiter User ID:', recruiterUserId);
  console.log(
    '[Frontend Service] Initial Job Opening Data (text fields):',
    JSON.stringify(jobOpeningData, null, 2)
  );
  if (mediaFile) {
    console.log(
      '[Frontend Service] Media File to be uploaded:',
      mediaFile.name,
      mediaFile.type,
      mediaFile.size
    );
  }
  console.log('[Frontend Service] CUSTOM_BACKEND_URL resolved to:', CUSTOM_BACKEND_URL);

  const targetUrl = `${CUSTOM_BACKEND_URL}/api/users/${recruiterUserId}/jobs`;
  console.log('[Frontend Service] Target Backend URL for POST:', targetUrl);

  const formData = new FormData();

  // Append all text fields from jobOpeningData
  Object.entries(jobOpeningData).forEach(([key, value]) => {
    if (key === 'actualTags' && Array.isArray(value)) {
      // Multer typically expects array fields to be sent like: tags=tag1&tags=tag2
      // Or by appending multiple times with the same key
      value.forEach((tag) => formData.append('actualTags[]', tag)); // Or just 'tags[]' if backend expects that
    } else if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  if (mediaFile) {
    formData.append('mediaFile', mediaFile, mediaFile.name);
  }

  console.log('[Frontend Service] FormData prepared. Keys:');
  for (const pair of formData.entries()) {
    console.log(`  ${pair[0]}: ${pair[1] instanceof File ? `File(${pair[1].name})` : pair[1]}`);
  }

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      // DO NOT set Content-Type header manually when using FormData,
      // the browser will set it correctly with the boundary.
      body: formData,
    });

    console.log(`[Frontend Service] Backend response status: ${response.status}`);
    let errorDataTextForLog = '';

    if (!response.ok) {
      let errorData;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        errorData = await response.json();
        console.error('[Frontend Service] Backend error response (JSON):', errorData);
      } else {
        errorDataTextForLog = await response.text();
        console.error(
          '[Frontend Service] Backend error response (Non-JSON Text):',
          errorDataTextForLog
        );
        errorData = {
          message: `Failed to post job. Server responded with non-JSON error. Status: ${response.status}. Response body: ${errorDataTextForLog.substring(0, 200)}...`,
        };
      }
      throw new Error(errorData.message || `Failed to post job. Status: ${response.status}`);
    }

    const result: { message: string; job: CompanyJobOpening } = await response.json();
    console.log(
      '[Frontend Service] Job posted successfully via backend. Backend message:',
      result.message
    );
    return result.job;
  } catch (error: any) {
    console.error('[Frontend Service] Error in postJobToBackend:', error.message);
    console.error('[Frontend Service] Full error object for postJobToBackend:', error);
    throw error;
  }
}

export async function fetchJobsFromBackend(): Promise<{
  jobs: Company[];
  hasMore: boolean;
  nextCursor?: string;
}> {
  console.log('[Frontend Service] Calling fetchJobsFromBackend.');
  console.log(
    '[Frontend Service] CUSTOM_BACKEND_URL for GET /api/jobs resolved to:',
    CUSTOM_BACKEND_URL
  );
  const targetUrl = `${CUSTOM_BACKEND_URL}/api/jobs?timestamp=${Date.now()}`;
  console.log('[Frontend Service] Target Backend URL for GET /api/jobs:', targetUrl);

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`[Frontend Service] GET /api/jobs - Backend response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: `Failed to fetch jobs. Status: ${response.status}` }));
      console.error('[Frontend Service] GET /api/jobs - Backend error response (JSON):', errorData);
      throw new Error(errorData.message);
    }

    const responseData = await response.json();
    console.log('[Frontend Service] Raw backend response:', responseData);
    let rawJobs: any[] = [];

    // Handle both response formats:
    // 1. Direct array of jobs
    // 2. Object with jobs array property
    if (Array.isArray(responseData)) {
      rawJobs = responseData;
    } else if (responseData && Array.isArray(responseData.jobs)) {
      rawJobs = responseData.jobs;
    } else {
      console.warn('[Frontend Service] Unexpected jobs response format, defaulting to empty array');
    }

    // Transform raw Job objects into Company objects
    const companies: Company[] = rawJobs.map((job: any) => ({
      id: `comp-user-${job.userId}-job-${job._id}`,
      name: job.companyName || 'Company Name Not Available',
      industry: job.industry || 'Technology',
      description: job.companyDescription || 'No company description available.',
      cultureHighlights: [],
      logoUrl: job.mediaUrl || null,
      jobOpenings: [
        {
          _id: job._id,
          title: job.title,
          description: job.description,
          tags: job.skillsRequired || [],
          salaryMin: 0,
          salaryMax: 0,
          salaryRange: job.salaryRange,
          jobType: job.jobType || JobType.FULL_TIME,
          workLocationType: LocationPreference.REMOTE,
          location: job.location,
          requiredExperienceLevel: WorkExperienceLevel.MID_LEVEL,
          requiredEducationLevel: EducationLevel.UNIVERSITY,
        },
      ],
      recruiterUserId: job.userId,
      dataAiHint: 'company logo',
    }));

    console.log(`[Frontend Service] Transformed ${companies.length} jobs into company objects.`);
    return { jobs: companies, hasMore: false };
  } catch (error: any) {
    console.error('[Frontend Service] Error in fetchJobsFromBackend service:', error.message);
    console.error('[Frontend Service] Full error object for fetchJobsFromBackend:', error);
    throw error;
  }
}

export async function fetchRecruiterJobs(recruiterUserId: string): Promise<CompanyJobOpening[]> {
  if (!recruiterUserId) {
    console.warn('[Frontend Service] fetchRecruiterJobs called without recruiterUserId.');
    return [];
  }
  const targetUrl = `${CUSTOM_BACKEND_URL}/api/users/${recruiterUserId}/jobs?timestamp=${Date.now()}`;
  console.log(
    '[Frontend Service] Fetching jobs for recruiter:',
    recruiterUserId,
    'URL:',
    targetUrl
  );
  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: `Failed to fetch recruiter jobs. Status: ${response.status}` }));
      console.error('[Frontend Service] Error fetching recruiter jobs (JSON):', errorData);
      throw new Error(errorData.message);
    }
    const jobs: CompanyJobOpening[] = await response.json();
    console.log(`[Frontend Service] Fetched ${jobs.length} jobs for recruiter ${recruiterUserId}.`);
    return jobs;
  } catch (error: any) {
    console.error(
      `[Frontend Service] Error in fetchRecruiterJobs for ${recruiterUserId}:`,
      error.message
    );
    throw error;
  }
}

export async function updateRecruiterJob(
  recruiterUserId: string,
  jobId: string,
  jobData: Partial<CompanyJobOpening>
): Promise<CompanyJobOpening> {
  if (!recruiterUserId || !jobId) {
    throw new Error('Recruiter user ID and Job ID are required for update.');
  }
  const targetUrl = `${CUSTOM_BACKEND_URL}/api/users/${recruiterUserId}/jobs/${jobId}/update`; // Changed path
  console.log(
    '[Frontend Service] Updating job (POST):',
    jobId,
    'for recruiter:',
    recruiterUserId,
    'URL:',
    targetUrl
  );
  console.log('[Frontend Service] Job data being sent:', JSON.stringify(jobData, null, 2));

  try {
    const response = await fetch(targetUrl, {
      method: 'POST', // Changed method to POST
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData),
    });

    console.log(`[Frontend Service] Update job response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: `Failed to update job. Status: ${response.status}` }));
      console.error('[Frontend Service] Error updating job (JSON):', errorData);
      throw new Error(errorData.message);
    }

    const responseData = await response.json();
    console.log('[Frontend Service] Raw response data:', JSON.stringify(responseData, null, 2));

    // Handle different response formats from backend
    let updatedJob: CompanyJobOpening;

    if (responseData?.job) {
      // Expected format: { message: string; job: CompanyJobOpening }
      updatedJob = responseData.job;
      console.log(
        '[Frontend Service] Job updated successfully (nested format):',
        updatedJob.title || 'No title'
      );
    } else if (responseData?.title) {
      // Direct job object format
      updatedJob = responseData;
      console.log(
        '[Frontend Service] Job updated successfully (direct format):',
        updatedJob.title || 'No title'
      );
    } else {
      // Fallback - use the original job data with updates
      console.warn('[Frontend Service] Unexpected response format, using fallback');
      updatedJob = { ...jobData } as CompanyJobOpening;
      console.log(
        '[Frontend Service] Job updated successfully (fallback):',
        updatedJob.title || 'No title'
      );
    }

    return updatedJob;
  } catch (error: any) {
    console.error(
      `[Frontend Service] Error in updateRecruiterJob for job ${jobId}:`,
      error.message
    );
    throw error;
  }
}

export async function deleteRecruiterJob(
  recruiterUserId: string,
  jobId: string
): Promise<{ message: string }> {
  if (!recruiterUserId || !jobId) {
    throw new Error('Recruiter user ID and Job ID are required for deletion.');
  }
  const targetUrl = `${CUSTOM_BACKEND_URL}/api/users/${recruiterUserId}/jobs/${jobId}`;
  console.log(
    '[Frontend Service] Deleting job:',
    jobId,
    'for recruiter:',
    recruiterUserId,
    'URL:',
    targetUrl
  );
  try {
    const response = await fetch(targetUrl, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: `Failed to delete job. Status: ${response.status}` }));
      console.error('[Frontend Service] Error deleting job (JSON):', errorData);
      throw new Error(errorData.message);
    }
    const result: { message: string } = await response.json();
    console.log('[Frontend Service] Job deleted successfully. Message:', result.message);
    return result;
  } catch (error: any) {
    console.error(
      `[Frontend Service] Error in deleteRecruiterJob for job ${jobId}:`,
      error.message
    );
    throw error;
  }
}
