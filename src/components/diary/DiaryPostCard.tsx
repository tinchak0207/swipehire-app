'use client';

import { formatDistanceToNow } from 'date-fns';
import { Edit3, Eye, Lock, MessageSquare, Send, Star, ThumbsUp, Trash2 } from 'lucide-react'; // Added Edit3, Trash2
import Image from 'next/image';
import type React from 'react';
import { useMemo, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // For editing comment
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useToast } from '@/hooks/use-toast';
import type { DiaryComment, DiaryPost } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  addCommentToDiaryPost,
  deleteDiaryComment,
  updateDiaryComment,
} from '@/services/diaryService'; // Added update/delete

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
    return CONFIGURED_IMAGE_HOSTNAMES.includes(url.hostname);
  } catch (_e) {
    return false;
  }
};

interface DiaryPostCardProps {
  post: DiaryPost;
  onLikePost: (postId: string) => void;
  onCommentAdded: (postId: string, updatedPost: DiaryPost) => void;
  onCommentUpdated: (postId: string, updatedPost: DiaryPost) => void; // New prop
  onCommentDeleted: (postId: string, updatedPost: DiaryPost) => void; // New prop
  isLikedByCurrentUser: boolean;
  isGuestMode?: boolean;
  currentUserId?: string | null;
}

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';

export function DiaryPostCard({
  post,
  onLikePost,
  onCommentAdded,
  onCommentUpdated,
  onCommentDeleted, // New props
  isLikedByCurrentUser,
  isGuestMode,
  currentUserId,
}: DiaryPostCardProps) {
  const [showFullContent, setShowFullContent] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingComment, setEditingComment] = useState<{ id: string; text: string } | null>(null);
  const MAX_CONTENT_LENGTH = 150;
  const { toast } = useToast();
  const { fullBackendUser } = useUserPreferences();

  const toggleContent = () => {
    if (isGuestMode) {
      toast({
        title: 'Feature Locked',
        description: 'Please sign in to read full posts.',
        variant: 'default',
      });
      return;
    }
    setShowFullContent(!showFullContent);
  };

  const toggleComments = () => {
    if (isGuestMode) {
      toast({
        title: 'Feature Locked',
        description: 'Please sign in to view and add comments.',
        variant: 'default',
      });
      return;
    }
    setShowComments(!showComments);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGuestMode || !currentUserId) {
      toast({
        title: 'Feature Locked',
        description: 'Please sign in to like posts.',
        variant: 'default',
      });
      return;
    }
    onLikePost(post._id!);
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuestMode || !currentUserId || !fullBackendUser?.name || !post._id) {
      toast({
        title: 'Action Required',
        description: 'Please sign in to comment.',
        variant: 'default',
      });
      return;
    }
    if (!newCommentText.trim()) {
      toast({
        title: 'Empty Comment',
        description: 'Please write something.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmittingComment(true);
    try {
      const commentPayload = {
        userId: currentUserId,
        userName: fullBackendUser.name,
        userAvatarUrl: fullBackendUser.profileAvatarUrl,
        text: newCommentText.trim(),
      };
      const updatedPost = await addCommentToDiaryPost(post._id, commentPayload);
      onCommentAdded(post._id, updatedPost);
      setNewCommentText('');
      setShowComments(true);
      toast({ title: 'Comment Posted!', description: 'Your comment has been added.' });
    } catch (error: any) {
      toast({
        title: 'Error Posting Comment',
        description: error.message || 'Could not post comment.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleEditComment = (comment: DiaryComment) => {
    setEditingComment({ id: comment._id, text: comment.text });
  };

  const handleSaveEditedComment = async () => {
    if (!editingComment || !currentUserId || !post._id) return;
    setIsSubmittingComment(true);
    try {
      const updatedPost = await updateDiaryComment(
        post._id,
        editingComment.id,
        currentUserId,
        editingComment.text
      );
      onCommentUpdated(post._id, updatedPost);
      setEditingComment(null);
      toast({ title: 'Comment Updated!' });
    } catch (error: any) {
      toast({
        title: 'Error Updating Comment',
        description: error.message || 'Could not update comment.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!currentUserId || !post._id) return;
    try {
      const updatedPost = await deleteDiaryComment(post._id, commentId, currentUserId);
      onCommentDeleted(post._id, updatedPost);
      toast({ title: 'Comment Deleted!' });
    } catch (error: any) {
      toast({
        title: 'Error Deleting Comment',
        description: error.message || 'Could not delete comment.',
        variant: 'destructive',
      });
    }
  };

  const displayContent = useMemo(() => {
    if (post.content.length <= MAX_CONTENT_LENGTH || showFullContent) {
      return post.content;
    }
    return `${post.content.substring(0, MAX_CONTENT_LENGTH)}...`;
  }, [post.content, showFullContent]);

  let finalImageUrl = post.imageUrl;
  if (post.imageUrl?.startsWith('/uploads/')) {
    finalImageUrl = `${CUSTOM_BACKEND_URL}${post.imageUrl}`;
  }

  const imageHint = post.diaryImageHint || post.tags?.[0] || 'diary image';
  const useNextImage = isUrlProcessableByNextImage(finalImageUrl);
  const isBackendImage =
    finalImageUrl &&
    (finalImageUrl.startsWith('http://localhost') ||
      finalImageUrl.includes('cloudworkstations.dev'));

  return (
    <Card className="w-full overflow-hidden shadow-lg">
      <CardHeader className="flex flex-row items-start space-x-3 bg-muted/30 p-4">
        <Avatar className="mt-1">
          <AvatarImage
            src={post.authorAvatarUrl || 'https://placehold.co/40x40.png'}
            alt={post.authorName}
            data-ai-hint={post.dataAiHint || 'person initial'}
          />
          <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="font-semibold text-md text-primary">{post.authorName}</CardTitle>
          <p className="text-muted-foreground text-xs">
            Posted{' '}
            {formatDistanceToNow(new Date(post.createdAt || Date.now()), { addSuffix: true })}
          </p>
        </div>
        {post.isFeatured && (
          <Badge
            variant="outline"
            className="ml-auto shrink-0 border-yellow-500 bg-yellow-400/20 px-2 py-1 font-semibold text-xs text-yellow-700"
          >
            <Star className="mr-1 h-3.5 w-3.5 fill-yellow-500 text-yellow-600" />
            Featured
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        <h3 className="font-semibold text-lg">{post.title}</h3>
        {finalImageUrl && (
          <div className="relative my-2 aspect-video w-full overflow-hidden rounded-md">
            {useNextImage ? (
              <Image
                src={finalImageUrl}
                alt={post.title}
                fill
                style={{ objectFit: 'cover' }}
                data-ai-hint={imageHint}
                priority={post.isFeatured}
                unoptimized={isBackendImage}
              />
            ) : (
              <img
                src={finalImageUrl}
                alt={post.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                data-ai-hint={imageHint}
              />
            )}
          </div>
        )}
        <p className="whitespace-pre-line text-foreground text-sm">
          {displayContent}
          {post.content.length > MAX_CONTENT_LENGTH && (
            <Button
              variant="link"
              size="sm"
              onClick={toggleContent}
              className="ml-1 h-auto p-0 text-primary"
            >
              {showFullContent ? 'Read Less' : 'Read More'}
            </Button>
          )}
        </p>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-start space-x-4 border-t bg-muted/30 p-4 text-muted-foreground text-xs">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLikeClick}
          disabled={isGuestMode || !currentUserId}
          className={cn(
            'flex h-auto items-center p-1 hover:bg-accent/50',
            isLikedByCurrentUser && !isGuestMode && 'text-primary',
            (isGuestMode || !currentUserId) && 'cursor-not-allowed opacity-70'
          )}
          aria-label={`Like post titled ${post.title}`}
        >
          {isGuestMode || !currentUserId ? (
            <Lock className="mr-1 h-3.5 w-3.5" />
          ) : (
            <ThumbsUp
              className={cn(
                'mr-1 h-3.5 w-3.5',
                isLikedByCurrentUser && !isGuestMode && 'fill-primary'
              )}
            />
          )}
          {post.likes || 0}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleComments}
          disabled={isGuestMode}
          className={cn(
            'flex h-auto items-center p-1 hover:bg-accent/50',
            isGuestMode && 'cursor-not-allowed opacity-70'
          )}
        >
          {isGuestMode ? (
            <Lock className="mr-1 h-3.5 w-3.5" />
          ) : (
            <MessageSquare className="mr-1 h-3.5 w-3.5" />
          )}
          {post.commentsCount || 0} Comments
        </Button>
        <div className="flex items-center">
          <Eye className="mr-1 h-3.5 w-3.5" /> {post.views || 0} Views
        </div>
      </CardFooter>

      {showComments && !isGuestMode && (
        <div className="border-t p-4">
          <h4 className="mb-2 font-semibold text-sm">Comments:</h4>
          {post.comments && post.comments.length > 0 ? (
            <div className="mb-3 max-h-60 space-y-3 overflow-y-auto pr-1">
              {post.comments
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((comment) => (
                  <div key={comment._id} className="flex items-start space-x-2 text-xs">
                    <Avatar className="mt-0.5 h-6 w-6">
                      <AvatarImage
                        src={comment.userAvatarUrl || 'https://placehold.co/40x40.png'}
                        alt={comment.userName}
                        data-ai-hint="commenter avatar"
                      />
                      <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 rounded-md bg-secondary p-2">
                      <div className="flex items-baseline justify-between">
                        <span className="font-semibold text-foreground">{comment.userName}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      {editingComment && editingComment.id === comment._id ? (
                        <div className="mt-1 space-y-1">
                          <Textarea
                            value={editingComment.text}
                            onChange={(e) =>
                              setEditingComment({ ...editingComment, text: e.target.value })
                            }
                            className="h-16 text-xs"
                            disabled={isSubmittingComment}
                          />
                          <div className="flex gap-1">
                            <Button
                              size="xs"
                              onClick={handleSaveEditedComment}
                              disabled={isSubmittingComment || !editingComment.text.trim()}
                            >
                              Save
                            </Button>
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => setEditingComment(null)}
                              disabled={isSubmittingComment}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-foreground/80">{comment.text}</p>
                      )}
                      {currentUserId === comment.userId && !editingComment && (
                        <div className="mt-1 flex gap-1">
                          <Button
                            variant="ghost"
                            size="xs"
                            className="h-auto p-0 text-blue-600 hover:text-blue-700"
                            onClick={() => handleEditComment(comment)}
                          >
                            <Edit3 size={12} className="mr-0.5" /> Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            className="h-auto p-0 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteComment(comment._id)}
                          >
                            <Trash2 size={12} className="mr-0.5" /> Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="mb-2 text-muted-foreground text-xs">No comments yet. Be the first!</p>
          )}
          <form onSubmit={handlePostComment} className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Write a comment..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="h-9 text-sm"
              disabled={isSubmittingComment}
            />
            <Button
              type="submit"
              size="sm"
              className="h-9"
              disabled={isSubmittingComment || !newCommentText.trim()}
            >
              {isSubmittingComment ? (
                <Send className="h-4 w-4 animate-pulse" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      )}
    </Card>
  );
}
