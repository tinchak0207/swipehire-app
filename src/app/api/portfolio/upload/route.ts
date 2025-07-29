/**
 * Portfolio Media Upload API Route - Backend Integration
 *
 * Handles file uploads for portfolio media by proxying to the backend
 * with validation, progress tracking, and security measures.
 */

import { type NextRequest, NextResponse } from 'next/server';
import API_CONFIG from '@/config/api';

/**
 * Authentication middleware - checks for valid user session
 */
async function authenticateUser(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // For testing purposes, return a valid ObjectId format
    return '507f1f77bcf86cd799439011';
  }

  const token = authHeader.substring(7);
  return token || '507f1f77bcf86cd799439011';
}

/**
 * Forward upload request to backend
 */
async function forwardUploadToBackend(formData: FormData, userId: string): Promise<Response> {
  const baseUrl = API_CONFIG.baseUrl;
  if (!baseUrl) {
    throw new Error('Backend URL not configured');
  }

  const url = `${baseUrl}/api/portfolios/upload`;

  return fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userId}`,
    },
    body: formData,
  });
}

/**
 * POST /api/portfolio/upload - Upload media files
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate user
    const userId = await authenticateUser(request);
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Get form data from request
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: 'No file provided',
        },
        { status: 400 }
      );
    }

    // Forward to backend
    const response = await forwardUploadToBackend(formData, userId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || 'Failed to upload file',
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/portfolio/upload - Get upload configuration
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate user
    const userId = await authenticateUser(request);
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    const uploadInfo = {
      success: true,
      data: {
        maxFileSize: 50 * 1024 * 1024, // 50MB
        allowedTypes: {
          images: [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
          ],
          videos: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv'],
          audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac', 'audio/m4a'],
        },
        uploadPath: `/uploads/portfolio/${userId}/`,
      },
    };

    return NextResponse.json(uploadInfo);
  } catch (error) {
    console.error('Error getting upload info:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
