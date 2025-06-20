// src/services/matchService.ts
import type { Match, RecordLikePayload, RecordLikeResponse } from '@/lib/types';

const CUSTOM_BACKEND_URL_FROM_ENV = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL;
const CUSTOM_BACKEND_URL = CUSTOM_BACKEND_URL_FROM_ENV || 'http://localhost:5000';

export async function recordLike(payload: RecordLikePayload): Promise<RecordLikeResponse> {
  try {
    const targetUrl = `${CUSTOM_BACKEND_URL}/api/interactions/like`;
    
    console.log(`[Server Action - recordLike] ENV NEXT_PUBLIC_CUSTOM_BACKEND_URL: ${CUSTOM_BACKEND_URL_FROM_ENV}`);
    console.log(`[Server Action - recordLike] Effective CUSTOM_BACKEND_URL for fetch: ${CUSTOM_BACKEND_URL}`);
    console.log(`[Server Action - recordLike] Target URL for fetch: ${targetUrl}`);
    console.log("[Server Action - recordLike] Payload received:", JSON.stringify(payload));

    const response = await fetch(targetUrl, {
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
        console.log("[Server Action - recordLike] Service success response:", responseData);
        return responseData as RecordLikeResponse;
      } else {
        const textResponse = await response.text();
        console.warn("[Server Action - recordLike] Service success response was not JSON. Received text:", textResponse.substring(0, 200) + "...");
        throw new Error(`Unexpected response format from server. Status: ${response.status}. Response: ${textResponse.substring(0,100)}...`);
      }
    } else {
      let errorData;
      let errorMessage = `Failed to record like. Status: ${response.status}.`;

      if (contentType && contentType.includes("application/json")) {
        errorData = await response.json();
        console.error("[Server Action - recordLike] Service error (JSON response):", errorData);
        errorMessage = errorData.message || errorMessage;
      } else {
        const textError = await response.text();
        console.error("[Server Action - recordLike] Service error (Non-JSON response). Status:", response.status, "Body:", textError.substring(0, 500) + "...");
        
        const titleMatch = textError.match(/<title>(.*?)<\/title>/i);
        const h1Match = textError.match(/<h1>(.*?)<\/h1>/i);
        const preMatch = textError.match(/<pre>(.*?)<\/pre>/is); 

        let extractedMessage = "Server returned non-JSON error.";
        if (preMatch && preMatch[1]) { 
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
    console.error("[Server Action - recordLike] Error in service (catch block):", error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(String(error) || "An unknown error occurred while recording like.");
    }
  }
}

export async function fetchMatches(userId: string): Promise<{ data: Match[] | null; error: string | null; }> {
  if (!userId) {
    console.warn("[Server Action - fetchMatches] Called without a userId.");
    return { data: [], error: "User ID not provided." };
  }
  try {
    const targetUrl = `${CUSTOM_BACKEND_URL}/api/matches/${userId}`;
    console.log(`[Server Action - fetchMatches] Effective CUSTOM_BACKEND_URL for fetch: ${CUSTOM_BACKEND_URL}`);
    console.log(`[Server Action - fetchMatches] Target URL for fetch: ${targetUrl}`);
    
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', 
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Failed to fetch matches. Status: ${response.status}` }));
      console.error("[Server Action - fetchMatches] Service error response:", errorData);
      return { data: null, error: errorData.message || `Failed to fetch matches. Status: ${response.status}` };
    }
    
    const responseData = await response.json(); 
    console.log("[Server Action - fetchMatches] Service success, count:", responseData.length);
    return { data: responseData as Match[], error: null };
  } catch (error: any) {
    console.error("[Server Action - fetchMatches] Error in service:", error);
    return { data: null, error: error.message || "An unknown error occurred while fetching matches." };
  }
}

export async function archiveMatch(matchId: string, archivingUserId: string): Promise<Match> {
  if (!matchId || !archivingUserId) {
    throw new Error("Match ID and Archiving User ID are required.");
  }
  try {
    const targetUrl = `${CUSTOM_BACKEND_URL}/api/matches/${matchId}/archive`;
    console.log(`[Server Action - archiveMatch] Target URL: ${targetUrl}`);
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archivingUserId }),
    });
    const responseData = await response.json();
    if (!response.ok) {
      console.error("[Server Action - archiveMatch] Service error response:", responseData);
      throw new Error(responseData.message || `Failed to archive match. Status: ${response.status}`);
    }
    console.log("[Server Action - archiveMatch] Match archived successfully:", responseData.match?._id);
    return responseData.match as Match;
  } catch (error) {
    console.error("[Server Action - archiveMatch] Error in service:", error);
    throw error;
  }
}
