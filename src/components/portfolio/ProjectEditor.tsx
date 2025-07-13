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
   * Get link icon based on type
   */
  const getLinkIcon = (type: ExternalLink['type']) => {
    switch (type) {
      case 'github':
        return <GithubIcon className="h-4 w-4" />;
      case 'demo':
        return <EyeIcon className="h-4 w-4" />;
      default:
        return <ExternalLinkIcon className="h-4 w-4" />;
    }
  };

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
      className={`card border border-base-300 bg-base-100 shadow-sm transition-all duration-200 ${
        isDragging ? 'rotate-1 shadow-lg ring-2 ring-primary ring-opacity-50' : ''
      }`}
    >
      {/* Project Header */}
      <div className="card-body p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Drag Handle */}
            <div
              className="cursor-grab text-base-content/40 transition-colors hover:text-base-content/80 active:cursor-grabbing"
              {...dragHandleProps}
            >
              <GripVerticalIcon className="h-5 w-5" />
            </div>

            {/* Project Title */}
            <div className="flex-1">
              <h3 className="font-medium">{project.title || `Project ${index + 1}`}</h3>
              <div className="text-base-content/60 text-sm">
                {project.media.length} media • {project.links.length} links
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Reorder Buttons (fallback for non-drag users) */}
            <div className="btn-group">
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleMoveUp}
                disabled={index === 0}
                title="Move up"
              >
                <ChevronUpIcon className="h-4 w-4" />
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleMoveDown}
                disabled={index === allProjects.length - 1}
                title="Move down"
              >
                <ChevronDownIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Expand/Collapse */}
            <button className="btn btn-ghost btn-sm" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>

            {/* Remove */}
            <button
              className="btn btn-ghost btn-sm text-error hover:bg-error hover:text-error-content"
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
                  <span className="label-text font-medium">Project Title</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter project title..."
                  className="input input-bordered"
                  value={project.title}
                  onChange={(e) => handleFieldUpdate('title', e.target.value)}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Description</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                placeholder="Describe your project..."
                value={project.description}
                onChange={(e) => handleFieldUpdate('description', e.target.value)}
              />
            </div>

            {/* Tags */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Tags</span>
              </label>
              <TagSelector
                selectedTags={project.tags}
                onTagsChange={handleTagsUpdate}
                placeholder="Add project tags..."
                maxTags={8}
              />
            </div>

            {/* Media Upload */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Media</span>
              </label>
              <MediaUploader
                media={project.media}
                onMediaUpdate={handleMediaUpdate}
                maxFiles={10}
              />
            </div>

            {/* External Links */}
            <div className="form-control">
              <div className="mb-3 flex items-center justify-between">
                <label className="label p-0">
                  <span className="label-text font-medium">External Links</span>
                </label>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowLinkForm(!showLinkForm)}
                >
                  <PlusIcon className="mr-1 h-4 w-4" />
                  Add Link
                </button>
              </div>

              {/* Existing Links */}
              {project.links.length > 0 && (
                <div className="mb-4 space-y-2">
                  {project.links.map((link, linkIndex) => (
                    <div
                      key={linkIndex}
                      className="flex items-center justify-between rounded-lg bg-base-200 p-3"
                    >
                      <div className="flex items-center gap-3">
                        {getLinkIcon(link.type)}
                        <div>
                          <div className="font-medium text-sm">{link.label}</div>
                          <div className="text-base-content/60 text-xs">
                            {getLinkTypeLabel(link.type)} • {link.url}
                          </div>
                        </div>
                      </div>
                      <button
                        className="btn btn-ghost btn-sm text-error"
                        onClick={() => handleRemoveLink(linkIndex)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Link Form */}
              {showLinkForm && (
                <div className="card border border-base-300 bg-base-200">
                  <div className="card-body p-4">
                    <h4 className="mb-3 font-medium">Add External Link</h4>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div className="form-control">
                        <label className="label py-1">
                          <span className="label-text text-sm">Type</span>
                        </label>
                        <select
                          className="select select-bordered select-sm"
                          value={newLink.type}
                          onChange={(e) =>
                            setNewLink((prev) => ({
                              ...prev,
                              type: e.target.value as ExternalLink['type'],
                            }))
                          }
                        >
                          <option value="other">Other</option>
                          <option value="github">GitHub</option>
                          <option value="demo">Live Demo</option>
                          <option value="behance">Behance</option>
                          <option value="dribbble">Dribbble</option>
                        </select>
                      </div>

                      <div className="form-control">
                        <label className="label py-1">
                          <span className="label-text text-sm">Label</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., View Source Code"
                          className="input input-bordered input-sm"
                          value={newLink.label}
                          onChange={(e) =>
                            setNewLink((prev) => ({
                              ...prev,
                              label: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="form-control">
                        <label className="label py-1">
                          <span className="label-text text-sm">URL</span>
                        </label>
                        <input
                          type="url"
                          placeholder="https://..."
                          className="input input-bordered input-sm"
                          value={newLink.url}
                          onChange={(e) =>
                            setNewLink((prev) => ({
                              ...prev,
                              url: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setShowLinkForm(false)}
                      >
                        Cancel
                      </button>
                      <button className="btn btn-primary btn-sm" onClick={handleAddLink}>
                        Add Link
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectEditor;
