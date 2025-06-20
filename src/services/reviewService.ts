
// src/services/reviewService.ts
import type { CompanyReview } from '@/lib/types';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';

interface SubmitReviewPayload extends Omit<CompanyReview, 'id' | 'timestamp' | 'reviewerUserId' | '_id' | 'createdAt' | 'updatedAt'> {
  // companyId, jobId, ratings, comments, isAnonymous are already in Omit
}

export async function submitCompanyReview(
  reviewerUserId: string,
  payload: SubmitReviewPayload
): Promise<{ success: boolean; message: string; review?: CompanyReview }> {
  console.log('[Service: submitCompanyReview] Called with userId:', reviewerUserId, 'Payload:', payload);
  
  if (!reviewerUserId) {
    console.error('[Service: submitCompanyReview] Reviewer User ID is missing.');
    throw new Error('User not identified. Cannot submit review.');
  }

  try {
    const response = await fetch(`${CUSTOM_BACKEND_URL}/api/reviews/company`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, reviewerUserId }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('[Service: submitCompanyReview] Backend error:', responseData);
      throw new Error(responseData.message || 'Failed to submit review.');
    }
    
    console.log('[Service: submitCompanyReview] Review submitted successfully via backend:', responseData.review);
    return { success: true, message: 'Review submitted successfully!', review: responseData.review };

  } catch (error: any) {
    console.error('[Service: submitCompanyReview] Catch block error:', error);
    throw error; 
  }
}

export async function getCompanyReviews(companyUserId: string): Promise<CompanyReview[]> {
  try {
    const response = await fetch(`${CUSTOM_BACKEND_URL}/api/reviews/company/${companyUserId}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Failed to fetch reviews. Status: ${response.status}` }));
      throw new Error(errorData.message);
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching company reviews:", error);
    throw error;
  }
}

export async function getCompanyReviewSummary(companyUserId: string): Promise<{
  averageResponsiveness: number;
  averageAttitude: number;
  averageProcessExperience: number;
  totalReviews: number;
}> {
  try {
    const response = await fetch(`${CUSTOM_BACKEND_URL}/api/reviews/company/${companyUserId}/summary`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Failed to fetch review summary. Status: ${response.status}` }));
      throw new Error(errorData.message);
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching company review summary:", error);
    throw error;
  }
}

