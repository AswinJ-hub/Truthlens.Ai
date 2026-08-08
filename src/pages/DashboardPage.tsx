import { useEffect, useState } from 'react';
import { Film, ShieldX, ShieldCheck, Target, ScanSearch, ArrowRight, Clock, TrendingUp } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Card, StatCard } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';
import { supabase } from '@/lib/supabase';
import type { Analysis } from '@/lib/types';
import { formatDate } from '@/lib/analysis';

export function DashboardPage() {
  const { user, profile } = useAuth();
  const { navigate } = useRouter();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setAnalyses((data as Analysis[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  const total = analyses.length;
  const fakeCount = analyses.filter((a) => a.prediction === 'FAKE').length;
  const realCount = analyses.filter((a) => a.prediction === 'REAL').length;
  const avgConfidence = total ? (analyses.reduce((s, a) => s + Number(a.confidence), 0) / total).toFixed(1) : '0.0';
  const accuracy = total ? Math.round((realCount / total) * 100) : 0;

  const recent = analyses.slice(0, 5);

  return (
    <AppShell>
      <div className="animate-fade-in">
        {/* welcome */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold">
              Welcome back, <span className="gradient-text">{profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'}</span>
            </h1>
            <p className="mt-1.5 text-sm" style={{ color: 'var(--text-soft)' }}>
              {total === 0 ? "Run your first analysis to see insights here." : `${total} videos analyzed so far.`}
            </p>
          </div>
          <Button onClick={() => navigate('/analyze')}>
            <ScanSearch size={16} />
            New Analysis
          </Button>
        </div>

        {/* stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total Analyzed" value={total} icon={<Film size={18} />} accent="brand" />
          <StatCard label="Fake Detected" value={fakeCount} icon={<ShieldX size={18} />} accent="error" />
          <StatCard label="Real Detected" value={realCount} icon={<ShieldCheck size={18} />} accent="success" />
          <StatCard label="Avg Confidence" value={`${avgConfidence}%`} icon={<Target size={18} />} accent="accent" />
          <StatCard label="Accuracy Rate" value={`${accuracy}%`} icon={<TrendingUp size={18} />} accent="warning" />
        </div>

        {/* recent history */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Clock size={18} style={{ color: 'var(--color-brand-400)' }} />
                <h2 className="font-display text-lg font-semibold">Recent Analysis</h2>
              </div>
              <button onClick={() => navigate('/history')} className="text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: 'var(--color-brand-400)' }}>
                View all <ArrowRight size={12} />
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-xl shimmer" />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl mx-auto mb-4" style={{ background: 'color-mix(in srgb, var(--color-brand-500) 12%, transparent)', color: 'var(--color-brand-400)' }}>
                  <ScanSearch size={24} />
                </div>
                <h3 className="font-medium">No analyses yet</h3>
                <p className="mt-1 text-sm" style={{ color: 'var(--text-soft)' }}>Upload your first video to get started.</p>
                <Button className="mt-5" size="sm" onClick={() => navigate('/analyze')}>
                  Analyze a video
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recent.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 rounded-xl border transition-colors hover:bg-[color-mix(in_srgb,var(--text)_4%,transparent)]"
                    style={{ borderColor: 'var(--border-soft)' }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                        style={{
                          background: a.prediction === 'FAKE'
                            ? 'color-mix(in srgb, var(--color-error-500) 14%, transparent)'
                            : 'color-mix(in srgb, var(--color-success-500) 14%, transparent)',
                          color: a.prediction === 'FAKE' ? 'var(--color-error-500)' : 'var(--color-success-500)',
                        }}
                      >
                        {a.prediction === 'FAKE' ? <ShieldX size={18} /> : <ShieldCheck size={18} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{a.file_name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(a.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{
                          background: a.prediction === 'FAKE'
                            ? 'color-mix(in srgb, var(--color-error-500) 14%, transparent)'
                            : 'color-mix(in srgb, var(--color-success-500) 14%, transparent)',
                          color: a.prediction === 'FAKE' ? 'var(--color-error-500)' : 'var(--color-success-500)',
                        }}
                      >
                        {a.prediction}
                      </span>
                      <span className="text-sm font-semibold font-display w-14 text-right">{Number(a.confidence).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* quick action */}
          <Card className="p-6 relative overflow-hidden">
            <div
              className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20"
              style={{ background: 'var(--color-brand-500)' }}
            />
            <div className="relative">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{ background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-accent-500))', color: '#fff' }}>
                <ScanSearch size={22} />
              </div>
              <h2 className="font-display text-lg font-semibold">Quick Analysis</h2>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-soft)' }}>
                Upload a video and get a full deepfake report in seconds.
              </p>
              <Button className="mt-5" fullWidth onClick={() => navigate('/analyze')}>
                Upload Video
                <ArrowRight size={15} />
              </Button>
            </div>

            <div className="mt-6 pt-5 border-t" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Supported formats</h3>
              <div className="flex flex-wrap gap-1.5">
                {['MP4', 'MOV', 'AVI', 'MKV'].map((f) => (
                  <span key={f} className="text-xs px-2.5 py-1 rounded-lg border" style={{ borderColor: 'var(--border)', color: 'var(--text-soft)' }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
