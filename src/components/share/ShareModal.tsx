'use client';

import html2canvas from 'html2canvas';
import { Copy, Download, FileVideo2, Linkedin, Mail, Share2, Twitter } from 'lucide-react';
import QRCodeStylized from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ShareModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  itemName: string;
  itemDescription?: string;
  itemType: string;
  shareUrl?: string;
  qrCodeLogoUrl?: string; // New optional prop for the logo in QR code
}

const BITLY_URL = 'bit.ly/swipehire';

export function ShareModal({
  isOpen,
  onOpenChange,
  title,
  itemName,
  itemDescription,
  itemType,
  shareUrl,
  qrCodeLogoUrl, // Use the new prop
}: ShareModalProps) {
  const { toast } = useToast();
  const [appOrigin, setAppOrigin] = useState('');
  const shareCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAppOrigin(window.location.origin);
    }
  }, []);

  const urlToShareWithUser = shareUrl || appOrigin || 'https://swipehire-app.com';
  const urlToDisplay = BITLY_URL;
  const qrCodeValue = urlToShareWithUser;

  const shareTextGeneric = `Check out this ${itemType} on SwipeHire: ${itemName}${itemDescription ? ` (${itemDescription})` : ''}. Visit ${urlToDisplay} or scan the QR code. Direct link: ${urlToShareWithUser}`;
  const emailSubject = `Interesting ${itemType} on SwipeHire: ${itemName}`;
  const emailBody = `${shareTextGeneric}`;

  const handleCopyLink = async (linkToCopy: string) => {
    try {
      await navigator.clipboard.writeText(linkToCopy);
      toast({
        title: 'Link Copied!',
        description: `${linkToCopy} has been copied to your clipboard.`,
      });
    } catch (_err) {
      toast({
        title: 'Copy Failed',
        description: 'Could not copy the link.',
        variant: 'destructive',
      });
    }
  };

  const handleSocialShare = (platform: 'email' | 'linkedin' | 'twitter') => {
    let socialShareUrl = '';
    switch (platform) {
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        return;
      case 'linkedin':
        socialShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(urlToShareWithUser)}&title=${encodeURIComponent(shareTextGeneric)}`;
        break;
      case 'twitter':
        socialShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTextGeneric)}&url=${encodeURIComponent(urlToShareWithUser)}`;
        break;
    }
    window.open(socialShareUrl, '_blank', 'noopener,noreferrer');
    onOpenChange(false);
  };

  const handleDownloadImage = async () => {
    if (shareCardRef.current) {
      try {
        const canvas = await html2canvas(shareCardRef.current, {
          useCORS: true,
          backgroundColor: '#ffffff',
          scale: 2,
        });
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `swipehire-share-${itemType.replace(/\s+/g, '-')}-${itemName.toLowerCase().replace(/\s+/g, '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({
          title: 'Image Downloaded!',
          description: 'The shareable card image has been downloaded.',
        });
      } catch (error) {
        console.error('Error generating image:', error);
        toast({
          title: 'Image Generation Failed',
          description: 'Could not generate the image.',
          variant: 'destructive',
        });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card p-0 text-card-foreground sm:max-w-lg">
        <DialogHeader className="border-b p-6 pb-4">
          <DialogTitle className="flex items-center font-semibold text-2xl text-primary">
            <Share2 className="mr-3 h-6 w-6" />
            {title}
          </DialogTitle>
          <DialogDescription className="pt-1 text-muted-foreground text-sm">
            Share this {itemType} with your network or download a shareable card.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 p-6">
          <div
            ref={shareCardRef}
            id="shareCardContent"
            className="space-y-3 overflow-hidden rounded-lg border bg-background p-6 text-center shadow-md"
            style={{ width: '380px', margin: '0 auto' }}
          >
            <FileVideo2 className="mx-auto mb-2 h-12 w-12 text-primary" />
            <h3 className="truncate font-bold text-foreground text-xl" title={itemName}>
              {itemName}
            </h3>
            {itemDescription && (
              <p className="truncate text-muted-foreground text-sm" title={itemDescription}>
                {itemDescription}
              </p>
            )}

            <div className="my-3 flex justify-center">
              <QRCodeStylized
                value={qrCodeValue}
                size={120}
                level="M"
                bgColor="#ffffff"
                fgColor="#1E293B"
                imageSettings={
                  qrCodeValue && qrCodeLogoUrl
                    ? {
                        src: qrCodeLogoUrl,
                        height: 28,
                        width: 28,
                        excavate: true,
                      }
                    : undefined
                }
              />
            </div>
            <p className="text-muted-foreground text-xs">Scan the QR code or visit:</p>
            <p className="break-all font-semibold text-accent text-md">{urlToDisplay}</p>
            <p className="mt-2 text-muted-foreground text-xs">Shared from SwipeHire</p>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 border-t pt-4 sm:flex-row">
            <Button
              onClick={handleDownloadImage}
              variant="default"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Download className="mr-2 h-5 w-5" /> Download Card
            </Button>
            <Button
              onClick={() => handleCopyLink(urlToShareWithUser)}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Copy className="mr-2 h-5 w-5" /> Copy Link
            </Button>
          </div>

          <div className="space-y-1 text-center">
            <p className="font-medium text-muted-foreground text-sm">Or share the link via:</p>
            <div className="flex justify-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSocialShare('email')}
                aria-label="Share via Email"
              >
                <Mail className="h-6 w-6 text-red-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSocialShare('linkedin')}
                aria-label="Share on LinkedIn"
              >
                <Linkedin className="h-6 w-6 text-blue-700" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSocialShare('twitter')}
                aria-label="Share on X/Twitter"
              >
                <Twitter className="h-6 w-6 text-blue-400" />
              </Button>
            </div>
            <p className="pt-2 text-muted-foreground text-xs">
              (Social shares will use the specific link. Download the card to share the image
              directly.)
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
