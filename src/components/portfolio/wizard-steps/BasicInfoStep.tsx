'use client';

import { motion } from 'framer-motion';
import { FileText, Sparkles, Tag, User } from 'lucide-react';
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import TagSelector from '../TagSelector';

interface BasicInfoStepProps {
  form: UseFormReturn<any>;
  data: any;
  onDataChange: (data: any) => void;
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
        <label className="flex items-center space-x-2 text-white font-semibold text-lg">
          <User className="w-5 h-5" />
          <span>Portfolio Title</span>
          <span className="text-red-300">*</span>
        </label>

        <div className="relative">
          <motion.input
            {...register('title')}
            type="text"
            placeholder="e.g., John Doe - Full Stack Developer"
            className={`w-full px-6 py-4 bg-white/10 backdrop-blur-sm border-2 rounded-2xl text-white placeholder-white/50 text-lg transition-all duration-300 focus:outline-none ${
              titleFocused || title ? 'border-white/50 bg-white/20' : 'border-white/20'
            } ${errors.title ? 'border-red-400' : ''}`}
            onFocus={() => setTitleFocused(true)}
            onBlur={() => setTitleFocused(false)}
            whileFocus={{ scale: 1.02 }}
          />

          {/* Character counter */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 text-sm">
            {title.length}/100
          </div>
        </div>

        {errors.title && (
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-red-300 text-sm flex items-center space-x-1"
          >
            <span>⚠️</span>
            <span>{errors.title.message}</span>
          </motion.p>
        )}

        <p className="text-white/60 text-sm">
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
        <label className="flex items-center space-x-2 text-white font-semibold text-lg">
          <FileText className="w-5 h-5" />
          <span>About You</span>
        </label>

        <div className="relative">
          <motion.textarea
            {...register('description')}
            placeholder="Tell visitors about yourself, your skills, and what makes you unique..."
            rows={4}
            className={`w-full px-6 py-4 bg-white/10 backdrop-blur-sm border-2 rounded-2xl text-white placeholder-white/50 text-lg transition-all duration-300 focus:outline-none resize-none ${
              descriptionFocused || description ? 'border-white/50 bg-white/20' : 'border-white/20'
            } ${errors.description ? 'border-red-400' : ''}`}
            onFocus={() => setDescriptionFocused(true)}
            onBlur={() => setDescriptionFocused(false)}
            whileFocus={{ scale: 1.02 }}
          />

          {/* Character counter */}
          <div className="absolute right-4 bottom-4 text-white/50 text-sm">
            {description.length}/500
          </div>
        </div>

        {errors.description && (
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-red-300 text-sm flex items-center space-x-1"
          >
            <span>⚠️</span>
            <span>{errors.description.message}</span>
          </motion.p>
        )}

        <p className="text-white/60 text-sm">
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
        <label className="flex items-center space-x-2 text-white font-semibold text-lg">
          <Tag className="w-5 h-5" />
          <span>Skills & Interests</span>
        </label>

        <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-6">
          <TagSelector
            selectedTags={tags}
            onTagsChange={handleTagsChange}
            placeholder="Add tags that describe your skills..."
            className="bg-transparent border-white/30 text-white placeholder-white/50"
            tagClassName="bg-white/20 text-white border-white/30"
          />

          {/* Suggested tags */}
          <div className="mt-4">
            <p className="text-white/70 text-sm mb-3 flex items-center space-x-1">
              <Sparkles className="w-4 h-4" />
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
                  className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                    tags.includes(tag)
                      ? 'bg-white/30 text-white/50 cursor-not-allowed'
                      : 'bg-white/10 text-white/80 hover:bg-white/20 hover:scale-105'
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
            className="text-red-300 text-sm flex items-center space-x-1"
          >
            <span>⚠️</span>
            <span>{errors.tags.message}</span>
          </motion.p>
        )}

        <p className="text-white/60 text-sm">
          Add up to 10 tags to help people discover your portfolio. ({tags.length}/10)
        </p>
      </motion.div>

      {/* Preview card */}
      {title && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
        >
          <h3 className="text-white font-semibold mb-3 flex items-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>Preview</span>
          </h3>

          <div className="space-y-3">
            <h4 className="text-2xl font-bold text-white">{title}</h4>
            {description && <p className="text-white/80 leading-relaxed">{description}</p>}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 bg-white/20 text-white text-sm rounded-full">
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
