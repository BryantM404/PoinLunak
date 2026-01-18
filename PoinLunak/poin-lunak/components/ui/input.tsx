
'use client';

import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-[#875600] mb-1">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-3 py-1.5 border border-[#d1d5db] rounded-md focus:border-[#875600] focus:ring-0 text-sm',
          error ? 'border-red-500' : '',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
