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
      case 'general':
      default:
        return 'badge-neutral';
    }
  };

  return (
    <div
      className={`card bg-white shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onSelect(template)}
    >
      <div className="card-body">
        <div className="flex items-start justify-between mb-2">
          <DocumentTextIcon className="w-8 h-8 text-gray-400" />
          {isSelected && <CheckCircleIcon className="w-6 h-6 text-primary" />}
        </div>

        <h3 className="card-title text-lg">{template.name}</h3>
        <p className="text-gray-600 text-sm mb-3">{template.description}</p>

        <div className="flex justify-between items-center">
          <span className={`badge ${getCategoryColor(template.category)} badge-sm`}>
            {template.category}
          </span>
          <button className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'}`}>
            {isSelected ? 'Selected' : 'Select'}
          </button>
        </div>

        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
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
