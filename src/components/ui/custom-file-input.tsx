'use client';

import { UploadCloud } from 'lucide-react';
import * as React from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Input, type InputProps } from '@/components/ui/input';
import { Label as ShadCnLabel } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// Props that the actual <input type="file" /> will receive.
interface HiddenInputProps extends Omit<InputProps, 'type' | 'value' | 'onChange'> {
  // onChange will be handled internally and then propagated via onFileSelected
}

interface CustomFileInputProps {
  id: string;
  // For RHF, 'name' would be part of field object from Controller
  // For non-RHF, manage value and onChange outside.

  inputProps?: HiddenInputProps; // Props for the hidden <input type="file" />

  // Visuals
  fieldLabel?: string; // e.g., "Avatar Image"
  buttonText?: string;
  buttonVariant?: ButtonProps['variant'];
  buttonIcon?: React.ReactNode;
  selectedFileName?: string | null; // Displayed file name
  fieldDescription?: string;

  // Event handler
  onFileSelected: (file: File | null) => void;

  disabled?: boolean;
  className?: string; // className for the wrapping div
}

const CustomFileInput = React.forwardRef<HTMLInputElement, CustomFileInputProps>(
  (
    {
      id,
      inputProps,
      fieldLabel,
      buttonText = 'Choose File',
      buttonVariant = 'outline',
      buttonIcon,
      selectedFileName,
      fieldDescription,
      onFileSelected,
      disabled,
      className,
    },
    ref
  ) => {
    const internalInputRef = React.useRef<HTMLInputElement>(null);

    const handleNativeInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] || null;
      onFileSelected(file);
      // Reset the input value to allow selecting the same file again if it was cleared
      if (event.target) {
        event.target.value = '';
      }
    };

    const triggerFileDialog = () => {
      internalInputRef.current?.click();
    };

    return (
      <div className={cn('space-y-2', className)}>
        {fieldLabel && <ShadCnLabel className="font-medium text-base">{fieldLabel}</ShadCnLabel>}
        <div className="flex items-center gap-x-3">
          <Button
            type="button"
            variant={buttonVariant}
            onClick={triggerFileDialog}
            disabled={disabled}
            className="shrink-0"
            aria-controls={id}
          >
            {buttonIcon || <UploadCloud className="mr-2 h-4 w-4" />}
            {buttonText}
          </Button>
          <Input
            type="file"
            id={id}
            ref={(node) => {
              // Assign to internalInputRef
              (internalInputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
              // Assign to forwarded ref if provided
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
            className="sr-only"
            onChange={handleNativeInputChange}
            disabled={disabled}
            {...inputProps} // Spread props like 'accept', 'multiple'
          />
          <span
            className="min-w-0 flex-1 truncate text-muted-foreground text-sm"
            aria-live="polite"
          >
            {selectedFileName || 'No file selected'}
          </span>
        </div>
        {fieldDescription && <p className="text-muted-foreground text-xs">{fieldDescription}</p>}
      </div>
    );
  }
);
CustomFileInput.displayName = 'CustomFileInput';

export { CustomFileInput };
