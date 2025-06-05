// src/services/reviewService.ts
'use server';

import type { CompanyReview } from '@/lib/types';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';

interface SubmitReviewPayload extends Omit<CompanyReview, 'id' | 'timestamp' | 'reviewerUserId'> {
  // companyId, jobId, ratings, comments, isAnonymous are already in Omit
}

export async function submitCompanyReview(
  reviewerUserId: string,
  payload: SubmitReviewPayload
): Promise<{ success: boolean; message: string; review?: CompanyReview }> {
  console.log('[Service: submitCompanyReview] Called with userId:', reviewerUserId, 'Payload:', payload);
  
  // Placeholder: Simulate backend call
  await new Promise(resolve => setTimeout(resolve, 1000));

  // In a real scenario, you would make a fetch call to your backend:
  // const response = await fetch(`${CUSTOM_BACKEND_URL}/api/companies/${payload.companyId}/reviews`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ ...payload, reviewerUserId }),
  // });
  // if (!response.ok) {
  //   const errorData = await response.json().catch(() => ({ message: 'Failed to submit review.'}));
  //   throw new Error(errorData.message);
  // }
  // const savedReview = await response.json();
  // return { success: true, message: 'Review submitted successfully!', review: savedReview };

  // Mock success response:
  const mockSavedReview: CompanyReview = {
    id: `rev_${Date.now()}`,
    reviewerUserId,
    timestamp: new Date().toISOString(),
    ...payload,
  };
  console.log('[Service: submitCompanyReview] Mock success, returning:', mockSavedReview);
  return { success: true, message: 'Review submitted successfully! (Mocked)', review: mockSavedReview };
}
