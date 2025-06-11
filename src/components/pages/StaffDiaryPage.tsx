
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { DiaryPost } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Added Select
import { BookOpenText, PlusCircle, Edit3, Search, Lock, Star, BadgeInfo, Loader2, SortAsc, Heart, MessageSquare } from 'lucide-react'; // Added SortAsc, Heart, MessageSquare
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { fetchDiaryPosts, createDiaryPost, toggleLikeDiaryPost, addCommentToDiaryPost } from '@/services/diaryService';
import { DiaryPostCard } from '@/components/diary/DiaryPostCard';
import { CreateDiaryPostForm } from '@/components/diary/CreateDiaryPostForm';
import { CardSkeleton } from '@/components/common/CardSkeleton'; // Added CardSkeleton

interface StaffDiaryPageProps {
  isGuestMode?: boolean;
  currentUserName: string | null;
  currentUserMongoId: string | null;
  currentUserAvatarUrl: string | null;
}

type SortOrder = 'newest' | 'mostLiked' | 'mostCommented';

export function StaffDiaryPage({ isGuestMode, currentUserName, currentUserMongoId, currentUserAvatarUrl }: StaffDiaryPageProps) {
  const [allPosts, setAllPosts] = useState<DiaryPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest'); // Added sortOrder state
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const { toast } = useToast();

  const loadPosts = useCallback(async () => {
    setIsLoadingPosts(true);
    try {
      const fetchedPosts = await fetchDiaryPosts();
      setAllPosts(fetchedPosts); // Sorting will be handled by useMemo
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

  const handlePostCreated = async (newPostData: Omit<DiaryPost, '_id' | 'createdAt' | 'updatedAt' | 'likes' | 'likedBy' | 'comments'>) => {
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
        prevPosts.map(p => (p._id === postId ? { ...p, ...updatedPost } : p)) // Ensure to merge fields correctly
      );
    } catch (error) {
      console.error("Failed to like post:", error);
      toast({ title: "Error Liking Post", description: "Could not update like status.", variant: "destructive" });
    }
  }, [isGuestMode, currentUserMongoId, toast]);

  const handleCommentAdded = useCallback((postId: string, updatedPostWithNewComment: DiaryPost) => {
    setAllPosts(prevPosts =>
      prevPosts.map(p => (p._id === postId ? { ...p, ...updatedPostWithNewComment } : p))
    );
  }, []);


  const postsToDisplay = useMemo(() => {
    let filtered = allPosts;
    if (searchTerm.trim()) {
      filtered = allPosts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    switch (sortOrder) {
      case 'mostLiked':
        return [...filtered].sort((a, b) => (b.likes || 0) - (a.likes || 0));
      case 'mostCommented':
        return [...filtered].sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0));
      case 'newest':
      default:
        return [...filtered].sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
    }
  }, [allPosts, searchTerm, sortOrder]);

  const featuredPosts = useMemo(() => {
    return postsToDisplay.filter(post => post.isFeatured === true);
  }, [postsToDisplay]);

  const regularPostsToDisplay = useMemo(() => {
    return postsToDisplay.filter(post => !post.isFeatured);
  }, [postsToDisplay]);


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

      <div className="flex flex-col sm:flex-row gap-2 items-center">
        <div className="relative flex-grow w-full sm:w-auto">
          <Input
            type="text"
            placeholder="Search diary posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
        <Select value={sortOrder} onValueChange={(value: SortOrder) => setSortOrder(value)}>
          <SelectTrigger className="w-full sm:w-[180px] h-10">
             <SortAsc className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="mostLiked"><Heart className="mr-2 h-4 w-4 text-red-500 inline-block"/>Most Liked</SelectItem>
            <SelectItem value="mostCommented"><MessageSquare className="mr-2 h-4 w-4 text-blue-500 inline-block"/>Most Commented</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoadingPosts ? (
        <div className="space-y-6">
          <CardSkeleton count={3} showHeader={true} linesInContent={4} showFooter={true} />
        </div>
      ) : (
        <>
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
                    onCommentAdded={handleCommentAdded}
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

            {postsToDisplay.length === 0 ? (
              <div className="text-center py-10 col-span-full">
                <BadgeInfo className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">
                  {searchTerm ? "No diary posts match your search." : (isGuestMode ? "Sign in to view and create diary posts." : "No diary posts yet. Be the first to share!")}
                </p>
              </div>
            ) : regularPostsToDisplay.length === 0 && featuredPosts.length > 0 ? (
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
                    onCommentAdded={handleCommentAdded}
                    isLikedByCurrentUser={currentUserMongoId ? !!post.likedBy?.includes(currentUserMongoId) : false}
                    isGuestMode={isGuestMode}
                    currentUserId={currentUserMongoId}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
