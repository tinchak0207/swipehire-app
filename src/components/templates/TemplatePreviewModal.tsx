'use client';

import { XMarkIcon, PlusIcon, EyeIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Image from 'next/image';
import type React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { ApplicationTemplate } from '@/lib/types/application-templates';

interface TemplatePreviewModalProps {
  template: ApplicationTemplate;
  isOpen: boolean;
  onClose: () => void;
  onCreate: () => void;
}

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  isOpen,
  onClose,
  onCreate,
}) => {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative h-4 w-4">
            <StarIcon className="absolute h-4 w-4 text-gray-300" />
            <div className="absolute overflow-hidden w-1/2">
              <StarIconSolid className="h-4 w-4 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <StarIcon key={i} className="h-4 w-4 text-gray-300" />
        );
      }
    }

    return stars;
  };

  const getDifficultyColor = (difficulty: ApplicationTemplate['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      tech: 'bg-blue-100 text-blue-800 border-blue-200',
      design: 'bg-purple-100 text-purple-800 border-purple-200',
      marketing: 'bg-orange-100 text-orange-800 border-orange-200',
      sales: 'bg-green-100 text-green-800 border-green-200',
      finance: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      healthcare: 'bg-red-100 text-red-800 border-red-200',
      education: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      legal: 'bg-gray-100 text-gray-800 border-gray-200',
      consulting: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      startup: 'bg-pink-100 text-pink-800 border-pink-200',
      remote: 'bg-teal-100 text-teal-800 border-teal-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-2">
                {template.title}
              </DialogTitle>
              <p className="text-gray-600 mb-4">{template.description}</p>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Badge className={getCategoryColor(template.category)}>
                    {template.category}
                  </Badge>
                  <Badge className={getDifficultyColor(template.difficulty)}>
                    {template.difficulty}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1">
                  {renderStars(template.rating)}
                  <span className="text-sm text-gray-600 ml-1">
                    {template.rating} ({template.reviewCount} reviews)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span>⏱️ {template.estimatedTime}</span>
                <span>🔥 {template.popularity}% popular</span>
                <span>📅 Updated {new Date(template.metadata.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <XMarkIcon className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
            {/* Preview Image */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Preview</h3>
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border bg-gray-50">
                <Image
                  src={template.preview}
                  alt={`${template.title} preview`}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://placehold.co/600x800/e5e7eb/6b7280?text=${encodeURIComponent('Template Preview')}`;
                  }}
                />
              </div>
            </div>

            {/* Template Details */}
            <div className="space-y-6">
              {/* Tags */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {template.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Template Sections */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Template Sections</h3>
                <div className="space-y-3">
                  {template.content.sections.map((section) => (
                    <div key={section.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{section.title}</h4>
                        <div className="flex gap-2">
                          {section.required && (
                            <Badge variant="destructive" className="text-xs">
                              Required
                            </Badge>
                          )}
                          {section.customizable && (
                            <Badge variant="outline" className="text-xs">
                              Customizable
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{section.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Styling Options */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Styling</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Layout:</span>
                    <span className="ml-2 capitalize">{template.content.styling.layout}</span>
                  </div>
                  <div>
                    <span className="font-medium">Color:</span>
                    <span className="ml-2 capitalize">{template.content.styling.colorScheme}</span>
                  </div>
                  <div>
                    <span className="font-medium">Font:</span>
                    <span className="ml-2 capitalize">{template.content.styling.fontFamily}</span>
                  </div>
                  <div>
                    <span className="font-medium">Spacing:</span>
                    <span className="ml-2 capitalize">{template.content.styling.spacing}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Metadata */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Details</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Author:</span>
                    <span className="ml-2">{template.metadata.author}</span>
                  </div>
                  <div>
                    <span className="font-medium">Version:</span>
                    <span className="ml-2">{template.metadata.version}</span>
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>
                    <span className="ml-2">
                      {new Date(template.metadata.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span>
                    <span className="ml-2">
                      {new Date(template.metadata.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            <EyeIcon className="mr-2 h-4 w-4" />
            Close Preview
          </Button>
          <Button onClick={onCreate} className="bg-primary hover:bg-primary/90">
            <PlusIcon className="mr-2 h-4 w-4" />
            Use This Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplatePreviewModal;