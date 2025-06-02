
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Briefcase, 
  X, 
  Eye, 
  Heart, 
  Share2,
  Star
} from 'lucide-react';

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
  imageUrl
}) => {
  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
      <CardContent className="p-0">
        {/* Header with gradient background */}
        <div className="h-32 bg-gradient-to-br from-purple-500 to-blue-600 relative flex items-center justify-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Briefcase className="h-8 w-8 text-slate-700" />
          </div>
          
          {/* Company Badge */}
          <div className="absolute top-4 left-4">
            <Badge className="bg-white/20 text-white border-white/30">
              {category}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 text-center">
          {/* Company Name */}
          <h2 className="text-xl font-bold text-slate-900 mb-1">{company}</h2>
          <p className="text-purple-600 font-medium text-sm uppercase tracking-wide mb-4">{title}</p>

          {/* Location and Type */}
          <div className="flex items-center justify-center space-x-4 mb-4 text-sm text-slate-600">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1 text-slate-400" />
              {location}
            </div>
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 mr-1 text-slate-400" />
              {type}
            </div>
          </div>

          {/* Match Percentage */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Job Match</span>
              <span className="text-sm font-bold text-purple-600">85%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>

          {/* Experience Level */}
          <p className="text-sm text-slate-500 italic mb-4">2-3 years experience required</p>

          {/* Skills Tags */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">TOP SKILLS</h4>
            <div className="flex flex-wrap gap-2 justify-center">
              {tags.slice(0, 3).map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-full px-3 py-1"
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
              className="text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300 rounded-xl w-16 h-16 p-0"
            >
              <div className="flex flex-col items-center">
                <X className="h-5 w-5 mb-1" />
                <span className="text-xs">Pass</span>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 rounded-xl w-16 h-16 p-0"
            >
              <div className="flex flex-col items-center">
                <Eye className="h-5 w-5 mb-1" />
                <span className="text-xs">Profile</span>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300 rounded-xl w-16 h-16 p-0"
            >
              <div className="flex flex-col items-center">
                <Heart className="h-5 w-5 mb-1" />
                <span className="text-xs">Like</span>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300 rounded-xl w-16 h-16 p-0"
            >
              <div className="flex flex-col items-center">
                <Share2 className="h-5 w-5 mb-1" />
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
