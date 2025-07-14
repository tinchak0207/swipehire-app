'use client';

import { GridIcon, ListIcon, SlidersIcon } from 'lucide-react';
import type React from 'react';
import type { PortfolioLayout } from '@/lib/types/portfolio';

interface LayoutSelectorProps {
  selectedLayout: PortfolioLayout;
  onLayoutChange: (layout: PortfolioLayout) => void;
}

/**
 * LayoutSelector Component
 *
 * A component for selecting portfolio layout with visual previews.
 * Supports grid, list, and carousel layouts with preview thumbnails.
 */
const LayoutSelector: React.FC<LayoutSelectorProps> = ({ selectedLayout, onLayoutChange }) => {
  const layouts: Array<{
    value: PortfolioLayout;
    label: string;
    description: string;
    icon: React.ReactNode;
    preview: React.ReactNode;
  }> = [
    {
      value: 'grid',
      label: 'Grid Layout',
      description: 'Display projects in a responsive grid',
      icon: <GridIcon className="h-5 w-5" />,
      preview: (
        <div className="grid grid-cols-2 gap-1 w-12 h-8">
          <div className="bg-primary/30 rounded-sm" />
          <div className="bg-primary/30 rounded-sm" />
          <div className="bg-primary/30 rounded-sm" />
          <div className="bg-primary/30 rounded-sm" />
        </div>
      ),
    },
    {
      value: 'list',
      label: 'List Layout',
      description: 'Display projects in a vertical list',
      icon: <ListIcon className="h-5 w-5" />,
      preview: (
        <div className="space-y-1 w-12 h-8">
          <div className="bg-primary/30 rounded-sm h-1.5" />
          <div className="bg-primary/30 rounded-sm h-1.5" />
          <div className="bg-primary/30 rounded-sm h-1.5" />
          <div className="bg-primary/30 rounded-sm h-1.5" />
        </div>
      ),
    },
    {
      value: 'carousel',
      label: 'Carousel Layout',
      description: 'Display projects in a sliding carousel',
      icon: <SlidersIcon className="h-5 w-5" />,
      preview: (
        <div className="flex gap-1 w-12 h-8 overflow-hidden">
          <div className="bg-primary/50 rounded-sm flex-shrink-0 w-6" />
          <div className="bg-primary/30 rounded-sm flex-shrink-0 w-6" />
          <div className="bg-primary/20 rounded-sm flex-shrink-0 w-6" />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Layout Options */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {layouts.map((layout) => (
          <div
            key={layout.value}
            className={`card cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedLayout === layout.value
                ? 'border-2 border-primary bg-primary/5'
                : 'border border-base-300 hover:border-primary/50'
            }`}
            onClick={() => onLayoutChange(layout.value)}
          >
            <div className="card-body p-4">
              {/* Header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {layout.icon}
                  <span className="font-medium text-sm">{layout.label}</span>
                </div>

                {/* Radio Button */}
                <input
                  type="radio"
                  name="layout"
                  className="radio radio-primary radio-sm"
                  checked={selectedLayout === layout.value}
                  onChange={() => onLayoutChange(layout.value)}
                />
              </div>

              {/* Preview */}
              <div className="mb-3 flex justify-center">{layout.preview}</div>

              {/* Description */}
              <p className="text-center text-base-content/70 text-xs">{layout.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Layout Details */}
      <div className="alert alert-info">
        <div className="flex-1">
          <div className="text-sm">
            <strong>Selected: {layouts.find((l) => l.value === selectedLayout)?.label}</strong>
          </div>
          <div className="mt-1 text-xs opacity-80">
            {selectedLayout === 'grid' &&
              'Projects will be displayed in a responsive grid that adapts to screen size.'}
            {selectedLayout === 'list' &&
              'Projects will be displayed in a vertical list with full-width cards.'}
            {selectedLayout === 'carousel' &&
              'Projects will be displayed in a horizontal sliding carousel.'}
          </div>
        </div>
      </div>

      {/* Layout-specific Options */}
      {selectedLayout === 'grid' && (
        <div className="card border border-base-300 bg-base-100">
          <div className="card-body p-4">
            <h4 className="mb-3 font-medium text-sm">Grid Options</h4>
            <div className="space-y-3">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs">Columns on Desktop</span>
                </label>
                <select className="select select-bordered select-sm">
                  <option value="2">2 Columns</option>
                  <option value="3" selected>
                    3 Columns
                  </option>
                  <option value="4">4 Columns</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs">Card Aspect Ratio</span>
                </label>
                <select className="select select-bordered select-sm">
                  <option value="square">Square (1:1)</option>
                  <option value="landscape" selected>
                    Landscape (4:3)
                  </option>
                  <option value="portrait">Portrait (3:4)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedLayout === 'carousel' && (
        <div className="card border border-base-300 bg-base-100">
          <div className="card-body p-4">
            <h4 className="mb-3 font-medium text-sm">Carousel Options</h4>
            <div className="space-y-3">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs">Auto-play</span>
                </label>
                <input type="checkbox" className="toggle toggle-primary toggle-sm" />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs">Show Navigation Dots</span>
                </label>
                <input type="checkbox" className="toggle toggle-primary toggle-sm" defaultChecked />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs">Items per View</span>
                </label>
                <select className="select select-bordered select-sm">
                  <option value="1" selected>
                    1 Item
                  </option>
                  <option value="2">2 Items</option>
                  <option value="3">3 Items</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayoutSelector;
