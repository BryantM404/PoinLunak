
'use client';

import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none border';
  const variants = {
    primary: 'bg-white text-[#6B3E1D] border-[#6B3E1D] hover:bg-[#f3e7d1] hover:border-[#DDBA72] active:bg-[#f3e7d1] active:border-[#c9a860]',
    secondary: 'bg-[#f3f4f6] text-[#6B3E1D] border-[#d1d5db] hover:bg-[#e5e7eb] hover:border-[#bfc3c9] active:bg-[#d1d5db] active:border-[#a3a8b0]',
    outline: 'bg-white text-[#6B3E1D] border-[#6B3E1D] hover:bg-[#f3e7d1] hover:border-[#DDBA72] active:bg-[#f3e7d1] active:border-[#c9a860]',
    danger: 'bg-[#6B3E1D] text-white border-[#6B3E1D] hover:bg-[#4e2710] hover:border-[#4e2710] active:bg-[#4e2710] active:border-[#4e2710]',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg',
  };
  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
