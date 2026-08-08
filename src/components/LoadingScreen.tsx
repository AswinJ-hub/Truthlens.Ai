import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/Logo';

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--bg)' }}>
      <Logo size={40} />
      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        <Loader2 size={15} className="animate-spin" />
        Loading...
      </div>
    </div>
  );
}
