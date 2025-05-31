
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
      const errorData = await response.json().catch(() => ({ message: `Failed to create diary post. Status: ${response.status}` }));
      throw new Error(errorData.message);
    }
    const newPost: DiaryPost = await response.json();
    return { ...newPost, id: newPost._id }; // Map _id to id
  } catch (error) {
    console.error("Error in createDiaryPost:", error);
    throw error;
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
