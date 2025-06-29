'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UseFormReturn, FieldError } from 'react-hook-form';
import { 
  Plus, 
  Rocket, 
  Github, 
  Eye, 
  Trash2, 
  GripVertical,
  AlertCircle,
  CheckCircle,
  X,
  Globe
} from 'lucide-react';
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
const LINK_TYPES: Array<{ value: ProjectLink['type']; label: string; icon: React.ComponentType }> = [
  { value: 'github', label: 'GitHub Repository', icon: Github },
  { value: 'live', label: 'Live Demo', icon: Eye },
  { value: 'demo', label: 'Demo/Preview', icon: Globe },
] as const;

/**
 * Popular technology suggestions
 */
const POPULAR_TECHNOLOGIES = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 
  'HTML', 'CSS', 'Tailwind CSS', 'Vue.js', 'Angular', 'Express.js',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Firebase', 'AWS', 'Docker',
  'Git', 'Figma', 'Photoshop', 'Illustrator', 'Sketch', 'Adobe XD'
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
const ProjectsStep: React.FC<ProjectsStepProps> = ({ 
  form, 
  data, 
  onDataChange 
}) => {
  const { toast } = useToast();
  const { formState: { errors }, watch, setValue, trigger } = form;
  
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
  }, []);

  // Update form data when projects change
  const updateProjects = useCallback((updatedProjects: ProjectData[]) => {
    setValue('projects', updatedProjects);
    onDataChange({ ...data, projects: updatedProjects });
    trigger('projects'); // Trigger validation
  }, [setValue, onDataChange, data, trigger]);

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
  const removeProject = useCallback((index: number) => {
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
  }, [projects, updateProjects, expandedProject, toast]);

  // Update specific project
  const updateProject = useCallback((index: number, updatedProject: ProjectData) => {
    const updatedProjects = [...projects];
    updatedProjects[index] = updatedProject;
    updateProjects(updatedProjects);
  }, [projects, updateProjects]);

  return (
    <div className="space-y-8">
      {/* Step Introduction */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-4">
          <Rocket className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Showcase Your Best Work</h2>
        <p className="text-white/80 max-w-2xl mx-auto">
          Add your most impressive projects to create a compelling portfolio. Include details about technologies used and provide links to live demos or source code.
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
              errors={(errors?.['projects'] as Record<number, FieldError>)?.[index]}
            />
          ))}
        </AnimatePresence>

        {/* Add Project Button */}
        <motion.button
          type="button"
          onClick={addProject}
          className="w-full p-6 bg-white/10 backdrop-blur-sm border-2 border-dashed border-white/30 rounded-2xl text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300 group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Add New Project</h3>
              <p className="text-white/70 text-sm">
                {projects.length === 0 ? 'Add your first project to get started' : 'Add another project to your portfolio'}
              </p>
            </div>
          </div>
        </motion.button>

        {/* Validation Error */}
        {errors?.['projects'] && typeof errors['projects'] === 'object' && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2 text-red-300 bg-red-500/10 backdrop-blur-sm border border-red-400/30 rounded-lg p-4"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>
              {(errors['projects'] as FieldError)?.message || 
               (Object.values(errors['projects']).some((p: unknown) => (p as FieldError)?.message) 
                ? 'Some projects have errors' 
                : 'Please add at least one project')}
            </span>
          </motion.div>
        )}

        {/* Projects Summary */}
        {projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <h3 className="text-white font-semibold">Portfolio Summary</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white">{projects.length}</div>
                <div className="text-white/70 text-sm">Projects</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white">
                  {projects.reduce((acc, p) => acc + p.technologies.length, 0)}
                </div>
                <div className="text-white/70 text-sm">Technologies</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white">
                  {projects.reduce((acc, p) => acc + p.links.length, 0)}
                </div>
                <div className="text-white/70 text-sm">External Links</div>
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
    updateField('technologies', project.technologies.filter(tech => tech !== techToRemove));
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
    updateField('links', project.links.filter((_, i) => i !== linkIndex));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <GripVertical className="w-5 h-5 text-white/50 cursor-grab" />
            <div>
              <h3 className="text-white font-semibold">
                {project.title || `Project ${index + 1}`}
              </h3>
              <p className="text-white/70 text-sm">
                {project.technologies.length} technologies • {project.links.length} links
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onToggleExpand}
              className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="p-2 text-red-300 hover:text-red-200 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
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
              <label className="block text-white font-medium">
                Project Title *
              </label>
              <input
                type="text"
                value={project.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Enter project title"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
              />
              {errors?.title && (
                <p className="text-red-300 text-sm flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.title.message}</span>
                </p>
              )}
            </div>

            {/* Project Description */}
            <div className="space-y-2">
              <label className="block text-white font-medium">
                Project Description *
              </label>
              <textarea
                value={project.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe your project, what it does, and what makes it special"
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent resize-none"
              />
              {errors?.description && (
                <p className="text-red-300 text-sm flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.description.message}</span>
                </p>
              )}
            </div>

            {/* Technologies */}
            <div className="space-y-3">
              <label className="block text-white font-medium">
                Technologies Used
              </label>
              
              {/* Technology Tags */}
              {project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-white/20 text-white rounded-full text-sm"
                    >
                      <span>{tech}</span>
                      <button
                        type="button"
                        onClick={() => removeTechnology(tech)}
                        className="text-white/70 hover:text-white"
                      >
                        <X className="w-3 h-3" />
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
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => addTechnology(newTechnology)}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Popular Technologies */}
              <div className="space-y-2">
                <p className="text-white/70 text-sm">Popular technologies:</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_TECHNOLOGIES.filter(tech => !project.technologies.includes(tech)).slice(0, 8).map((tech) => (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => addTechnology(tech)}
                      className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-sm hover:bg-white/20 transition-colors"
                    >
                      {tech}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Project Links */}
            <div className="space-y-3">
              <label className="block text-white font-medium">
                Project Links
              </label>

              {/* Existing Links */}
              {project.links.length > 0 && (
                <div className="space-y-2">
                  {project.links.map((link, linkIndex) => {
                    const LinkIcon = LINK_TYPES.find(type => type.value === link.type)?.icon || Github;
                    return (
                      <div
                        key={linkIndex}
                        className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg"
                      >
                        <LinkIcon className="w-5 h-5 text-white/70" />
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            {LINK_TYPES.find(type => type.value === link.type)?.label}
                          </p>
                          <p className="text-white/70 text-sm truncate">{link.url}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLink(linkIndex)}
                          className="text-red-300 hover:text-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add New Link */}
              <div className="space-y-3 p-4 bg-white/5 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select
                    value={newLink.type}
                    onChange={(e) => setNewLink({ ...newLink, type: e.target.value as ProjectLink['type'] })}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                  >
                    {LINK_TYPES.map((type) => (
                      <option key={type.value} value={type.value} className="bg-gray-800">
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="url"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    placeholder="https://..."
                    className="md:col-span-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                  />
                </div>
                <button
                  type="button"
                  onClick={addLink}
                  disabled={!newLink.url.trim()}
                  className="w-full px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
