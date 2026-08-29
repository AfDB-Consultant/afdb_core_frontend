'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, onCheckedChange, checked, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    if (label) {
      return (
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div className="relative">
            <input
              type="checkbox"
              ref={ref}
              checked={checked}
              onChange={handleChange}
              className="peer sr-only"
              {...props}
            />
            <div className={cn(
              'h-4 w-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[rgb(15,15,15)] transition-colors',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-[#009A44]/30 peer-focus-visible:border-[#009A44]',
              'peer-checked:bg-[#009A44] peer-checked:border-[#009A44]',
              'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
              className
            )}>
              <div className="flex items-center justify-center h-full">
                {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
              </div>
            </div>
          </div>
          <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
        </label>
      );
    }

    return (
      <div className="relative">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={handleChange}
          className="peer sr-only"
          {...props}
        />
        <div className={cn(
          'h-4 w-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[rgb(15,15,15)] transition-colors cursor-pointer',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-[#009A44]/30 peer-focus-visible:border-[#009A44]',
          'peer-checked:bg-[#009A44] peer-checked:border-[#009A44]',
          'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
          className
        )}>
          <div className="flex items-center justify-center h-full">
            {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
          </div>
        </div>
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
