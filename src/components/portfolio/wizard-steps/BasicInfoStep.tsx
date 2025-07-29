'use client';

import { motion } from 'framer-motion';
import { FileText, Sparkles, Tag, User } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import TagSelector from '../TagSelector';

interface PortfolioBasicInfo {
  title: string;
  description?: string;
  tags: string[];
}

interface BasicInfoStepProps {
  form: UseFormReturn<PortfolioBasicInfo>;
  data: PortfolioBasicInfo;
  onDataChange: (data: PortfolioBasicInfo) => void;
}

/**
 * Basic Info Step Component
 *
 * Collects essential portfolio information with:
 * - Smart input fields with contextual icons
 * - Real-time character counting
 * - Tag selection with suggestions
 * - Smooth animations and transitions
 * - Form validation with visual feedback
 */
const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ form, data, onDataChange }) => {
  const [titleFocused, setTitleFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);

  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = form;

  const title = watch('title') || '';
  const description = watch('description') || '';
  const tags = watch('tags') || [];

  const suggestedTags = [
    'Web Development',
    'Mobile Apps',
    'UI/UX Design',
    'Frontend',
    'Backend',
    'Full Stack',
    'React',
    'Node.js',
    'Python',
    'JavaScript',
    'TypeScript',
    'Design',
    'Photography',
    'Marketing',
    'Data Science',
    'Machine Learning',
  ];

  const handleTagsChange = (newTags: string[]) => {
    setValue('tags', newTags);
    onDataChange({ ...data, tags: newTags });
  };

  return (
    <div className="space-y-8">
      {/* Portfolio Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-3"
      >
        <label className="flex items-center space-x-2 font-semibold text-lg text-blue-600">
          <User className="h-5 w-5 text-blue-600" />
          <span>Portfolio Title</span>
          <span className="text-red-300">*</span>
        </label>

        <div className="relative">
          <motion.input
            {...register('title')}
            type="text"
            placeholder="e.g., John Doe - Full Stack Developer"
            className={`w-full rounded-2xl border-2 bg-white/80 px-6 py-4 text-lg text-black placeholder-black/50 backdrop-blur-sm transition-all duration-300 focus:outline-none ${
              titleFocused || title ? 'border-gray-200/50 bg-white/90' : 'border-gray-200/50'
            } ${errors.title ? 'border-red-400' : ''}`}
            onFocus={() => setTitleFocused(true)}
            onBlur={() => setTitleFocused(false)}
            whileFocus={{ scale: 1.02 }}
          />

          {/* Character counter */}
          <div className="-translate-y-1/2 absolute top-1/2 right-4 transform text-sm text-black/50">
            {title.length}/100
          </div>
        </div>

        {errors.title && (
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-1 text-red-500 text-sm"
          >
            <span>⚠️</span>
            <span>{errors.title?.message as string}</span>
          </motion.p>
        )}

        <p className="text-sm text-black/60">
          This will be the main heading of your portfolio. Make it memorable!
        </p>
      </motion.div>

      {/* Portfolio Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-3"
      >
        <label className="flex items-center space-x-2 font-semibold text-lg text-blue-600">
          <FileText className="h-5 w-5 text-blue-600" />
          <span>About You</span>
        </label>

        <div className="relative">
          <motion.textarea
            {...register('description')}
            placeholder="Tell visitors about yourself, your skills, and what makes you unique..."
            rows={4}
            className={`w-full resize-none rounded-2xl border-2 bg-white/80 px-6 py-4 text-lg text-black placeholder-black/50 backdrop-blur-sm transition-all duration-300 focus:outline-none ${
              descriptionFocused || description ? 'border-gray-200/50 bg-white/90' : 'border-gray-200/50'
            } ${errors.description ? 'border-red-400' : ''}`}
            onFocus={() => setDescriptionFocused(true)}
            onBlur={() => setDescriptionFocused(false)}
            whileFocus={{ scale: 1.02 }}
          />

          {/* Character counter */}
          <div className="absolute right-4 bottom-4 text-sm text-black/50">
            {description.length}/500
          </div>
        </div>

        {errors.description && (
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-1 text-red-500 text-sm"
          >
            <span>⚠️</span>
            <span>{errors.description?.message as string}</span>
          </motion.p>
        )}

        <p className="text-sm text-black/60">
          Optional: A brief introduction that appears at the top of your portfolio.
        </p>
      </motion.div>

      {/* Tags Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-3"
      >
        <label className="flex items-center space-x-2 font-semibold text-lg text-blue-600">
          <Tag className="h-5 w-5 text-blue-600" />
          <span>Skills & Interests</span>
        </label>

        <div className="rounded-2xl border-2 border-gray-200/50 bg-white/80 p-6 backdrop-blur-sm">
          <TagSelector
            selectedTags={tags}
            onTagsChange={handleTagsChange}
            placeholder="Add tags that describe your skills..."
          />

          {/* Suggested tags */}
          <div className="mt-4">
            <p className="mb-3 flex items-center space-x-1 text-sm text-black/70">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span>Popular tags:</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedTags.slice(0, 8).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    if (!tags.includes(tag) && tags.length < 10) {
                      handleTagsChange([...tags, tag]);
                    }
                  }}
                  disabled={tags.includes(tag) || tags.length >= 10}
                  className={`rounded-full px-3 py-1 text-sm transition-all duration-200 ${
                    tags.includes(tag)
                      ? 'cursor-not-allowed bg-blue-100 text-black/50'
                      : 'bg-blue-100 text-black/80 hover:scale-105 hover:bg-blue-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {errors.tags && (
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-1 text-red-500 text-sm"
          >
            <span>⚠️</span>
            <span>{errors.tags?.message as string}</span>
          </motion.p>
        )}

        <p className="text-sm text-black/60">
          Add up to 10 tags to help people discover your portfolio. ({tags.length}/10)
        </p>
      </motion.div>

      {/* Preview card */}
      {title && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-2xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-sm"
        >
          <h3 className="mb-3 flex items-center space-x-2 font-semibold text-blue-600">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>Preview</span>
          </h3>

          <div className="space-y-3">
            <h4 className="font-bold text-2xl text-blue-600">{title}</h4>
            {description && <p className="text-black/80 leading-relaxed">{description}</p>}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string) => (
                  <span key={tag} className="rounded-full bg-blue-100 px-3 py-1 text-sm text-black">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BasicInfoStep;
