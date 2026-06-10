import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Loader2, ArrowRight, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface RegisterFormProps {
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

const RegisterForm = ({ onToggle }: RegisterFormProps) => {
  const { signUpWithEmail } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setIsLoading(true);
      await signUpWithEmail(email, password, fullName);
      setSuccess('Account created! Check your email for a verification link.');
      setFullName('');
      setEmail('');
      setPassword('');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Shared input styles ─────────────────── */
  const inputStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#f1f5f9',
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)';
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
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

      {/* ── Success ────────────────────────────── */}
      {success && (
        <motion.div
          variants={itemVariant}
          className="flex items-start gap-3 px-4 py-3 rounded-lg text-sm"
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#34d399',
          }}
        >
          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </motion.div>
      )}

      {/* ── Full Name ──────────────────────────── */}
      <motion.div variants={itemVariant} className="relative">
        <User
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: '#64748b' }}
        />
        <input
          type="text"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
          className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none placeholder:text-[#64748b] transition-colors"
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </motion.div>

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
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </motion.div>

      {/* ── Password ───────────────────────────── */}
      <motion.div variants={itemVariant} className="relative">
        <Lock
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: '#64748b' }}
        />
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Password (min. 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          className="w-full pl-11 pr-11 py-3.5 rounded-xl text-sm outline-none placeholder:text-[#64748b] transition-colors"
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#f1f5f9] transition-colors focus:outline-none"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
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
              Create Account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </motion.div>

      {/* ── Toggle ─────────────────────────────── */}
      <motion.p variants={itemVariant} className="text-center text-sm" style={{ color: '#94a3b8' }}>
        Already have an account?{' '}
        <button
          type="button"
          onClick={onToggle}
          className="font-medium cursor-pointer hover:underline"
          style={{ color: '#06b6d4' }}
        >
          Sign in
        </button>
      </motion.p>
    </motion.form>
  );
};

export default RegisterForm;
