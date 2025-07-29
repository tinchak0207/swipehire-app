'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle,
  Eye,
  Github,
  Globe,
  GripVertical,
  Plus,
  Rocket,
  Trash2,
  X,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';

/**
 * Project data structure for the wizard step
 */
interface ProjectData {
  title: string;
  description: string;
  technologies: string[];
  links: ProjectLink[];
}

/**
 * Project link structure
 */
interface ProjectLink {
  type: 'github' | 'live' | 'demo';
  url: string;
}

/**
 * Props interface for ProjectsStep component
 */
interface ProjectsStepProps {
  form: UseFormReturn<any>;
  data: any;
  onDataChange: (data: any) => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

/**
 * Link type options for project external links
 */
const LINK_TYPES: Array<{ value: ProjectLink['type']; label: string; icon: React.ComponentType }> =
  [
    { value: 'github', label: 'GitHub Repository', icon: Github },
    { value: 'live', label: 'Live Demo', icon: Eye },
    { value: 'demo', label: 'Demo/Preview', icon: Globe },
  ] as const;

/**
 * Popular technology suggestions
 */
const POPULAR_TECHNOLOGIES = [
  'React',
  'Next.js',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Python',
  'HTML',
  'CSS',
  'Tailwind CSS',
  'Vue.js',
  'Angular',
  'Express.js',
  'MongoDB',
  'PostgreSQL',
  'MySQL',
  'Firebase',
  'AWS',
  'Docker',
  'Git',
  'Figma',
  'Photoshop',
  'Illustrator',
  'Sketch',
  'Adobe XD',
];

/**
 * ProjectsStep Component
 *
 * A comprehensive step for adding and managing projects in the portfolio wizard.
 * Features:
 * - Add/remove multiple projects
 * - Project title and description
 * - Technology stack selection with suggestions
 * - External links management (GitHub, demo, etc.)
 * - Form validation with visual feedback
 * - Responsive design with DaisyUI components
 * - Smooth animations with Framer Motion
 * - Accessibility considerations
 */
const ProjectsStep: React.FC<ProjectsStepProps> = ({ form, data, onDataChange }) => {
  const { toast } = useToast();
  const {
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = form;

  // Watch projects array from form
  const projects: ProjectData[] = watch('projects') || [];

  // Local state for UI interactions
  const [expandedProject, setExpandedProject] = useState<number>(0);

  // Initialize projects if empty
  useEffect(() => {
    if (projects.length === 0) {
      const initialProject: ProjectData = {
        title: '',
        description: '',
        technologies: [],
        links: [],
      };
      setValue('projects', [initialProject]);
      onDataChange({ ...data, projects: [initialProject] });
      setExpandedProject(0);
    }
  }, [data, onDataChange, projects.length, setValue]);

  // Update form data when projects change
  const updateProjects = useCallback(
    (updatedProjects: ProjectData[]) => {
      setValue('projects', updatedProjects);
      onDataChange({ ...data, projects: updatedProjects });
      trigger('projects'); // Trigger validation
    },
    [setValue, onDataChange, data, trigger]
  );

  // Add new project
  const addProject = useCallback(() => {
    const newProject: ProjectData = {
      title: '',
      description: '',
      technologies: [],
      links: [],
    };
    const updatedProjects = [...projects, newProject];
    updateProjects(updatedProjects);
    setExpandedProject(updatedProjects.length - 1);

    toast({
      title: 'Project Added',
      description: 'New project has been added to your portfolio.',
    });
  }, [projects, updateProjects, toast]);

  // Remove project
  const removeProject = useCallback(
    (index: number) => {
      if (projects.length <= 1) {
        toast({
          title: 'Cannot Remove',
          description: 'You must have at least one project in your portfolio.',
          variant: 'destructive',
        });
        return;
      }

      const updatedProjects = projects.filter((_, i) => i !== index);
      updateProjects(updatedProjects);

      if (expandedProject >= updatedProjects.length) {
        setExpandedProject(Math.max(0, updatedProjects.length - 1));
      }

      toast({
        title: 'Project Removed',
        description: 'Project has been removed from your portfolio.',
      });
    },
    [projects, updateProjects, expandedProject, toast]
  );

  // Update specific project
  const updateProject = useCallback(
    (index: number, updatedProject: ProjectData) => {
      const updatedProjects = [...projects];
      updatedProjects[index] = updatedProject;
      updateProjects(updatedProjects);
    },
    [projects, updateProjects]
  );

  return (
    <div className="space-y-8">
      {/* Step Introduction */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4 text-center"
      >
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-gray-200/50 bg-white/80 backdrop-blur-sm">
          <Rocket className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="mb-2 font-bold text-2xl text-blue-600">Showcase Your Best Work</h2>
        <p className="mx-auto max-w-2xl text-black/80">
          Add your most impressive projects to create a compelling portfolio. Include details about
          technologies used and provide links to live demos or source code.
        </p>
      </motion.div>

      {/* Projects List */}
      <div className="space-y-6">
        <AnimatePresence>
          {projects.map((project, index) => (
            <ProjectCard
              key={index}
              project={project}
              index={index}
              isExpanded={expandedProject === index}
              onToggleExpand={() => setExpandedProject(expandedProject === index ? -1 : index)}
              onUpdate={(updatedProject) => updateProject(index, updatedProject)}
              onRemove={() => removeProject(index)}
              errors={
                errors['projects'] && Array.isArray(errors['projects']) && errors['projects'][index]
                  ? errors['projects'][index]
                  : undefined
              }
            />
          ))}
        </AnimatePresence>

        {/* Add Project Button */}
        <motion.button
          type="button"
          onClick={addProject}
          className="group w-full rounded-2xl border-2 border-gray-200/50 border-dashed bg-white/80 p-6 text-black backdrop-blur-sm transition-all duration-300 hover:border-gray-200 hover:bg-white/90"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex flex-col items-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 transition-colors group-hover:bg-blue-200">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-blue-600">Add New Project</h3>
              <p className="text-sm text-black/70">
                {projects.length === 0
                  ? 'Add your first project to get started'
                  : 'Add another project to your portfolio'}
              </p>
            </div>
          </div>
        </motion.button>

        {/* Validation Error */}
        {errors['projects'] && typeof errors['projects'].message === 'string' && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-red-500 backdrop-blur-sm"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{errors['projects'].message}</span>
          </motion.div>
        )}

        {/* Projects Summary */}
        {projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-sm"
          >
            <div className="mb-4 flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <h3 className="font-semibold text-blue-600">Portfolio Summary</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 text-center md:grid-cols-3">
              <div className="space-y-1">
                <div className="font-bold text-2xl text-blue-600">{projects.length}</div>
                <div className="text-sm text-black/70">Projects</div>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-2xl text-blue-600">
                  {projects.reduce((acc, p) => acc + p.technologies.length, 0)}
                </div>
                <div className="text-sm text-black/70">Technologies</div>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-2xl text-blue-600">
                  {projects.reduce((acc, p) => acc + p.links.length, 0)}
                </div>
                <div className="text-sm text-black/70">External Links</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

/**
 * Individual Project Card Component
 */
interface ProjectCardProps {
  project: ProjectData;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (project: ProjectData) => void;
  onRemove: () => void;
  errors?: any;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  index,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onRemove,
  errors,
}) => {
  const [newTechnology, setNewTechnology] = useState('');
  const [newLink, setNewLink] = useState<ProjectLink>({ type: 'github', url: '' });

  // Update project field
  const updateField = (field: keyof ProjectData, value: any) => {
    onUpdate({ ...project, [field]: value });
  };

  // Add technology
  const addTechnology = (tech: string) => {
    if (tech.trim() && !project.technologies.includes(tech.trim())) {
      updateField('technologies', [...project.technologies, tech.trim()]);
      setNewTechnology('');
    }
  };

  // Remove technology
  const removeTechnology = (techToRemove: string) => {
    updateField(
      'technologies',
      project.technologies.filter((tech) => tech !== techToRemove)
    );
  };

  // Add link
  const addLink = () => {
    if (newLink.url.trim()) {
      updateField('links', [...project.links, newLink]);
      setNewLink({ type: 'github', url: '' });
    }
  };

  // Remove link
  const removeLink = (linkIndex: number) => {
    updateField(
      'links',
      project.links.filter((_, i) => i !== linkIndex)
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded-2xl border border-gray-200/50 bg-white/80 backdrop-blur-sm"
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <GripVertical className="h-5 w-5 cursor-grab text-black/50" />
            <div>
              <h3 className="font-semibold text-blue-600">
                {project.title || `Project ${index + 1}`}
              </h3>
              <p className="text-sm text-black/70">
                {project.technologies.length} technologies • {project.links.length} links
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onToggleExpand}
              className="rounded-lg bg-blue-100 px-4 py-2 text-blue-600 transition-colors hover:bg-blue-200"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-500/20 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 space-y-6"
          >
            {/* Project Title */}
            <div className="space-y-2">
              <label className="block font-medium text-blue-600">Project Title *</label>
              <input
                type="text"
                value={project.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Enter project title"
                className="w-full rounded-lg border border-gray-200/50 bg-white/80 px-4 py-3 text-black placeholder-black/50 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              {errors?.title && (
                <p className="flex items-center space-x-1 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.title.message}</span>
                </p>
              )}
            </div>

            {/* Project Description */}
            <div className="space-y-2">
              <label className="block font-medium text-blue-600">Project Description *</label>
              <textarea
                value={project.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe your project, what it does, and what makes it special"
                rows={4}
                className="w-full resize-none rounded-lg border border-gray-200/50 bg-white/80 px-4 py-3 text-black placeholder-black/50 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              {errors?.description && (
                <p className="flex items-center space-x-1 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.description.message}</span>
                </p>
              )}
            </div>

            {/* Technologies */}
            <div className="space-y-3">
              <label className="block font-medium text-blue-600">Technologies Used</label>

              {/* Technology Tags */}
              {project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="inline-flex items-center space-x-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-black"
                    >
                      <span>{tech}</span>
                      <button
                        type="button"
                        onClick={() => removeTechnology(tech)}
                        className="text-black/70 hover:text-black"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add Technology Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTechnology}
                  onChange={(e) => setNewTechnology(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTechnology(newTechnology);
                    }
                  }}
                  placeholder="Add a technology (e.g., React, Node.js)"
                  className="flex-1 rounded-lg border border-gray-200/50 bg-white/80 px-4 py-2 text-black placeholder-black/50 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => addTechnology(newTechnology)}
                  className="rounded-lg bg-blue-100 px-4 py-2 text-blue-600 transition-colors hover:bg-blue-200"
                >
                  Add
                </button>
              </div>

              {/* Popular Technologies */}
              <div className="space-y-2">
                <p className="text-sm text-black/70">Popular technologies:</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_TECHNOLOGIES.filter((tech) => !project.technologies.includes(tech))
                    .slice(0, 8)
                    .map((tech) => (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => addTechnology(tech)}
                        className="rounded-full bg-blue-100 px-3 py-1 text-sm text-black/80 transition-colors hover:bg-blue-200"
                      >
                        {tech}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Project Links */}
            <div className="space-y-3">
              <label className="block font-medium text-blue-600">Project Links</label>

              {/* Existing Links */}
              {project.links.length > 0 && (
                <div className="space-y-2">
                  {project.links.map((link, linkIndex) => {
                    const LinkIcon =
                      LINK_TYPES.find((type) => type.value === link.type)?.icon || Github;
                    return (
                      <div
                        key={linkIndex}
                        className="flex items-center space-x-3 rounded-lg bg-blue-100 p-3"
                      >
                        <LinkIcon className="h-5 w-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="font-medium text-black">
                            {LINK_TYPES.find((type) => type.value === link.type)?.label}
                          </p>
                          <p className="truncate text-sm text-black/70">{link.url}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLink(linkIndex)}
                          className="text-red-500 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add New Link */}
              <div className="space-y-3 rounded-lg bg-blue-50 p-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <select
                    value={newLink.type}
                    onChange={(e) =>
                      setNewLink({ ...newLink, type: e.target.value as ProjectLink['type'] })
                    }
                    className="rounded-lg border border-gray-200/50 bg-white/80 px-4 py-2 text-black focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    {LINK_TYPES.map((type) => (
                      <option key={type.value} value={type.value} className="bg-white">
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="url"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    placeholder="https://..."
                    className="rounded-lg border border-gray-200/50 bg-white/80 px-4 py-2 text-black placeholder-black/50 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 md:col-span-2"
                  />
                </div>
                <button
                  type="button"
                  onClick={addLink}
                  disabled={!newLink.url.trim()}
                  className="w-full rounded-lg bg-blue-100 px-4 py-2 text-blue-600 transition-colors hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add Link
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ProjectsStep;
