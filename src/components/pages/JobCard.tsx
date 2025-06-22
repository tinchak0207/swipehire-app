import { Briefcase, Eye, Heart, MapPin, Share2, X } from 'lucide-react';
import type React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface JobCardProps {
  company: string;
  category: string;
  title: string;
  location: string;
  type: string;
  tags: string[];
  description: string;
  imageUrl?: string;
}

const JobCard: React.FC<JobCardProps> = ({
  company,
  category,
  title,
  location,
  type,
  tags,
  description,
  imageUrl,
}) => {
  return (
    <Card className="mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
      <CardContent className="p-0">
        {/* Header with gradient background */}
        <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-purple-500 to-blue-600">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
            <Briefcase className="h-8 w-8 text-slate-700" />
          </div>

          {/* Company Badge */}
          <div className="absolute top-4 left-4">
            <Badge className="border-white/30 bg-white/20 text-white">{category}</Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 text-center">
          {/* Company Name */}
          <h2 className="mb-1 font-bold text-slate-900 text-xl">{company}</h2>
          <p className="mb-4 font-medium text-purple-600 text-sm uppercase tracking-wide">
            {title}
          </p>

          {/* Location and Type */}
          <div className="mb-4 flex items-center justify-center space-x-4 text-slate-600 text-sm">
            <div className="flex items-center">
              <MapPin className="mr-1 h-4 w-4 text-slate-400" />
              {location}
            </div>
            <div className="flex items-center">
              <Briefcase className="mr-1 h-4 w-4 text-slate-400" />
              {type}
            </div>
          </div>

          {/* Match Percentage */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium text-slate-700 text-sm">Job Match</span>
              <span className="font-bold text-purple-600 text-sm">85%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                style={{ width: '85%' }}
              />
            </div>
          </div>

          {/* Experience Level */}
          <p className="mb-4 text-slate-500 text-sm italic">2-3 years experience required</p>

          {/* Skills Tags */}
          <div className="mb-6">
            <h4 className="mb-2 font-semibold text-slate-700 text-sm">TOP SKILLS</h4>
            <div className="flex flex-wrap justify-center gap-2">
              {tags.slice(0, 3).map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="rounded-full bg-orange-100 px-3 py-1 text-orange-700 hover:bg-orange-200"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-3">
            <Button
              variant="outline"
              size="lg"
              className="h-16 w-16 rounded-xl border-red-200 p-0 text-red-500 hover:border-red-300 hover:bg-red-50"
            >
              <div className="flex flex-col items-center">
                <X className="mb-1 h-5 w-5" />
                <span className="text-xs">Pass</span>
              </div>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-16 w-16 rounded-xl border-blue-200 p-0 text-blue-600 hover:border-blue-300 hover:bg-blue-50"
            >
              <div className="flex flex-col items-center">
                <Eye className="mb-1 h-5 w-5" />
                <span className="text-xs">Profile</span>
              </div>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-16 w-16 rounded-xl border-green-200 p-0 text-green-600 hover:border-green-300 hover:bg-green-50"
            >
              <div className="flex flex-col items-center">
                <Heart className="mb-1 h-5 w-5" />
                <span className="text-xs">Like</span>
              </div>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-16 w-16 rounded-xl border-purple-200 p-0 text-purple-600 hover:border-purple-300 hover:bg-purple-50"
            >
              <div className="flex flex-col items-center">
                <Share2 className="mb-1 h-5 w-5" />
                <span className="text-xs">Share</span>
              </div>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
