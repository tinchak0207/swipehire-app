'use client';

import { Facebook, Linkedin, Link as LinkIcon, Share2, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface ShareButtonProps {
  url: string;
  title: string;
}

export function ShareButton({ url, title }: ShareButtonProps) {
  const { toast } = useToast();

  const shareOptions = [
    {
      name: 'Twitter',
      icon: <Twitter className="h-4 w-4" />,
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
          '_blank'
        );
      },
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="h-4 w-4" />,
      action: () => {
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          '_blank'
        );
      },
    },
    {
      name: 'Facebook',
      icon: <Facebook className="h-4 w-4" />,
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank'
        );
      },
    },
    {
      name: 'Copy Link',
      icon: <LinkIcon className="h-4 w-4" />,
      action: async () => {
        try {
          await navigator.clipboard.writeText(url);
          toast({
            title: 'Link copied!',
            description: 'The article link has been copied to your clipboard.',
          });
        } catch (_err) {
          toast({
            title: 'Failed to copy',
            description: 'Please try copying the link manually.',
            variant: 'destructive',
          });
        }
      },
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {shareOptions.map((option) => (
          <DropdownMenuItem key={option.name} onClick={option.action}>
            {option.icon}
            <span className="ml-2">{option.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
