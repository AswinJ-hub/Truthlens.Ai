import { ShieldCheck, ScanSearch, Eye, Activity, FileCheck, Zap, Lock, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';

export function LandingPage() {
  const { navigate } = useRouter();
  const { session } = useAuth();

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* background */}
      <div className="absolute inset-0 bg-grid bg-grid-pan opacity-40" />
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[120px] opacity-25"
        style={{ background: 'radial-gradient(circle, var(--color-brand-500), transparent 70%)' }}
      />
      <div
        className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20"
        style={{ background: 'radial-gradient(circle, var(--color-accent-500), transparent 70%)' }}
      />

      {/* nav */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          {session && (
            <Button size="sm" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
          )}
        </div>
      </header>

      {/* hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium mb-8 animate-fade-in"
          style={{ background: 'color-mix(in srgb, var(--color-brand-500) 12%, transparent)', color: 'var(--color-brand-300)', border: '1px solid color-mix(in srgb, var(--color-brand-500) 30%, transparent)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--color-accent-500)' }} />
          AI-Powered Deepfake Detection
        </div>

        <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight animate-fade-in">
          See past the <span className="gradient-text">synthetic</span>.
          <br />
          Know what's <span className="gradient-text">real</span>.
        </h1>

        <p
          className="mt-6 max-w-2xl mx-auto text-lg leading-relaxed animate-fade-in"
          style={{ color: 'var(--text-soft)', animationDelay: '0.1s' }}
        >
          TruthLens AI analyzes every frame of your video to detect AI-generated
          content and deepfakes — facial consistency, lip-sync, texture, and
          temporal coherence, in seconds. No account required.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Button size="lg" onClick={() => navigate('/analyze')} className="group">
            <ScanSearch size={18} />
            Analyze a Video
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Button>
          {session && (
            <Button size="lg" variant="secondary" onClick={() => navigate('/dashboard')}>
              View Dashboard
            </Button>
          )}
        </div>

        {/* privacy note under hero CTA */}
        <div className="mt-6 flex items-start justify-center gap-2 max-w-lg mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Lock size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
          <p className="text-xs leading-relaxed text-left" style={{ color: 'var(--text-muted)' }}>
            Videos are processed in your browser and never stored beyond your session.
            Do not upload videos containing sensitive or private content unless you have permission.
          </p>
        </div>

        {/* hero visual */}
        <div className="mt-20 relative max-w-4xl mx-auto animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <div
            className="relative rounded-2xl border p-1.5 shadow-2xl"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.5)' }}
          >
            <div className="rounded-xl overflow-hidden relative" style={{ background: 'var(--bg-elevated)' }}>
              {/* scan visualization */}
              <div className="aspect-video relative flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-soft))' }}>
                <div className="absolute inset-0 bg-grid opacity-30" />
                {/* face wireframe */}
                <div className="relative animate-float">
                  <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
                    <ellipse cx="90" cy="95" rx="55" ry="68" stroke="var(--color-brand-400)" strokeWidth="1.5" opacity="0.6" />
                    <circle cx="68" cy="80" r="6" stroke="var(--color-accent-400)" strokeWidth="1.5" />
                    <circle cx="112" cy="80" r="6" stroke="var(--color-accent-400)" strokeWidth="1.5" />
                    <path d="M75 110 Q90 120 105 110" stroke="var(--color-accent-400)" strokeWidth="1.5" fill="none" />
                    <path d="M90 30 L90 50 M40 60 L55 70 M140 60 L125 70 M35 100 L50 105 M145 100 L130 105" stroke="var(--color-brand-400)" strokeWidth="1" opacity="0.4" />
                    <circle cx="90" cy="95" r="3" fill="var(--color-accent-400)" />
                  </svg>
                </div>
                {/* scan line */}
                <div
                  className="absolute left-0 right-0 h-px"
                  style={{
                    background: 'linear-gradient(90deg, transparent, var(--color-accent-400), transparent)',
                    boxShadow: '0 0 12px var(--color-accent-400)',
                    animation: 'scan 3s ease-in-out infinite',
                  }}
                />
                {/* corner brackets */}
                {['top-3 left-3 border-t-2 border-l-2', 'top-3 right-3 border-t-2 border-r-2', 'bottom-3 left-3 border-b-2 border-l-2', 'bottom-3 right-3 border-b-2 border-r-2'].map((c) => (
                  <span key={c} className={`absolute w-6 h-6 rounded-sm ${c}`} style={{ borderColor: 'var(--color-brand-400)' }} />
                ))}
              </div>

              {/* result bar */}
              <div className="flex items-center justify-between px-5 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-error-500)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-soft)' }}>Detection: FAKE</span>
                </div>
                <span className="font-display text-sm font-semibold" style={{ color: 'var(--color-error-500)' }}>97.4% confidence</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* features */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold">Multi-layer detection engine</h2>
          <p className="mt-3 max-w-xl mx-auto" style={{ color: 'var(--text-soft)' }}>
            Four specialized analysis passes combine into a single, explainable verdict.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: Eye, title: 'Face Consistency', desc: 'Landmark tracking detects warped geometry and blending seams.', color: 'var(--color-brand-500)' },
            { icon: Activity, title: 'Lip-Sync Analysis', desc: 'Audio-to-mouth alignment flags dubbed or synthetic speech.', color: 'var(--color-accent-500)' },
            { icon: ScanSearch, title: 'Visual Artifacts', desc: 'Texture and frequency analysis reveals GAN fingerprints.', color: 'var(--color-warning-500)' },
            { icon: Zap, title: 'Temporal Coherence', desc: 'Frame-to-frame motion vectors expose interpolation glitches.', color: 'var(--color-success-500)' },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1.5 animate-fade-in"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', animationDelay: `${i * 0.08}s` }}
              >
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-xl mb-4 transition-transform group-hover:scale-110"
                  style={{ background: `color-mix(in srgb, ${f.color} 16%, transparent)`, color: f.color }}
                >
                  <Icon size={22} />
                </div>
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-soft)' }}>
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* how it works */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold">From upload to verdict in seconds</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: ScanSearch, step: '01', title: 'Upload your video', desc: 'Drag in an MP4, MOV, AVI, or MKV. Preview it instantly before analysis.' },
            { icon: Activity, step: '02', title: 'AI runs the analysis', desc: 'Our model extracts frames and runs four detection passes with live progress.' },
            { icon: FileCheck, step: '03', title: 'Get your report', desc: 'A detailed verdict with scores, explanation, and a downloadable PDF.' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="relative rounded-2xl border p-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <span className="font-display text-5xl font-bold opacity-10 absolute top-4 right-5" style={{ color: 'var(--color-brand-500)' }}>
                  {s.step}
                </span>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{ background: 'color-mix(in srgb, var(--color-brand-500) 16%, transparent)', color: 'var(--color-brand-400)' }}>
                  <Icon size={22} />
                </div>
                <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-soft)' }}>{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* trust */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { icon: Lock, title: 'Private by design', desc: 'Your videos are analyzed in-browser and never stored beyond your session.' },
            { icon: BarChart3, title: 'Explainable scores', desc: 'Every verdict breaks down into four measurable sub-scores.' },
            { icon: CheckCircle2, title: 'Exportable reports', desc: 'Download a PDF or share your result with a single click.' },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.title} className="flex items-start gap-4 rounded-2xl border p-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0" style={{ background: 'color-mix(in srgb, var(--color-accent-500) 16%, transparent)', color: 'var(--color-accent-500)' }}>
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className="font-medium">{t.title}</h3>
                  <p className="mt-1 text-sm" style={{ color: 'var(--text-soft)' }}>{t.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <div
          className="relative rounded-3xl border p-10 sm:p-16 text-center overflow-hidden"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="absolute inset-0 opacity-30 bg-grid" />
          <div
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full blur-[80px] opacity-40"
            style={{ background: 'radial-gradient(circle, var(--color-brand-500), transparent 70%)' }}
          />
          <div className="relative">
            <ShieldCheck size={48} className="mx-auto mb-5" style={{ color: 'var(--color-accent-500)' }} />
            <h2 className="font-display text-3xl sm:text-4xl font-semibold">Start detecting deepfakes today</h2>
            <p className="mt-3 max-w-md mx-auto" style={{ color: 'var(--text-soft)' }}>
              No account needed — upload a video and get your analysis in seconds.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" onClick={() => navigate('/analyze')} className="group">
                <ScanSearch size={18} />
                Analyze a Video
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="relative z-10 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size={28} />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} TruthLens AI · Built for a more trustworthy web.
          </p>
        </div>
      </footer>
    </div>
  );
}
