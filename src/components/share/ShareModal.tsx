
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Mail, Linkedin, Twitter, Share2, Download, QrCode, ExternalLink } from "lucide-react";
import { cn } from '@/lib/utils';
import QRCodeStylized from 'qrcode.react'; // Using a different import name to avoid conflict if 'QRCode' is used elsewhere
import html2canvas from 'html2canvas';

interface ShareModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string; // e.g., "Share Candidate Profile"
  itemName: string; // e.g., Candidate's Name or Job Title
  itemDescription?: string; // e.g., Candidate's Role or Company Name
  itemType: string; // e.g., "profile", "job opportunity"
}

const BITLY_URL = "bit.ly/swipehire"; // Your specific Bitly URL

export function ShareModal({
  isOpen,
  onOpenChange,
  title,
  itemName,
  itemDescription,
  itemType,
}: ShareModalProps) {
  const { toast } = useToast();
  const [appOrigin, setAppOrigin] = useState('');
  const shareCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAppOrigin(window.location.origin);
    }
  }, []);

  const urlToShare = appOrigin || `https://[your-app-domain.com]`; // Fallback
  const qrCodeValue = appOrigin || "https://swipehire-app.com"; // Ensure QR always has a valid URL

  const shareTextGeneric = `Check out this ${itemType} on SwipeHire: ${itemName}${itemDescription ? ` (${itemDescription})` : ''}. Visit ${BITLY_URL} or scan the QR code.`;
  const emailSubject = `Interesting ${itemType} on SwipeHire: ${itemName}`;
  const emailBody = `${shareTextGeneric}`;

  const handleCopyLink = async (linkToCopy: string) => {
    try {
      await navigator.clipboard.writeText(linkToCopy);
      toast({ title: "Link Copied!", description: `${linkToCopy} has been copied to your clipboard.` });
    } catch (err) {
      toast({ title: "Copy Failed", description: "Could not copy the link.", variant: "destructive" });
    }
  };

  const handleSocialShare = (platform: 'email' | 'linkedin' | 'twitter') => {
    let url = '';
    switch (platform) {
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        return;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(urlToShare)}&title=${encodeURIComponent(shareTextGeneric)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTextGeneric)}&url=${encodeURIComponent(urlToShare)}`;
        break;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
    onOpenChange(false); // Close modal after initiating share
  };

  const handleDownloadImage = async () => {
    if (shareCardRef.current) {
      try {
        const canvas = await html2canvas(shareCardRef.current, {
          useCORS: true, // Important if any images are from other domains
          backgroundColor: '#ffffff', // Set a background color for transparency handling
          scale: 2, // Increase scale for better resolution
        });
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `swipehire-share-${itemType.replace(' ', '-')}-${itemName.toLowerCase().replace(/\s+/g, '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Image Downloaded!", description: "The shareable card image has been downloaded." });
      } catch (error) {
        console.error("Error generating image:", error);
        toast({ title: "Image Generation Failed", description: "Could not generate the image.", variant: "destructive" });
      }
    }
  };


  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 bg-card text-card-foreground">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-semibold flex items-center text-primary">
            <Share2 className="mr-3 h-6 w-6" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground pt-1">
            Share this {itemType} with your network or download a shareable card.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Area to be captured as image */}
          <div
            ref={shareCardRef}
            id="shareCardContent"
            className="p-6 rounded-lg border bg-background shadow-md overflow-hidden text-center space-y-3"
            style={{ width: '380px', margin: '0 auto' }} // Fixed width for consistent image generation
          >
            <Share2 className="h-10 w-10 text-primary mx-auto mb-1" />
            <h3 className="text-xl font-bold text-foreground truncate" title={itemName}>{itemName}</h3>
            {itemDescription && <p className="text-sm text-muted-foreground truncate" title={itemDescription}>{itemDescription}</p>}
            
            <div className="my-3 flex justify-center">
              <QRCodeStylized
                value={qrCodeValue}
                size={120}
                level="M" // Error correction level
                bgColor="#ffffff"
                fgColor="#000000"
                imageSettings={qrCodeValue ? { // Only add imageSettings if qrCodeValue is not empty
                    src: "/assets/logo-favicon.png", // Path to your small logo in public/assets
                    height: 28,
                    width: 28,
                    excavate: true,
                } : undefined}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Scan the QR code or visit:
            </p>
            <p className="text-md font-semibold text-accent break-all">{BITLY_URL}</p>
            <p className="text-xs text-muted-foreground mt-2">Shared from SwipeHire</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t">
            <Button onClick={handleDownloadImage} variant="default" size="lg" className="w-full sm:w-auto">
              <Download className="mr-2 h-5 w-5" /> Download Card
            </Button>
            <Button onClick={() => handleCopyLink(BITLY_URL)} variant="outline" size="lg" className="w-full sm:w-auto">
              <Copy className="mr-2 h-5 w-5" /> Copy Link
            </Button>
          </div>
          
          <div className="space-y-1 text-center">
            <p className="text-sm font-medium text-muted-foreground">Or share the link via:</p>
            <div className="flex justify-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => handleSocialShare('email')} aria-label="Share via Email">
                <Mail className="h-6 w-6 text-red-500" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleSocialShare('linkedin')} aria-label="Share on LinkedIn">
                <Linkedin className="h-6 w-6 text-blue-700" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleSocialShare('twitter')} aria-label="Share on X/Twitter">
                <Twitter className="h-6 w-6 text-blue-400" />
              </Button>
            </div>
             <p className="text-xs text-muted-foreground pt-2">
              (Social shares will use the link. Download the card to share the image directly.)
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
