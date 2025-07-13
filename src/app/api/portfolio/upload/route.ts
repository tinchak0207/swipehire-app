/**
 * Portfolio Media Upload API Route
 *
 * Handles file uploads for portfolio media with validation, progress tracking,
 * and security measures including file type validation and size limits.
 */

import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { Media } from '@/lib/types/portfolio';
import type { Media } from '@/lib/types/portfolio';

// File validation schema
const fileValidationSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z.number().max(50 * 1024 * 1024, 'File size must be less than 50MB'), // 50MB limit
  type: z.string().refine((type) => {
    const allowedTypes = [
      // Images
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      // Videos
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/avi',
      'video/mov',
      'video/wmv',
      // Audio
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/aac',
      'audio/flac',
      'audio/m4a',
    ];
    return allowedTypes.includes(type);
  }, 'Unsupported file type'),
});

// Upload response interface
interface UploadResponse {
  success: boolean;
  data?: {
    media: Media;
    url: string;
  };
  error?: string;
  message?: string;
}

/**
 * Authentication middleware - checks for valid user session
 */
async function authenticateUser(request: NextRequest): Promise<string | null> {
  // TODO: Implement actual authentication logic
  // For now, return a mock user ID
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  // Mock user ID - replace with actual JWT validation
  return 'user-123';
}

/**
 * Generate unique filename to prevent conflicts
 */
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, extension);

  // Sanitize filename
  const sanitizedName = nameWithoutExt
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();

  return `${sanitizedName}-${timestamp}-${randomString}${extension}`;
}

/**
 * Get media type from MIME type
 */
function getMediaType(mimeType: string): 'image' | 'video' | 'audio' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  throw new Error('Unsupported media type');
}

/**
 * Create media object from uploaded file
 */
function createMediaObject(
  file: File,
  url: string,
  additionalData?: { width?: number; height?: number; duration?: number }
): Media {
  const mediaType = getMediaType(file.type);

  const baseMedia = {
    url,
    size: file.size,
  };

  switch (mediaType) {
    case 'image':
      return {
        type: 'image',
        ...baseMedia,
        alt: `Uploaded image: ${file.name}`,
        ...(additionalData?.width !== undefined && { width: additionalData.width }),
        ...(additionalData?.height !== undefined && { height: additionalData.height }),
      };
    case 'video':
      return {
        type: 'video',
        ...baseMedia,
        ...(additionalData?.duration !== undefined && { duration: additionalData.duration }),
      };
    case 'audio':
      return {
        type: 'audio',
        ...baseMedia,
        ...(additionalData?.duration !== undefined && { duration: additionalData.duration }),
      };
    default:
      throw new Error('Unsupported media type');
  }
}

/**
 * Ensure upload directory exists
 */
async function ensureUploadDirectory(uploadPath: string): Promise<void> {
  if (!existsSync(uploadPath)) {
    await mkdir(uploadPath, { recursive: true });
  }
}

/**
 * Validate file security (basic checks)
 */
function validateFileSecurity(file: File): { isValid: boolean; error?: string } {
  // Check for suspicious file extensions in the name
  const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
  const fileName = file.name.toLowerCase();

  for (const ext of suspiciousExtensions) {
    if (fileName.includes(ext)) {
      return { isValid: false, error: 'Potentially dangerous file type detected' };
    }
  }

  // Check for double extensions (e.g., image.jpg.exe)
  const parts = fileName.split('.');
  if (parts.length > 2) {
    const secondLastExt = `.${parts[parts.length - 2]}`;
    if (suspiciousExtensions.includes(secondLastExt)) {
      return { isValid: false, error: 'Suspicious file extension detected' };
    }
  }

  return { isValid: true };
}

/**
 * POST /api/portfolio/upload - Upload media files
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate user
    const userId = await authenticateUser(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Validate file
    const fileValidation = fileValidationSchema.safeParse({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!fileValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'File validation failed',
          details: fileValidation.error.errors,
        },
        { status: 400 }
      );
    }

    // Security validation
    const securityCheck = validateFileSecurity(file);
    if (!securityCheck.isValid) {
      return NextResponse.json({ success: false, error: securityCheck.error }, { status: 400 });
    }

    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(file.name);

    // Define upload path
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'portfolio', userId);
    const filePath = path.join(uploadDir, uniqueFilename);

    // Ensure upload directory exists
    await ensureUploadDirectory(uploadDir);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);

    // Generate public URL
    const publicUrl = `/uploads/portfolio/${userId}/${uniqueFilename}`;

    // Create media object
    // Note: In a real implementation, you might want to extract metadata
    // like image dimensions or video/audio duration using libraries like sharp, ffprobe, etc.
    const media = createMediaObject(file, publicUrl);

    const response: UploadResponse = {
      success: true,
      data: {
        media,
        url: publicUrl,
      },
      message: 'File uploaded successfully',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/portfolio/upload - Get upload status or metadata
 * This endpoint can be used to check upload limits, allowed file types, etc.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate user
    const userId = await authenticateUser(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
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
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
