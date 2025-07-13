'use client';

import type React from 'react';
import { TagInput } from '@/components/ui/tag-input';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onTagsChange,
  placeholder = 'Add tags...',
  maxTags,
}) => {
  return (
    <TagInput
      tags={selectedTags}
      setTags={(tags: string[]) => {
        if (!maxTags || tags.length <= maxTags) {
          onTagsChange(tags);
        }
      }}
      placeholder={placeholder}
    />
  );
};

export default TagSelector;
