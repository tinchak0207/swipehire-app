'use client';

import type React from 'react';
import { createContext, useContext } from 'react';

interface RadioGroupContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const RadioGroupContext = createContext<RadioGroupContextType | null>(null);

interface RadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const RadioGroup = ({ value, onValueChange, children, className = '' }: RadioGroupProps) => {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div className={`flex flex-col gap-2 ${className}`} role="radiogroup">
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
};

interface RadioGroupItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const RadioGroupItem = ({
  value,
  children,
  className = '',
  disabled = false,
}: RadioGroupItemProps) => {
  const context = useContext(RadioGroupContext);

  if (!context) {
    throw new Error('RadioGroupItem must be used within a RadioGroup');
  }

  const { value: selectedValue, onValueChange } = context;
  const isSelected = selectedValue === value;

  return (
    <label
      className={`flex cursor-pointer items-center gap-2 ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`}
    >
      <input
        type="radio"
        checked={isSelected}
        onChange={() => !disabled && onValueChange(value)}
        disabled={disabled}
        className="radio radio-primary"
        value={value}
      />
      <span>{children}</span>
    </label>
  );
};
