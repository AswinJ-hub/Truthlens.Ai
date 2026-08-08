import { useState } from 'react';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { AuthLayout, AuthInput } from '@/pages/auth/AuthLayout';
import { Button } from '@/components/Button';
import { useRouter } from '@/context/RouterContext';
import { supabase } from '@/lib/supabase';

export function LoginPage() {
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message === 'Invalid login credentials' ? 'Incorrect email or password.' : err.message);
      return;
    }
    navigate('/dashboard');
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue detecting deepfakes.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm" style={{ background: 'color-mix(in srgb, var(--color-error-500) 12%, transparent)', color: 'var(--color-error-500)' }}>
            <AlertCircle size={15} />
            {error}
          </div>
        )}
        <AuthInput
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          icon={<Mail size={16} />}
          autoComplete="email"
        />
        <AuthInput
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          icon={<Lock size={16} />}
          autoComplete="current-password"
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-xs font-medium hover:underline"
            style={{ color: 'var(--color-brand-400)' }}
          >
            Forgot password?
          </button>
        </div>
        <Button type="submit" fullWidth size="lg" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
          {!loading && <ArrowRight size={16} />}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-soft)' }}>
        Don't have an account?{' '}
        <button onClick={() => navigate('/signup')} className="font-medium hover:underline" style={{ color: 'var(--color-brand-400)' }}>
          Sign up
        </button>
      </p>
    </AuthLayout>
  );
}
