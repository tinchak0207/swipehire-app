'use client';

import { Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CustomFileInput } from '@/components/ui/custom-file-input'; // Added import
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { DiaryPost } from '@/lib/types';
import { uploadDiaryImage } from '@/services/diaryService';

interface CreateDiaryPostFormProps {
  onPostCreated: (
    newPostData: Omit<DiaryPost, '_id' | 'createdAt' | 'updatedAt' | 'likes' | 'likedBy'>
  ) => void;
  currentUserName: string | null;
  currentUserMongoId: string | null;
  currentUserAvatarUrl: string | null;
}

export function CreateDiaryPostForm({
  onPostCreated,
  currentUserName,
  currentUserMongoId,
  currentUserAvatarUrl,
}: CreateDiaryPostFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [diaryImageHint, setDiaryImageHint] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleFileSelected = (file: File | null) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: 'File Too Large',
          description: 'Image must be less than 5MB.',
          variant: 'destructive',
        });
        setImageFile(null);
        setImagePreview(null);
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please select an image file.',
          variant: 'destructive',
        });
        setImageFile(null);
        setImagePreview(null);
        return;
      }
      setImageFile(file);
      setImageUrlInput(''); // Clear manual URL if file is chosen
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserMongoId || !currentUserName) {
      toast({
        title: 'Authentication Error',
        description:
          'User information is missing. Please ensure your profile is complete and try again.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }
    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Title and content are required.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    let finalImageUrl: string | undefined = imageUrlInput.trim() || undefined;

    try {
      if (imageFile) {
        const uploadResult = await uploadDiaryImage(imageFile);
        finalImageUrl = uploadResult.imageUrl;
      }

      const newPostData = {
        title,
        content,
        authorId: currentUserMongoId,
        authorName: currentUserName,
        authorAvatarUrl: currentUserAvatarUrl || undefined,
        imageUrl: finalImageUrl,
        diaryImageHint: diaryImageHint.trim() || undefined,
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        isFeatured: Math.random() < 0.1,
      };
      onPostCreated(newPostData);

      setTitle('');
      setContent('');
      setImageUrlInput('');
      setImageFile(null);
      setImagePreview(null);
      setDiaryImageHint('');
      setTags('');
    } catch (error: any) {
      toast({
        title: 'Submission Error',
        description: error.message || 'Could not submit post.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="postTitle" className="block font-medium text-foreground text-sm">
          Title
        </label>
        <Input
          id="postTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My Awesome Day"
          required
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label htmlFor="postContent" className="block font-medium text-foreground text-sm">
          Content
        </label>
        <Textarea
          id="postContent"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Today was an interesting day because..."
          required
          rows={5}
          disabled={isSubmitting}
        />
      </div>

      <CustomFileInput
        id="postImageUpload"
        fieldLabel="Upload Image (Optional, Max 5MB)"
        buttonText="Choose Image"
        buttonIcon={<ImageIcon className="mr-2 h-4 w-4" />}
        selectedFileName={imageFile?.name}
        onFileSelected={handleFileSelected}
        inputProps={{ accept: 'image/*' }}
        disabled={isSubmitting}
      />

      {imagePreview && (
        <div className="mt-2">
          <Image
            src={imagePreview}
            alt="Image preview"
            width={128}
            height={128}
            className="rounded-md border object-cover"
            data-ai-hint="uploaded image preview"
          />
        </div>
      )}

      <div>
        <label htmlFor="postImageUrl" className="block font-medium text-foreground text-sm">
          Or Enter Image URL (Optional)
        </label>
        <Input
          id="postImageUrl"
          value={imageUrlInput}
          onChange={(e) => {
            setImageUrlInput(e.target.value);
            if (e.target.value) {
              setImageFile(null);
              setImagePreview(null);
            }
          }}
          placeholder="https://example.com/image.png"
          disabled={isSubmitting || !!imageFile}
        />
      </div>

      <div>
        <label htmlFor="postImageHint" className="block font-medium text-foreground text-sm">
          Image Keywords (Optional, for AI)
        </label>
        <Input
          id="postImageHint"
          value={diaryImageHint}
          onChange={(e) => setDiaryImageHint(e.target.value)}
          placeholder="e.g., 'team meeting', 'laptop screen'"
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label htmlFor="postTags" className="block font-medium text-foreground text-sm">
          Tags (comma-separated, optional)
        </label>
        <Input
          id="postTags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="work, learning, team"
          disabled={isSubmitting}
        />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isSubmitting ? 'Posting...' : 'Post Entry'}
        </Button>
      </DialogFooter>
    </form>
  );
}
