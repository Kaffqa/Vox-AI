import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { MAX_TTS_CHARS } from '../../lib/constants';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function TextInput({ value, onChange, disabled }: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const remaining = MAX_TTS_CHARS - value.length;
  const isOverLimit = remaining < 0;

  return (
    <motion.div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${isFocused ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.08)'}`,
        transition: 'border-color 0.3s ease',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5">
        <h3 className="text-sm font-semibold text-[--text-primary]">Your Text</h3>
      </div>

      {/* Text area */}
      <div className="p-4">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder="Type or paste your text here. VoxAI will transform it into natural-sounding speech..."
          className="w-full min-h-[180px] md:min-h-[220px] bg-transparent text-[--text-primary] text-sm 
            leading-relaxed resize-none outline-none placeholder:text-[--text-muted]
            disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: "'Inter', sans-serif" }}
        />
      </div>

      {/* Footer with character count */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/5">
        <div className="flex items-center gap-2">
          {isOverLimit && (
            <motion.div
              className="flex items-center gap-1 text-xs text-rose-400"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <AlertCircle className="w-3 h-3" />
              Exceeds limit
            </motion.div>
          )}
        </div>
        <div className={`text-xs font-medium ${isOverLimit ? 'text-rose-400' : remaining < 200 ? 'text-amber-400' : 'text-[--text-muted]'}`}>
          {value.length.toLocaleString()} / {MAX_TTS_CHARS.toLocaleString()}
        </div>
      </div>
    </motion.div>
  );
}
