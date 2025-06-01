
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { DiaryPost } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image'; // Keep next/image import
import { formatDistanceToNow } from 'date-fns';
import { BookOpenText, PlusCircle, MessageSquare, ThumbsUp, Eye, Edit3, Search, Lock, Star, BadgeInfo, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { fetchDiaryPosts, createDiaryPost, toggleLikeDiaryPost } from '@/services/diaryService';

// Helper to check if a URL's hostname is likely configured for next/image
// This list should ideally be kept in sync with next.config.js remotePatterns
const CONFIGURED_IMAGE_HOSTNAMES = [
  'placehold.co',
  'lh3.googleusercontent.com',
  'storage.googleapis.com', // Note: next.config might have path constraints for this
  'upload.wikimedia.org',
  // Add other frequently used and configured hostnames here
];

const isUrlProcessableByNextImage = (imageUrl?: string): boolean => {
  if (!imageUrl) return false;
  try {
    const url = new URL(imageUrl);
    // Simple check: is the hostname in our known list?
    // A more robust check might involve regex if patterns are used in next.config.js
    return CONFIGURED_IMAGE_HOSTNAMES.includes(url.hostname);
  } catch (e) {
    // Invalid URL
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

function DiaryPostCard({ post, onLikePost, isLikedByCurrentUser, isGuestMode, currentUserId }: DiaryPostCardProps) {
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

  const imageHint = post.diaryImageHint || post.tags?.[0] || 'diary image';
  const useNextImage = isUrlProcessableByNextImage(post.imageUrl);

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
        {post.imageUrl && (
          <div className="relative aspect-video w-full rounded-md overflow-hidden my-2">
            {useNextImage ? (
              <Image src={post.imageUrl} alt={post.title} fill style={{ objectFit: 'cover' }} data-ai-hint={imageHint} priority={post.isFeatured} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.imageUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} data-ai-hint={imageHint} />
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

interface CreateDiaryPostFormProps {
  onPostCreated: (newPostData: Omit<DiaryPost, '_id' | 'createdAt' | 'updatedAt' | 'likes' | 'likedBy'>) => void;
  currentUserName: string | null;
  currentUserMongoId: string | null;
  currentUserAvatarUrl: string | null;
}

function CreateDiaryPostForm({ onPostCreated, currentUserName, currentUserMongoId, currentUserAvatarUrl }: CreateDiaryPostFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [diaryImageHint, setDiaryImageHint] = useState('');
  const [tags, setTags] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserMongoId || !currentUserName) {
      toast({ title: "Authentication Error", description: "User information is missing. Please re-login.", variant: "destructive" });
      return;
    }
    if (!title.trim() || !content.trim()) {
      toast({ title: "Missing fields", description: "Title and content are required.", variant: "destructive" });
      return;
    }
    const newPostData = {
      title,
      content,
      authorId: currentUserMongoId,
      authorName: currentUserName,
      authorAvatarUrl: currentUserAvatarUrl || undefined,
      imageUrl: imageUrl.trim() || undefined,
      diaryImageHint: diaryImageHint.trim() || undefined,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      isFeatured: Math.random() < 0.1,
    };
    onPostCreated(newPostData);
    // Clear form fields after attempting to create the post
    setTitle('');
    setContent('');
    setImageUrl('');
    setDiaryImageHint('');
    setTags('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="postTitle" className="block text-sm font-medium text-foreground">Title</label>
        <Input id="postTitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Awesome Day" required />
      </div>
      <div>
        <label htmlFor="postContent" className="block text-sm font-medium text-foreground">Content</label>
        <Textarea id="postContent" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Today was an interesting day because..." required rows={5} />
      </div>
      <div>
        <label htmlFor="postImageUrl" className="block text-sm font-medium text-foreground">Image URL (Optional)</label>
        <Input id="postImageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.png" />
      </div>
      <div>
        <label htmlFor="postImageHint" className="block text-sm font-medium text-foreground">Image Keywords (Optional, for AI)</label>
        <Input id="postImageHint" value={diaryImageHint} onChange={(e) => setDiaryImageHint(e.target.value)} placeholder="e.g., 'team meeting', 'laptop screen'" />
      </div>
       <div>
        <label htmlFor="postTags" className="block text-sm font-medium text-foreground">Tags (comma-separated, optional)</label>
        <Input id="postTags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="work, learning, team" />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit">Post Entry</Button>
      </DialogFooter>
    </form>
  );
}

interface StaffDiaryPageProps {
  isGuestMode?: boolean;
  currentUserName: string | null;
  currentUserMongoId: string | null;
  currentUserAvatarUrl: string | null;
}

export function StaffDiaryPage({ isGuestMode, currentUserName, currentUserMongoId, currentUserAvatarUrl }: StaffDiaryPageProps) {
  const [allPosts, setAllPosts] = useState<DiaryPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const { toast } = useToast();

  const loadPosts = useCallback(async () => {
    setIsLoadingPosts(true);
    try {
      const fetchedPosts = await fetchDiaryPosts();
      setAllPosts(fetchedPosts.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()));
    } catch (error) {
      console.error("Failed to load diary posts:", error);
      toast({ title: "Error Loading Diary", description: "Could not fetch diary entries.", variant: "destructive" });
    } finally {
      setIsLoadingPosts(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!isGuestMode) {
      loadPosts();
    } else {
      setAllPosts([]); 
      setIsLoadingPosts(false);
    }
  }, [isGuestMode, loadPosts]);

  const handlePostCreated = async (newPostData: Omit<DiaryPost, '_id' | 'createdAt' | 'updatedAt' | 'likes' | 'likedBy'>) => {
    try {
      await createDiaryPost(newPostData);
      toast({ title: "Diary Post Created!", description: "Your new entry has been added." });
      setIsCreatePostOpen(false);
      loadPosts(); 
    } catch (error) {
      console.error("Failed to create post:", error);
      toast({ title: "Error Creating Post", description: "Could not save your diary entry.", variant: "destructive" });
    }
  };
  
  const handleLikePost = useCallback(async (postId: string) => {
    if (isGuestMode || !currentUserMongoId) {
      toast({ title: "Feature Locked", description: "Please sign in to like posts.", variant: "default" });
      return;
    }
    try {
      const updatedPost = await toggleLikeDiaryPost(postId, currentUserMongoId);
      setAllPosts(prevPosts => 
        prevPosts.map(p => (p._id === postId ? updatedPost : p))
                 .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      );
    } catch (error) {
      console.error("Failed to like post:", error);
      toast({ title: "Error Liking Post", description: "Could not update like status.", variant: "destructive" });
    }
  }, [isGuestMode, currentUserMongoId, toast]);
  
  const postsMatchingSearch = useMemo(() => {
    if (!searchTerm.trim()) {
      return allPosts;
    }
    return allPosts.filter(post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [allPosts, searchTerm]);

  const featuredPosts = useMemo(() => {
    return postsMatchingSearch.filter(post => post.isFeatured === true);
  }, [postsMatchingSearch]);

  const regularPostsToDisplay = useMemo(() => {
    return postsMatchingSearch.filter(post => !post.isFeatured);
  }, [postsMatchingSearch]);


  const handleCreatePostClick = () => {
    if (isGuestMode || !currentUserMongoId) {
        toast({
            title: "Feature Locked",
            description: "Please sign in to create diary posts.",
            variant: "default"
        });
        return;
    }
    setIsCreatePostOpen(true);
  }

  if (isGuestMode && !isLoadingPosts && !allPosts.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6 bg-background">
        <Lock className="h-16 w-16 text-red-400 mb-6" />
        <h2 className="text-2xl font-semibold text-red-500 mb-3">Access Restricted</h2>
        <p className="text-muted-foreground max-w-md">
          Creating and viewing staff diary entries is a feature for registered users. Please sign in using the Login button in the header to participate.
        </p>
      </div>
    );
  }
  
  if (isLoadingPosts) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center">
            <BookOpenText className="mr-3 h-8 w-8 text-primary" />
            Staff Diary
          </h1>
          <p className="text-muted-foreground mt-1">Share your work experiences, learnings, and stories.</p>
        </div>
        <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
          <DialogTrigger asChild>
            <Button size="lg" onClick={handleCreatePostClick} aria-disabled={isGuestMode || !currentUserMongoId}>
              {(isGuestMode || !currentUserMongoId) ? <Lock className="mr-2 h-5 w-5" /> : <PlusCircle className="mr-2 h-5 w-5" />}
              Create New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Edit3 className="mr-2 h-5 w-5" />
                Create New Diary Entry
              </DialogTitle>
            </DialogHeader>
            <CreateDiaryPostForm 
              onPostCreated={handlePostCreated} 
              currentUserName={currentUserName}
              currentUserMongoId={currentUserMongoId}
              currentUserAvatarUrl={currentUserAvatarUrl}
            />
          </DialogContent>
        </Dialog>
      </header>

      <div className="relative">
        <Input 
          type="text"
          placeholder="Search diary posts by title, content, author, or tag..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      </div>

      {featuredPosts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-primary flex items-center">
            <Star className="mr-2 h-6 w-6 text-yellow-500 fill-yellow-400" />
            Featured Insights
          </h2>
          <div className="space-y-6">
            {featuredPosts.map(post => (
              <DiaryPostCard 
                key={post._id} 
                post={post} 
                onLikePost={handleLikePost}
                isLikedByCurrentUser={currentUserMongoId ? !!post.likedBy?.includes(currentUserMongoId) : false}
                isGuestMode={isGuestMode} 
                currentUserId={currentUserMongoId}
              />
            ))}
          </div>
          <Separator className="my-8" />
        </section>
      )}
      
      <section className="space-y-4">
        {featuredPosts.length > 0 && regularPostsToDisplay.length > 0 && (
            <h2 className="text-2xl font-semibold text-foreground">
                All Diary Entries
            </h2>
        )}

        {postsMatchingSearch.length === 0 && !isLoadingPosts ? (
          <div className="text-center py-10 col-span-full">
            <BadgeInfo className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">
              {searchTerm ? "No diary posts match your search." : (isGuestMode ? "Sign in to view and create diary posts." : "No diary posts yet. Be the first to share!")}
            </p>
          </div>
        ) : regularPostsToDisplay.length === 0 && featuredPosts.length > 0 && !isLoadingPosts ? (
            <div className="text-center py-10 col-span-full">
                <BadgeInfo className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">
                    {searchTerm ? "No other entries match your search." : "No other entries yet beyond the featured ones."}
                </p>
            </div>
        ) : (
          <div className="space-y-6">
            {regularPostsToDisplay.map(post => (
              <DiaryPostCard 
                key={post._id} 
                post={post} 
                onLikePost={handleLikePost}
                isLikedByCurrentUser={currentUserMongoId ? !!post.likedBy?.includes(currentUserMongoId) : false}
                isGuestMode={isGuestMode}
                currentUserId={currentUserMongoId}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

