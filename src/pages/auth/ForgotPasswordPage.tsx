import { useState } from 'react';
import { Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuthLayout, AuthInput } from '@/pages/auth/AuthLayout';
import { Button } from '@/components/Button';
import { useRouter } from '@/context/RouterContext';
import { supabase } from '@/lib/supabase';

export function ForgotPasswordPage() {
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (err) return setError(err.message);
    setSent(true);
  };

  return (
    <AuthLayout title="Reset your password" subtitle="We'll send a recovery link to your email.">
      {sent ? (
        <div className="text-center py-6 animate-scale-in">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl mx-auto mb-5" style={{ background: 'color-mix(in srgb, var(--color-success-500) 16%, transparent)', color: 'var(--color-success-500)' }}>
            <CheckCircle2 size={28} />
          </div>
          <h3 className="font-display text-lg font-semibold">Check your inbox</h3>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-soft)' }}>
            If an account exists for <span className="font-medium" style={{ color: 'var(--text)' }}>{email}</span>, you'll receive a password reset link shortly.
          </p>
          <Button className="mt-6" variant="secondary" onClick={() => navigate('/login')}>
            Back to sign in
          </Button>
        </div>
      ) : (
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
          <Button type="submit" fullWidth size="lg" disabled={loading}>
            {loading ? 'Sending...' : 'Send recovery link'}
            {!loading && <ArrowRight size={16} />}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-soft)' }}>
        Remembered your password?{' '}
        <button onClick={() => navigate('/login')} className="font-medium hover:underline" style={{ color: 'var(--color-brand-400)' }}>
          Sign in
        </button>
      </p>
    </AuthLayout>
  );
}
