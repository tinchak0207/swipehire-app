'use client';

import type React from 'react';
import { type KeyboardEvent, useState } from 'react';

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  setTags,
  placeholder = 'Add tags...',
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      setTags([...tags, inputValue.trim()]);
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      e.preventDefault();
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="tag-input-container flex flex-wrap items-center gap-2 rounded-lg border border-gray-300 bg-white p-2">
      {tags.map((tag, index) => (
        <div
          key={index}
          className="tag-badge flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-black text-sm"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(index)}
            className="tag-remove-btn text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-w-[100px] flex-1 bg-transparent text-black placeholder-gray-500 outline-none"
      />
    </div>
  );
};
