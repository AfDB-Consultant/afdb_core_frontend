'use client';

import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';

type DatePickerProps = {
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
};

export function DatePicker({ value, onChange, placeholder = 'Pick a date', disabled, error, className }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState<Date>(() => {
    if (value) return new Date(value);
    return new Date();
  });

  const selected = value ? new Date(value) : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const iso = format(date, 'yyyy-MM-dd');
      onChange?.(iso);
      setOpen(false);
    }
  };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-[#009A44]/20 focus:border-[#009A44]',
            error
              ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20'
              : 'border-gray-200 dark:border-[rgb(30,30,30)] bg-white dark:bg-[rgb(15,15,15)]',
            'text-gray-900 dark:text-gray-100',
            disabled && 'cursor-not-allowed opacity-50',
            className
          )}
        >
          <span className={cn('flex items-center gap-2', !value && 'text-gray-400 dark:text-gray-500')}>
            <CalendarIcon className="w-4 h-4 shrink-0" />
            {selected ? format(selected, 'MMM d, yyyy') : placeholder}
          </span>
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Content
        align="start"
        sideOffset={4}
        className="z-[60] rounded-lg border border-gray-200 dark:border-[rgb(30,30,30)] bg-white dark:bg-[rgb(15,15,15)] shadow-lg outline-none"
      >
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          month={month}
          onMonthChange={setMonth}
          showOutsideDays
          classNames={{
            months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 p-3',
            month: 'space-y-4',
            month_caption: 'flex justify-center pt-1 relative items-center',
            caption_label: 'text-sm font-medium text-gray-900 dark:text-gray-100',
            nav: 'space-x-1 flex items-center',
            button_previous: cn(
              'absolute left-1 top-1 inline-flex items-center justify-center h-7 w-7 rounded-md text-gray-500 dark:text-gray-400',
              'hover:bg-gray-100 dark:hover:bg-[rgb(25,25,25)] transition-colors'
            ),
            button_next: cn(
              'absolute right-1 top-1 inline-flex items-center justify-center h-7 w-7 rounded-md text-gray-500 dark:text-gray-400',
              'hover:bg-gray-100 dark:hover:bg-[rgb(25,25,25)] transition-colors'
            ),
            chevron: 'h-4 w-4',
            weekdays: 'flex',
            weekday: 'text-gray-500 dark:text-gray-400 rounded-md w-9 font-normal text-[0.8rem]',
            week: 'flex w-full mt-2',
            day: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-green-50/50 [&:has([aria-selected])]:bg-green-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md dark:[&:has([aria-selected].day-outside)]:bg-green-950/50 dark:[&:has([aria-selected])]:bg-green-950/30',
            day_button: cn(
              'inline-flex items-center justify-center h-full w-full rounded-md hover:bg-gray-100 dark:hover:bg-[rgb(25,25,25)] transition-colors',
              'text-gray-700 dark:text-gray-300'
            ),
            selected:
              'bg-[#009A44] text-white hover:bg-[#007a36] hover:text-white focus:bg-[#009A44] focus:text-white',
            today: 'bg-gray-100 dark:bg-[rgb(25,25,25)] font-semibold text-[#009A44]',
            outside: 'text-gray-400 dark:text-gray-600 opacity-50',
            disabled: 'opacity-50 cursor-not-allowed',
            hidden: 'invisible',
          }}
          components={{
            Chevron: ({ orientation }) => {
              const Icon = orientation === 'left' ? ChevronLeft : ChevronRight;
              return <Icon className="h-4 w-4" />;
            },
          }}
        />
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Root>
  );
}
