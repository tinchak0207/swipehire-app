'use client';

import { CheckCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import type { TemplateCardProps } from '@/lib/types/resume-optimizer';

/**
 * Template card component for displaying resume templates
 */
const TemplateCard: React.FC<TemplateCardProps> = ({ template, isSelected, onSelect }) => {
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'tech':
        return 'badge-primary';
      case 'business':
        return 'badge-success';
      case 'creative':
        return 'badge-warning';
      case 'healthcare':
        return 'badge-info';
      case 'education':
        return 'badge-secondary';
      default:
        return 'badge-neutral';
    }
  };

  return (
    <div
      className={`card cursor-pointer bg-white shadow-lg transition-all duration-200 hover:shadow-xl ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onSelect(template)}
    >
      <div className="card-body">
        <div className="mb-2 flex items-start justify-between">
          <DocumentTextIcon className="h-8 w-8 text-gray-400" />
          {isSelected && <CheckCircleIcon className="h-6 w-6 text-primary" />}
        </div>

        <h3 className="card-title text-lg">{template.name}</h3>
        <p className="mb-3 text-gray-600 text-sm">{template.description}</p>

        <div className="flex items-center justify-between">
          <span className={`badge ${getCategoryColor(template.category)} badge-sm`}>
            {template.category}
          </span>
          <button className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'}`}>
            {isSelected ? 'Selected' : 'Select'}
          </button>
        </div>

        {template.tags && template.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="badge badge-outline badge-xs">
                {tag}
              </span>
            ))}
            {template.tags.length > 3 && (
              <span className="badge badge-outline badge-xs">+{template.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateCard;
