import { useEffect, useState } from 'react';
import { getAnalysisSteps } from '@/lib/analysis';

export function AnalysisLoader({ onComplete }: { onComplete: () => void }) {
  const steps = getAnalysisSteps();
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    let raf: number;
    let start: number | null = null;
    const duration = 5200;

    const tick = (ts: number) => {
      if (start === null) start = ts;
      const elapsed = ts - start;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);
      setStepIdx(Math.min(steps.length - 1, Math.floor((pct / 100) * steps.length)));
      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(onComplete, 450);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onComplete, steps.length]);

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
      <div className="relative w-44 h-44">
        {/* pulse rings */}
        <span
          className="absolute inset-0 rounded-full"
          style={{ border: '2px solid var(--color-brand-500)', animation: 'pulse-ring 2.4s ease-out infinite' }}
        />
        <span
          className="absolute inset-0 rounded-full"
          style={{ border: '2px solid var(--color-accent-500)', animation: 'pulse-ring 2.4s ease-out infinite 1.2s' }}
        />

        <svg className="w-full h-full -rotate-90 relative" viewBox="0 0 160 160">
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth="6"
          />
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke="url(#grad)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
          />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-brand-400)" />
              <stop offset="100%" stopColor="var(--color-accent-400)" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-4xl font-semibold gradient-text">
            {Math.round(progress)}%
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] mt-1" style={{ color: 'var(--text-muted)' }}>
            Analyzing
          </span>
        </div>
      </div>

      <div className="mt-10 w-full max-w-md">
        <div className="flex items-center gap-3 justify-center">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: 'var(--color-accent-500)' }}
          />
          <p className="text-sm font-medium" style={{ color: 'var(--text-soft)' }}>
            {steps[stepIdx]}
          </p>
        </div>

        <div className="mt-5 space-y-1.5">
          {steps.map((s, i) => {
            const done = i < stepIdx;
            const active = i === stepIdx;
            return (
              <div
                key={s}
                className="flex items-center gap-2.5 text-xs transition-all duration-300"
                style={{
                  color: done ? 'var(--text-muted)' : active ? 'var(--text)' : 'var(--text-muted)',
                  opacity: done ? 0.5 : active ? 1 : 0.4,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: done ? 'var(--color-success-500)' : active ? 'var(--color-brand-400)' : 'var(--border)',
                  }}
                />
                {s}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
