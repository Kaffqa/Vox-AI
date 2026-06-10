import { motion } from 'framer-motion';
import { Mic, Square, Loader2 } from 'lucide-react';

interface MicrophoneButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  audioLevel: number;
  onClick: () => void;
}

export default function MicrophoneButton({ isRecording, isProcessing, audioLevel, onClick }: MicrophoneButtonProps) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow rings */}
      {isRecording && (
        <>
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 160 + audioLevel * 40,
              height: 160 + audioLevel * 40,
              background: 'radial-gradient(circle, rgba(244,63,94,0.15) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 130 + audioLevel * 30,
              height: 130 + audioLevel * 30,
              background: 'radial-gradient(circle, rgba(244,63,94,0.2) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.6, 0.3, 0.6],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.2,
            }}
          />
          {/* Audio level reactive ring */}
          <motion.div
            className="absolute rounded-full border-2 border-rose-500/30"
            style={{
              width: 110 + audioLevel * 50,
              height: 110 + audioLevel * 50,
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </>
      )}

      {/* Main button */}
      <motion.button
        onClick={onClick}
        disabled={isProcessing}
        className={`
          relative z-10 flex items-center justify-center rounded-full
          transition-all duration-300 cursor-pointer
          ${isRecording
            ? 'w-24 h-24 bg-gradient-to-br from-rose-500 to-red-600 shadow-[0_0_40px_rgba(244,63,94,0.4)]'
            : isProcessing
              ? 'w-24 h-24 bg-gradient-to-br from-violet-500 to-cyan-500 opacity-70 cursor-not-allowed'
              : 'w-24 h-24 bg-gradient-to-br from-cyan-500 to-violet-600 shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.5)]'
          }
        `}
        whileHover={!isRecording && !isProcessing ? { scale: 1.08 } : {}}
        whileTap={!isProcessing ? { scale: 0.95 } : {}}
        animate={isRecording ? {
          scale: [1, 1.05, 1],
        } : {}}
        transition={isRecording ? {
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        } : {
          type: 'spring',
          stiffness: 400,
          damping: 17,
        }}
      >
        {isProcessing ? (
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        ) : isRecording ? (
          <Square className="w-8 h-8 text-white fill-white" />
        ) : (
          <Mic className="w-10 h-10 text-white" />
        )}
      </motion.button>

      {/* Status text */}
      <motion.p
        className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={isRecording ? 'recording' : isProcessing ? 'processing' : 'idle'}
      >
        {isRecording ? (
          <span className="text-rose-400">Tap to stop recording</span>
        ) : isProcessing ? (
          <span className="text-violet-400">Processing...</span>
        ) : (
          <span className="text-[--text-secondary]">Tap to start recording</span>
        )}
      </motion.p>
    </div>
  );
}
