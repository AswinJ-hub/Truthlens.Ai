import { useEffect, useState } from 'react';
import { History as HistoryIcon, ShieldX, ShieldCheck, Download, Trash2, ScanSearch, AlertCircle, Search } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';
import { supabase } from '@/lib/supabase';
import type { Analysis } from '@/lib/types';
import { formatDate, formatFileSize } from '@/lib/analysis';

export function HistoryPage() {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = () => {
    if (!user) return;
    setLoading(true);
    supabase
      .from('analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setAnalyses((data as Analysis[]) ?? []);
        setLoading(false);
      });
  };

  useEffect(load, [user]);

  const deleteOne = async (id: string) => {
    const { error } = await supabase.from('analyses').delete().eq('id', id);
    if (error) return;
    setAnalyses((prev) => prev.filter((a) => a.id !== id));
    setConfirmDelete(null);
  };

  const deleteAll = async () => {
    if (!user) return;
    const { error } = await supabase.from('analyses').delete().eq('user_id', user.id);
    if (error) return;
    setAnalyses([]);
    setConfirmDelete(null);
  };

  const downloadReport = (a: Analysis) => {
    const text = `TruthLens AI Report\n\nFile: ${a.file_name}\nPrediction: ${a.prediction}\nConfidence: ${a.confidence}%\nRisk: ${a.risk_level}\n\n${a.summary}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `truthlens-${a.id.slice(0, 8)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filtered = analyses.filter((a) =>
    a.file_name.toLowerCase().includes(query.toLowerCase()) || a.prediction.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <AppShell>
      <div className="animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold">Analysis History</h1>
            <p className="mt-1.5 text-sm" style={{ color: 'var(--text-soft)' }}>
              {analyses.length} {analyses.length === 1 ? 'video' : 'videos'} analyzed.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate('/analyze')}>
              <ScanSearch size={15} />
              New Analysis
            </Button>
            {analyses.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete('all')}>
                <Trash2 size={15} />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {analyses.length > 0 && (
          <div className="mb-5 relative max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by file name or result..."
              className="w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-xl shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-16 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl mx-auto mb-5" style={{ background: 'color-mix(in srgb, var(--color-brand-500) 12%, transparent)', color: 'var(--color-brand-400)' }}>
              <HistoryIcon size={28} />
            </div>
            <h3 className="font-display text-lg font-semibold">
              {query ? 'No results found' : 'No history yet'}
            </h3>
            <p className="mt-1.5 text-sm" style={{ color: 'var(--text-soft)' }}>
              {query ? 'Try a different search term.' : 'Your analyzed videos will appear here.'}
            </p>
            {!query && (
              <Button className="mt-5" size="sm" onClick={() => navigate('/analyze')}>
                <ScanSearch size={15} />
                Analyze a Video
              </Button>
            )}
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b text-xs font-medium uppercase tracking-wider" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-soft)' }}>
              <div className="col-span-5">File</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Prediction</div>
              <div className="col-span-1">Confidence</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border-soft)' }}>
              {filtered.map((a) => (
                <div key={a.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[color-mix(in_srgb,var(--text)_3%,transparent)] transition-colors">
                  <div className="md:col-span-5 flex items-center gap-3 min-w-0">
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
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatFileSize(a.file_size)}</p>
                    </div>
                  </div>
                  <div className="md:col-span-2 text-sm" style={{ color: 'var(--text-soft)' }}>
                    {formatDate(a.created_at)}
                  </div>
                  <div className="md:col-span-2">
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
                  </div>
                  <div className="md:col-span-1 text-sm font-semibold font-display">{Number(a.confidence).toFixed(1)}%</div>
                  <div className="md:col-span-2 flex items-center gap-1 md:justify-end">
                    <button
                      onClick={() => downloadReport(a)}
                      className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-[color-mix(in_srgb,var(--text)_8%,transparent)]"
                      style={{ color: 'var(--text-soft)' }}
                      title="Download report"
                    >
                      <Download size={15} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(a.id)}
                      className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-[color-mix(in_srgb,var(--color-error-500)_12%,transparent)]"
                      style={{ color: 'var(--text-soft)' }}
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* delete confirm modal */}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in-slow" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setConfirmDelete(null)}>
            <Card className="p-6 max-w-sm w-full animate-scale-in" >
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl mx-auto mb-4" style={{ background: 'color-mix(in srgb, var(--color-error-500) 14%, transparent)', color: 'var(--color-error-500)' }}>
                <AlertCircle size={24} />
              </div>
              <h3 className="font-display text-lg font-semibold text-center">
                {confirmDelete === 'all' ? 'Delete all history?' : 'Delete this analysis?'}
              </h3>
              <p className="mt-2 text-sm text-center" style={{ color: 'var(--text-soft)' }}>
                {confirmDelete === 'all' ? 'This will permanently delete all your analysis records.' : 'This action cannot be undone.'}
              </p>
              <div className="mt-6 flex gap-3">
                <Button variant="secondary" fullWidth onClick={() => setConfirmDelete(null)}>
                  Cancel
                </Button>
                <Button variant="danger" fullWidth onClick={() => (confirmDelete === 'all' ? deleteAll() : deleteOne(confirmDelete))}>
                  Delete
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
