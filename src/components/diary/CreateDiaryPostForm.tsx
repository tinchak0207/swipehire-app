
"use client";

import React, { useState } from 'react';
import type { DiaryPost } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface CreateDiaryPostFormProps {
  onPostCreated: (newPostData: Omit<DiaryPost, '_id' | 'createdAt' | 'updatedAt' | 'likes' | 'likedBy'>) => void;
  currentUserName: string | null;
  currentUserMongoId: string | null;
  currentUserAvatarUrl: string | null;
}

export function CreateDiaryPostForm({ onPostCreated, currentUserName, currentUserMongoId, currentUserAvatarUrl }: CreateDiaryPostFormProps) {
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
      isFeatured: Math.random() < 0.1, // Assign randomly for mock purposes
    };
    onPostCreated(newPostData);
    // Clear form fields
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

    