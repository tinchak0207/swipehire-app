
"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Mail, Linkedin, Twitter, Share2, X as CloseIcon } from "lucide-react";
import { cn } from '@/lib/utils';

interface ShareModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  itemName: string;
  itemType: string; // e.g., "profile", "job opportunity"
  shareUrl: string;
}

export function ShareModal({
  isOpen,
  onOpenChange,
  title,
  itemName,
  itemType,
  shareUrl,
}: ShareModalProps) {
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Ensures window.location.origin is available client-side
  }, []);

  const effectiveShareUrl = isClient ? window.location.origin : shareUrl;

  const shareText = `Check out this ${itemType}: ${itemName} on SwipeHire!`;
  const emailSubject = `Interesting ${itemType} on SwipeHire: ${itemName}`;
  const emailBody = `${shareText}\n\nExplore more at: ${effectiveShareUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(effectiveShareUrl);
      toast({ title: "Link Copied!", description: "The link has been copied to your clipboard." });
    } catch (err) {
      toast({ title: "Copy Failed", description: "Could not copy the link to your clipboard.", variant: "destructive" });
    }
  };

  const handleShareAction = (platform: 'email' | 'linkedin' | 'twitter') => {
    switch (platform) {
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(effectiveShareUrl)}&title=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(effectiveShareUrl)}`, '_blank', 'noopener,noreferrer');
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 bg-card text-card-foreground">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-semibold flex items-center text-primary">
            <Share2 className="mr-3 h-6 w-6" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground pt-1">
            Share the {itemType} for "{itemName}" with your network.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label htmlFor="share-link-input" className="text-sm font-medium text-foreground">
              Shareable Link
            </label>
            <div className="flex items-center space-x-2">
              <Input
                id="share-link-input"
                type="text"
                value={effectiveShareUrl}
                readOnly
                className="bg-muted border-border focus-visible:ring-primary"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                aria-label="Copy link"
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Share directly via:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={() => handleShareAction('email')}
                className="w-full justify-start py-3 text-base border-input hover:bg-accent hover:text-accent-foreground"
              >
                <Mail className="mr-2 h-5 w-5 text-red-500" /> Email
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShareAction('linkedin')}
                className="w-full justify-start py-3 text-base border-input hover:bg-accent hover:text-accent-foreground"
              >
                <Linkedin className="mr-2 h-5 w-5 text-blue-700" /> LinkedIn
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShareAction('twitter')}
                className="w-full justify-start py-3 text-base border-input hover:bg-accent hover:text-accent-foreground"
              >
                <Twitter className="mr-2 h-5 w-5 text-blue-400" /> X / Twitter
              </Button>
            </div>
          </div>
        </div>
        {/* DialogClose is implicitly handled by the 'X' in DialogContent or by onOpenChange(false) */}
      </DialogContent>
    </Dialog>
  );
}
