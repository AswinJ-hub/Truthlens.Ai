import { useState } from 'react';
import { LayoutDashboard, ScanSearch, History, User, Settings, LogOut, Menu, X, Sun, Moon } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';

const ACCOUNT_NAV = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Analyze', to: '/analyze', icon: ScanSearch },
  { label: 'History', to: '/history', icon: History },
  { label: 'Profile', to: '/profile', icon: User },
  { label: 'Settings', to: '/settings', icon: Settings },
];

const GUEST_NAV = [
  { label: 'Analyze', to: '/analyze', icon: ScanSearch },
];

export function Navbar() {
  const { path, navigate } = useRouter();
  const { session, profile, signOut, theme, setTheme } = useAuth();
  const [open, setOpen] = useState(false);

  const navItems = session ? ACCOUNT_NAV : GUEST_NAV;
  const isActive = (to: string) => path === to;

  const go = (to: string) => {
    navigate(to);
    setOpen(false);
  };

  return (
    <header
      className="sticky top-0 z-40 glass border-b"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button onClick={() => go(session ? '/dashboard' : '/')} className="shrink-0">
          <Logo />
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <button
                key={item.to}
                onClick={() => go(item.to)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  color: active ? 'var(--text)' : 'var(--text-soft)',
                  background: active ? 'color-mix(in srgb, var(--color-brand-500) 14%, transparent)' : 'transparent',
                }}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors hover:bg-[color-mix(in_srgb,var(--text)_8%,transparent)]"
            style={{ color: 'var(--text-soft)' }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {session && (
            <div className="hidden md:flex items-center gap-2 pl-2 ml-1 border-l" style={{ borderColor: 'var(--border)' }}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                style={{ background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-accent-500))', color: '#fff' }}
              >
                {(profile?.full_name?.[0] || 'U').toUpperCase()}
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm transition-colors hover:bg-[color-mix(in_srgb,var(--text)_8%,transparent)]"
                style={{ color: 'var(--text-soft)' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg"
            style={{ color: 'var(--text)' }}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t px-4 py-3 space-y-1" style={{ borderColor: 'var(--border)', background: 'var(--bg-soft)' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <button
                key={item.to}
                onClick={() => go(item.to)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium"
                style={{
                  color: active ? 'var(--text)' : 'var(--text-soft)',
                  background: active ? 'color-mix(in srgb, var(--color-brand-500) 14%, transparent)' : 'transparent',
                }}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
          {session && (
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium"
              style={{ color: 'var(--text-soft)' }}
            >
              <LogOut size={18} />
              Sign out
            </button>
          )}
        </div>
      )}
    </header>
  );
}
