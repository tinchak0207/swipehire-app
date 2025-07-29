'use client';

import { motion } from 'framer-motion';
import { Check, Eye, Grid3X3, Layers, Layout, List, Palette, Sparkles } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

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
    icon: Grid3X3 as any,
    preview: 'grid-cols-2 gap-2',
  },
  {
    id: 'masonry',
    name: 'Masonry',
    description: 'Pinterest-style layout with varying heights',
    icon: Layers as any,
    preview: 'masonry',
  },
  {
    id: 'list',
    name: 'List',
    description: 'Detailed list view with descriptions',
    icon: List as any,
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
          <Palette className="h-6 w-6 text-blue-600" />
          <h3 className="font-bold text-2xl text-blue-600">Choose Your Theme</h3>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {themes.map((theme, index) => (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group relative cursor-pointer ${
                selectedTheme === theme.id ? 'ring-4 ring-white/50' : ''
              }`}
              onClick={() => handleThemeSelect(theme.id)}
              onMouseEnter={() => setPreviewTheme(theme.id)}
              onMouseLeave={() => setPreviewTheme(null)}
            >
              <div className="rounded-2xl border-2 border-gray-200/50 bg-white/80 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/90">
                {/* Theme preview */}
                <div
                  className={`mb-4 h-32 w-full rounded-xl ${theme.preview} relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute right-2 bottom-2 left-2">
                    <div className="rounded bg-white/40 p-2 backdrop-blur-sm">
                      <div className="mb-1 h-2 rounded bg-white/60" />
                      <div className="h-1 w-2/3 rounded bg-white/50" />
                    </div>
                  </div>

                  {/* Selection indicator */}
                  {selectedTheme === theme.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white"
                    >
                      <Check className="h-5 w-5 text-green-600" />
                    </motion.div>
                  )}

                  {/* Preview overlay */}
                  {previewTheme === theme.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/40"
                    >
                      <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                        <Eye className="h-6 w-6 text-blue-600" />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Theme info */}
                <div className="space-y-3">
                  <h4 className="font-bold text-blue-600 text-xl">{theme.name}</h4>
                  <p className="text-sm text-black/70">{theme.description}</p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    {theme.features.map((feature) => (
                      <span
                        key={feature}
                        className="rounded-full bg-blue-100 px-2 py-1 text-black/80 text-xs"
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
          <Layout className="h-6 w-6 text-blue-600" />
          <h3 className="font-bold text-2xl text-blue-600">Select Layout Style</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {layouts.map((layout, index) => (
            <motion.div
              key={layout.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              className={`group relative cursor-pointer ${
                selectedLayout === layout.id ? 'ring-4 ring-white/50' : ''
              }`}
              onClick={() => handleLayoutSelect(layout.id)}
            >
              <div className="rounded-2xl border-2 border-gray-200/50 bg-white/80 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/90">
                {/* Layout preview */}
                <div className="relative mb-4 h-24 w-full overflow-hidden rounded-lg bg-blue-100 p-3">
                  {layout.id === 'grid' && (
                    <div className="grid h-full grid-cols-2 gap-2">
                      <div className="rounded bg-blue-200" />
                      <div className="rounded bg-blue-200" />
                      <div className="rounded bg-blue-200" />
                      <div className="rounded bg-blue-200" />
                    </div>
                  )}

                  {layout.id === 'masonry' && (
                    <div className="grid h-full grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <div className="h-8 rounded bg-blue-200" />
                        <div className="h-12 rounded bg-blue-200" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-12 rounded bg-blue-200" />
                        <div className="h-8 rounded bg-blue-200" />
                      </div>
                    </div>
                  )}

                  {layout.id === 'list' && (
                    <div className="h-full space-y-2">
                      <div className="flex space-x-2">
                        <div className="h-4 w-8 rounded bg-blue-200" />
                        <div className="h-4 flex-1 rounded bg-blue-200" />
                      </div>
                      <div className="flex space-x-2">
                        <div className="h-4 w-8 rounded bg-blue-200" />
                        <div className="h-4 flex-1 rounded bg-blue-200" />
                      </div>
                      <div className="flex space-x-2">
                        <div className="h-4 w-8 rounded bg-blue-200" />
                        <div className="h-4 flex-1 rounded bg-blue-200" />
                      </div>
                    </div>
                  )}

                  {/* Selection indicator */}
                  {selectedLayout === layout.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white"
                    >
                      <Check className="h-4 w-4 text-green-600" />
                    </motion.div>
                  )}
                </div>

                {/* Layout info */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <layout.icon className="h-5 w-5 text-blue-600" />
                    <h4 className="font-bold text-lg text-blue-600">{layout.name}</h4>
                  </div>
                  <p className="text-sm text-black/70">{layout.description}</p>
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
        className="rounded-2xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-sm"
      >
        <h4 className="mb-3 flex items-center space-x-2 font-semibold text-blue-600">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span>Your Selection</span>
        </h4>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-black/60">Theme</p>
            <p className="font-medium text-black">
              {themes.find((t) => t.id === selectedTheme)?.name}
            </p>
          </div>
          <div>
            <p className="text-sm text-black/60">Layout</p>
            <p className="font-medium text-black">
              {layouts.find((l) => l.id === selectedLayout)?.name}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ThemeSelectionStep;
