'use client';

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { EyeIcon, PlusIcon, SaveIcon, ShareIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCreatePortfolio, useUpdatePortfolio } from '@/hooks/usePortfolio';
import type { PortfolioDraft, PortfolioLayout, Project } from '@/lib/types/portfolio';
import LayoutSelector from './LayoutSelector';
import PortfolioPreview from './PortfolioPreview';
import SortableProjectEditor from './SortableProjectEditor';
import TagSelector from './TagSelector';

interface PortfolioEditorProps {
  initialData: PortfolioDraft;
  mode: 'create' | 'edit';
  portfolioId?: string;
}

/**
 * Main Portfolio Editor Component
 *
 * This component provides a comprehensive interface for creating and editing portfolios.
 * It includes form fields for basic portfolio information, project management,
 * layout selection, and real-time preview functionality.
 *
 * Features:
 * - Basic portfolio fields (title, description, tags)
 * - Project management with drag-and-drop reordering
 * - Layout selection with preview
 * - Real-time preview in modal/drawer
 * - Auto-save functionality
 * - State management for draft data
 */
const PortfolioEditor: React.FC<PortfolioEditorProps> = ({ initialData, mode, portfolioId }) => {
  const router = useRouter();
  const { toast } = useToast();

  // State management for portfolio draft
  const [draft, setDraft] = useState<PortfolioDraft>(initialData);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  // React Query mutations
  const createPortfolioMutation = useCreatePortfolio();
  const updatePortfolioMutation = useUpdatePortfolio();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * Update draft state and mark as dirty
   */
  const updateDraft = useCallback((updates: Partial<PortfolioDraft>) => {
    setDraft((prev) => ({
      ...prev,
      ...updates,
      isDirty: true,
    }));
  }, []);

  /**
   * Handle basic field changes
   */
  const handleFieldChange = useCallback(
    (field: keyof PortfolioDraft, value: any) => {
      updateDraft({ [field]: value });
    },
    [updateDraft]
  );

  /**
   * Handle tag changes
   */
  const handleTagsChange = useCallback(
    (tags: string[]) => {
      updateDraft({ tags });
    },
    [updateDraft]
  );

  /**
   * Handle layout change
   */
  const handleLayoutChange = useCallback(
    (layout: PortfolioLayout) => {
      updateDraft({ layout });
    },
    [updateDraft]
  );

  /**
   * Add new project
   */
  const handleAddProject = useCallback(() => {
    const newProject: Project = {
      id: `temp-${Date.now()}`,
      title: '',
      description: '',
      media: [],
      links: [],
      tags: [],
      order: draft.projects.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      likes: 0,
      isPublished: false,
      technologies: [],
      duration: '1 month',
      role: 'Developer',
    };

    updateDraft({
      projects: [...draft.projects, newProject],
    });
  }, [draft.projects, updateDraft]);

  /**
   * Update project
   */
  const handleUpdateProject = useCallback(
    (projectId: string, updates: Partial<Project>) => {
      const updatedProjects = draft.projects.map((project) =>
        project.id === projectId
          ? { ...project, ...updates, updatedAt: new Date().toISOString() }
          : project
      );
      updateDraft({ projects: updatedProjects });
    },
    [draft.projects, updateDraft]
  );

  /**
   * Remove project
   */
  const handleRemoveProject = useCallback(
    (projectId: string) => {
      const filteredProjects = draft.projects
        .filter((project) => project.id !== projectId)
        .map((project, index) => ({ ...project, order: index }));

      updateDraft({ projects: filteredProjects });
    },
    [draft.projects, updateDraft]
  );

  /**
   * Handle drag start
   */
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  /**
   * Handle drag end
   */
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = draft.projects.findIndex((project) => project.id === active.id);
      const newIndex = draft.projects.findIndex((project) => project.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedProjects = arrayMove(draft.projects, oldIndex, newIndex);
        const projectsWithUpdatedOrder = reorderedProjects.map((project, index) => ({
          ...project,
          order: index,
        }));
        updateDraft({ projects: projectsWithUpdatedOrder });

        toast({
          title: 'Project Reordered',
          description: 'Project order has been updated.',
        });
      }
    },
    [draft.projects, updateDraft, toast]
  );

  /**
   * Reorder projects (for drag-and-drop)
   */
  const handleReorderProjects = useCallback(
    (reorderedProjects: Project[]) => {
      const projectsWithUpdatedOrder = reorderedProjects.map((project, index) => ({
        ...project,
        order: index,
      }));
      updateDraft({ projects: projectsWithUpdatedOrder });
    },
    [updateDraft]
  );

  /**
   * Save portfolio
   */
  const handleSave = useCallback(
    async (publish = false) => {
      if (!draft.title.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Portfolio title is required.',
          variant: 'destructive',
        });
        return;
      }

      setIsSaving(true);

      try {
        const portfolioData = {
          title: draft.title,
          description: draft.description,
          projects: draft.projects.map((project) => ({
            title: project.title,
            description: project.description,
            media: project.media,
            links: project.links,
            tags: project.tags,
            order: project.order,
            isPublished: true,
            technologies: project.technologies || [],
            duration: project.duration,
            role: project.role,
          })),
          layout: draft.layout,
          tags: draft.tags,
          isPublished: publish,
          url: draft.url || draft.title.toLowerCase().replace(/\s+/g, '-'),
          theme: draft.theme || 'light',
        };

        if (mode === 'create') {
          const result = await createPortfolioMutation.mutateAsync(portfolioData);
          toast({
            title: 'Success',
            description: `Portfolio ${publish ? 'created and published' : 'saved as draft'} successfully.`,
          });
          router.push(`/portfolio/edit/${result.id}`);
        } else if (portfolioId) {
          await updatePortfolioMutation.mutateAsync({
            id: portfolioId,
            data: portfolioData,
          });
          toast({
            title: 'Success',
            description: `Portfolio ${publish ? 'published' : 'updated'} successfully.`,
          });
          setDraft((prev) => ({ ...prev, isDirty: false }));
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to save portfolio. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsSaving(false);
      }
    },
    [draft, mode, portfolioId, createPortfolioMutation, updatePortfolioMutation, toast, router]
  );

  /**
   * Auto-save functionality
   */
  useEffect(() => {
    if (!autoSaveEnabled || !draft.isDirty || mode === 'create') return;

    const autoSaveTimer = setTimeout(() => {
      handleSave(false);
    }, 5000); // Auto-save after 5 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [draft, autoSaveEnabled, mode, handleSave]);

  /**
   * Warn user about unsaved changes
   */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (draft.isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [draft.isDirty]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Editor Panel */}
      <div className="lg:col-span-2 space-y-6">
        {/* Basic Information Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Portfolio Information</h2>

            {/* Title Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Title *</span>
              </label>
              <input
                type="text"
                placeholder="Enter portfolio title..."
                className="input input-bordered w-full"
                value={draft.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                required
              />
            </div>

            {/* Description Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Description</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                placeholder="Describe your portfolio..."
                value={draft.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
              />
            </div>

            {/* Tags */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Tags</span>
              </label>
              <TagSelector
                selectedTags={draft.tags}
                onTagsChange={handleTagsChange}
                placeholder="Add tags to categorize your portfolio..."
              />
            </div>

            {/* Layout Selection */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Layout</span>
              </label>
              <LayoutSelector selectedLayout={draft.layout} onLayoutChange={handleLayoutChange} />
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title text-2xl">Projects</h2>
              <button className="btn btn-accent btn-sm" onClick={handleAddProject}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Project
              </button>
            </div>

            {/* Projects List */}
            <div className="space-y-4">
              {draft.projects.length === 0 ? (
                <div className="text-center py-8 text-base-content/60">
                  <p>No projects added yet.</p>
                  <p className="text-sm mt-2">Click "Add Project" to get started.</p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                >
                  <SortableContext
                    items={draft.projects.map((p) => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {draft.projects
                        .sort((a, b) => a.order - b.order)
                        .map((project, index) => (
                          <SortableProjectEditor
                            key={project.id}
                            project={project}
                            index={index}
                            onUpdate={(updates) => handleUpdateProject(project.id, updates)}
                            onRemove={() => handleRemoveProject(project.id)}
                            onReorder={handleReorderProjects}
                            allProjects={draft.projects}
                            isDragging={activeId === project.id}
                          />
                        ))}
                    </div>
                  </SortableContext>

                  {/* Drag Overlay */}
                  <DragOverlay>
                    {activeId ? (
                      <div className="opacity-90 transform rotate-3 shadow-2xl">
                        {(() => {
                          const draggedProject = draft.projects.find((p) => p.id === activeId);
                          const draggedIndex = draft.projects.findIndex((p) => p.id === activeId);
                          return draggedProject ? (
                            <SortableProjectEditor
                              project={draggedProject}
                              index={draggedIndex}
                              onUpdate={() => {}}
                              onRemove={() => {}}
                              onReorder={() => {}}
                              allProjects={draft.projects}
                              isDragging={true}
                            />
                          ) : null;
                        })()}
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Actions Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">Actions</h3>

            <div className="space-y-3">
              {/* Preview Button */}
              <button className="btn btn-outline btn-block" onClick={() => setShowPreview(true)}>
                <EyeIcon className="w-4 h-4 mr-2" />
                Preview
              </button>

              {/* Save Draft Button */}
              <button
                className={`btn btn-primary btn-block ${isSaving ? 'loading' : ''}`}
                onClick={() => handleSave(false)}
                disabled={isSaving || !draft.isDirty}
              >
                {!isSaving && <SaveIcon className="w-4 h-4 mr-2" />}
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>

              {/* Publish Button */}
              <button
                className={`btn btn-success btn-block ${isSaving ? 'loading' : ''}`}
                onClick={() => handleSave(true)}
                disabled={isSaving || !draft.title.trim()}
              >
                {!isSaving && <ShareIcon className="w-4 h-4 mr-2" />}
                {isSaving ? 'Publishing...' : 'Publish'}
              </button>
            </div>

            {/* Auto-save Toggle */}
            <div className="form-control mt-4">
              <label className="label cursor-pointer">
                <span className="label-text">Auto-save</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={autoSaveEnabled}
                  onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                />
              </label>
            </div>

            {/* Status Indicator */}
            {draft.isDirty && (
              <div className="alert alert-warning mt-4">
                <span className="text-sm">Unsaved changes</span>
              </div>
            )}
          </div>
        </div>

        {/* Portfolio Stats (if editing) */}
        {mode === 'edit' && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">Portfolio Stats</h3>
              <div className="stats stats-vertical shadow">
                <div className="stat">
                  <div className="stat-title">Projects</div>
                  <div className="stat-value text-2xl">{draft.projects.length}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Status</div>
                  <div className="stat-value text-lg">
                    {draft.isPublished ? (
                      <span className="text-success">Published</span>
                    ) : (
                      <span className="text-warning">Draft</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-7xl h-5/6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Portfolio Preview</h3>
              <button className="btn btn-sm btn-circle" onClick={() => setShowPreview(false)}>
                ✕
              </button>
            </div>

            <div className="h-full overflow-auto">
              <PortfolioPreview portfolio={draft} />
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowPreview(false)} />
        </div>
      )}
    </div>
  );
};

export default PortfolioEditor;
