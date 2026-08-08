import { ShieldCheck } from 'lucide-react';

export function Logo({ size = 36, className = '' }: { size?: number; className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="relative flex items-center justify-center rounded-xl"
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-accent-500))',
          boxShadow: '0 8px 24px -8px var(--color-brand-500)',
        }}
      >
        <ShieldCheck size={size * 0.6} color="#fff" strokeWidth={2.4} />
        <span
          className="absolute inset-0 rounded-xl"
          style={{ border: '1px solid rgba(255,255,255,0.18)' }}
        />
      </div>
      <span className="font-display text-lg font-semibold tracking-tight">
        Truth<span className="gradient-text">Lens</span>
        <span className="ml-1 text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
          AI
        </span>
      </span>
    </div>
  );
}
