// ============================================
// VoxAI — LoadingSpinner Component
// ============================================

import { motion } from 'framer-motion';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeMap: Record<SpinnerSize, { wh: string; border: string }> = {
  sm: { wh: 'w-4 h-4', border: 'border-2' },
  md: { wh: 'w-8 h-8', border: 'border-[3px]' },
  lg: { wh: 'w-12 h-12', border: 'border-4' },
};

export default function LoadingSpinner({
  size = 'md',
  className = '',
}: LoadingSpinnerProps) {
  const { wh, border } = sizeMap[size];

  return (
    <motion.div
      className={`${wh} ${className}`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <div
        className={`
          ${wh} ${border}
          rounded-full
          border-transparent
          border-t-cyan-400
          border-r-violet-400
        `}
      />
    </motion.div>
  );
}
