
// src/services/jobService.ts
'use server'; // Can be used by Server Components/Actions if structured that way

import type { Company } from '@/lib/types';
import { mockCompanies } from '@/lib/mockData'; // For mock data in this demo

// In a real Firebase setup, you would initialize Firebase Admin SDK in your Cloud Functions.
// For client-side interactions (like fetching jobs directly from Firestore or calling functions),
// you'd use the Firebase client SDK, which is typically initialized in a firebase.ts or similar config file.

// Simulate a database or persistent storage for user-posted jobs (Firestore in a real app)
let userPostedJobsStore: Company[] = []; // This would be replaced by Firestore

/**
 * Simulates posting a job to a backend.
 * In a real app, this frontend function would call a Firebase Cloud Function.
 */
export async function postJobToBackend(jobData: Company): Promise<Company> {
  console.log('Frontend: Calling postJobToBackend with jobData:', jobData);
  // In a real Firebase app, you would:
  // 1. Get the Firebase Functions instance.
  // 2. Get a reference to your 'createJobPosting' Cloud Function.
  // 3. Call the function with the jobData.
  // Example (conceptual, actual SDK usage might vary slightly):
  //   const functions = getFunctions(); // from 'firebase/functions'
  //   const createJobPosting = httpsCallable(functions, 'createJobPosting');
  //   try {
  //     const result = await createJobPosting({ jobDetails: jobData.jobOpenings?.[0], companyName: jobData.name /* ...other relevant data */ });
  //     console.log('Cloud Function result:', result.data);
  //     return result.data as Company; // Assuming the function returns the created job/company object
  //   } catch (error) {
  //     console.error("Error calling createJobPosting Cloud Function", error);
  //     throw error;
  //   }

  // --- Simulation Logic (Remove when implementing Firebase) ---
  return new Promise((resolve) => {
    setTimeout(() => {
      // The backend would assign the ID and handle creation timestamp.
      const newJobWithId = { ...jobData, id: `backend-job-${Date.now()}-${Math.random().toString(16).slice(2)}` };
      userPostedJobsStore = [newJobWithId, ...userPostedJobsStore];
      console.log('Simulated Backend: Job posted, new store:', userPostedJobsStore);
      resolve(newJobWithId);
    }, 1000);
  });
  // --- End Simulation Logic ---
}

const JOBS_PER_PAGE = 3;

/**
 * Simulates fetching jobs from a backend with pagination.
 * In a real app, this could query Firestore directly (if rules allow and it's efficient)
 * or call a Firebase Cloud Function that handles the querying and pagination.
 * @param lastItemId - Optional ID of the last item fetched, for pagination (Firestore cursor).
 */
export async function fetchJobsFromBackend(lastItemId?: string): Promise<{ jobs: Company[]; hasMore: boolean; nextCursor?: string }> {
  console.log('Frontend: Calling fetchJobsFromBackend. lastItemId:', lastItemId);

  // In a real Firebase app, you might:
  // Option A: Query Firestore directly from the client (ensure security rules are appropriate)
  //   const db = getFirestore(); // from 'firebase/firestore'
  //   let queryRef = collection(db, 'jobPostings'); // Or 'companies' if jobs are nested
  //   queryRef = query(queryRef, orderBy('createdAt', 'desc'), limit(JOBS_PER_PAGE));
  //   if (lastItemId) {
  //     const lastDocSnapshot = await getDoc(doc(db, 'jobPostings', lastItemId));
  //     queryRef = query(queryRef, startAfter(lastDocSnapshot));
  //   }
  //   const querySnapshot = await getDocs(queryRef);
  //   const jobs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Company));
  //   const hasMore = jobs.length === JOBS_PER_PAGE; // Basic check, more robust check needed
  //   const nextCursor = jobs.length > 0 ? jobs[jobs.length - 1].id : undefined;
  //   return { jobs, hasMore, nextCursor };
  //
  // Option B: Call a Cloud Function
  //   const functions = getFunctions();
  //   const getJobsFunction = httpsCallable(functions, 'listJobPostings');
  //   const result = await getJobsFunction({ limit: JOBS_PER_PAGE, startAfter: lastItemId });
  //   return result.data as { jobs: Company[]; hasMore: boolean; nextCursor?: string };


  // --- Simulation Logic (Remove when implementing Firebase) ---
  const allAvailableJobsForSimulation = [...userPostedJobsStore, ...mockCompanies.filter(mc => !userPostedJobsStore.find(upj => upj.id === mc.id))];
  console.log('Simulated Backend: Fetching from combined store of size:', allAvailableJobsForSimulation.length);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      let startIndex = 0;
      if (lastItemId) {
        const lastIndex = allAvailableJobsForSimulation.findIndex(job => job.id === lastItemId);
        if (lastIndex !== -1) {
          startIndex = lastIndex + 1;
        }
      }

      const jobsSlice = allAvailableJobsForSimulation.slice(startIndex, startIndex + JOBS_PER_PAGE);
      const hasMore = (startIndex + JOBS_PER_PAGE) < allAvailableJobsForSimulation.length;
      const nextCursor = hasMore && jobsSlice.length > 0 ? jobsSlice[jobsSlice.length - 1].id : undefined;
      
      console.log(`Simulated Backend: Returning ${jobsSlice.length} jobs. HasMore: ${hasMore}. NextCursor: ${nextCursor}`);
      resolve({ jobs: jobsSlice, hasMore, nextCursor });
    }, 700);
  });
  // --- End Simulation Logic ---
}
