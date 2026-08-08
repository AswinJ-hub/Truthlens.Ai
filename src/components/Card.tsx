import { type ReactNode } from 'react';

export function Card({
  children,
  className = '',
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border ${hover ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-500/5' : ''} ${className}`}
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border)',
      }}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  accent = 'brand',
  sub,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  accent?: 'brand' | 'accent' | 'success' | 'warning' | 'error';
  sub?: string;
}) {
  const colors: Record<string, string> = {
    brand: 'var(--color-brand-500)',
    accent: 'var(--color-accent-500)',
    success: 'var(--color-success-500)',
    warning: 'var(--color-warning-500)',
    error: 'var(--color-error-500)',
  };
  const c = colors[accent];

  return (
    <Card hover className="p-5 relative overflow-hidden">
      <div
        className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-2xl"
        style={{ background: c }}
      />
      <div className="flex items-start justify-between relative">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            {label}
          </p>
          <p className="mt-2 text-3xl font-display font-semibold" style={{ color: 'var(--text)' }}>
            {value}
          </p>
          {sub && (
            <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              {sub}
            </p>
          )}
        </div>
        <div
          className="flex items-center justify-center w-11 h-11 rounded-xl"
          style={{ background: `color-mix(in srgb, ${c} 16%, transparent)`, color: c }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}
