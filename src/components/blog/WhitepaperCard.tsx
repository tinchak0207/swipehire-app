import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from 'lucide-react';
import Image from 'next/image';

interface WhitepaperCardProps {
  title: string;
  description: string;
  imageUrl: string;
  downloadUrl: string;
  fileSize: string;
}

export function WhitepaperCard({ title, description, imageUrl, downloadUrl, fileSize }: WhitepaperCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground">
          <FileText className="mr-2 h-4 w-4" />
          <span>{fileSize}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" asChild>
          <a href={downloadUrl} download>
            <Download className="mr-2 h-4 w-4" />
            Download Whitepaper
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
} 