
// src/services/jobService.ts
'use server'; // Can be used by Server Components/Actions if structured that way

import type { Company } from '@/lib/types';
import { mockCompanies } from '@/lib/mockData'; // For mock data in this demo

// Simulate a database or persistent storage for user-posted jobs
let userPostedJobsStore: Company[] = [];

/**
 * Simulates posting a job to a backend.
 * In a real app, this would make an API call to a Firebase Function
 * which would then save the data to Firestore.
 */
export async function postJobToBackend(jobData: Company): Promise<Company> {
  console.log('Simulating: Posting job to backend', jobData);
  return new Promise((resolve) => {
    setTimeout(() => {
      const newJobWithId = { ...jobData, id: `backend-job-${Date.now()}-${Math.random().toString(16).slice(2)}` };
      // Prepend to our simulated store so new jobs appear first
      userPostedJobsStore = [newJobWithId, ...userPostedJobsStore];
      resolve(newJobWithId);
    }, 1000);
  });
}

const JOBS_PER_PAGE = 3;

/**
 * Simulates fetching jobs from a backend with pagination.
 * In a real app, this would query Firestore, possibly using a cursor
 * (e.g., the ID or timestamp of the last fetched job).
 * @param lastItemId - Optional ID of the last item fetched, for pagination.
 */
export async function fetchJobsFromBackend(lastItemId?: string): Promise<{ jobs: Company[]; hasMore: boolean; nextCursor?: string }> {
  console.log('Simulating: Fetching jobs from backend. lastItemId:', lastItemId);
  
  // Combine mock companies and user-posted jobs for the purpose of this demo backend simulation
  const allAvailableJobs = [...userPostedJobsStore, ...mockCompanies.filter(mc => !userPostedJobsStore.find(upj => upj.id === mc.id))];
  
  return new Promise((resolve) => {
    setTimeout(() => {
      let startIndex = 0;
      if (lastItemId) {
        const lastIndex = allAvailableJobs.findIndex(job => job.id === lastItemId);
        if (lastIndex !== -1) {
          startIndex = lastIndex + 1;
        }
      }

      const jobsSlice = allAvailableJobs.slice(startIndex, startIndex + JOBS_PER_PAGE);
      const hasMore = (startIndex + JOBS_PER_PAGE) < allAvailableJobs.length;
      const nextCursor = hasMore && jobsSlice.length > 0 ? jobsSlice[jobsSlice.length - 1].id : undefined;
      
      resolve({ jobs: jobsSlice, hasMore, nextCursor });
    }, 700);
  });
}
