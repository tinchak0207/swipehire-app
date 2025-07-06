// src/services/diaryService.ts
import type { DiaryPost } from '@/lib/types';

const CUSTOM_BACKEND_URL = process.env['NEXT_PUBLIC_CUSTOM_BACKEND_URL'] || 'http://localhost:5000';

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

export interface AddCommentPayload {
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  text: string;
}

export async function fetchDiaryPosts(): Promise<DiaryPost[]> {
  try {
    const response = await fetch(`${CUSTOM_BACKEND_URL}/api/diary-posts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: `Failed to fetch diary posts. Status: ${response.status}` }));
      throw new Error(errorData.message);
    }
    const posts = await response.json();
    return posts.map((post: any) => ({ ...post, id: post._id.toString() }));
  } catch (error) {
    console.error('Error in fetchDiaryPosts:', error);
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
      const contentType = response.headers.get('content-type');
      let errorData;
      if (contentType?.includes('application/json')) {
        errorData = await response.json();
      } else {
        const errorText = await response.text();
        errorData = {
          message: `Server error: ${response.status}. Response: ${errorText.substring(0, 100)}...`,
        };
      }
      throw new Error(
        errorData.message || `Failed to create diary post. Status: ${response.status}`
      );
    }
    const newPost = await response.json();
    return { ...newPost, id: newPost._id.toString() };
  } catch (error) {
    console.error('Error in createDiaryPost:', error);
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
      const errorData = await response
        .json()
        .catch(() => ({ message: `Failed to toggle like. Status: ${response.status}` }));
      throw new Error(errorData.message);
    }
    const updatedPost = await response.json();
    return { ...updatedPost, id: updatedPost._id.toString() };
  } catch (error) {
    console.error('Error in toggleLikeDiaryPost:', error);
    throw error;
  }
}

export async function uploadDiaryImage(imageFile: File): Promise<{ imageUrl: string }> {
  const formData = new FormData();
  formData.append('diaryImage', imageFile);

  try {
    const response = await fetch(`${CUSTOM_BACKEND_URL}/api/diary-posts/upload-image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: `Failed to upload image. Status: ${response.status}` }));
      throw new Error(errorData.message || `Image upload failed: ${response.statusText}`);
    }
    const result = await response.json();
    if (!result.success || !result.imageUrl) {
      throw new Error(result.message || 'Image upload succeeded but no URL was returned.');
    }
    return { imageUrl: result.imageUrl };
  } catch (error) {
    console.error('Error in uploadDiaryImage service:', error);
    throw error;
  }
}

export async function addCommentToDiaryPost(
  postId: string,
  commentData: AddCommentPayload
): Promise<DiaryPost> {
  try {
    const response = await fetch(`${CUSTOM_BACKEND_URL}/api/diary-posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commentData),
    });
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: `Failed to add comment. Status: ${response.status}` }));
      throw new Error(errorData.message);
    }
    const updatedPost = await response.json();
    return { ...updatedPost, id: updatedPost._id.toString() };
  } catch (error) {
    console.error('Error in addCommentToDiaryPost service:', error);
    throw error;
  }
}

export async function updateDiaryComment(
  postId: string,
  commentId: string,
  userId: string, // User ID of the person making the request
  text: string
): Promise<DiaryPost> {
  try {
    const response = await fetch(
      `${CUSTOM_BACKEND_URL}/api/diary-posts/${postId}/comments/${commentId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, text }),
      }
    );
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: `Failed to update comment. Status: ${response.status}` }));
      throw new Error(errorData.message);
    }
    return response.json();
  } catch (error) {
    console.error('Error updating diary comment:', error);
    throw error;
  }
}

export async function deleteDiaryComment(
  postId: string,
  commentId: string,
  userId: string // User ID of the person making the request
): Promise<DiaryPost> {
  try {
    const response = await fetch(
      `${CUSTOM_BACKEND_URL}/api/diary-posts/${postId}/comments/${commentId}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }), // Send userId in body for DELETE for auth purposes
      }
    );
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: `Failed to delete comment. Status: ${response.status}` }));
      throw new Error(errorData.message);
    }
    return response.json();
  } catch (error) {
    console.error('Error deleting diary comment:', error);
    throw error;
  }
}
