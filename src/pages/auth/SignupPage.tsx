import { useState } from 'react';
import { Mail, Lock, User, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { AuthLayout, AuthInput } from '@/pages/auth/AuthLayout';
import { Button } from '@/components/Button';
import { useRouter } from '@/context/RouterContext';
import { supabase } from '@/lib/supabase';

const PASSWORD_CHECKS = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p: string) => /\d/.test(p) },
];

export function SignupPage() {
  const { navigate } = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordValid = PASSWORD_CHECKS.every((c) => c.test(password));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim()) return setError('Please enter your name.');
    if (!emailValid) return setError('Please enter a valid email address.');
    if (!passwordValid) return setError('Please meet all password requirements.');
    setLoading(true);
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName.trim() } },
    });
    if (err) {
      setLoading(false);
      return setError(err.message);
    }
    if (data.user) {
      // create profile row
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName.trim(),
        theme: 'dark',
      });
    }
    setLoading(false);
    navigate('/dashboard');
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start running deepfake analyses in minutes.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm" style={{ background: 'color-mix(in srgb, var(--color-error-500) 12%, transparent)', color: 'var(--color-error-500)' }}>
            <AlertCircle size={15} />
            {error}
          </div>
        )}
        <AuthInput
          label="Full name"
          value={fullName}
          onChange={setFullName}
          placeholder="Jane Doe"
          icon={<User size={16} />}
          autoComplete="name"
        />
        <AuthInput
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          icon={<Mail size={16} />}
          error={email.length > 0 && !emailValid ? 'Enter a valid email address.' : undefined}
          autoComplete="email"
        />
        <AuthInput
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          icon={<Lock size={16} />}
          autoComplete="new-password"
        />
        {password.length > 0 && (
          <div className="space-y-1.5">
            {PASSWORD_CHECKS.map((c) => {
              const ok = c.test(password);
              return (
                <div key={c.label} className="flex items-center gap-2 text-xs" style={{ color: ok ? 'var(--color-success-500)' : 'var(--text-muted)' }}>
                  <span className="flex items-center justify-center w-4 h-4 rounded-full" style={{ background: ok ? 'var(--color-success-500)' : 'var(--border)' }}>
                    {ok && <Check size={10} color="#fff" />}
                  </span>
                  {c.label}
                </div>
              );
            })}
          </div>
        )}
        <Button type="submit" fullWidth size="lg" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
          {!loading && <ArrowRight size={16} />}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-soft)' }}>
        Already have an account?{' '}
        <button onClick={() => navigate('/login')} className="font-medium hover:underline" style={{ color: 'var(--color-brand-400)' }}>
          Sign in
        </button>
      </p>
    </AuthLayout>
  );
}
