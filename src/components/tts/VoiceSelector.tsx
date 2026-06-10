import { motion } from 'framer-motion';
import { VOICE_OPTIONS } from '../../lib/constants';
import type { VoiceModel } from '../../types';

interface VoiceSelectorProps {
  selected: VoiceModel;
  onChange: (voice: VoiceModel) => void;
  disabled?: boolean;
}

export default function VoiceSelector({ selected, onChange, disabled }: VoiceSelectorProps) {
  return (
    <motion.div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5">
        <h3 className="text-sm font-semibold text-[--text-primary]">Voice Model</h3>
      </div>

      {/* Voice grid */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {VOICE_OPTIONS.map((voice, index) => {
          const isSelected = selected === voice.id;
          return (
            <motion.button
              key={voice.id}
              onClick={() => !disabled && onChange(voice.id)}
              disabled={disabled}
              className={`
                relative flex flex-col items-center gap-2 p-3 rounded-xl
                transition-all duration-300 cursor-pointer
                ${isSelected
                  ? 'bg-gradient-to-br from-cyan-500/15 to-violet-500/15 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                  : 'bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={!disabled ? { scale: 1.03 } : {}}
              whileTap={!disabled ? { scale: 0.97 } : {}}
            >
              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400"
                  layoutId="voice-indicator"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}

              <span className="text-xl">{voice.icon}</span>
              <div className="text-center">
                <p className={`text-xs font-semibold ${isSelected ? 'text-cyan-300' : 'text-[--text-primary]'}`}>
                  {voice.name}
                </p>
                <p className="text-[10px] text-[--text-muted] mt-0.5 leading-tight">
                  {voice.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
