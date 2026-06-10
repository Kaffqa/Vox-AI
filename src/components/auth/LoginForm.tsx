import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormProps {
  onToggle: () => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariant: any = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const LoginForm = ({ onToggle }: LoginFormProps) => {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setIsLoading(true);
      await signInWithEmail(email, password);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Sign in failed. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 w-full"
    >
      {/* ── Error ──────────────────────────────── */}
      {error && (
        <motion.div
          variants={itemVariant}
          className="px-4 py-3 rounded-lg text-sm"
          style={{
            backgroundColor: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            color: '#fb7185',
          }}
        >
          {error}
        </motion.div>
      )}

      {/* ── Email ──────────────────────────────── */}
      <motion.div variants={itemVariant} className="relative">
        <Mail
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: '#64748b' }}
        />
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none placeholder:text-[#64748b] transition-colors"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#f1f5f9',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
          }}
        />
      </motion.div>

      {/* ── Password ───────────────────────────── */}
      <motion.div variants={itemVariant} className="relative">
        <Lock
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: '#64748b' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none placeholder:text-[#64748b] transition-colors"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#f1f5f9',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
          }}
        />
      </motion.div>

      {/* ── Submit ──────────────────────────────── */}
      <motion.div variants={itemVariant}>
        <motion.button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 transition-shadow"
          style={{
            background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
          }}
          whileHover={{ scale: 1.01, boxShadow: '0 8px 30px rgba(6,182,212,0.25)' }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </motion.div>

      {/* ── Toggle ─────────────────────────────── */}
      <motion.p variants={itemVariant} className="text-center text-sm" style={{ color: '#94a3b8' }}>
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onToggle}
          className="font-medium cursor-pointer hover:underline"
          style={{ color: '#06b6d4' }}
        >
          Create one
        </button>
      </motion.p>
    </motion.form>
  );
};

export default LoginForm;
