
// src/services/blogService.ts
import type { BlogPost } from '@/lib/types';

const CUSTOM_BACKEND_URL = process.env['NEXT_PUBLIC_CUSTOM_BACKEND_URL'] || 'http://localhost:5000';

export async function fetchBlogPostsFromBackend(): Promise<{
  posts: BlogPost[];
  hasMore: boolean;
  nextCursor?: string;
}> {
  console.log('[Frontend Service] Calling fetchBlogPostsFromBackend.');
  const targetUrl = `${CUSTOM_BACKEND_URL}/api/blog?timestamp=${Date.now()}`;
  console.log('[Frontend Service] Target Backend URL for GET /api/blog:', targetUrl);

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`[Frontend Service] GET /api/blog - Backend response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: `Failed to fetch blog posts. Status: ${response.status}` }));
      console.error('[Frontend Service] GET /api/blog - Backend error response (JSON):', errorData);
      throw new Error(errorData.message);
    }

    const responseData = await response.json();
    console.log('[Frontend Service] Raw backend response:', responseData);
    let rawPosts: any[] = [];

    if (Array.isArray(responseData)) {
      rawPosts = responseData;
    } else if (responseData && Array.isArray(responseData.posts)) {
      rawPosts = responseData.posts;
    } else {
      console.warn('[Frontend Service] Unexpected blog posts response format, defaulting to empty array');
    }

    const posts: BlogPost[] = rawPosts.map((post: any) => ({
      id: post._id,
      title: post.title,
      content: post.content,
      author: post.author,
      createdAt: post.createdAt,
    }));

    console.log(`[Frontend Service] Transformed ${posts.length} blog posts.`);
    return { posts, hasMore: false };
  } catch (error: any) {
    console.error('[Frontend Service] Error in fetchBlogPostsFromBackend service:', error.message);
    console.error('[Frontend Service] Full error object for fetchBlogPostsFromBackend:', error);
    throw error;
  }
}
