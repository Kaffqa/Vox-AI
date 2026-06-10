import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface Voice {
  voiceURI: string;
  name: string;
  lang: string;
}

interface VoiceSelectProps {
  voices: Voice[];
  selectedURI: string;
  onChange: (uri: string) => void;
  disabled?: boolean;
}

export default function VoiceSelect({ voices, selectedURI, onChange, disabled }: VoiceSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedVoice = voices.find(v => v.voiceURI === selectedURI) || voices[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-[--text-primary] focus:outline-none transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/20 hover:bg-black/60 focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]'}`}
      >
        <span className="truncate pr-4">
          {selectedVoice ? `${selectedVoice.name} (${selectedVoice.lang})` : 'Select a voice'}
        </span>
        <ChevronDown className={`w-4 h-4 text-[--text-secondary] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-[#0f1117] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto p-1">
              {voices.map((voice) => (
                <button
                  key={voice.voiceURI}
                  type="button"
                  onClick={() => {
                    onChange(voice.voiceURI);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    selectedURI === voice.voiceURI
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'text-[--text-secondary] hover:bg-white/5 hover:text-[--text-primary]'
                  }`}
                >
                  <span className="truncate">{voice.name} <span className="opacity-50 text-xs ml-1">({voice.lang})</span></span>
                  {selectedURI === voice.voiceURI && <Check className="w-4 h-4 shrink-0" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
