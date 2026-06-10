// ============================================
// VoxAI — Button Component
// ============================================

import { type ReactNode, type ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: ReactNode;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-gradient-to-r from-cyan-500 to-violet-500',
    'text-white font-semibold',
    'shadow-lg shadow-cyan-500/20',
    'hover:shadow-cyan-500/40 hover:brightness-110',
    'active:brightness-95',
  ].join(' '),
  secondary: [
    'bg-[var(--bg-glass)] backdrop-blur-xl',
    'border border-[var(--border-glass)]',
    'text-[var(--text-primary)]',
    'hover:bg-[var(--bg-glass-hover)] hover:border-[var(--border-glass-hover)]',
  ].join(' '),
  danger: [
    'bg-rose-500/15 border border-rose-500/30',
    'text-rose-400',
    'hover:bg-rose-500/25 hover:border-rose-500/50',
  ].join(' '),
  ghost: [
    'bg-transparent',
    'text-[var(--text-secondary)]',
    'hover:bg-white/5 hover:text-[var(--text-primary)]',
  ].join(' '),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-base rounded-xl gap-2.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      whileHover={isDisabled ? undefined : { scale: 1.02 }}
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`
        inline-flex items-center justify-center
        font-medium cursor-pointer
        transition-all duration-200 ease-out
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      disabled={isDisabled}
      {...(rest as any)}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" />
          <span>Loading…</span>
        </>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
}
