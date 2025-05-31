
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

    const contentType = response.headers.get("content-type");

    if (response.ok) {
      if (contentType && contentType.includes("application/json")) {
        const responseData = await response.json();
        console.log("Frontend: recordLike service success response:", responseData);
        return responseData as RecordLikeResponse;
      } else {
        const textResponse = await response.text();
        console.warn("Frontend: recordLike service success response was not JSON. Received text:", textResponse.substring(0, 200) + "...");
        throw new Error(`Unexpected response format from server. Status: ${response.status}. Response: ${textResponse.substring(0,100)}...`);
      }
    } else {
      // Handle non-ok responses (4xx, 5xx)
      let errorData;
      let errorMessage = `Failed to record like. Status: ${response.status}.`;

      if (contentType && contentType.includes("application/json")) {
        errorData = await response.json();
        console.error("Frontend: recordLike service error (JSON response):", errorData);
        errorMessage = errorData.message || errorMessage;
      } else {
        const textError = await response.text();
        console.error("Frontend: recordLike service error (Non-JSON response). Status:", response.status, "Body:", textError.substring(0, 500) + "...");
        
        const titleMatch = textError.match(/<title>(.*?)<\/title>/i);
        const h1Match = textError.match(/<h1>(.*?)<\/h1>/i);
        const preMatch = textError.match(/<pre>(.*?)<\/pre>/is); // Check for <pre> tag content

        let extractedMessage = "Server returned non-JSON error.";
        if (preMatch && preMatch[1]) { // Prefer <pre> content as it often contains the direct Express error
            extractedMessage = preMatch[1].trim();
        } else if (titleMatch && titleMatch[1]) {
            extractedMessage = titleMatch[1].trim();
        } else if (h1Match && h1Match[1]) {
            extractedMessage = h1Match[1].trim();
        }
        errorMessage = `${errorMessage} Server Message: ${extractedMessage}. Full response (first 200 chars): ${textError.substring(0,200)}...`;
      }
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error("Error in recordLike service (catch block):", error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(String(error) || "An unknown error occurred while recording like.");
    }
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
      cache: 'no-store', 
    });

    const responseData = await response.json(); 

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
