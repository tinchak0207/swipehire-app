
"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
import { BookOpenText, PlusCircle, MessageSquare, ThumbsUp, Eye, Edit3, Search, Lock } from 'lucide-react'; // Added Lock
import { useToast } from '@/hooks/use-toast';

const DIARY_POSTS_STORAGE_KEY = 'swipeHireDiaryPosts';

function DiaryPostCard({ post, isGuestMode }: { post: DiaryPost, isGuestMode?: boolean }) {
  const [showFullContent, setShowFullContent] = useState(false);
  const MAX_CONTENT_LENGTH = 150;

  const toggleContent = () => setShowFullContent(!showFullContent);

  const displayContent = useMemo(() => {
    if (post.content.length <= MAX_CONTENT_LENGTH || showFullContent) {
      return post.content;
    }
    return `${post.content.substring(0, MAX_CONTENT_LENGTH)}...`;
  }, [post.content, showFullContent]);

  return (
    <Card className="w-full shadow-lg overflow-hidden">
      <CardHeader className="flex flex-row items-center space-x-3 p-4 bg-muted/30">
        <Avatar>
          <AvatarImage src={post.authorAvatarUrl || `https://placehold.co/100x100.png?text=${post.authorName.charAt(0)}`} alt={post.authorName} data-ai-hint={post.dataAiHint || 'person initial'}/>
          <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-md font-semibold text-primary">{post.authorName}</CardTitle>
          <p className="text-xs text-muted-foreground">
            Posted {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
          </p>
        </div>
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
            <Button variant="link" size="sm" onClick={toggleContent} className="p-0 h-auto ml-1 text-primary" disabled={isGuestMode}>
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
      <CardFooter className="p-4 bg-muted/30 border-t flex justify-start space-x-4 text-xs text-muted-foreground">
        <div className="flex items-center">
          <ThumbsUp className="h-3.5 w-3.5 mr-1" /> {post.likes || 0} Likes
        </div>
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
      views: 0,
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
        <Input id="postImageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.png" />
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
  const [posts, setPosts] = useState<DiaryPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('Demo User');
  const { toast } = useToast();


  useEffect(() => {
    const storedName = localStorage.getItem('userNameSettings');
    if (storedName) {
      setCurrentUserName(storedName);
    }

    const storedPosts = localStorage.getItem(DIARY_POSTS_STORAGE_KEY);
    const initialPosts = storedPosts ? JSON.parse(storedPosts) : mockDiaryPosts;
    setPosts(initialPosts.sort((a: DiaryPost, b: DiaryPost) => b.timestamp - a.timestamp));
  }, []);

  const handlePostCreated = (newPost: DiaryPost) => {
    setPosts(prevPosts => {
      const updatedPosts = [newPost, ...prevPosts].sort((a, b) => b.timestamp - a.timestamp);
      localStorage.setItem(DIARY_POSTS_STORAGE_KEY, JSON.stringify(updatedPosts));
      return updatedPosts;
    });
    setIsCreatePostOpen(false);
  };
  
  const filteredPosts = useMemo(() => {
    if (!searchTerm.trim()) {
      return posts;
    }
    return posts.filter(post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [posts, searchTerm]);

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

  if (isGuestMode) {
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
            My Staff Diary
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

      <Card className="border-dashed border-primary/50 bg-primary/5">
          <CardHeader>
              <CardTitle className="text-lg text-primary flex items-center">
                  <BookOpenText className="mr-2 h-5 w-5" />
                  AI Content Curation (Conceptual)
              </CardTitle>
          </CardHeader>
          <CardContent>
              <p className="text-sm text-muted-foreground">
                  In a full implementation, this section might feature AI-selected quality posts, sort by engagement (readership, likes), or highlight posts based on specific criteria to ensure authenticity and positivity. For now, all posts are displayed chronologically.
              </p>
          </CardContent>
      </Card>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground text-lg">
            {searchTerm ? "No diary posts match your search." : "No diary posts yet. Be the first to share!"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map(post => (
            <DiaryPostCard key={post.id} post={post} isGuestMode={isGuestMode} />
          ))}
        </div>
      )}
    </div>
  );
}
