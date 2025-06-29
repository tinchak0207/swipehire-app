declare module '@/components/ui/tag-input' {
  import { FC } from 'react';

  interface TagInputProps {
    tags: string[];
    setTags: (tags: string[]) => void;
    placeholder?: string;
  }

  export const TagInput: FC<TagInputProps>;
}
