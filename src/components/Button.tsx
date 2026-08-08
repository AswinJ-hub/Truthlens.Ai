import { type ReactNode } from 'react';
import { useRouter } from '@/context/RouterContext';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  to?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export function Button({
  children,
  onClick,
  to,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled,
  className = '',
  fullWidth,
}: ButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (to) router.navigate(to);
    onClick?.();
  };

  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const sizes = {
    sm: 'text-sm px-3.5 py-2',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-7 py-3.5',
  };

  const variants = {
    primary:
      'text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5',
    secondary:
      'border hover:-translate-y-0.5',
    ghost: 'hover:bg-[color-mix(in_srgb,var(--text)_8%,transparent)]',
    danger: 'text-white bg-error-500 hover:bg-red-600 shadow-lg shadow-red-500/20',
  };

  const style =
    variant === 'primary'
      ? { background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-brand-600))' }
      : variant === 'secondary'
        ? { background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text)' }
        : variant === 'ghost'
          ? { color: 'var(--text-soft)' }
          : undefined;

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      style={style}
      className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
}
