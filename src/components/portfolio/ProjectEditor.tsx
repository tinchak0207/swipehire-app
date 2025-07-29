'use client';

import {
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLink as ExternalLinkIcon,
  EyeIcon,
  GithubIcon,
  GripVerticalIcon,
  PlusIcon,
  TrashIcon,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { ExternalLink, Media, Project } from '@/lib/types/portfolio';
import MediaUploader from './MediaUploader';
import TagSelector from './TagSelector';

interface ProjectEditorProps {
  project: Project;
  index: number;
  onUpdate: (updates: Partial<Project>) => void;
  onRemove: () => void;
  onReorder: (reorderedProjects: Project[]) => void;
  allProjects: Project[];
  dragHandleProps?: any;
  isDragging?: boolean;
}

/**
 * ProjectEditor Component
 *
 * A comprehensive editor for individual projects within a portfolio.
 * Features:
 * - Basic project information (title, description)
 * - Media management with upload functionality
 * - External links management
 * - Tag management
 * - Project reordering
 * - Collapsible interface for better UX
 * - Drag and drop support
 */
const ProjectEditor: React.FC<ProjectEditorProps> = ({
  project,
  index,
  onUpdate,
  onRemove,
  onReorder,
  allProjects,
  dragHandleProps,
  isDragging = false,
}) => {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(index === 0); // First project expanded by default
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [newLink, setNewLink] = useState<Partial<ExternalLink>>({
    type: 'other',
    url: '',
    label: '',
  });

  /**
   * Handle field updates
   */
  const handleFieldUpdate = useCallback(
    (field: keyof Project, value: any) => {
      onUpdate({ [field]: value });
    },
    [onUpdate]
  );

  /**
   * Handle media updates
   */
  const handleMediaUpdate = useCallback(
    (media: Media[]) => {
      onUpdate({ media });
    },
    [onUpdate]
  );

  /**
   * Handle tag updates
   */
  const handleTagsUpdate = useCallback(
    (tags: string[]) => {
      onUpdate({ tags });
    },
    [onUpdate]
  );

  /**
   * Add external link
   */
  const handleAddLink = useCallback(() => {
    if (!newLink.url || !newLink.label) {
      toast({
        title: 'Validation Error',
        description: 'Please provide both URL and label for the link.',
        variant: 'destructive',
      });
      return;
    }

    // Validate URL format
    try {
      new URL(newLink.url);
    } catch {
      toast({
        title: 'Invalid URL',
        description: 'Please provide a valid URL.',
        variant: 'destructive',
      });
      return;
    }

    const link: ExternalLink = {
      type: newLink.type as ExternalLink['type'],
      url: newLink.url,
      label: newLink.label,
    };

    onUpdate({
      links: [...project.links, link],
    });

    // Reset form
    setNewLink({
      type: 'other',
      url: '',
      label: '',
    });
    setShowLinkForm(false);

    toast({
      title: 'Link Added',
      description: 'External link has been added to the project.',
    });
  }, [newLink, project.links, onUpdate, toast]);

  /**
   * Remove external link
   */
  const handleRemoveLink = useCallback(
    (linkIndex: number) => {
      const updatedLinks = project.links.filter((_, i) => i !== linkIndex);
      onUpdate({ links: updatedLinks });
    },
    [project.links, onUpdate]
  );

  /**
   * Move project up
   */
  const handleMoveUp = useCallback(() => {
    if (index === 0) return;

    const reordered = [...allProjects];
    const currentProject = reordered[index];
    const previousProject = reordered[index - 1];

    if (currentProject && previousProject) {
      [reordered[index - 1], reordered[index]] = [currentProject, previousProject];
      onReorder(reordered);
    }
  }, [index, allProjects, onReorder]);

  /**
   * Move project down
   */
  const handleMoveDown = useCallback(() => {
    if (index === allProjects.length - 1) return;

    const reordered = [...allProjects];
    const currentProject = reordered[index];
    const nextProject = reordered[index + 1];

    if (currentProject && nextProject) {
      [reordered[index], reordered[index + 1]] = [nextProject, currentProject];
      onReorder(reordered);
    }
  }, [index, allProjects, onReorder]);

  /**
   * Get link type label
   */
  const getLinkTypeLabel = (type: ExternalLink['type']) => {
    switch (type) {
      case 'github':
        return 'GitHub';
      case 'demo':
        return 'Live Demo';
      case 'behance':
        return 'Behance';
      case 'dribbble':
        return 'Dribbble';
      default:
        return 'Other';
    }
  };

  return (
    <div
      className={`rounded-xl border border-gray-200/50 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${
        isDragging ? 'rotate-1 scale-105 shadow-2xl ring-2 ring-blue-500 ring-opacity-50' : ''
      }`}
    >
      {/* Project Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <div
            className="cursor-grab text-gray-400 transition-colors hover:text-blue-600 active:cursor-grabbing"
            {...dragHandleProps}
          >
            <GripVerticalIcon className="h-5 w-5" />
          </div>

          {/* Project Title */}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">
              {project.title || `Project ${index + 1}`}
            </h3>
            <div className="flex items-center gap-3 text-gray-500 text-sm">
              <span className="flex items-center gap-1">
                <EyeIcon className="h-3 w-3" />
                {project.media.length} media
              </span>
              <span className="flex items-center gap-1">
                <ExternalLinkIcon className="h-3 w-3" />
                {project.links.length} links
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Reorder Buttons (fallback for non-drag users) */}
          <div className="flex rounded-lg border border-gray-200/50 bg-white/60">
            <button
              className="rounded-l-lg border-r border-gray-200/30 px-2 py-1 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
              onClick={handleMoveUp}
              disabled={index === 0}
              title="Move up"
            >
              <ChevronUpIcon className="h-4 w-4" />
            </button>
            <button
              className="rounded-r-lg px-2 py-1 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
              onClick={handleMoveDown}
              disabled={index === allProjects.length - 1}
              title="Move down"
            >
              <ChevronDownIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Expand/Collapse */}
          <button
            className="rounded-lg border border-gray-200/50 bg-white/60 px-3 py-1 text-gray-700 text-sm transition-all duration-200 hover:bg-blue-50 hover:text-blue-600"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>

          {/* Remove */}
          <button
            className="rounded-lg border border-red-200/50 bg-red-50/60 px-2 py-1 text-red-600 transition-all duration-200 hover:bg-red-100 hover:text-red-700"
            onClick={onRemove}
            title="Remove project"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-gray-700">Project Title</span>
              </label>
              <input
                type="text"
                placeholder="Enter project title..."
                className="input w-full rounded-lg border-gray-200/50 bg-white/60 text-black transition-all duration-200 placeholder:text-gray-500 focus:border-blue-500 focus:bg-white/80 focus:ring-2 focus:ring-blue-200"
                value={project.title}
                onChange={(e) => handleFieldUpdate('title', e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-gray-700">Role</span>
              </label>
              <input
                type="text"
                placeholder="Your role in this project..."
                className="input w-full rounded-lg border-gray-200/50 bg-white/60 text-black transition-all duration-200 placeholder:text-gray-500 focus:border-blue-500 focus:bg-white/80 focus:ring-2 focus:ring-blue-200"
                value={project.role || ''}
                onChange={(e) => handleFieldUpdate('role', e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-gray-700">Description</span>
            </label>
            <textarea
              className="textarea h-24 w-full rounded-lg border-gray-200/50 bg-white/60 text-black transition-all duration-200 placeholder:text-gray-500 focus:border-blue-500 focus:bg-white/80 focus:ring-2 focus:ring-blue-200"
              placeholder="Describe your project..."
              value={project.description}
              onChange={(e) => handleFieldUpdate('description', e.target.value)}
            />
          </div>

          {/* Duration and Technologies */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-gray-700">Duration</span>
              </label>
              <input
                type="text"
                placeholder="e.g., 3 months"
                className="input w-full rounded-lg border-gray-200/50 bg-white/60 text-black transition-all duration-200 placeholder:text-gray-500 focus:border-blue-500 focus:bg-white/80 focus:ring-2 focus:ring-blue-200"
                value={project.duration || ''}
                onChange={(e) => handleFieldUpdate('duration', e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-gray-700">Technologies</span>
              </label>
              <TagSelector
                selectedTags={project.technologies || []}
                onTagsChange={(technologies) => handleFieldUpdate('technologies', technologies)}
                placeholder="Add technologies used..."
              />
            </div>
          </div>

          {/* Tags */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-gray-700">Tags</span>
            </label>
            <TagSelector
              selectedTags={project.tags}
              onTagsChange={handleTagsUpdate}
              placeholder="Add tags to categorize this project..."
            />
          </div>

          {/* Media Section */}
          <div className="rounded-lg border border-gray-200/30 bg-gradient-to-r from-blue-50/30 to-cyan-50/30 p-4 backdrop-blur-sm">
            <h4 className="mb-4 font-semibold text-gray-800">Project Media</h4>
            <MediaUploader media={project.media} onMediaUpdate={handleMediaUpdate} />
          </div>

          {/* External Links Section */}
          <div className="rounded-lg border border-gray-200/30 bg-gradient-to-r from-green-50/30 to-emerald-50/30 p-4 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-semibold text-gray-800">External Links</h4>
              <button
                className="btn btn-sm rounded-lg border-gray-200 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:shadow-lg"
                onClick={() => setShowLinkForm(!showLinkForm)}
              >
                <PlusIcon className="mr-1 h-3 w-3" />
                Add Link
              </button>
            </div>

            {/* Existing Links */}
            {project.links.length > 0 && (
              <div className="mb-4 space-y-2">
                {project.links.map((link, linkIndex) => (
                  <div
                    key={linkIndex}
                    className="flex items-center justify-between rounded-lg border border-gray-200/50 bg-white/60 p-3 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3">
                      {link.type === 'github' && <GithubIcon className="h-4 w-4 text-gray-600" />}
                      {link.type === 'demo' && (
                        <ExternalLinkIcon className="h-4 w-4 text-gray-600" />
                      )}
                      <div>
                        <div className="font-medium text-gray-800 text-sm">{link.label}</div>
                        <div className="text-gray-500 text-xs">
                          {getLinkTypeLabel(link.type)} • {link.url}
                        </div>
                      </div>
                    </div>
                    <button
                      className="text-red-500 transition-colors hover:text-red-700"
                      onClick={() => handleRemoveLink(linkIndex)}
                      title="Remove link"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Link Form */}
            {showLinkForm && (
              <div className="space-y-3 rounded-lg border border-gray-200/50 bg-white/60 p-4 backdrop-blur-sm">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <select
                    className="select w-full rounded-lg border-gray-200/50 bg-white/60 text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    value={newLink.type}
                    onChange={(e) =>
                      setNewLink({ ...newLink, type: e.target.value as ExternalLink['type'] })
                    }
                  >
                    <option value="other">Other</option>
                    <option value="github">GitHub</option>
                    <option value="demo">Live Demo</option>
                    <option value="behance">Behance</option>
                    <option value="dribbble">Dribbble</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Link label..."
                    className="input w-full rounded-lg border-gray-200/50 bg-white/60 text-black placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    value={newLink.label}
                    onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                  />

                  <input
                    type="url"
                    placeholder="https://..."
                    className="input w-full rounded-lg border-gray-200/50 bg-white/60 text-black placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    className="btn btn-sm rounded-lg border-gray-200 bg-white/80 text-gray-700 transition-all duration-200 hover:bg-gray-50"
                    onClick={() => {
                      setShowLinkForm(false);
                      setNewLink({ type: 'other', url: '', label: '' });
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-sm rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg"
                    onClick={handleAddLink}
                  >
                    Add Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectEditor;
