
'use client';

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };
  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizes[size]} border-2 border-[#875600] border-t-transparent rounded-full animate-spin`}
        aria-label="Loading"
      ></div>
    </div>
  );
}
