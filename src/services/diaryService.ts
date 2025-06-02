
// src/services/diaryService.ts
'use server';

import type { DiaryPost } from '@/lib/types';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';

interface CreateDiaryPostPayload {
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  imageUrl?: string;
  diaryImageHint?: string;
  tags?: string[];
  isFeatured?: boolean;
}

export async function fetchDiaryPosts(): Promise<DiaryPost[]> {
  try {
    const response = await fetch(`${CUSTOM_BACKEND_URL}/api/diary-posts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Ensure fresh data
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Failed to fetch diary posts. Status: ${response.status}` }));
      throw new Error(errorData.message);
    }
    const posts: DiaryPost[] = await response.json();
    return posts.map(post => ({ ...post, id: post._id })); // Map _id to id for frontend use
  } catch (error) {
    console.error("Error in fetchDiaryPosts:", error);
    throw error;
  }
}

export async function createDiaryPost(postData: CreateDiaryPostPayload): Promise<DiaryPost> {
  try {
    const response = await fetch(`${CUSTOM_BACKEND_URL}/api/diary-posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorData;
      if (contentType && contentType.includes("application/json")) {
        errorData = await response.json();
      } else {
        // Attempt to get text if not JSON, for better debugging
        const errorText = await response.text();
        errorData = { message: `Server error: ${response.status}. Response: ${errorText.substring(0, 100)}...` }; // Truncate long HTML errors
      }
      throw new Error(errorData.message || `Failed to create diary post. Status: ${response.status}`);
    }
    const newPost: DiaryPost = await response.json();
    return { ...newPost, id: newPost._id }; // Map _id to id
  } catch (error) {
    console.error("Error in createDiaryPost:", error);
    throw error; // Re-throw the error to be caught by the component
  }
}

export async function toggleLikeDiaryPost(postId: string, userId: string): Promise<DiaryPost> {
  try {
    const response = await fetch(`${CUSTOM_BACKEND_URL}/api/diary-posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Failed to toggle like. Status: ${response.status}` }));
      throw new Error(errorData.message);
    }
    const updatedPost: DiaryPost = await response.json();
    return { ...updatedPost, id: updatedPost._id }; // Map _id to id
  } catch (error) {
    console.error("Error in toggleLikeDiaryPost:", error);
    throw error;
  }
}

// New function to upload diary image
export async function uploadDiaryImage(imageFile: File): Promise<{ imageUrl: string }> {
  const formData = new FormData();
  formData.append('diaryImage', imageFile); // Ensure this key matches what backend expects

  try {
    const response = await fetch(`${CUSTOM_BACKEND_URL}/api/diary-posts/upload-image`, {
      method: 'POST',
      body: formData,
      // No 'Content-Type' header for FormData, browser sets it with boundary
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Failed to upload image. Status: ${response.status}` }));
      throw new Error(errorData.message || `Image upload failed: ${response.statusText}`);
    }
    const result = await response.json();
    if (!result.success || !result.imageUrl) {
      throw new Error(result.message || 'Image upload succeeded but no URL was returned.');
    }
    return { imageUrl: result.imageUrl };
  } catch (error) {
    console.error("Error in uploadDiaryImage service:", error);
    throw error; // Re-throw to be caught by the component
  }
}
