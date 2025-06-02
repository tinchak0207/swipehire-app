
"use client";

import React, { useState, useMemo } from 'react';
import type { DiaryPost } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, ThumbsUp, Eye, Star, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Helper to check if a URL's hostname is likely configured for next/image
const CONFIGURED_IMAGE_HOSTNAMES = [
  'placehold.co',
  'lh3.googleusercontent.com',
  'storage.googleapis.com',
  'upload.wikimedia.org',
];

const isUrlProcessableByNextImage = (imageUrl?: string): boolean => {
  if (!imageUrl) return false;
  try {
    const url = new URL(imageUrl);
    // Check against configured hostnames
    return CONFIGURED_IMAGE_HOSTNAMES.includes(url.hostname);
  } catch (e) {
    // If it's a relative path like /uploads/diary/..., it's not a full URL.
    // This function expects a full URL to check its hostname.
    // The calling code will now pass the final, absolute URL.
    return false;
  }
};

interface DiaryPostCardProps {
  post: DiaryPost;
  onLikePost: (postId: string) => void;
  isLikedByCurrentUser: boolean;
  isGuestMode?: boolean;
  currentUserId?: string | null;
}

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';

export function DiaryPostCard({ post, onLikePost, isLikedByCurrentUser, isGuestMode, currentUserId }: DiaryPostCardProps) {
  const [showFullContent, setShowFullContent] = useState(false);
  const MAX_CONTENT_LENGTH = 150;
  const { toast } = useToast();

  const toggleContent = () => {
    if (isGuestMode) {
      toast({ title: "Feature Locked", description: "Please sign in to read full posts.", variant: "default" });
      return;
    }
    setShowFullContent(!showFullContent);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGuestMode || !currentUserId) {
      toast({ title: "Feature Locked", description: "Please sign in to like posts.", variant: "default" });
      return;
    }
    onLikePost(post._id!);
  };

  const displayContent = useMemo(() => {
    if (post.content.length <= MAX_CONTENT_LENGTH || showFullContent) {
      return post.content;
    }
    return `${post.content.substring(0, MAX_CONTENT_LENGTH)}...`;
  }, [post.content, showFullContent]);

  let finalImageUrl = post.imageUrl;
  if (post.imageUrl && post.imageUrl.startsWith('/uploads/')) {
    finalImageUrl = `${CUSTOM_BACKEND_URL}${post.imageUrl}`;
  }

  const imageHint = post.diaryImageHint || post.tags?.[0] || 'diary image';
  const useNextImage = isUrlProcessableByNextImage(finalImageUrl);
  
  // Determine if the image is from the backend to potentially set unoptimized=true for next/image
  // This is useful if the backend URL is localhost or a dynamic dev URL.
  // next.config.ts should have the patterns, but unoptimized is safer for dev.
  const isBackendImage = finalImageUrl && (finalImageUrl.startsWith('http://localhost') || finalImageUrl.includes('cloudworkstations.dev'));


  return (
    <Card className="w-full shadow-lg overflow-hidden">
      <CardHeader className="flex flex-row items-start space-x-3 p-4 bg-muted/30">
        <Avatar className="mt-1">
          <AvatarImage src={post.authorAvatarUrl || `https://placehold.co/100x100.png`} alt={post.authorName} data-ai-hint={post.dataAiHint || 'person initial'}/>
          <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-md font-semibold text-primary">{post.authorName}</CardTitle>
          <p className="text-xs text-muted-foreground">
            Posted {formatDistanceToNow(new Date(post.createdAt || Date.now()), { addSuffix: true })}
          </p>
        </div>
        {post.isFeatured && (
          <Badge variant="outline" className="ml-auto text-xs px-2 py-1 border-yellow-500 bg-yellow-400/20 text-yellow-700 font-semibold shrink-0">
            <Star className="h-3.5 w-3.5 mr-1 fill-yellow-500 text-yellow-600" />
            Featured
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <h3 className="text-lg font-semibold">{post.title}</h3>
        {finalImageUrl && (
          <div className="relative aspect-video w-full rounded-md overflow-hidden my-2">
            {useNextImage ? (
              <Image 
                src={finalImageUrl} 
                alt={post.title} 
                fill 
                style={{ objectFit: 'cover' }} 
                data-ai-hint={imageHint} 
                priority={post.isFeatured} 
                unoptimized={isBackendImage} // Consider unoptimized for local/dev backend URLs
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={finalImageUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} data-ai-hint={imageHint} />
            )}
          </div>
        )}
        <p className="text-sm text-foreground whitespace-pre-line">
          {displayContent}
          {post.content.length > MAX_CONTENT_LENGTH && (
            <Button variant="link" size="sm" onClick={toggleContent} className="p-0 h-auto ml-1 text-primary">
              {showFullContent ? "Read Less" : "Read More"}
            </Button>
          )}
        </p>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">#{tag}</span>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 bg-muted/30 border-t flex justify-start items-center space-x-4 text-xs text-muted-foreground">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLikeClick}
          disabled={isGuestMode || !currentUserId}
          className={cn(
            "flex items-center p-1 h-auto hover:bg-accent/50", 
            isLikedByCurrentUser && !isGuestMode && "text-primary",
            (isGuestMode || !currentUserId) && "cursor-not-allowed opacity-70"
          )}
          aria-label={`Like post titled ${post.title}`}
        >
          {(isGuestMode || !currentUserId) ? <Lock className="h-3.5 w-3.5 mr-1" /> : <ThumbsUp className={cn("h-3.5 w-3.5 mr-1", isLikedByCurrentUser && !isGuestMode && "fill-primary")} />}
           {post.likes || 0}
        </Button>
        <div className="flex items-center">
          <MessageSquare className="h-3.5 w-3.5 mr-1" /> {post.commentsCount || 0} Comments
        </div>
        <div className="flex items-center">
          <Eye className="h-3.5 w-3.5 mr-1" /> {post.views || 0} Views
        </div>
      </CardFooter>
    </Card>
  );
}

    
