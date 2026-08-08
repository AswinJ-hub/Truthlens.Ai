import { useState } from 'react';
import { Sun, Moon, Monitor, Bell, Shield, Trash2, AlertCircle, Check } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Theme } from '@/lib/types';

export function SettingsPage() {
  const { user, theme, setTheme, signOut } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);
  const [cleared, setCleared] = useState(false);

  const clearHistory = async () => {
    if (!user) return;
    const { error } = await supabase.from('analyses').delete().eq('user_id', user.id);
    if (!error) {
      setCleared(true);
      setTimeout(() => setCleared(false), 2500);
    }
    setConfirmClear(false);
  };

  const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'light', label: 'Light', icon: Sun },
  ];

  return (
    <AppShell>
      <div className="animate-fade-in max-w-3xl">
        <h1 className="font-display text-3xl font-semibold mb-8">Settings</h1>

        {/* appearance */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Monitor size={18} style={{ color: 'var(--color-brand-400)' }} />
            <h2 className="font-display text-lg font-semibold">Appearance</h2>
          </div>
          <p className="text-sm mb-5" style={{ color: 'var(--text-soft)' }}>Choose how TruthLens looks to you.</p>

          <div className="grid grid-cols-2 gap-3">
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const active = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className="relative rounded-xl border p-5 text-left transition-all"
                  style={{
                    borderColor: active ? 'var(--color-brand-500)' : 'var(--border)',
                    background: active ? 'color-mix(in srgb, var(--color-brand-500) 8%, transparent)' : 'var(--bg-soft)',
                  }}
                >
                  {active && (
                    <span className="absolute top-3 right-3 flex items-center justify-center w-5 h-5 rounded-full" style={{ background: 'var(--color-brand-500)' }}>
                      <Check size={12} color="#fff" />
                    </span>
                  )}
                  <div
                    className="flex items-center justify-center w-11 h-11 rounded-xl mb-3"
                    style={{
                      background: opt.value === 'dark' ? '#0c1322' : '#f4f7fb',
                      color: opt.value === 'dark' ? 'var(--color-brand-400)' : 'var(--color-brand-600)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <p className="font-medium">{opt.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {opt.value === 'dark' ? 'Easy on the eyes' : 'Bright and clear'}
                  </p>
                </button>
              );
            })}
          </div>
        </Card>

        {/* preferences */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Bell size={18} style={{ color: 'var(--color-accent-500)' }} />
            <h2 className="font-display text-lg font-semibold">Preferences</h2>
          </div>
          <p className="text-sm mb-5" style={{ color: 'var(--text-soft)' }}>Manage your analysis preferences.</p>

          <div className="space-y-1">
            <Toggle
              label="Email notifications"
              desc="Get notified when your analysis is complete."
              checked={notifications}
              onChange={setNotifications}
            />
            <Toggle
              label="Auto-save analyses"
              desc="Automatically save every analysis to your history."
              checked={autoSave}
              onChange={setAutoSave}
            />
          </div>
        </Card>

        {/* data */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={18} style={{ color: 'var(--color-warning-500)' }} />
            <h2 className="font-display text-lg font-semibold">Data & Privacy</h2>
          </div>
          <p className="text-sm mb-5" style={{ color: 'var(--text-soft)' }}>Manage your analysis data.</p>

          {cleared ? (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm mb-3" style={{ background: 'color-mix(in srgb, var(--color-success-500) 12%, transparent)', color: 'var(--color-success-500)' }}>
              <Check size={16} /> All analysis history cleared.
            </div>
          ) : confirmClear ? (
            <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ borderColor: 'var(--color-error-500)', background: 'color-mix(in srgb, var(--color-error-500) 8%, transparent)' }}>
              <AlertCircle size={18} style={{ color: 'var(--color-error-500)' }} />
              <p className="text-sm flex-1" style={{ color: 'var(--text-soft)' }}>Delete all analysis history? This cannot be undone.</p>
              <Button variant="ghost" size="sm" onClick={() => setConfirmClear(false)}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={clearHistory}>Delete all</Button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="w-full flex items-center justify-between p-4 rounded-xl border transition-colors hover:bg-[color-mix(in_srgb,var(--color-error-500)_6%,transparent)] text-left"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg" style={{ background: 'color-mix(in srgb, var(--color-error-500) 12%, transparent)', color: 'var(--color-error-500)' }}>
                  <Trash2 size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium">Clear analysis history</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Permanently delete all your past analyses.</p>
                </div>
              </div>
            </button>
          )}
        </Card>

        {/* account */}
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold mb-5">Account</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Sign out</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>End your current session.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function Toggle({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between p-4 rounded-xl transition-colors hover:bg-[color-mix(in_srgb,var(--text)_3%,transparent)] text-left"
    >
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
      </div>
      <span
        className="relative w-11 h-6 rounded-full transition-colors shrink-0"
        style={{ background: checked ? 'var(--color-brand-500)' : 'var(--border)' }}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
          style={{ left: checked ? '1.5rem' : '0.125rem' }}
        />
      </span>
    </button>
  );
}
