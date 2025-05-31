// src/services/matchService.ts
'use server'; // Or remove if not exclusively for server-side in Next.js 13+ App Router

import type { Match, RecordLikePayload, RecordLikeResponse } from '@/lib/types';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';

export async function recordLike(payload: RecordLikePayload): Promise<RecordLikeResponse> {
  try {
    console.log("Frontend: Calling recordLike service with payload:", payload);
    const response = await fetch(`${CUSTOM_BACKEND_URL}/api/interactions/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json(); // Always try to parse JSON

    if (!response.ok) {
      console.error("Frontend: recordLike service error response:", responseData);
      throw new Error(responseData.message || `Failed to record like. Status: ${response.status}`);
    }
    console.log("Frontend: recordLike service success response:", responseData);
    return responseData as RecordLikeResponse;
  } catch (error) {
    console.error("Error in recordLike service:", error);
    // Ensure a consistent error structure if possible, or re-throw
    throw error;
  }
}

export async function fetchMatches(userId: string): Promise<Match[]> {
  if (!userId) {
    console.warn("fetchMatches called without a userId.");
    return [];
  }
  try {
    console.log("Frontend: Calling fetchMatches service for userId:", userId);
    const response = await fetch(`${CUSTOM_BACKEND_URL}/api/matches/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Ensure fresh data for matches
    });

    const responseData = await response.json(); // Always try to parse JSON

    if (!response.ok) {
      console.error("Frontend: fetchMatches service error response:", responseData);
      throw new Error(responseData.message || `Failed to fetch matches. Status: ${response.status}`);
    }
    console.log("Frontend: fetchMatches service success, count:", responseData.length);
    return responseData as Match[];
  } catch (error) {
    console.error("Error in fetchMatches service:", error);
    throw error;
  }
}
