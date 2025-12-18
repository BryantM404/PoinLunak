// Toast provider component using Sonner

'use client';

import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#fff',
          color: '#6B3E1D',
          border: '1px solid #DDBA72',
        },
        className: 'my-toast',
        duration: 3000,
      }}
    />
  );
}
