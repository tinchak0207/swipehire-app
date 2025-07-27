'use client';

import { EyeIcon, PlusIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Image from 'next/image';
import type React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import type { ApplicationTemplate } from '@/lib/types/application-templates';

interface TemplateCardProps {
  template: ApplicationTemplate;
  onPreview: () => void;
  onCreate: () => void;
  className?: string;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onPreview,
  onCreate,
  className = '',
}) => {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative h-4 w-4">
            <StarIcon className="absolute h-4 w-4 text-gray-300" />
            <div className="absolute w-1/2 overflow-hidden">
              <StarIconSolid className="h-4 w-4 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<StarIcon key={i} className="h-4 w-4 text-gray-300" />);
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
    <Card
      className={`group hover:-translate-y-1 h-full transition-all duration-300 hover:shadow-lg ${className}`}
    >
      <CardHeader className="p-0">
        <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-gray-100">
          <Image
            src={template.thumbnail}
            alt={template.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              // Fallback to a placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.src = `https://placehold.co/400x225/e5e7eb/6b7280?text=${encodeURIComponent(template.title)}`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute top-2 left-2">
            <Badge className={getCategoryColor(template.category)}>{template.category}</Badge>
          </div>
          <div className="absolute top-2 right-2">
            <Badge className={getDifficultyColor(template.difficulty)}>{template.difficulty}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow p-4">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="line-clamp-2 font-semibold text-gray-900 text-lg leading-tight">
            {template.title}
          </h3>
        </div>

        <p className="mb-3 line-clamp-2 text-gray-600 text-sm">{template.description}</p>

        <div className="mb-3 flex items-center gap-2">
          <div className="flex items-center">{renderStars(template.rating)}</div>
          <span className="text-gray-600 text-sm">
            {template.rating} ({template.reviewCount})
          </span>
        </div>

        <div className="mb-3 flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{template.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-gray-500 text-sm">
          <span>⏱️ {template.estimatedTime}</span>
          <span>🔥 {template.popularity}% popular</span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 p-4 pt-0">
        <Button variant="outline" size="sm" onClick={onPreview} className="flex-1">
          <EyeIcon className="mr-2 h-4 w-4" />
          Preview
        </Button>
        <Button size="sm" onClick={onCreate} className="flex-1">
          <PlusIcon className="mr-2 h-4 w-4" />
          Use Template
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TemplateCard;
