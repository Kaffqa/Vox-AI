import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Sparkles, Shield, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AnimatedBackground from '../components/shared/AnimatedBackground';
import GoogleSignInButton from '../components/auth/GoogleSignInButton';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

/* ────────────────────────────────────────────── */
/*  Feature highlights data                       */
/* ────────────────────────────────────────────── */

const features = [
  {
    icon: Sparkles,
    title: 'High Accuracy',
    description: 'State-of-the-art AI models',
    color: '#06b6d4',
  },
  {
    icon: Users,
    title: 'Multiple Voices',
    description: 'Dozens of natural voices',
    color: '#8b5cf6',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'End-to-end encryption',
    color: '#10b981',
  },
];

/* ────────────────────────────────────────────── */
/*  Animation variants                            */
/* ────────────────────────────────────────────── */

const container: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const fadeUp: any = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const scaleIn: any = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

/* ────────────────────────────────────────────── */
/*  Tab type                                      */
/* ────────────────────────────────────────────── */

type AuthTab = 'login' | 'register';

/* ────────────────────────────────────────────── */
/*  Component                                     */
/* ────────────────────────────────────────────── */

const Landing = () => {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-8 sm:py-12">
      {/* Background */}
      <AnimatedBackground />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-md flex flex-col items-center gap-8"
      >
        {/* ── Logo ───────────────────────────────── */}
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-3">
          <motion.div
            className="flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
              boxShadow: '0 8px 32px rgba(6, 182, 212, 0.3)',
            }}
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.05 }}
            transition={{ duration: 0.5 }}
          >
            <Mic className="w-8 h-8 text-white" />
          </motion.div>

          <h1
            className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
            }}
          >
            VoxAI
          </h1>

          <p
            className="text-center text-sm sm:text-base max-w-xs leading-relaxed"
            style={{ color: '#94a3b8' }}
          >
            Transform voice to text and text to voice with AI precision
          </p>
        </motion.div>

        {/* ── Main Card ──────────────────────────── */}
        <motion.div
          variants={scaleIn}
          className="w-full rounded-2xl p-6 sm:p-8"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          {/* ── Tab toggle ─────────────────────── */}
          <div
            className="relative flex rounded-xl p-1 mb-6"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
            }}
          >
            {/* Animated indicator */}
            <motion.div
              className="absolute top-1 bottom-1 rounded-lg"
              style={{
                width: 'calc(50% - 4px)',
                background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(139,92,246,0.2))',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              animate={{
                x: activeTab === 'login' ? 4 : 'calc(100% + 4px)',
              }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />

            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className="relative z-10 flex-1 py-2.5 text-sm font-medium text-center rounded-lg transition-colors cursor-pointer"
              style={{
                color: activeTab === 'login' ? '#f1f5f9' : '#64748b',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className="relative z-10 flex-1 py-2.5 text-sm font-medium text-center rounded-lg transition-colors cursor-pointer"
              style={{
                color: activeTab === 'register' ? '#f1f5f9' : '#64748b',
              }}
            >
              Register
            </button>
          </div>

          {/* ── Google SSO ─────────────────────── */}
          <GoogleSignInButton />

          {/* ── Divider ────────────────────────── */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
            <span className="text-xs font-medium" style={{ color: '#64748b' }}>
              or
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* ── Forms ──────────────────────────── */}
          <AnimatePresence mode="wait">
            {activeTab === 'login' ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <LoginForm onToggle={() => setActiveTab('register')} />
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <RegisterForm onToggle={() => setActiveTab('login')} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Feature highlights ──────────────── */}
        <motion.div
          variants={fadeUp}
          className="w-full grid grid-cols-3 gap-3"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className="flex flex-col items-center gap-2 p-4 rounded-xl text-center"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                whileHover={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  y: -4,
                }}
              >
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg"
                  style={{
                    backgroundColor: `${feature.color}15`,
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: feature.color }} />
                </div>
                <span
                  className="text-xs font-semibold"
                  style={{ color: '#f1f5f9' }}
                >
                  {feature.title}
                </span>
                <span
                  className="text-[10px] leading-tight"
                  style={{ color: '#64748b' }}
                >
                  {feature.description}
                </span>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Footer ──────────────────────────── */}
        <motion.p
          variants={fadeUp}
          className="text-[11px] text-center"
          style={{ color: '#475569' }}
        >
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Landing;
