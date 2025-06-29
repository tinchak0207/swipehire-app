'use client';

import { motion } from 'framer-motion';
import { Check, Eye, Grid3X3, Layers, Layout, List, Palette, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface ThemeSelectionStepProps {
  form: UseFormReturn<any>;
  data: any;
  onDataChange: (data: any) => void;
}

interface Theme {
  id: string;
  name: string;
  description: string;
  preview: string;
  gradient: string;
  features: string[];
}

interface LayoutOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  preview: string;
}

const themes: Theme[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, contemporary design with bold typography',
    preview: 'bg-gradient-to-br from-slate-900 to-slate-700',
    gradient: 'from-slate-600 to-slate-800',
    features: ['Dark theme', 'Minimalist', 'Typography-focused'],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple, elegant design that lets your work shine',
    preview: 'bg-gradient-to-br from-gray-100 to-white',
    gradient: 'from-gray-200 to-gray-400',
    features: ['Light theme', 'Clean lines', 'Spacious layout'],
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Vibrant, artistic design for creative professionals',
    preview: 'bg-gradient-to-br from-purple-500 to-pink-500',
    gradient: 'from-purple-400 to-pink-600',
    features: ['Colorful', 'Artistic', 'Eye-catching'],
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Corporate-friendly design for business portfolios',
    preview: 'bg-gradient-to-br from-blue-600 to-blue-800',
    gradient: 'from-blue-500 to-blue-700',
    features: ['Business-ready', 'Trustworthy', 'Polished'],
  },
];

const layouts: LayoutOption[] = [
  {
    id: 'grid',
    name: 'Grid',
    description: 'Organized grid layout for showcasing multiple projects',
    icon: Grid3X3,
    preview: 'grid-cols-2 gap-2',
  },
  {
    id: 'masonry',
    name: 'Masonry',
    description: 'Pinterest-style layout with varying heights',
    icon: Layers,
    preview: 'masonry',
  },
  {
    id: 'list',
    name: 'List',
    description: 'Detailed list view with descriptions',
    icon: List,
    preview: 'space-y-2',
  },
];

/**
 * Theme Selection Step Component
 *
 * Allows users to choose their portfolio theme and layout with:
 * - Interactive theme previews
 * - Layout visualization
 * - Hover effects and animations
 * - Real-time preview updates
 */
const ThemeSelectionStep: React.FC<ThemeSelectionStepProps> = ({ form, data, onDataChange }) => {
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);

  const { setValue, watch } = form;

  const selectedTheme = watch('theme') || 'modern';
  const selectedLayout = watch('layout') || 'grid';

  const handleThemeSelect = (themeId: string) => {
    setValue('theme', themeId);
    onDataChange({ ...data, theme: themeId });
  };

  const handleLayoutSelect = (layoutId: string) => {
    setValue('layout', layoutId);
    onDataChange({ ...data, layout: layoutId });
  };

  return (
    <div className="space-y-10">
      {/* Theme Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center space-x-3">
          <Palette className="w-6 h-6 text-white" />
          <h3 className="text-2xl font-bold text-white">Choose Your Theme</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {themes.map((theme, index) => (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative cursor-pointer group ${
                selectedTheme === theme.id ? 'ring-4 ring-white/50' : ''
              }`}
              onClick={() => handleThemeSelect(theme.id)}
              onMouseEnter={() => setPreviewTheme(theme.id)}
              onMouseLeave={() => setPreviewTheme(null)}
            >
              <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-6 transition-all duration-300 hover:bg-white/20 hover:scale-105">
                {/* Theme preview */}
                <div
                  className={`w-full h-32 rounded-xl mb-4 ${theme.preview} relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-white/20 backdrop-blur-sm rounded p-2">
                      <div className="h-2 bg-white/40 rounded mb-1" />
                      <div className="h-1 bg-white/30 rounded w-2/3" />
                    </div>
                  </div>

                  {/* Selection indicator */}
                  {selectedTheme === theme.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center"
                    >
                      <Check className="w-5 h-5 text-green-600" />
                    </motion.div>
                  )}

                  {/* Preview overlay */}
                  {previewTheme === theme.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center"
                    >
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Theme info */}
                <div className="space-y-3">
                  <h4 className="text-xl font-bold text-white">{theme.name}</h4>
                  <p className="text-white/70 text-sm">{theme.description}</p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    {theme.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-2 py-1 bg-white/20 text-white/80 text-xs rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Layout Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center space-x-3">
          <Layout className="w-6 h-6 text-white" />
          <h3 className="text-2xl font-bold text-white">Select Layout Style</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {layouts.map((layout, index) => (
            <motion.div
              key={layout.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              className={`relative cursor-pointer group ${
                selectedLayout === layout.id ? 'ring-4 ring-white/50' : ''
              }`}
              onClick={() => handleLayoutSelect(layout.id)}
            >
              <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-6 transition-all duration-300 hover:bg-white/20 hover:scale-105">
                {/* Layout preview */}
                <div className="w-full h-24 bg-white/10 rounded-lg mb-4 p-3 relative overflow-hidden">
                  {layout.id === 'grid' && (
                    <div className="grid grid-cols-2 gap-2 h-full">
                      <div className="bg-white/30 rounded" />
                      <div className="bg-white/30 rounded" />
                      <div className="bg-white/30 rounded" />
                      <div className="bg-white/30 rounded" />
                    </div>
                  )}

                  {layout.id === 'masonry' && (
                    <div className="grid grid-cols-2 gap-2 h-full">
                      <div className="space-y-2">
                        <div className="bg-white/30 rounded h-8" />
                        <div className="bg-white/30 rounded h-12" />
                      </div>
                      <div className="space-y-2">
                        <div className="bg-white/30 rounded h-12" />
                        <div className="bg-white/30 rounded h-8" />
                      </div>
                    </div>
                  )}

                  {layout.id === 'list' && (
                    <div className="space-y-2 h-full">
                      <div className="flex space-x-2">
                        <div className="bg-white/30 rounded w-8 h-4" />
                        <div className="bg-white/30 rounded flex-1 h-4" />
                      </div>
                      <div className="flex space-x-2">
                        <div className="bg-white/30 rounded w-8 h-4" />
                        <div className="bg-white/30 rounded flex-1 h-4" />
                      </div>
                      <div className="flex space-x-2">
                        <div className="bg-white/30 rounded w-8 h-4" />
                        <div className="bg-white/30 rounded flex-1 h-4" />
                      </div>
                    </div>
                  )}

                  {/* Selection indicator */}
                  {selectedLayout === layout.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-green-600" />
                    </motion.div>
                  )}
                </div>

                {/* Layout info */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <layout.icon className="w-5 h-5 text-white" />
                    <h4 className="text-lg font-bold text-white">{layout.name}</h4>
                  </div>
                  <p className="text-white/70 text-sm">{layout.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Selection summary */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
      >
        <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
          <Sparkles className="w-4 h-4" />
          <span>Your Selection</span>
        </h4>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-white/60 text-sm">Theme</p>
            <p className="text-white font-medium">
              {themes.find((t) => t.id === selectedTheme)?.name}
            </p>
          </div>
          <div>
            <p className="text-white/60 text-sm">Layout</p>
            <p className="text-white font-medium">
              {layouts.find((l) => l.id === selectedLayout)?.name}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ThemeSelectionStep;
