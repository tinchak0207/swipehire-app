'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Code, FileText, Image } from 'lucide-react';
import type React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ReviewStepProps {
  form: UseFormReturn<any>;
  data: any;
  onDataChange: (data: any) => void;
  onSubmit: () => void;
  onPrevious: () => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ form, onSubmit, onPrevious }) => {
  const { toast } = useToast();
  const {
    watch,
    formState: { errors },
  } = form;

  const formData = watch();

  const handleSubmit = () => {
    if (Object.keys(errors).length > 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fix all errors before submitting',
        variant: 'destructive',
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
        className="space-y-4 text-center"
      >
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-sm">
          <CheckCircle className="h-8 w-8 text-green-400" />
        </div>
        <h2 className="mb-2 font-bold text-2xl text-white">Review Your Portfolio</h2>
        <p className="mx-auto max-w-2xl text-white/80">
          Please review all the information below before submitting your portfolio. Make sure
          everything looks correct.
        </p>
      </motion.div>

      {/* Portfolio Details Summary */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm"
          >
            <div className="mb-4 flex items-center space-x-3">
              <FileText className="h-5 w-5 text-blue-400" />
              <h3 className="font-semibold text-white">Basic Information</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-white/70">Title</p>
                <p className="font-medium text-white">{formData.title || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-white/70">About You</p>
                <p className="font-medium text-white">{formData.description || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-white/70">Skills & Interests</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {formData.tags?.length > 0 ? (
                    formData.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/20 px-3 py-1 text-sm text-white"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-white/70">None selected</p>
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
            className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm"
          >
            <div className="mb-4 flex items-center space-x-3">
              <Image className="h-5 w-5 text-purple-400" />
              <h3 className="font-semibold text-white">Theme</h3>
            </div>
            <p className="font-medium text-white capitalize">{formData.theme || 'Default'}</p>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Projects */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm"
          >
            <div className="mb-4 flex items-center space-x-3">
              <Code className="h-5 w-5 text-yellow-400" />
              <h3 className="font-semibold text-white">
                Projects ({formData.projects?.length || 0})
              </h3>
            </div>
            <div className="space-y-4">
              {formData.projects?.length > 0 ? (
                formData.projects.map((project: any, index: number) => (
                  <div key={index} className="border-white/10 border-b pb-4 last:border-0">
                    <h4 className="font-medium text-white">
                      {project.title || `Project ${index + 1}`}
                    </h4>
                    <p className="mt-1 text-sm text-white/70">
                      {project.description || 'No description'}
                    </p>
                    {project.technologies?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {project.technologies.map((tech: string) => (
                          <span
                            key={tech}
                            className="rounded-full bg-white/10 px-2 py-1 text-white text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/70">No projects added</p>
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
          className="border-white/30 text-white hover:bg-white/10"
        >
          Back
        </Button>
        <Button type="button" onClick={handleSubmit} className="bg-green-500 hover:bg-green-600">
          Submit Portfolio
        </Button>
      </div>
    </div>
  );
};

export default ReviewStep;
