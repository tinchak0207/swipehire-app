'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UseFormReturn } from 'react-hook-form';
import { CheckCircle, AlertCircle, ExternalLink, FileText, Image, Tag, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ReviewStepProps {
  form: UseFormReturn<any>;
  data: any;
  onDataChange: (data: any) => void;
  onSubmit: () => void;
  onPrevious: () => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ 
  form, 
  onSubmit,
  onPrevious
}) => {
  const { toast } = useToast();
  const { watch, formState: { errors } } = form;
  
  const formData = watch();

  const handleSubmit = () => {
    if (Object.keys(errors).length > 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fix all errors before submitting',
        variant: 'destructive'
      });
      return;
    }
    onSubmit();
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-4">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Review Your Portfolio</h2>
        <p className="text-white/80 max-w-2xl mx-auto">
          Please review all the information below before submitting your portfolio. Make sure everything looks correct.
        </p>
      </motion.div>

      {/* Portfolio Details Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Basic Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-semibold">Basic Information</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-white/70 text-sm">Title</p>
                <p className="text-white font-medium">{formData.title || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-white/70 text-sm">About You</p>
                <p className="text-white font-medium">
                  {formData.description || 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-white/70 text-sm">Skills & Interests</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {formData.tags?.length > 0 ? (
                    formData.tags.map((tag: string) => (
                      <span key={tag} className="px-3 py-1 bg-white/20 text-white text-sm rounded-full">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <p className="text-white/70 text-sm">None selected</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Theme Selection */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Image className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-semibold">Theme</h3>
            </div>
            <p className="text-white font-medium capitalize">
              {formData.theme || 'Default'}
            </p>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Projects */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Code className="w-5 h-5 text-yellow-400" />
              <h3 className="text-white font-semibold">Projects ({formData.projects?.length || 0})</h3>
            </div>
            <div className="space-y-4">
              {formData.projects?.length > 0 ? (
                formData.projects.map((project: any, index: number) => (
                  <div key={index} className="border-b border-white/10 pb-4 last:border-0">
                    <h4 className="text-white font-medium">{project.title || `Project ${index + 1}`}</h4>
                    <p className="text-white/70 text-sm mt-1">{project.description || 'No description'}</p>
                    {project.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {project.technologies.map((tech: string) => (
                          <span key={tech} className="px-2 py-1 bg-white/10 text-white text-xs rounded-full">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-white/70 text-sm">No projects added</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPrevious}
          className="text-white border-white/30 hover:bg-white/10"
        >
          Back
        </Button>
        <Button 
          type="button" 
          onClick={handleSubmit}
          className="bg-green-500 hover:bg-green-600"
        >
          Submit Portfolio
        </Button>
      </div>
    </div>
  );
};

export default ReviewStep;
