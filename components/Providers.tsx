'use client';

import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/lib/ThemeContext';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
