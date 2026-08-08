import { type ReactNode } from 'react';
import { Navbar } from '@/components/Navbar';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
