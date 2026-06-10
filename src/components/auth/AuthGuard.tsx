import { Navigate, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AuthGuard = () => {
  const { user, loading } = useAuth();

  /* ── Loading state ─────────────────────────── */
  if (loading) {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center"
        style={{ backgroundColor: '#06070a' }}
      >
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="flex items-center justify-center w-12 h-12 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
            }}
          >
            <Mic className="w-6 h-6 text-white" />
          </div>
          <span
            className="text-3xl font-bold bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
            }}
          >
            VoxAI
          </span>
        </motion.div>

        {/* Spinner */}
        <motion.div
          className="w-10 h-10 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: '#06b6d4',
            borderRightColor: '#8b5cf6',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        <motion.p
          className="mt-4 text-sm"
          style={{ color: '#94a3b8' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Loading your workspace…
        </motion.p>
      </div>
    );
  }

  /* ── Not authenticated → redirect ─────────── */
  if (!user) {
    return <Navigate to="/" replace />;
  }

  /* ── Authenticated → render children ───────── */
  return <Outlet />;
};

export default AuthGuard;
