
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react'; // Added useCallback
import type { DiaryPost } from '@/lib/types';
import { mockDiaryPosts } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { BookOpenText, PlusCircle, MessageSquare, ThumbsUp, Eye, Edit3, Search, Lock, Star, BadgeInfo } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils'; // Added cn

const DIARY_POSTS_STORAGE_KEY = 'swipeHireDiaryPosts';
const LIKED_DIARY_POSTS_KEY = 'swipeHireLikedDiaryPosts';


interface DiaryPostCardProps {
  post: DiaryPost;
  onLikePost: (postId: string) => void;
  isLikedByCurrentUser: boolean;
  isGuestMode?: boolean;
}

function DiaryPostCard({ post, onLikePost, isLikedByCurrentUser, isGuestMode }: DiaryPostCardProps) {
  const [showFullContent, setShowFullContent] = useState(false);
  const MAX_CONTENT_LENGTH = 150;
  const { toast } = useToast(); // Added toast for guest mode interaction

  const toggleContent = () => {
    if (isGuestMode) {
      toast({ title: "Feature Locked", description: "Please sign in to read full posts.", variant: "default" });
      return;
    }
    setShowFullContent(!showFullContent);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click or other underlying events
    if (isGuestMode) {
      toast({ title: "Feature Locked", description: "Please sign in to like posts.", variant: "default" });
      return;
    }
    onLikePost(post.id);
  };

  const displayContent = useMemo(() => {
    if (post.content.length <= MAX_CONTENT_LENGTH || showFullContent) {
      return post.content;
    }
    return `${post.content.substring(0, MAX_CONTENT_LENGTH)}...`;
  }, [post.content, showFullContent]);

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
            Posted {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
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
            <Image src={post.imageUrl} alt={post.title} fill style={{ objectFit: 'cover' }} data-ai-hint="diary post image" />
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
          disabled={isGuestMode}
          className={cn(
            "flex items-center p-1 h-auto hover:bg-accent/50", 
            isLikedByCurrentUser && !isGuestMode && "text-primary",
            isGuestMode && "cursor-not-allowed opacity-70"
          )}
          aria-label={`Like post titled ${post.title}`}
        >
          {isGuestMode ? <Lock className="h-3.5 w-3.5 mr-1" /> : <ThumbsUp className={cn("h-3.5 w-3.5 mr-1", isLikedByCurrentUser && !isGuestMode && "fill-primary")} />}
           {post.likes || 0}
        </Button>
        <div className="flex items-center">
          <MessageSquare className="h-3.5 w-3.5 mr-1" /> {post.comments || 0} Comments
        </div>
        <div className="flex items-center">
          <Eye className="h-3.5 w-3.5 mr-1" /> {post.views || 0} Views
        </div>
      </CardFooter>
    </Card>
  );
}

function CreateDiaryPostForm({ onPostCreated, currentUserName }: { onPostCreated: (newPost: DiaryPost) => void; currentUserName: string }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({ title: "Missing fields", description: "Title and content are required.", variant: "destructive" });
      return;
    }
    const newPost: DiaryPost = {
      id: `diary-${Date.now()}`,
      authorId: 'currentUser', 
      authorName: currentUserName || 'Demo User', 
      authorAvatarUrl: localStorage.getItem('userAvatarSettings') || undefined, 
      dataAiHint: 'person face',
      title,
      content,
      imageUrl: imageUrl.trim() || undefined,
      timestamp: Date.now(),
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      likes: 0,
      comments: 0,
      views: 0,
      isFeatured: Math.random() < 0.2, 
    };
    onPostCreated(newPost);
    setTitle('');
    setContent('');
    setImageUrl('');
    setTags('');
    toast({ title: "Diary Post Created!", description: "Your new entry has been added." });
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
        <Input id="postImageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://placehold.co/600x400.png" />
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
}

export function StaffDiaryPage({ isGuestMode }: StaffDiaryPageProps) {
  const [allPosts, setAllPosts] = useState<DiaryPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('Demo User');
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();


  useEffect(() => {
    const storedName = localStorage.getItem('userNameSettings');
    if (storedName) {
      setCurrentUserName(storedName);
    }

    const storedPosts = localStorage.getItem(DIARY_POSTS_STORAGE_KEY);
    let initialPosts: DiaryPost[] = storedPosts ? JSON.parse(storedPosts) : mockDiaryPosts;
    
    initialPosts = initialPosts.map(p => ({ 
      ...p, 
      isFeatured: p.isFeatured || Math.random() < 0.15,
      likes: p.likes || 0,
      comments: p.comments || 0,
      views: p.views || 0,
    })); 

    setAllPosts(initialPosts.sort((a, b) => b.timestamp - a.timestamp));

    const storedLikedPosts = localStorage.getItem(LIKED_DIARY_POSTS_KEY);
    if (storedLikedPosts) {
      setLikedPostIds(new Set(JSON.parse(storedLikedPosts)));
    }
  }, []);

  const handlePostCreated = (newPost: DiaryPost) => {
    setAllPosts(prevPosts => {
      const updatedPosts = [newPost, ...prevPosts].sort((a, b) => b.timestamp - a.timestamp);
      localStorage.setItem(DIARY_POSTS_STORAGE_KEY, JSON.stringify(updatedPosts));
      return updatedPosts;
    });
    setIsCreatePostOpen(false);
  };
  
  const handleLikePost = useCallback((postId: string) => {
    if (isGuestMode) {
      toast({ title: "Feature Locked", description: "Please sign in to like posts.", variant: "default" });
      return;
    }

    setAllPosts(prevPosts => {
      const updatedPosts = prevPosts.map(post => {
        if (post.id === postId) {
          const alreadyLiked = likedPostIds.has(postId);
          return { ...post, likes: (post.likes || 0) + (alreadyLiked ? -1 : 1) };
        }
        return post;
      });
      localStorage.setItem(DIARY_POSTS_STORAGE_KEY, JSON.stringify(updatedPosts));
      return updatedPosts;
    });

    setLikedPostIds(prevLikedIds => {
      const newLikedIds = new Set(prevLikedIds);
      if (newLikedIds.has(postId)) {
        newLikedIds.delete(postId);
      } else {
        newLikedIds.add(postId);
      }
      localStorage.setItem(LIKED_DIARY_POSTS_KEY, JSON.stringify(Array.from(newLikedIds)));
      return newLikedIds;
    });
  }, [isGuestMode, toast, likedPostIds]);
  
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
    if (isGuestMode) {
        toast({
            title: "Feature Locked",
            description: "Please sign in to create diary posts.",
            variant: "default"
        });
        return;
    }
    setIsCreatePostOpen(true);
  }

  if (isGuestMode && !allPosts.length) { // Show locked state if guest and no posts loaded (or initial state)
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
            <Button size="lg" onClick={handleCreatePostClick} aria-disabled={isGuestMode}>
              {isGuestMode ? <Lock className="mr-2 h-5 w-5" /> : <PlusCircle className="mr-2 h-5 w-5" />}
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
            <CreateDiaryPostForm onPostCreated={handlePostCreated} currentUserName={currentUserName} />
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

      {/* Featured Posts Section */}
      {featuredPosts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-primary flex items-center">
            <Star className="mr-2 h-6 w-6 text-yellow-500 fill-yellow-400" />
            Featured Insights
          </h2>
          <div className="space-y-6">
            {featuredPosts.map(post => (
              <DiaryPostCard 
                key={post.id} 
                post={post} 
                onLikePost={handleLikePost}
                isLikedByCurrentUser={likedPostIds.has(post.id)}
                isGuestMode={isGuestMode} 
              />
            ))}
          </div>
          <Separator className="my-8" />
        </section>
      )}
      
      {/* Regular Posts Section */}
      <section className="space-y-4">
        {featuredPosts.length > 0 && regularPostsToDisplay.length > 0 && (
            <h2 className="text-2xl font-semibold text-foreground">
                All Diary Entries
            </h2>
        )}

        {postsMatchingSearch.length === 0 ? (
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
                key={post.id} 
                post={post} 
                onLikePost={handleLikePost}
                isLikedByCurrentUser={likedPostIds.has(post.id)}
                isGuestMode={isGuestMode}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
