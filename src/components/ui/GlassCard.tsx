// ============================================
// VoxAI — GlassCard Component
// ============================================

import { type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  className?: string;
  /** Enable subtle scale + border glow on hover */
  hover?: boolean;
  /** Enable colored glow shadow */
  glow?: boolean;
  /** Glow accent color (CSS color string) */
  glowColor?: string;
}

export default function GlassCard({
  children,
  className = '',
  hover = false,
  glow = false,
  glowColor = 'var(--accent-cyan)',
  ...motionProps
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      whileHover={
        hover
          ? {
              scale: 1.01,
              borderColor: 'var(--border-glass-hover)',
              transition: { duration: 0.25 },
            }
          : undefined
      }
      className={`
        relative rounded-xl
        bg-[var(--bg-glass)] backdrop-blur-xl
        border border-[var(--border-glass)]
        ${className}
      `}
      style={
        glow
          ? {
              boxShadow: `0 0 30px -5px ${glowColor}20, 0 0 60px -10px ${glowColor}10`,
            }
          : undefined
      }
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
