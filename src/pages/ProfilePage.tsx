import { useEffect, useState } from 'react';
import { User, Mail, Calendar, ShieldCheck, Film, ShieldX, Target, Edit3, Check } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Card, StatCard } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/analysis';
import type { Analysis } from '@/lib/types';

export function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.full_name ?? '');
  const [saving, setSaving] = useState(false);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setAnalyses((data as Analysis[]) ?? []));
  }, [user]);

  const fakeCount = analyses.filter((a) => a.prediction === 'FAKE').length;
  const realCount = analyses.filter((a) => a.prediction === 'REAL').length;
  const avgConfidence = analyses.length
    ? (analyses.reduce((s, a) => s + Number(a.confidence), 0) / analyses.length).toFixed(1)
    : '0.0';

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: name.trim() || null, updated_at: new Date().toISOString() })
      .eq('id', user!.id);
    setSaving(false);
    if (!error) {
      await refreshProfile();
      setEditing(false);
    }
  };

  return (
    <AppShell>
      <div className="animate-fade-in">
        <h1 className="font-display text-3xl font-semibold mb-8">Profile</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* profile card */}
          <Card className="p-6 text-center">
            <div
              className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center font-display text-3xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-accent-500))' }}
            >
              {(profile?.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </div>
            <h2 className="mt-4 font-display text-xl font-semibold">
              {profile?.full_name || user?.email?.split('@')[0] || 'User'}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-soft)' }}>{user?.email}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ background: 'color-mix(in srgb, var(--color-accent-500) 14%, transparent)', color: 'var(--color-accent-500)' }}>
              <ShieldCheck size={12} />
              Verified Member
            </div>

            <div className="mt-6 pt-5 border-t space-y-3 text-left" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3 text-sm">
                <Mail size={15} style={{ color: 'var(--text-muted)' }} />
                <span className="truncate" style={{ color: 'var(--text-soft)' }}>{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={15} style={{ color: 'var(--text-muted)' }} />
                <span style={{ color: 'var(--text-soft)' }}>Joined {profile ? formatDate(profile.created_at) : '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <User size={15} style={{ color: 'var(--text-muted)' }} />
                <span style={{ color: 'var(--text-soft)' }}>{profile?.full_name || 'No name set'}</span>
              </div>
            </div>
          </Card>

          {/* stats + edit */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Total" value={analyses.length} icon={<Film size={18} />} accent="brand" />
              <StatCard label="Fake" value={fakeCount} icon={<ShieldX size={18} />} accent="error" />
              <StatCard label="Real" value={realCount} icon={<ShieldCheck size={18} />} accent="success" />
              <StatCard label="Avg Conf." value={`${avgConfidence}%`} icon={<Target size={18} />} accent="accent" />
            </div>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-lg font-semibold">Account Details</h2>
                {!editing ? (
                  <Button variant="ghost" size="sm" onClick={() => { setName(profile?.full_name ?? ''); setEditing(true); }}>
                    <Edit3 size={14} /> Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                    <Button size="sm" onClick={save} disabled={saving}>
                      {saving ? 'Saving...' : <><Check size={14} /> Save</>}
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-soft)' }}>Full Name</label>
                  {editing ? (
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2"
                      style={{ background: 'var(--bg-soft)', borderColor: 'var(--border)', color: 'var(--text)' }}
                      placeholder="Your name"
                    />
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--text)' }}>{profile?.full_name || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-soft)' }}>Email</label>
                  <p className="text-sm" style={{ color: 'var(--text)' }}>{user?.email}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-soft)' }}>User ID</label>
                  <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{user?.id}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
