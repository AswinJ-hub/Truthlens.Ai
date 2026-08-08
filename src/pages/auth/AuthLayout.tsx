import { type ReactNode } from 'react';
import { Logo } from '@/components/Logo';
import { useRouter } from '@/context/RouterContext';
import { ShieldCheck, ScanSearch, Eye, Activity } from 'lucide-react';

export function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ background: 'var(--bg)' }}>
      {/* left brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden" style={{ background: 'var(--bg-soft)' }}>
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-[120px] opacity-30"
          style={{ background: 'radial-gradient(circle, var(--color-brand-500), transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 -right-20 w-[400px] h-[400px] rounded-full blur-[120px] opacity-20"
          style={{ background: 'radial-gradient(circle, var(--color-accent-500), transparent 70%)' }}
        />

        <div className="relative">
          <button onClick={() => navigate('/')}>
            <Logo />
          </button>
        </div>

        <div className="relative">
          <ShieldCheck size={40} className="mb-5" style={{ color: 'var(--color-accent-500)' }} />
          <h2 className="font-display text-3xl font-semibold leading-tight max-w-sm">
            Detect AI-generated videos with <span className="gradient-text">surgical precision</span>.
          </h2>
          <p className="mt-4 max-w-sm" style={{ color: 'var(--text-soft)' }}>
            Four specialized analysis passes — facial consistency, lip-sync, texture, and temporal coherence — combine into one explainable verdict.
          </p>

          <div className="mt-8 space-y-3 max-w-sm">
            {[
              { icon: Eye, label: 'Face consistency scoring' },
              { icon: Activity, label: 'Lip-sync & blink analysis' },
              { icon: ScanSearch, label: 'Visual artifact detection' },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-soft)' }}>
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: 'color-mix(in srgb, var(--color-accent-500) 14%, transparent)', color: 'var(--color-accent-500)' }}>
                    <Icon size={15} />
                  </div>
                  {f.label}
                </div>
              );
            })}
          </div>
        </div>

        <p className="relative text-xs" style={{ color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} TruthLens AI
        </p>
      </div>

      {/* right form panel */}
      <div className="flex flex-col items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex justify-center">
            <button onClick={() => navigate('/')}>
              <Logo />
            </button>
          </div>
          <h1 className="font-display text-2xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-soft)' }}>{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function AuthInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon,
  error,
  autoComplete,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: ReactNode;
  error?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-soft)' }}>
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2"
          style={{
            background: 'var(--bg-card)',
            borderColor: error ? 'var(--color-error-500)' : 'var(--border)',
            color: 'var(--text)',
            paddingLeft: icon ? '2.75rem' : undefined,
            // @ts-expect-error custom prop
            '--tw-ring-color': 'var(--ring)',
          }}
        />
      </div>
      {error && <p className="mt-1.5 text-xs" style={{ color: 'var(--color-error-500)' }}>{error}</p>}
    </div>
  );
}
